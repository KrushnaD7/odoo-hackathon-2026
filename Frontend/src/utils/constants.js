export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const ROLES = {
  EMPLOYEE: 'employee',
  HR: 'hr',
  ADMIN: 'admin'
}

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  HALF_DAY: 'half_day',
  LEAVE: 'leave'
}

export const LEAVE_TYPE = {
  PAID: 'paid',
  SICK: 'sick',
  UNPAID: 'unpaid'
}

export const LEAVE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
}

export const ATTENDANCE_STATUS_COLORS = {
  present: 'bg-success text-white',
  absent: 'bg-error text-white',
  half_day: 'bg-warning text-white',
  leave: 'bg-secondary text-white'
}

export const LEAVE_STATUS_COLORS = {
  pending: 'bg-warning text-white',
  approved: 'bg-success text-white',
  rejected: 'bg-error text-white'
}

