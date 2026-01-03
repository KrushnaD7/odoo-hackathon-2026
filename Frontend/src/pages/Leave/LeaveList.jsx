import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { leaveService } from '../../services/leaveService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { Textarea } from '../../components/ui/textarea'
import { useToast } from '../../components/ui/use-toast'
import { Calendar, Plus, CheckCircle, XCircle, Eye } from 'lucide-react'
import { formatDate } from '../../utils/formatters'
import { LEAVE_STATUS_COLORS, LEAVE_TYPE } from '../../utils/constants'

export default function LeaveList() {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const isEmployee = user?.role === 'employee'
  const isHR = user?.role === 'hr'
  const isAdminRole = user?.role === 'admin'
  // HR and Admin should see all leaves, employees see only their own
  const canViewAllLeaves = isAdminRole || isHR
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedLeave, setSelectedLeave] = useState(null)
  const [approvalDialog, setApprovalDialog] = useState({ open: false, action: null, comment: '' })

  // Get leaves
  const { data: leavesData, isLoading, error } = useQuery({
    queryKey: ['leaves', statusFilter, canViewAllLeaves],
    queryFn: async () => {
      try {
        if (canViewAllLeaves) {
          // HR and Admin see all employees' leave requests
          const response = await leaveService.getAllLeaves({
            status: statusFilter === 'all' ? undefined : statusFilter,
          })
          console.log('All leaves response:', response)
          // Service returns: { success: true, data: [...], pagination: {...} }
          return response
        } else {
          // Employees see only their own leave requests
          const response = await leaveService.getMyLeaves({
            status: statusFilter === 'all' ? undefined : statusFilter,
          })
          console.log('My leaves response:', response)
          // Service returns: { success: true, data: [...], pagination: {...} }
          return response
        }
      } catch (error) {
        console.error('Error fetching leaves:', error)
        if (error?.response?.status !== 429) {
          console.error('Error details:', error.response?.data)
        }
        throw error
      }
    },
    retry: (failureCount, error) => {
      if (error?.response?.status === 429) return false
      return failureCount < 1
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: ({ leaveId, comment }) => leaveService.approveLeave(leaveId, comment),
    onSuccess: () => {
      queryClient.invalidateQueries(['leaves'])
      setApprovalDialog({ open: false, action: null, comment: '' })
      toast({
        title: 'Leave approved',
        variant: 'success',
      })
    },
    onError: (error) => {
      toast({
        title: 'Approval failed',
        description: error.response?.data?.error?.message || 'Failed to approve leave',
        variant: 'destructive',
      })
    },
  })

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ leaveId, comment }) => leaveService.rejectLeave(leaveId, comment),
    onSuccess: () => {
      queryClient.invalidateQueries(['leaves'])
      setApprovalDialog({ open: false, action: null, comment: '' })
      toast({
        title: 'Leave rejected',
        variant: 'success',
      })
    },
    onError: (error) => {
      toast({
        title: 'Rejection failed',
        description: error.response?.data?.error?.message || 'Failed to reject leave',
        variant: 'destructive',
      })
    },
  })

  const handleApprove = (leave) => {
    setSelectedLeave(leave)
    setApprovalDialog({ open: true, action: 'approve', comment: '' })
  }

  const handleReject = (leave) => {
    setSelectedLeave(leave)
    setApprovalDialog({ open: true, action: 'reject', comment: '' })
  }

  const handleSubmitApproval = () => {
    if (approvalDialog.action === 'approve') {
      approveMutation.mutate({
        leaveId: selectedLeave.id,
        comment: approvalDialog.comment || null,
      })
    } else {
      rejectMutation.mutate({
        leaveId: selectedLeave.id,
        comment: approvalDialog.comment || null,
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Leave Management</h1>
          <p className="text-muted-foreground mt-1">
            {canViewAllLeaves ? 'Manage all leave requests' : 'View and manage your leave requests'}
          </p>
        </div>
        {isEmployee && (
          <Button onClick={() => navigate('/leaves/apply')}>
            <Plus className="mr-2" size={20} />
            Apply for Leave
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 max-w-xs">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaves Table */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
          <CardDescription>
            {leavesData?.pagination?.total ?? leavesData?.data?.length ?? 0} leave request(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-foreground">Loading...</div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-destructive">
                {error.response?.status === 429 
                  ? 'Rate limit reached. Please try again in a moment.'
                  : `Error loading leaves: ${error.response?.data?.error?.message || error.message}`
                }
              </p>
            </div>
          ) : leavesData?.data && leavesData.data.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  {canViewAllLeaves && <TableHead>Employee</TableHead>}
                  <TableHead>Type</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leavesData.data.map((leave) => (
                  <TableRow key={leave.id}>
                    {canViewAllLeaves && (
                      <TableCell>
                        <span className="text-foreground">{leave.first_name} {leave.last_name}</span>
                        <div className="text-xs text-muted-foreground">{leave.employee_id}</div>
                      </TableCell>
                    )}
                    <TableCell className="capitalize text-foreground">{leave.leave_type}</TableCell>
                    <TableCell className="text-foreground">{formatDate(leave.start_date)}</TableCell>
                    <TableCell className="text-foreground">{formatDate(leave.end_date)}</TableCell>
                    <TableCell className="text-foreground">{leave.total_days}</TableCell>
                    <TableCell>
                      <Badge className={LEAVE_STATUS_COLORS[leave.status]}>
                        {leave.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {canViewAllLeaves && leave.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApprove(leave)}
                              className="text-success hover:text-success"
                            >
                              <CheckCircle className="mr-1" size={16} />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(leave)}
                              className="text-error hover:text-error"
                            >
                              <XCircle className="mr-1" size={16} />
                              Reject
                            </Button>
                          </>
                        )}
                        {leave.remarks && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedLeave(leave)}
                          >
                            <Eye size={16} />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No leave requests found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={approvalDialog.open} onOpenChange={(open) => setApprovalDialog({ ...approvalDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approvalDialog.action === 'approve' ? 'Approve' : 'Reject'} Leave Request
            </DialogTitle>
            <DialogDescription>
              {selectedLeave && (
                <>
                  {selectedLeave.first_name} {selectedLeave.last_name} - {selectedLeave.leave_type} leave
                  <br />
                  {formatDate(selectedLeave.start_date)} to {formatDate(selectedLeave.end_date)}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Comment (Optional)</Label>
              <Textarea
                value={approvalDialog.comment}
                onChange={(e) => setApprovalDialog({ ...approvalDialog, comment: e.target.value })}
                placeholder="Add a comment..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setApprovalDialog({ open: false, action: null, comment: '' })}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitApproval}
              disabled={approveMutation.isPending || rejectMutation.isPending}
              variant={approvalDialog.action === 'approve' ? 'default' : 'destructive'}
            >
              {approvalDialog.action === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Leave Details Dialog */}
      {selectedLeave && !approvalDialog.open && (
        <Dialog open={!!selectedLeave} onOpenChange={() => setSelectedLeave(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Leave Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-muted-foreground">Remarks</Label>
                <p className="font-medium text-foreground">{selectedLeave.remarks || 'No remarks'}</p>
              </div>
              {selectedLeave.admin_comment && (
                <div>
                  <Label className="text-muted-foreground">Admin Comment</Label>
                  <p className="font-medium text-foreground">{selectedLeave.admin_comment}</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => setSelectedLeave(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

