import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { employeeService } from '../../services/employeeService'
import { leaveService } from '../../services/leaveService'
import { attendanceService } from '../../services/attendanceService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Users, Calendar, Clock, CheckCircle, XCircle, AlertCircle, ArrowRight } from 'lucide-react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function AdminDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isHR = user?.role === 'hr'
  const isAdminRole = user?.role === 'admin'

  // Get all employees
  const { data: employeesData, isLoading: employeesLoading, error: employeesError } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      try {
        const response = await employeeService.listEmployees()
        console.log('Employees response:', response)
        return response
      } catch (error) {
        // Don't log 429 errors to console to reduce noise
        if (error?.response?.status !== 429) {
          console.error('Error fetching employees:', error)
        }
        throw error
      }
    },
    retry: (failureCount, error) => {
      // Don't retry on 429 errors
      if (error?.response?.status === 429) return false
      return failureCount < 1
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - employees don't change often
  })

  // Get pending leaves
  const { data: pendingLeaves, isLoading: leavesLoading, error: leavesError } = useQuery({
    queryKey: ['leaves', 'pending'],
    queryFn: async () => {
      try {
        const response = await leaveService.getAllLeaves({ status: 'pending' })
        console.log('Pending leaves response:', response)
        return response
      } catch (error) {
        // Don't log 429 errors to console to reduce noise
        if (error?.response?.status !== 429) {
          console.error('Error fetching pending leaves:', error)
        }
        throw error
      }
    },
    retry: (failureCount, error) => {
      // Don't retry on 429 errors
      if (error?.response?.status === 429) return false
      return failureCount < 1
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - leaves can change frequently
  })

  // Get today's attendance
  const { data: todayAttendance, isLoading: attendanceLoading, error: attendanceError } = useQuery({
    queryKey: ['attendance', 'today'],
    queryFn: async () => {
      try {
        const today = new Date().toISOString().split('T')[0]
        const response = await attendanceService.getAllAttendance({
          startDate: today,
          endDate: today,
        })
        console.log('Today attendance response:', response)
        return response
      } catch (error) {
        // Don't log 429 errors to console to reduce noise
        if (error?.response?.status !== 429) {
          console.error('Error fetching today attendance:', error)
        }
        throw error
      }
    },
    retry: (failureCount, error) => {
      // Don't retry on 429 errors
      if (error?.response?.status === 429) return false
      return failureCount < 1
    },
    staleTime: 1 * 60 * 1000, // 1 minute - attendance changes frequently
  })

  // Extract data from responses (backend returns { success: true, data: [...], pagination: {...} })
  // Service returns: { success: true, data: [...], pagination: {...} }
  const allUsers = Array.isArray(employeesData?.data) ? employeesData.data : []
  const leaves = Array.isArray(pendingLeaves?.data) ? pendingLeaves.data : []
  const attendance = Array.isArray(todayAttendance?.data) ? todayAttendance.data : []

  // Filter out the current user and filter by role
  // Employee profiles have user_id field that matches users.id
  const filteredUsers = allUsers.filter(u => {
    if (!u) return false
    // Exclude current user
    if (u.user_id === user?.id || u.id === user?.id) return false
    
    // For HR: Only include employees (exclude HR and Admin)
    if (isHR) {
      return u.role === 'employee'
    }
    
    // For Admin: Include HR and Employees (exclude Admin)
    if (isAdminRole) {
      return u.role === 'hr' || u.role === 'employee'
    }
    
    return false
  })
  
  // Debug: Log user info for filtering
  console.log('AdminDashboard - Current user:', user)
  console.log('AdminDashboard - User ID to filter:', user?.id)
  console.log('AdminDashboard - All users with roles:', allUsers.map(u => ({ id: u.user_id || u.id, role: u.role })))

  // For Admin: Count HR and Employees separately
  // For HR: Only count employees (exclude HR and Admin)
  let hrCount = 0
  let employeeCount = 0
  let totalEmployees = 0

  if (isAdminRole) {
    // Admin dashboard: Show "X HR + Y Employees" (excluding admin himself)
    hrCount = filteredUsers.filter(u => u.role === 'hr').length
    employeeCount = filteredUsers.filter(u => u.role === 'employee').length
    totalEmployees = hrCount + employeeCount
  } else if (isHR) {
    // HR dashboard: Only show employees (exclude HR and Admin)
    employeeCount = filteredUsers.filter(u => u.role === 'employee').length
    totalEmployees = employeeCount
  }

  // Debug logging
  console.log('AdminDashboard - All users:', allUsers)
  console.log('AdminDashboard - Filtered users (excluding self):', filteredUsers)
  console.log('AdminDashboard - User role:', user?.role)
  console.log('AdminDashboard - HR count:', hrCount)
  console.log('AdminDashboard - Employee count:', employeeCount)
  console.log('AdminDashboard - Total employees:', totalEmployees)

  // Prepare chart data
  const attendanceChartData = attendance?.reduce((acc, att) => {
    const status = att.status || 'absent'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {}) || {}

  const attendanceData = [
    { name: 'Present', value: attendanceChartData.present || 0 },
    { name: 'Absent', value: attendanceChartData.absent || 0 },
    { name: 'Half Day', value: attendanceChartData.half_day || 0 },
    { name: 'Leave', value: attendanceChartData.leave || 0 },
  ]

  const leaveStatusData = [
    { name: 'Pending', value: leaves?.length || 0 },
    { name: 'Approved', value: 0 },
    { name: 'Rejected', value: 0 },
  ]

  const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#1e40af']

  // activeEmployees count (only for employees, excluding HR/Admin)
  const activeEmployees = filteredUsers.filter(u => 
    u.role === 'employee' && u.status === 'active'
  ).length || 0
  const pendingCount = leaves?.length || 0
  const presentToday = attendanceChartData.present || 0

  const isLoading = employeesLoading || leavesLoading || attendanceLoading
  const hasErrors = employeesError || leavesError || attendanceError

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {isHR ? 'HR Dashboard' : 'Admin Dashboard'}
        </h1>
        <p className="text-muted-foreground mt-1">Overview of your organization</p>
      </div>

      {/* Error Messages */}
      {hasErrors && (
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="pt-6">
            <div className="text-destructive">
              <p className="font-semibold">Error loading dashboard data:</p>
              {employeesError && employeesError.response?.status !== 429 && (
                <div className="mt-2">
                  <p className="text-sm font-medium">Employees Error:</p>
                  <p className="text-sm">{employeesError.response?.data?.error?.message || employeesError.message}</p>
                  {employeesError.response?.status && (
                    <p className="text-xs mt-1">Status: {employeesError.response.status}</p>
                  )}
                </div>
              )}
              {leavesError && (
                <div className="mt-2">
                  <p className="text-sm font-medium">Leaves Error:</p>
                  {leavesError.response?.status === 429 ? (
                    <p className="text-sm text-muted-foreground">
                      Rate limit reached. Data will refresh automatically when available.
                    </p>
                  ) : (
                    <>
                      <p className="text-sm">{leavesError.response?.data?.error?.message || leavesError.message}</p>
                      {leavesError.response?.status && (
                        <p className="text-xs mt-1">Status: {leavesError.response.status}</p>
                      )}
                    </>
                  )}
                </div>
              )}
              {attendanceError && (
                <div className="mt-2">
                  <p className="text-sm font-medium">Attendance Error:</p>
                  {attendanceError.response?.status === 429 ? (
                    <p className="text-sm text-muted-foreground">
                      Rate limit reached. Data will refresh automatically when available.
                    </p>
                  ) : (
                    <>
                      <p className="text-sm">{attendanceError.response?.data?.error?.message || attendanceError.message}</p>
                      {attendanceError.response?.status && (
                        <p className="text-xs mt-1">Status: {attendanceError.response.status}</p>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">Loading dashboard data...</div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="text-primary" size={20} />
              {isAdminRole ? 'Total Staff' : 'Total Employees'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isAdminRole ? (
              <>
                <div className="text-3xl font-bold text-primary">{totalEmployees}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {hrCount} HR + {employeeCount} Employees
                </p>
                <p className="text-xs text-muted-foreground mt-1">{activeEmployees} active employees</p>
              </>
            ) : (
              <>
                <div className="text-3xl font-bold text-primary">{totalEmployees}</div>
                <p className="text-xs text-muted-foreground mt-1">{activeEmployees} active</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="text-warning" size={20} />
              Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">{pendingCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Leave requests</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="text-success" size={20} />
              Present Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{presentToday}</div>
            <p className="text-xs text-muted-foreground mt-1">Employees</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-secondary bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="text-secondary" size={20} />
              Attendance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary">
              {totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Today</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Today's Attendance</CardTitle>
            <CardDescription>Status distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={attendanceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {attendanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leave Requests Status</CardTitle>
            <CardDescription>Current leave requests</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={leaveStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#14b8a6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Frequently used actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => navigate('/leaves')}
              variant="outline"
              className="h-20 flex-col gap-2"
            >
              <Calendar className="text-primary" size={24} />
              <span>Manage Leaves</span>
            </Button>
            <Button
              onClick={() => navigate('/employees')}
              variant="outline"
              className="h-20 flex-col gap-2"
            >
              <Users className="text-secondary" size={24} />
              <span>View Employees</span>
            </Button>
            <Button
              onClick={() => navigate('/attendance')}
              variant="outline"
              className="h-20 flex-col gap-2"
            >
              <Clock className="text-accent" size={24} />
              <span>Attendance</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pending Leaves */}
      {pendingCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Pending Leave Approvals</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/leaves')}
              >
                View All <ArrowRight className="ml-2" size={16} />
              </Button>
            </CardTitle>
            <CardDescription>Requires your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaves?.slice(0, 5).map((leave) => (
                <div
                  key={leave.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate('/leaves')}
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{leave.first_name} {leave.last_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {leave.leave_type} • {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="warning" className="bg-warning text-white">
                    Pending
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

