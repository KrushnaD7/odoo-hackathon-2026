import { format, parseISO } from 'date-fns'

export const formatDate = (date) => {
  if (!date) return '-'
  try {
    return format(parseISO(date), 'MMM dd, yyyy')
  } catch {
    return format(new Date(date), 'MMM dd, yyyy')
  }
}

export const formatDateTime = (date) => {
  if (!date) return '-'
  try {
    return format(parseISO(date), 'MMM dd, yyyy HH:mm')
  } catch {
    return format(new Date(date), 'MMM dd, yyyy HH:mm')
  }
}

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export const formatTime = (date) => {
  if (!date) return '-'
  try {
    return format(parseISO(date), 'HH:mm')
  } catch {
    return format(new Date(date), 'HH:mm')
  }
}

export const getInitials = (firstName, lastName) => {
  const first = firstName?.charAt(0)?.toUpperCase() || ''
  const last = lastName?.charAt(0)?.toUpperCase() || ''
  return first + last || 'U'
}

