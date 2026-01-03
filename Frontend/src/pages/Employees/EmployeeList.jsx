import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../contexts/AuthContext'
import { employeeService } from '../../services/employeeService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Users, Search } from 'lucide-react'

export default function EmployeeList() {
  const { isAdmin, user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  
  const isHR = user?.role === 'hr'
  const isAdminRole = user?.role === 'admin'

  // Get all employees
  const { data: employeesData, isLoading, error } = useQuery({
    queryKey: ['employees', departmentFilter, statusFilter],
    queryFn: async () => {
      try {
        const filters = {}
        if (departmentFilter !== 'all') filters.department = departmentFilter
        if (statusFilter !== 'all') filters.status = statusFilter
        
        const response = await employeeService.listEmployees(filters)
        console.log('Employees response:', response)
        return response
      } catch (error) {
        console.error('Error fetching employees:', error)
        throw error
      }
    },
    enabled: isAdmin || isHR,
    retry: 1,
  })

  // Extract employees from response and filter by role
  const allUsers = employeesData?.data || []
  
  // Filter to show only employees (exclude HR and Admin)
  const employees = allUsers.filter(u => {
    if (!u) return false
    // Exclude current user
    if (u.user_id === user?.id || u.id === user?.id) return false
    // Only show employees (exclude HR and Admin)
    return u.role === 'employee'
  })
  
  // Filter by search term
  const filteredEmployees = employees.filter(emp => {
    const searchLower = searchTerm.toLowerCase()
    return (
      emp.first_name?.toLowerCase().includes(searchLower) ||
      emp.last_name?.toLowerCase().includes(searchLower) ||
      emp.employee_id?.toLowerCase().includes(searchLower) ||
      emp.email?.toLowerCase().includes(searchLower)
    )
  })

  // Get unique departments for filter
  const departments = [...new Set(employees.map(emp => emp.department).filter(Boolean))]

  if (!isAdmin && !isHR) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">You don't have permission to view this page.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Employees</h1>
        <p className="text-muted-foreground mt-1">Manage and view all employees</p>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-l-4 border-l-destructive bg-card">
          <CardContent className="pt-6">
            <div className="text-destructive">
              <p className="font-semibold">Error loading employees:</p>
              <p className="text-sm mt-1 text-foreground">
                {error.response?.data?.error?.message || error.message}
              </p>
              {error.response?.status && (
                <p className="text-xs mt-1 text-muted-foreground">Status: {error.response.status}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="Search by name, ID, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employees Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="text-primary" size={24} />
            Employee List
          </CardTitle>
          <CardDescription>
            {isLoading ? 'Loading...' : `${filteredEmployees.length} employee(s) found`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-foreground">Loading employees...</div>
          ) : filteredEmployees.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-foreground">Employee ID</TableHead>
                  <TableHead className="text-foreground">Name</TableHead>
                  <TableHead className="text-foreground">Email</TableHead>
                  <TableHead className="text-foreground">Department</TableHead>
                  <TableHead className="text-foreground">Job Title</TableHead>
                  <TableHead className="text-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.user_id || employee.id}>
                    <TableCell className="font-medium text-foreground">{employee.employee_id}</TableCell>
                    <TableCell className="text-foreground">
                      {employee.first_name} {employee.last_name}
                    </TableCell>
                    <TableCell className="text-foreground">{employee.email}</TableCell>
                    <TableCell className="text-muted-foreground">{employee.department || '-'}</TableCell>
                    <TableCell className="text-muted-foreground">{employee.job_title || '-'}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          employee.status === 'active'
                            ? 'bg-success text-white'
                            : 'bg-muted text-muted-foreground'
                        }
                      >
                        {employee.status || 'active'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || departmentFilter !== 'all' || statusFilter !== 'all'
                ? 'No employees match your filters'
                : 'No employees found'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

