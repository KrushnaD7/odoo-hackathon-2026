import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../contexts/AuthContext'
import { payrollService } from '../../services/payrollService'
import { employeeService } from '../../services/employeeService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { useToast } from '../../components/ui/use-toast'
import { DollarSign, Plus, Edit, ChevronDown, ChevronUp } from 'lucide-react'
import { formatCurrency } from '../../utils/formatters'

export default function Payroll() {
  const { user, isAdmin } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [editDialog, setEditDialog] = useState({ open: false, employeeId: null, data: null })
  const [expandedSections, setExpandedSections] = useState({})
  
  const isHR = user?.role === 'hr'
  const isAdminRole = user?.role === 'admin'

  // Get my salary (employee only)
  const { data: mySalary, isLoading: loadingMySalary } = useQuery({
    queryKey: ['payroll', 'my-salary'],
    queryFn: async () => {
      const response = await payrollService.getMySalary()
      return response.data
    },
    enabled: !isAdmin && !isHR,
  })

  // Get all salaries (admin/HR)
  const { data: allSalaries, isLoading: loadingAllSalaries } = useQuery({
    queryKey: ['payroll', 'all'],
    queryFn: async () => {
      const response = await payrollService.getAllSalaries()
      return response.data
    },
    enabled: isAdmin || isHR,
  })

  // Get employees for admin/HR
  const { data: employeesData } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const response = await employeeService.listEmployees()
      return response.data
    },
    enabled: isAdmin || isHR,
  })
  
  // Filter employees based on role
  // employeesData is already the unwrapped response: { success: true, data: [...], pagination: {...} }
  // But wait, employeeService.listEmployees() returns response.data, which is the unwrapped axios response
  // So employeesData should be: { success: true, data: [...], pagination: {...} }
  const allUsers = Array.isArray(employeesData?.data) ? employeesData.data : (Array.isArray(employeesData) ? employeesData : [])
  const filteredUsers = allUsers.filter(u => {
    if (!u) return false
    
    // Exclude current user - check both user_id (from employee_profiles) and id (if it's the user id)
    const userId = u.user_id || u.id
    if (userId === user?.id) return false
    
    // For HR: Only show employees (exclude HR and Admin)
    if (isHR) {
      return u.role === 'employee'
    }
    
    // For Admin: Show all (HR and Employees)
    if (isAdminRole) {
      return u.role === 'hr' || u.role === 'employee'
    }
    
    return false
  })
  
  // Debug logging
  console.log('Payroll - employeesData:', employeesData)
  console.log('Payroll - allUsers:', allUsers)
  console.log('Payroll - filteredUsers:', filteredUsers)
  console.log('Payroll - user:', user)
  console.log('Payroll - isHR:', isHR, 'isAdminRole:', isAdminRole)
  
  // Count breakdown for Admin
  const hrCount = isAdminRole ? filteredUsers.filter(u => u.role === 'hr').length : 0
  const employeeCount = filteredUsers.filter(u => u.role === 'employee').length
  const totalCount = filteredUsers.length

  // Get specific employee salary (admin)
  const { data: employeeSalary } = useQuery({
    queryKey: ['payroll', selectedEmployee],
    queryFn: async () => {
      const response = await payrollService.getEmployeeSalary(selectedEmployee)
      return response.data
    },
    enabled: (isAdmin || isHR) && !!selectedEmployee,
  })

  const updateMutation = useMutation({
    mutationFn: ({ employeeId, data }) => payrollService.updateSalary(employeeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['payroll'])
      setEditDialog({ open: false, employeeId: null, data: null })
      toast({
        title: 'Salary updated',
        variant: 'success',
      })
    },
    onError: (error) => {
      toast({
        title: 'Update failed',
        description: error.response?.data?.error?.message || 'Failed to update salary',
        variant: 'destructive',
      })
    },
  })

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleEdit = (employeeId, currentSalary) => {
    const baseSalary = currentSalary?.base_salary || 0
    const allowances = currentSalary?.allowances || {}
    const deductions = currentSalary?.deductions || {}
    
    // Calculate monthly wage (base salary + total allowances)
    const totalAllowances = Object.values(allowances).reduce((sum, val) => sum + (parseFloat(val) || 0), 0)
    const monthlyWage = baseSalary + totalAllowances
    const yearlyWage = monthlyWage * 12
    
    setEditDialog({
      open: true,
      employeeId,
      data: {
        monthly_wage: monthlyWage,
        yearly_wage: yearlyWage,
        working_days_per_week: currentSalary?.working_days_per_week || 5,
        break_time_hours: currentSalary?.break_time_hours || 0,
        base_salary: baseSalary,
        allowances: allowances,
        deductions: deductions,
        // Salary components
        house_rent_allowance: allowances.house_rent_allowance || allowances.hra || 0,
        standard_allowance: allowances.standard_allowance || 0,
        performance_bonus: allowances.performance_bonus || 0,
        leave_travel_allowance: allowances.leave_travel_allowance || allowances.lta || 0,
        fixed_allowance: allowances.fixed_allowance || 0,
        // PF
        pf_employee: deductions.pf_employee || deductions.pf || 0,
        pf_employer: deductions.pf_employer || 0,
        // Tax
        professional_tax: deductions.professional_tax || 0,
      }
    })
  }

  const handleSave = () => {
    const { monthly_wage, yearly_wage, working_days_per_week, break_time_hours, ...rest } = editDialog.data
    
    // Reconstruct allowances and deductions from the form fields
    const allowances = {
      house_rent_allowance: rest.house_rent_allowance || 0,
      standard_allowance: rest.standard_allowance || 0,
      performance_bonus: rest.performance_bonus || 0,
      leave_travel_allowance: rest.leave_travel_allowance || 0,
      fixed_allowance: rest.fixed_allowance || 0,
      ...rest.allowances, // Keep any other existing allowances
    }
    
    const deductions = {
      pf_employee: rest.pf_employee || 0,
      pf_employer: rest.pf_employer || 0,
      professional_tax: rest.professional_tax || 0,
      ...rest.deductions, // Keep any other existing deductions
    }
    
    // Calculate base salary if not set (from monthly wage - total allowances)
    const totalAllowances = Object.values(allowances).reduce((sum, val) => sum + (parseFloat(val) || 0), 0)
    const baseSalary = rest.base_salary || (monthly_wage - totalAllowances) || 0
    
    updateMutation.mutate({
      employeeId: editDialog.employeeId,
      data: {
        base_salary: baseSalary,
        allowances: allowances,
        deductions: deductions,
        working_days_per_week: working_days_per_week,
        break_time_hours: break_time_hours,
      },
    })
  }
  
  // Calculate percentages based on base salary
  const calculatePercentage = (value, baseSalary) => {
    if (!baseSalary || baseSalary === 0) return 0
    return ((parseFloat(value) || 0) / baseSalary) * 100
  }
  
  // Update monthly wage and recalculate when components change
  const updateSalaryComponent = (field, value) => {
    const numValue = parseFloat(value) || 0
    const currentData = editDialog.data || {}
    const baseSalary = currentData.base_salary || 0
    
    const newData = {
      ...currentData,
      [field]: numValue,
    }
    
    // Recalculate monthly wage
    const totalAllowances = 
      (newData.house_rent_allowance || 0) +
      (newData.standard_allowance || 0) +
      (newData.performance_bonus || 0) +
      (newData.leave_travel_allowance || 0) +
      (newData.fixed_allowance || 0)
    
    newData.monthly_wage = baseSalary + totalAllowances
    newData.yearly_wage = newData.monthly_wage * 12
    
    setEditDialog({
      ...editDialog,
      data: newData,
    })
  }

  if (!isAdmin && !isHR && loadingMySalary) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading...</div>
  }

  if ((isAdmin || isHR) && loadingAllSalaries) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Payroll</h1>
        <p className="text-muted-foreground mt-1">
          {isAdmin ? (
            isAdminRole ? (
              `Manage employee salaries (${hrCount} HR + ${employeeCount} Employees)`
            ) : (
              `Manage employee salaries (${totalCount} Employees)`
            )
          ) : (
            'View your salary information'
          )}
        </p>
      </div>

      {!isAdmin && !isHR ? (
        /* Employee View */
        mySalary ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="text-primary" size={24} />
                My Salary
              </CardTitle>
              <CardDescription>Your current salary structure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-6 bg-card rounded-lg border border-primary/30">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Base Salary</p>
                    <p className="text-3xl font-bold text-primary">
                      {formatCurrency(mySalary.base_salary)}
                    </p>
                  </div>
                </div>

                {mySalary.allowances && Object.keys(mySalary.allowances).length > 0 && (
                  <div className="mt-4">
                    <button
                      onClick={() => toggleSection('allowances')}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <span className="font-medium text-foreground">Allowances</span>
                      {expandedSections.allowances ? (
                        <ChevronUp size={20} className="text-foreground" />
                      ) : (
                        <ChevronDown size={20} className="text-foreground" />
                      )}
                    </button>
                    {expandedSections.allowances && (
                      <div className="mt-2 space-y-2 pl-4">
                        {Object.entries(mySalary.allowances).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-muted-foreground capitalize">{key.replace('_', ' ')}</span>
                            <span className="font-medium text-foreground">{formatCurrency(value)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between font-medium pt-2 border-t border-border">
                          <span className="text-foreground">Total Allowances</span>
                          <span className="text-foreground">{formatCurrency(mySalary.total_allowances || 0)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {mySalary.deductions && Object.keys(mySalary.deductions).length > 0 && (
                  <div className="mt-4">
                    <button
                      onClick={() => toggleSection('deductions')}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <span className="font-medium text-foreground">Deductions</span>
                      {expandedSections.deductions ? (
                        <ChevronUp size={20} className="text-foreground" />
                      ) : (
                        <ChevronDown size={20} className="text-foreground" />
                      )}
                    </button>
                    {expandedSections.deductions && (
                      <div className="mt-2 space-y-2 pl-4">
                        {Object.entries(mySalary.deductions).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-muted-foreground capitalize">{key.replace('_', ' ')}</span>
                            <span className="font-medium text-destructive">-{formatCurrency(value)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between font-medium pt-2 border-t border-border">
                          <span className="text-foreground">Total Deductions</span>
                          <span className="text-destructive">-{formatCurrency(mySalary.total_deductions || 0)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-foreground">Net Salary</span>
                    <span className="text-3xl font-bold text-success">
                      {formatCurrency(mySalary.net_salary || mySalary.base_salary)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No salary information available</p>
            </CardContent>
          </Card>
        )
      ) : (
        /* Admin View */
        <>
          <Card>
            <CardHeader>
              <CardTitle>View Employee Salary</CardTitle>
              <CardDescription>Select an employee to view their salary</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>Employee</Label>
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((emp) => {
                          const userId = emp.user_id || emp.id
                          return (
                            <SelectItem key={userId} value={String(userId)}>
                              {emp.first_name} {emp.last_name} ({emp.employee_id}) {emp.role === 'hr' ? '- HR' : ''}
                            </SelectItem>
                          )
                        })
                      ) : (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground text-center">
                          No employees available
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {selectedEmployee && (
                  <Button onClick={() => handleEdit(selectedEmployee, employeeSalary)}>
                    <Edit className="mr-2" size={16} />
                    Edit
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {employeeSalary && (
            <Card>
              <CardHeader>
                <CardTitle>Salary Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground">Base Salary</Label>
                    <p className="text-2xl font-bold text-foreground">{formatCurrency(employeeSalary.base_salary)}</p>
                  </div>
                  {employeeSalary.net_salary && (
                    <div>
                      <Label className="text-muted-foreground">Net Salary</Label>
                      <p className="text-2xl font-bold text-success">
                        {formatCurrency(employeeSalary.net_salary)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>All Salaries</CardTitle>
              <CardDescription>Complete salary list</CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                // Filter salaries to match filtered users
                const filteredSalaries = allSalaries?.data?.filter(salary => {
                  // Exclude current user
                  if (salary.user_id === user?.id) return false
                  
                  // For HR: Only show employees
                  if (isHR) {
                    // Find the user in filteredUsers to check role
                    const userData = filteredUsers.find(u => u.user_id === salary.user_id)
                    return userData?.role === 'employee'
                  }
                  
                  // For Admin: Show all (HR and Employees)
                  if (isAdminRole) {
                    const userData = filteredUsers.find(u => u.user_id === salary.user_id)
                    return userData?.role === 'hr' || userData?.role === 'employee'
                  }
                  
                  return false
                }) || []
                
                return filteredSalaries.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Base Salary</TableHead>
                        <TableHead>Net Salary</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSalaries.map((salary) => {
                        const userData = filteredUsers.find(u => u.user_id === salary.user_id)
                        return (
                          <TableRow key={salary.user_id}>
                            <TableCell>
                              <span className="text-foreground">{salary.first_name} {salary.last_name}</span>
                              <div className="text-xs text-muted-foreground">
                                {salary.employee_id} {userData?.role === 'hr' ? '(HR)' : ''}
                              </div>
                            </TableCell>
                            <TableCell className="text-foreground">{formatCurrency(salary.base_salary)}</TableCell>
                            <TableCell className="font-semibold text-foreground">
                              {formatCurrency(salary.net_salary || salary.base_salary)}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(salary.user_id, salary)}
                              >
                                <Edit className="mr-1" size={14} />
                                Edit
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No salary records found</p>
                )
              })()}
            </CardContent>
          </Card>
        </>
      )}

      {/* Edit Salary Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ ...editDialog, open })}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Salary Info</DialogTitle>
            <DialogDescription>Update employee salary structure</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* General Salary Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Month Wage</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={editDialog.data?.monthly_wage || ''}
                    onChange={(e) => {
                      const monthlyWage = parseFloat(e.target.value) || 0
                      setEditDialog({
                        ...editDialog,
                        data: {
                          ...editDialog.data,
                          monthly_wage: monthlyWage,
                          yearly_wage: monthlyWage * 12,
                        }
                      })
                    }}
                  />
                  <span className="text-muted-foreground whitespace-nowrap">/ Month</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Yearly wage</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={editDialog.data?.yearly_wage || ''}
                    onChange={(e) => {
                      const yearlyWage = parseFloat(e.target.value) || 0
                      setEditDialog({
                        ...editDialog,
                        data: {
                          ...editDialog.data,
                          yearly_wage: yearlyWage,
                          monthly_wage: yearlyWage / 12,
                        }
                      })
                    }}
                  />
                  <span className="text-muted-foreground whitespace-nowrap">/ Yearly</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>No of working days in a week</Label>
                <Input
                  type="number"
                  value={editDialog.data?.working_days_per_week || ''}
                  onChange={(e) => setEditDialog({
                    ...editDialog,
                    data: { ...editDialog.data, working_days_per_week: parseFloat(e.target.value) || 0 }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Break Time</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={editDialog.data?.break_time_hours || ''}
                    onChange={(e) => setEditDialog({
                      ...editDialog,
                      data: { ...editDialog.data, break_time_hours: parseFloat(e.target.value) || 0 }
                    })}
                  />
                  <span className="text-muted-foreground whitespace-nowrap">/hrs</span>
                </div>
              </div>
            </div>

            {/* Salary Components */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Salary Components</h3>
              <div className="grid grid-cols-1 gap-4">
                {/* Basic Salary */}
                <div className="space-y-2 p-4 border rounded-lg bg-card">
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-base font-medium">Basic Salary</Label>
                    <div className="text-right">
                      <Input
                        type="number"
                        className="w-32 text-right"
                        value={editDialog.data?.base_salary || ''}
                        onChange={(e) => {
                          const baseSalary = parseFloat(e.target.value) || 0
                          const currentData = editDialog.data || {}
                          const totalAllowances = 
                            (currentData.house_rent_allowance || 0) +
                            (currentData.standard_allowance || 0) +
                            (currentData.performance_bonus || 0) +
                            (currentData.leave_travel_allowance || 0) +
                            (currentData.fixed_allowance || 0)
                          setEditDialog({
                            ...editDialog,
                            data: {
                              ...editDialog.data,
                              base_salary: baseSalary,
                              monthly_wage: baseSalary + totalAllowances,
                              yearly_wage: (baseSalary + totalAllowances) * 12,
                            }
                          })
                        }}
                      />
                      <span className="text-muted-foreground ml-2">₹ / month</span>
                      <span className="text-muted-foreground ml-2">
                        ({calculatePercentage(editDialog.data?.base_salary || 0, editDialog.data?.base_salary || 1).toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Define Basic salary from company cost compute it based on monthly Wages</p>
                </div>

                {/* House Rent Allowance */}
                <div className="space-y-2 p-4 border rounded-lg bg-card">
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-base font-medium">House Rent Allowance</Label>
                    <div className="text-right">
                      <Input
                        type="number"
                        className="w-32 text-right"
                        value={editDialog.data?.house_rent_allowance || ''}
                        onChange={(e) => updateSalaryComponent('house_rent_allowance', e.target.value)}
                      />
                      <span className="text-muted-foreground ml-2">/ month</span>
                      <span className="text-muted-foreground ml-2">
                        ({calculatePercentage(editDialog.data?.house_rent_allowance || 0, editDialog.data?.base_salary || 1).toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">HRA provided to employees 50% of the basic salary</p>
                </div>

                {/* Standard Allowance */}
                <div className="space-y-2 p-4 border rounded-lg bg-card">
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-base font-medium">Standard Allowance</Label>
                    <div className="text-right">
                      <Input
                        type="number"
                        className="w-32 text-right"
                        value={editDialog.data?.standard_allowance || ''}
                        onChange={(e) => updateSalaryComponent('standard_allowance', e.target.value)}
                      />
                      <span className="text-muted-foreground ml-2">/ month</span>
                      <span className="text-muted-foreground ml-2">
                        ({calculatePercentage(editDialog.data?.standard_allowance || 0, editDialog.data?.base_salary || 1).toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">A standard allowance is a predetermined, fixed amount provided to employee as part of their salary</p>
                </div>

                {/* Performance Bonus */}
                <div className="space-y-2 p-4 border rounded-lg bg-card">
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-base font-medium">Performance Bonus</Label>
                    <div className="text-right">
                      <Input
                        type="number"
                        className="w-32 text-right"
                        value={editDialog.data?.performance_bonus || ''}
                        onChange={(e) => updateSalaryComponent('performance_bonus', e.target.value)}
                      />
                      <span className="text-muted-foreground ml-2">/ month</span>
                      <span className="text-muted-foreground ml-2">
                        ({calculatePercentage(editDialog.data?.performance_bonus || 0, editDialog.data?.base_salary || 1).toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Variable amount paid during payroll. The value defined by the company and calculated as a % of the basic salary</p>
                </div>

                {/* Leave Travel Allowance */}
                <div className="space-y-2 p-4 border rounded-lg bg-card">
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-base font-medium">Leave Travel Allowance</Label>
                    <div className="text-right">
                      <Input
                        type="number"
                        className="w-32 text-right"
                        value={editDialog.data?.leave_travel_allowance || ''}
                        onChange={(e) => updateSalaryComponent('leave_travel_allowance', e.target.value)}
                      />
                      <span className="text-muted-foreground ml-2">/ month</span>
                      <span className="text-muted-foreground ml-2">
                        ({calculatePercentage(editDialog.data?.leave_travel_allowance || 0, editDialog.data?.base_salary || 1).toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">LTA is paid by the company to employees to cover their travel expenses. and calculated as a % of the basic salary</p>
                </div>

                {/* Fixed Allowance */}
                <div className="space-y-2 p-4 border rounded-lg bg-card">
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-base font-medium">Fixed Allowance</Label>
                    <div className="text-right">
                      <Input
                        type="number"
                        className="w-32 text-right"
                        value={editDialog.data?.fixed_allowance || ''}
                        onChange={(e) => updateSalaryComponent('fixed_allowance', e.target.value)}
                      />
                      <span className="text-muted-foreground ml-2">/ month</span>
                      <span className="text-muted-foreground ml-2">
                        ({calculatePercentage(editDialog.data?.fixed_allowance || 0, editDialog.data?.base_salary || 1).toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">fixed allowance portion of wages is determined after calculating all salary components</p>
                </div>
              </div>
            </div>

            {/* PF Contribution & Tax Deductions */}
            <div className="grid grid-cols-2 gap-4">
              {/* PF Contribution */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Provident Fund (PF) Contribution</h3>
                <div className="space-y-4">
                  <div className="space-y-2 p-4 border rounded-lg bg-card">
                    <div className="flex justify-between items-center mb-2">
                      <Label className="text-base font-medium">Employee</Label>
                      <div className="text-right">
                        <Input
                          type="number"
                          className="w-32 text-right"
                          value={editDialog.data?.pf_employee || ''}
                          onChange={(e) => setEditDialog({
                            ...editDialog,
                            data: { ...editDialog.data, pf_employee: parseFloat(e.target.value) || 0 }
                          })}
                        />
                        <span className="text-muted-foreground ml-2">₹ / month</span>
                        <span className="text-muted-foreground ml-2">
                          ({calculatePercentage(editDialog.data?.pf_employee || 0, editDialog.data?.base_salary || 1).toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">PF is calculated based on the basic salary</p>
                  </div>
                  <div className="space-y-2 p-4 border rounded-lg bg-card">
                    <div className="flex justify-between items-center mb-2">
                      <Label className="text-base font-medium">Employer</Label>
                      <div className="text-right">
                        <Input
                          type="number"
                          className="w-32 text-right"
                          value={editDialog.data?.pf_employer || ''}
                          onChange={(e) => setEditDialog({
                            ...editDialog,
                            data: { ...editDialog.data, pf_employer: parseFloat(e.target.value) || 0 }
                          })}
                        />
                        <span className="text-muted-foreground ml-2">₹ / month</span>
                        <span className="text-muted-foreground ml-2">
                          ({calculatePercentage(editDialog.data?.pf_employer || 0, editDialog.data?.base_salary || 1).toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">PF is calculated based on the basic salary</p>
                  </div>
                </div>
              </div>

              {/* Tax Deductions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Tax Deductions</h3>
                <div className="space-y-2 p-4 border rounded-lg bg-card">
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-base font-medium">Professional Tax</Label>
                    <div className="text-right">
                      <Input
                        type="number"
                        className="w-32 text-right"
                        value={editDialog.data?.professional_tax || ''}
                        onChange={(e) => setEditDialog({
                          ...editDialog,
                          data: { ...editDialog.data, professional_tax: parseFloat(e.target.value) || 0 }
                        })}
                      />
                      <span className="text-muted-foreground ml-2">₹ / month</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Professional Tax deducted from the Gross salary</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ open: false, employeeId: null, data: null })}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

