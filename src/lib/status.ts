import type { BookingStatus } from '../types'
import { tokens } from '../theme'

export const STATUS_ORDER: BookingStatus[] = ['Confirmed', 'Pending', 'Completed', 'Cancelled']

export const STATUS_COLOR: Record<BookingStatus, string> = {
  Confirmed: tokens.gold,
  Pending: '#9A9AA4',
  Completed: '#8FA58F',
  Cancelled: '#B0776F',
}
