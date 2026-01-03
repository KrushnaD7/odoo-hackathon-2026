import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { leaveService } from '../../services/leaveService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Textarea } from '../../components/ui/textarea'
import { useToast } from '../../components/ui/use-toast'
import { Calendar, ArrowLeft } from 'lucide-react'
import { differenceInDays, eachDayOfInterval, isWeekend } from 'date-fns'
import { useAuth } from '../../contexts/AuthContext'

const leaveSchema = z.object({
  leave_type: z.enum(['paid', 'sick', 'unpaid']),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  remarks: z.string().optional(),
}).refine((data) => {
  return new Date(data.end_date) >= new Date(data.start_date)
}, {
  message: 'End date must be after start date',
  path: ['end_date'],
})

export default function ApplyLeave() {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const isEmployee = user?.role === 'employee'
  const [totalDays, setTotalDays] = useState(0)

  // Redirect HR and Admin away from this page
  useEffect(() => {
    if (!isEmployee) {
      toast({
        title: 'Access Denied',
        description: 'Only employees can apply for leave.',
        variant: 'destructive',
      })
      navigate('/leaves')
    }
  }, [isEmployee, navigate, toast])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(leaveSchema),
    defaultValues: {
      leave_type: 'paid',
    },
  })

  const startDate = watch('start_date')
  const endDate = watch('end_date')

  // Calculate total days excluding weekends
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      if (end >= start) {
        const days = eachDayOfInterval({ start, end })
        const workingDays = days.filter(day => !isWeekend(day)).length
        setTotalDays(workingDays)
      } else {
        setTotalDays(0)
      }
    }
  }, [startDate, endDate])

  const applyMutation = useMutation({
    mutationFn: leaveService.applyLeave,
    onSuccess: () => {
      queryClient.invalidateQueries(['leaves'])
      toast({
        title: 'Leave request submitted',
        description: 'Your leave request has been submitted for approval.',
        variant: 'success',
      })
      navigate('/leaves')
    },
    onError: (error) => {
      let errorMessage = 'Failed to submit leave request'
      
      if (error.response?.status === 409) {
        errorMessage = error.response?.data?.error?.message || 'Leave request overlaps with an existing approved or pending leave. Please check your existing leave requests.'
      } else if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message
      }
      
      toast({
        title: 'Failed to apply leave',
        description: errorMessage,
        variant: 'destructive',
      })
    },
  })

  const onSubmit = (data) => {
    applyMutation.mutate({
      ...data,
      total_days: totalDays,
    })
  }

  // Don't render if not an employee
  if (!isEmployee) {
    return null
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/leaves')}>
          <ArrowLeft className="mr-2" size={20} />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Apply for Leave</h1>
          <p className="text-muted-foreground mt-1">Submit a new leave request</p>
        </div>
      </div>

      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="text-primary" size={24} />
              Leave Application
            </CardTitle>
          <CardDescription>Fill in the details to apply for leave</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="leave_type">Leave Type *</Label>
              <Select
                onValueChange={(value) => setValue('leave_type', value)}
                defaultValue="paid"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid Leave</SelectItem>
                  <SelectItem value="sick">Sick Leave</SelectItem>
                  <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                </SelectContent>
              </Select>
              {errors.leave_type && (
                <p className="text-sm text-destructive">{errors.leave_type.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date *</Label>
                <div className="relative">
                  <Input
                    id="start_date"
                    type="date"
                    className="cursor-pointer pr-10 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:w-6 [&::-webkit-calendar-picker-indicator]:h-6 [&::-webkit-calendar-picker-indicator]:text-primary"
                    {...register('start_date')}
                    onChange={(e) => {
                      setValue('start_date', e.target.value)
                      if (endDate) {
                        const start = new Date(e.target.value)
                        const end = new Date(endDate)
                        if (end >= start) {
                          const days = eachDayOfInterval({ start, end })
                          setTotalDays(days.filter(day => !isWeekend(day)).length)
                        }
                      }
                    }}
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-primary opacity-70" size={20} />
                </div>
                {errors.start_date && (
                  <p className="text-sm text-destructive">{errors.start_date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">End Date *</Label>
                <div className="relative">
                  <Input
                    id="end_date"
                    type="date"
                    className="cursor-pointer pr-10 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:w-6 [&::-webkit-calendar-picker-indicator]:h-6 [&::-webkit-calendar-picker-indicator]:text-primary"
                    {...register('end_date')}
                    onChange={(e) => {
                      setValue('end_date', e.target.value)
                      if (startDate) {
                        const start = new Date(startDate)
                        const end = new Date(e.target.value)
                        if (end >= start) {
                          const days = eachDayOfInterval({ start, end })
                          setTotalDays(days.filter(day => !isWeekend(day)).length)
                        }
                      }
                    }}
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-primary opacity-70" size={20} />
                </div>
                {errors.end_date && (
                  <p className="text-sm text-destructive">{errors.end_date.message}</p>
                )}
              </div>
            </div>

            {totalDays > 0 && (
              <div className="p-4 bg-card rounded-lg border border-primary/30">
                <p className="text-sm text-muted-foreground">Total Working Days</p>
                <p className="text-2xl font-bold text-primary">{totalDays} days</p>
                <p className="text-xs text-muted-foreground mt-1">Weekends excluded</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                placeholder="Optional remarks about your leave request..."
                rows={4}
                {...register('remarks')}
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={applyMutation.isPending || totalDays === 0}
                className="flex-1 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600"
              >
                {applyMutation.isPending ? 'Submitting...' : 'Submit Leave Request'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/leaves')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

