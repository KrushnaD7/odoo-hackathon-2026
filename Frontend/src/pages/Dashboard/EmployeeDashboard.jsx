import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { attendanceService } from '../../services/attendanceService'
import { leaveService } from '../../services/leaveService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { useToast } from '../../components/ui/use-toast'
import { Clock, Calendar, FileText, LogIn, LogOut, Plus, CheckCircle, XCircle, ClockIcon } from 'lucide-react'
import { formatDate } from '../../utils/formatters'
import { ATTENDANCE_STATUS_COLORS, LEAVE_STATUS_COLORS } from '../../utils/constants'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns'

export default function EmployeeDashboard() {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const isEmployee = user?.role === 'employee'

  // Get today's attendance
  const { data: todayAttendance } = useQuery({
    queryKey: ['attendance', 'today'],
    queryFn: async () => {
      const today = format(new Date(), 'yyyy-MM-dd')
      const response = await attendanceService.getMyAttendance({
        startDate: today,
        endDate: today,
      })
      // Response structure: { success: true, data: [...], pagination: {...} }
      const attendance = response.data?.[0] || null
      console.log('Today attendance data:', attendance)
      return attendance
    },
    retry: (failureCount, error) => {
      if (error?.response?.status === 429) return false
      return failureCount < 1
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  })

  // Get pending leaves
  const { data: leavesData } = useQuery({
    queryKey: ['leaves', 'pending'],
    queryFn: async () => {
      const response = await leaveService.getMyLeaves({ status: 'pending' })
      return response.data
    },
    retry: (failureCount, error) => {
      if (error?.response?.status === 429) return false
      return failureCount < 1
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })

  // Get recent attendance
  const { data: attendanceData } = useQuery({
    queryKey: ['attendance', 'recent'],
    queryFn: async () => {
      const response = await attendanceService.getMyAttendance({ limit: 7 })
      return response.data
    },
    retry: (failureCount, error) => {
      if (error?.response?.status === 429) return false
      return failureCount < 1
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: attendanceService.checkIn,
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
    mutationFn: attendanceService.checkOut,
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

  const canCheckIn = !todayAttendance?.check_in_time
  const canCheckOut = !!todayAttendance?.check_in_time && !todayAttendance?.check_out_time

  // Debug logging
  console.log('Today attendance:', todayAttendance)
  console.log('Check in time:', todayAttendance?.check_in_time)
  console.log('Check out time:', todayAttendance?.check_out_time)
  console.log('Can check in:', canCheckIn)
  console.log('Can check out:', canCheckOut)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back, {user?.employee_id}!</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-2 border-primary/30 bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Clock className="text-primary" size={24} />
              Attendance
            </CardTitle>
            <CardDescription>Today's attendance status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {todayAttendance && (
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant={todayAttendance.status === 'present' ? 'success' : 'warning'}
                  className={ATTENDANCE_STATUS_COLORS[todayAttendance.status]}
                >
                  {todayAttendance.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                </Badge>
                {todayAttendance.check_in_time && (
                  <span className="text-sm text-foreground">
                    Checked in: {format(new Date(todayAttendance.check_in_time), 'HH:mm')}
                  </span>
                )}
                {todayAttendance.check_out_time && (
                  <span className="text-sm text-foreground">
                    Checked out: {format(new Date(todayAttendance.check_out_time), 'HH:mm')}
                  </span>
                )}
              </div>
            )}
            <div className="flex gap-2">
              {canCheckIn && (
                <Button
                  onClick={() => checkInMutation.mutate()}
                  disabled={checkInMutation.isPending}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
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
              {!canCheckIn && !canCheckOut && !todayAttendance && (
                <div className="flex-1 text-center py-2 text-muted-foreground text-sm">
                  No attendance record for today. Click Check In to start.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Calendar className="text-secondary" size={24} />
              Leave Requests
            </CardTitle>
            <CardDescription>Your leave status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold text-primary">
              {leavesData?.data?.length || 0}
            </div>
            <p className="text-sm text-muted-foreground">Pending leave requests</p>
            {isEmployee && (
              <Button
                onClick={() => navigate('/leaves/apply')}
                variant="outline"
                className="w-full"
              >
                <Plus className="mr-2" size={20} />
                Apply for Leave
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {attendanceData?.data?.filter(a => a.status === 'present').length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Days Present</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Leaves</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {leavesData?.data?.filter(l => l.status === 'approved').length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Approved Leaves</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Quick Access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                onClick={() => navigate('/profile')}
                className="justify-start"
              >
                <FileText className="mr-2" size={16} />
                View Profile
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate('/leaves')}
                className="justify-start"
              >
                <Calendar className="mr-2" size={16} />
                My Leaves
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance</CardTitle>
          <CardDescription>Your last 7 days attendance</CardDescription>
        </CardHeader>
        <CardContent>
          {attendanceData?.data?.length > 0 ? (
            <div className="space-y-2">
              {attendanceData.data.slice(0, 7).map((attendance) => (
                <div
                  key={attendance.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                      <Calendar className="text-accent-foreground" size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{formatDate(attendance.date)}</p>
                      <p className="text-sm text-muted-foreground">
                        {attendance.check_in_time && format(new Date(attendance.check_in_time), 'HH:mm')}
                        {attendance.check_out_time && ` - ${format(new Date(attendance.check_out_time), 'HH:mm')}`}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={ATTENDANCE_STATUS_COLORS[attendance.status]}
                  >
                    {attendance.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No attendance records yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

