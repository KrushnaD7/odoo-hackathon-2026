import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../contexts/AuthContext'
import { attendanceService } from '../../services/attendanceService'
import { employeeService } from '../../services/employeeService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { useToast } from '../../components/ui/use-toast'
import { LogIn, LogOut, Calendar, Clock } from 'lucide-react'
import { formatDate, formatTime } from '../../utils/formatters'
import { ATTENDANCE_STATUS_COLORS } from '../../utils/constants'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns'

export default function Attendance() {
  const { user, isAdmin } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [employeeFilter, setEmployeeFilter] = useState('all')
  const [dateRange, setDateRange] = useState({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  })

  // Get employees for filter (admin only)
  const { data: employeesData } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const response = await employeeService.listEmployees()
      return response.data
    },
    enabled: isAdmin,
  })

  // Get attendance data
  const { data: attendanceData, isLoading, error: attendanceError } = useQuery({
    queryKey: ['attendance', dateRange, employeeFilter],
    queryFn: async () => {
      try {
        if (isAdmin) {
          const response = await attendanceService.getAllAttendance({
            ...dateRange,
            employeeId: employeeFilter === 'all' ? undefined : employeeFilter,
          })
          console.log('Admin attendance response:', response)
          return response
        } else {
          const response = await attendanceService.getMyAttendance(dateRange)
          console.log('Employee attendance response:', response)
          return response
        }
      } catch (error) {
        console.error('Error fetching attendance:', error)
        throw error
      }
    },
    retry: 1,
  })

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: () => attendanceService.checkIn(selectedDate),
    onSuccess: () => {
      // Invalidate and refetch attendance queries
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
      toast({
        title: 'Checked in successfully!',
        variant: 'success',
      })
    },
    onError: (error) => {
      toast({
        title: 'Check-in failed',
        description: error.response?.data?.error?.message || 'Failed to check in',
        variant: 'destructive',
      })
    },
  })

  // Check-out mutation
  const checkOutMutation = useMutation({
    mutationFn: () => attendanceService.checkOut(selectedDate),
    onSuccess: () => {
      // Invalidate and refetch attendance queries
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
      toast({
        title: 'Checked out successfully!',
        variant: 'success',
      })
    },
    onError: (error) => {
      toast({
        title: 'Check-out failed',
        description: error.response?.data?.error?.message || 'Failed to check out',
        variant: 'destructive',
      })
    },
  })

  // Get today's attendance for check-in/out
  const { data: todayAttendance } = useQuery({
    queryKey: ['attendance', 'today', selectedDate],
    queryFn: async () => {
      const response = await attendanceService.getMyAttendance({
        startDate: selectedDate,
        endDate: selectedDate,
      })
      // Response structure: { success: true, data: [...], pagination: {...} }
      const attendance = response.data?.[0] || null
      console.log('Today attendance data (Attendance page):', attendance)
      return attendance
    },
    enabled: !isAdmin,
    retry: (failureCount, error) => {
      if (error?.response?.status === 429) return false
      return failureCount < 1
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  })

  const canCheckIn = !todayAttendance?.check_in_time
  const canCheckOut = !!todayAttendance?.check_in_time && !todayAttendance?.check_out_time

  // Debug logging
  console.log('Attendance page - Today attendance:', todayAttendance)
  console.log('Attendance page - Check in time:', todayAttendance?.check_in_time)
  console.log('Attendance page - Check out time:', todayAttendance?.check_out_time)
  console.log('Attendance page - Can check in:', canCheckIn)
  console.log('Attendance page - Can check out:', canCheckOut)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Attendance</h1>
        <p className="text-muted-foreground mt-1">Track your daily attendance</p>
      </div>

      {/* Check-in/Check-out Section (Employee only) */}
      {!isAdmin && (
        <Card className="bg-card border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Clock className="text-primary" size={24} />
              Today's Attendance
            </CardTitle>
            <CardDescription>Mark your attendance for {format(new Date(selectedDate), 'MMMM dd, yyyy')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label>Select Date</Label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>
            </div>
            {todayAttendance && (
              <div className="p-4 bg-card rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground">Status</span>
                  <Badge className={ATTENDANCE_STATUS_COLORS[todayAttendance.status]}>
                    {todayAttendance.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                {todayAttendance.check_in_time && (
                  <div className="text-sm text-foreground">
                    Check-in: {formatTime(todayAttendance.check_in_time)}
                  </div>
                )}
                {todayAttendance.check_out_time && (
                  <div className="text-sm text-foreground">
                    Check-out: {formatTime(todayAttendance.check_out_time)}
                  </div>
                )}
              </div>
            )}
            <div className="flex gap-3">
              {canCheckIn && (
                <Button
                  onClick={() => checkInMutation.mutate()}
                  disabled={checkInMutation.isPending}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  size="lg"
                >
                  <LogIn className="mr-2" size={20} />
                  {checkInMutation.isPending ? 'Checking in...' : 'Check In'}
                </Button>
              )}
              {canCheckOut && (
                <Button
                  onClick={() => checkOutMutation.mutate()}
                  disabled={checkOutMutation.isPending}
                  className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  size="lg"
                >
                  <LogOut className="mr-2" size={20} />
                  {checkOutMutation.isPending ? 'Checking out...' : 'Check Out'}
                </Button>
              )}
              {!canCheckIn && !canCheckOut && todayAttendance?.check_out_time && (
                <div className="flex-1 text-center py-2 text-muted-foreground text-sm">
                  You have already checked in and checked out for today.
                </div>
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
            {isAdmin && (
              <div className="space-y-2">
                <Label>Employee</Label>
                <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All employees" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All employees</SelectItem>
                    {employeesData?.data?.map((emp) => (
                      <SelectItem key={emp.user_id} value={emp.user_id}>
                        {emp.first_name} {emp.last_name} ({emp.employee_id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>
            {attendanceData?.pagination?.total || 0} records found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Error Message */}
          {attendanceError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-semibold">Error loading attendance:</p>
              <p className="text-red-600 text-sm mt-1">
                {attendanceError.response?.data?.error?.message || attendanceError.message}
              </p>
              {attendanceError.response?.status && (
                <p className="text-red-500 text-xs mt-1">Status: {attendanceError.response.status}</p>
              )}
            </div>
          )}
          
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : attendanceData?.data?.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  {isAdmin && <TableHead>Employee</TableHead>}
                  <TableHead>Date</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceData.data.map((attendance) => (
                  <TableRow key={attendance.id}>
                    {isAdmin && (
                      <TableCell>
                        <span className="text-foreground">{attendance.first_name} {attendance.last_name}</span>
                        <div className="text-xs text-muted-foreground">{attendance.employee_id}</div>
                      </TableCell>
                    )}
                    <TableCell>{formatDate(attendance.date)}</TableCell>
                    <TableCell>
                      {attendance.check_in_time ? formatTime(attendance.check_in_time) : '-'}
                    </TableCell>
                    <TableCell>
                      {attendance.check_out_time ? formatTime(attendance.check_out_time) : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge className={ATTENDANCE_STATUS_COLORS[attendance.status]}>
                        {attendance.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No attendance records found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

