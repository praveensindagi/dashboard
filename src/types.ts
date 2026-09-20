export type NavKey =
  | 'dashboard'
  | 'bookings'
  | 'bespoke'
  | 'prive-applications'
  | 'prive-members'
  | 'upcoming'
  | 'completed'

export type BookingStatus = 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled'
export type BookingType = 'Regular' | 'Privé' | 'Bespoke'
export type RangeKey = '7d' | '30d' | 'month'
export type Sentiment = 'positive' | 'negative' | 'neutral'
export type MetricIconKey = 'calendar' | 'hourglass' | 'layers' | 'rupee' | 'wallet' | 'gem' | 'bespoke'

export interface MetricData {
  id: string
  label: string
  value: number
  format: 'number' | 'padded' | 'currency'
  icon: MetricIconKey
  trend: { label: string; direction: 'up' | 'down' | 'flat'; sentiment: Sentiment }
  caption: string
  /** Larger, gold-emphasised card. */
  featured?: boolean
}

export interface BookingPoint {
  /** ISO date, YYYY-MM-DD */
  date: string
  regular: number
  prive: number
}

export interface Look {
  id: string
  name: string
  bookings: number
}

export interface Booking {
  id: string
  client: string
  look: string
  type: BookingType
  /** ISO date, YYYY-MM-DD */
  date: string
  /** Amount in INR */
  amount: number
  status: BookingStatus
}

export interface StatusSlice {
  status: BookingStatus
  count: number
}

export interface PriveSummary {
  activeMembers: number
  newMembers: number
  bookings: number
  revenue: number
  averageBookingValue: number
  revenueTrendLabel: string
  weeklyRevenue: { week: string; revenue: number }[]
}

export interface NotificationItem {
  id: string
  title: string
  detail: string
  time: string
  unread: boolean
}

export type ApplicationStatus = 'Pending' | 'Approved' | 'Declined'

/** A full booking, as listed in the Bookings, Bespoke, Upcoming and Completed sections. */
export interface BookingRecord {
  /** Firestore document id */
  id: string
  /** Display id, e.g. AE-3HYDWG */
  ref: string
  client: string
  email: string
  phone: string
  service: string
  /** Curated look, else the service booked */
  look: string
  type: BookingType
  /** Customised booking (curated look or bespoke service) */
  bespoke: boolean
  status: BookingStatus
  amount: number
  /** Appointment date, ISO YYYY-MM-DD */
  date: string
  /** Appointment time as entered, e.g. "1:00 PM" */
  time: string
  startsAt: number
  createdAt: number
  address: string
  skinType: string
  skinConcerns: string[]
  notes: string
  isMember: boolean
  membershipId: string
}

export interface PriveApplicationRecord {
  id: string
  name: string
  email: string
  phone: string
  instagram: string
  interest: string
  occasion: string
  ageRange: string
  gender: string
  country: string
  language: string
  createdAt: number
  status: ApplicationStatus
  membershipId: string
  styleProfile: { question: string; answer: string }[]
}

export interface MemberRecord {
  /** Membership ID, e.g. AEPSPRIVE143 */
  id: string
  name: string
  email: string
  phone: string
  photoURL: string
  instagram: string
  /** ISO date, or empty when unknown */
  since: string
  status: string
  applicationId: string
}

export interface DashboardData {
  metrics: MetricData[]
  allBookings: BookingRecord[]
  applications: PriveApplicationRecord[]
  members: MemberRecord[]
  bookingSeries: Record<RangeKey, BookingPoint[]>
  looks: Look[]
  bookings: Booking[]
  statusBreakdown: StatusSlice[]
  prive: PriveSummary
  notifications: NotificationItem[]
  pendingApplications: number
}

export interface AdminUser {
  name: string
  role: string
  email: string
}

export interface SearchItem {
  id: string
  label: string
  sublabel: string
  kind: 'Booking' | 'Look'
}
