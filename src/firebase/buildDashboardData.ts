import type {
  ApplicationStatus,
  Booking,
  BookingPoint,
  BookingRecord,
  BookingStatus,
  BookingType,
  DashboardData,
  MemberRecord,
  MetricData,
  NotificationItem,
  PriveApplicationRecord,
  PriveSummary,
  Sentiment,
} from '../types'
import { formatDate, toISODate } from '../lib/format'
import { STATUS_ORDER } from '../lib/status'

/**
 * Pure mapping from raw Firestore documents to the DashboardData the UI renders.
 * Everything that depends on how your documents are shaped lives in this file, so it is
 * the only place to edit if a field name or status string differs from what is assumed here.
 */

export interface RawDoc {
  id: string
  data: Record<string, unknown>
}

export interface RawCollections {
  bookings: RawDoc[]
  priveApplications: RawDoc[]
  priveMembers: RawDoc[]
  jobApplications: RawDoc[]
  users: RawDoc[]
}

/** Where the dashboard gets its data. Firestore is the default (src/firebase/source.ts). */
export interface DataSource {
  subscribe(onRaw: (raw: RawCollections) => void, onError: (error: Error) => void): () => void
  /** Optional: write derived changes back (auto-confirm, auto-complete). */
  sync?(raw: RawCollections, now: Date): Promise<void>
}

// ---------- behaviour switches ----------

/** A new booking is confirmed straight away instead of waiting as Pending. */
export const AUTO_CONFIRM_BOOKINGS = true
/** A confirmed booking whose appointment date has passed becomes Completed. */
export const AUTO_COMPLETE_PAST_BOOKINGS = true

// ---------- assumptions you can change ----------

/** Status strings (lower-cased) found in `bookings.status`, mapped to the four dashboard stages. */
const STATUS_ALIASES: Record<string, BookingStatus> = {
  pending: 'Pending',
  received: 'Pending',
  requested: 'Pending',
  new: 'Pending',
  confirmed: 'Confirmed',
  accepted: 'Confirmed',
  approved: 'Confirmed',
  scheduled: 'Confirmed',
  completed: 'Completed',
  complete: 'Completed',
  done: 'Completed',
  fulfilled: 'Completed',
  cancelled: 'Cancelled',
  canceled: 'Cancelled',
  rejected: 'Cancelled',
  declined: 'Cancelled',
}

/** A booking counts as Privé when the client is a member. */
const isPriveBooking = (d: Record<string, unknown>) =>
  d.isMember === true || (typeof d.membershipId === 'string' && d.membershipId.trim() !== '')

/** A booking counts as bespoke (customised) when a curated look is attached or the service/type says so. */
const isBespokeBooking = (d: Record<string, unknown>) =>
  Boolean(d.curatedLook) || /bespoke|custom/i.test(`${str(d.service)} ${str(d.type)} ${str(d.bookingType)}`)

/** Payment signal. If no booking has any of these fields, Confirmed and Completed bookings count as paid. */
const PAID_STATUSES = ['paid', 'success', 'succeeded', 'captured', 'received']
const paymentSignal = (d: Record<string, unknown>) =>
  'paid' in d || 'paymentStatus' in d || 'paymentId' in d || 'razorpayPaymentId' in d
const isPaid = (d: Record<string, unknown>) =>
  d.paid === true ||
  PAID_STATUSES.includes(str(d.paymentStatus).toLowerCase()) ||
  Boolean(d.paymentId) ||
  Boolean(d.razorpayPaymentId)

/** Membership IDs look like AEPSPRIVE143. */
export const MEMBERSHIP_PREFIX = 'AEPSPRIVE'

// ---------- helpers ----------

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')
const num = (v: unknown) => {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))) return Number(v)
  return 0
}

export function toDate(v: unknown): Date | null {
  if (!v) return null
  if (v instanceof Date) return v
  if (typeof v === 'object' && typeof (v as { toDate?: unknown }).toDate === 'function') {
    return (v as { toDate: () => Date }).toDate()
  }
  if (typeof v === 'number') return new Date(v)
  if (typeof v === 'string') {
    const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v.trim())
    if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]))
    const t = Date.parse(v)
    return Number.isNaN(t) ? null : new Date(t)
  }
  return null
}

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

/** "Sunday, 20 September 2026" -> local Date */
export function parsePreferredDate(v: unknown): Date | null {
  const m = /(\d{1,2})\s+([A-Za-z]{3,})\S*\s+(\d{4})/.exec(str(v))
  if (!m) return toDate(v)
  const month = MONTHS.indexOf(m[2].slice(0, 3).toLowerCase())
  return month < 0 ? null : new Date(Number(m[3]), month, Number(m[1]))
}

/** "1:00 PM" -> minutes after midnight */
export function parseTimeMinutes(v: unknown): number {
  const m = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i.exec(str(v))
  if (!m) return 0
  let h = Number(m[1])
  const suffix = m[3]?.toLowerCase()
  if (suffix === 'pm' && h < 12) h += 12
  if (suffix === 'am' && h === 12) h = 0
  return h * 60 + Number(m[2] ?? 0)
}

export const normalizeStatus = (v: unknown): BookingStatus => STATUS_ALIASES[str(v).toLowerCase()] ?? 'Pending'

export function normalizeApplicationStatus(v: unknown): ApplicationStatus {
  const s = str(v).toLowerCase()
  if (['approved', 'active', 'accepted'].includes(s)) return 'Approved'
  if (['declined', 'rejected'].includes(s)) return 'Declined'
  return 'Pending'
}

export interface StatusPlan {
  /** Status the UI shows */
  status: BookingStatus
  /** Set when Firestore should be updated to match */
  write: null | { status: 'confirmed' | 'completed'; confirmed: boolean }
}

/** Pending becomes Confirmed, and Confirmed becomes Completed once the appointment date has passed. */
export function planStatus(data: Record<string, unknown>, when: Date | null, today: Date): StatusPlan {
  const original = normalizeStatus(data.status)
  let status = original
  let confirmed = false
  if (AUTO_CONFIRM_BOOKINGS && status === 'Pending') {
    status = 'Confirmed'
    confirmed = true
  }
  if (AUTO_COMPLETE_PAST_BOOKINGS && status === 'Confirmed' && when && when < today) status = 'Completed'
  const changed = status !== original
  return { status, write: changed ? { status: status === 'Completed' ? 'completed' : 'confirmed', confirmed } : null }
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
const sameMonth = (a: Date | null, ref: Date) => !!a && a.getFullYear() === ref.getFullYear() && a.getMonth() === ref.getMonth()
const prevMonthOf = (ref: Date) => new Date(ref.getFullYear(), ref.getMonth() - 1, 1)
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)

function pctTrend(cur: number, prev: number): MetricData['trend'] {
  if (prev === 0) {
    return cur === 0
      ? { label: '0%', direction: 'flat', sentiment: 'neutral' }
      : { label: 'New', direction: 'up', sentiment: 'positive' }
  }
  const p = ((cur - prev) / prev) * 100
  const sentiment: Sentiment = p > 0 ? 'positive' : p < 0 ? 'negative' : 'neutral'
  return { label: `${p >= 0 ? '+' : ''}${p.toFixed(1)}%`, direction: p > 0 ? 'up' : p < 0 ? 'down' : 'flat', sentiment }
}

const countTrend = (n: number, sentiment: Sentiment = 'positive'): MetricData['trend'] => ({
  label: n > 0 ? `+${n}` : '0',
  direction: n > 0 ? 'up' : 'flat',
  sentiment: n > 0 ? sentiment : 'neutral',
})

function timeAgo(d: Date | null, now: Date) {
  if (!d) return ''
  const mins = Math.round((now.getTime() - d.getTime()) / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} min ago`
  if (mins < 1440) return `${Math.floor(mins / 60)} h ago`
  const days = Math.floor(mins / 1440)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return formatDate(toISODate(d))
}

const lookName = (v: unknown): string => {
  if (typeof v === 'string') return v.trim()
  if (v && typeof v === 'object') {
    const o = v as Record<string, unknown>
    return str(o.name) || str(o.title)
  }
  return ''
}

const joinParts = (...parts: unknown[]) => parts.map(str).filter(Boolean).join(', ')

/** AEPSPRIVE142 -> 142 (0 if no number) */
export const membershipNumber = (id: string) => {
  const m = /(\d+)\s*$/.exec(id)
  return m ? Number(m[1]) : 0
}

// ---------- builder ----------

export function buildDashboardData(raw: RawCollections, now: Date = new Date()): DashboardData {
  const today = startOfDay(now)
  const prevMonth = prevMonthOf(now)
  const anyPaymentField = raw.bookings.some((b) => paymentSignal(b.data))

  const records = raw.bookings.map(({ id, data }) => {
    const created = toDate(data.createdAt)
    const day = parsePreferredDate(data.preferredDate) ?? created
    const status = planStatus(data, day, today).status
    const prive = isPriveBooking(data)
    const bespoke = isBespokeBooking(data)
    const service = str(data.service)
    const record: BookingRecord = {
      id,
      ref: str(data.bookingId) || str(data.bookingRef) || `AE-${id.slice(0, 6).toUpperCase()}`,
      client: str(data.fullName) || str(data.name) || 'Guest',
      email: str(data.email),
      phone: str(data.phone),
      service,
      look: lookName(data.curatedLook) || service,
      type: (prive ? 'Privé' : bespoke ? 'Bespoke' : 'Regular') as BookingType,
      bespoke,
      status,
      amount: num(data.bookingFee),
      date: toISODate(day ?? now),
      time: str(data.preferredTime),
      startsAt: day ? day.getTime() + parseTimeMinutes(data.preferredTime) * 60000 : 0,
      createdAt: created?.getTime() ?? 0,
      address: str(data.address) || joinParts(data.street, data.locality, data.city, data.state, data.pincode),
      skinType: str(data.skinType),
      skinConcerns: Array.isArray(data.skinConcerns) ? data.skinConcerns.map(String) : [],
      notes: str(data.specialNotes) || str(data.notes),
      isMember: prive,
      membershipId: str(data.membershipId),
    }
    return {
      record,
      created,
      day,
      prive,
      bespoke,
      paid: anyPaymentField ? isPaid(data) : status === 'Confirmed' || status === 'Completed',
    }
  })

  const bookings = records
  const live = bookings.filter((b) => b.record.status !== 'Cancelled')
  const thisMonth = <T extends { created: Date | null }>(list: T[]) => list.filter((b) => sameMonth(b.created, now))
  const lastMonth = <T extends { created: Date | null }>(list: T[]) => list.filter((b) => sameMonth(b.created, prevMonth))
  const lastDays = <T extends { created: Date | null }>(list: T[], days: number) =>
    list.filter((b) => b.created && b.created >= addDays(today, -(days - 1)))

  const allBookings = bookings.map((b) => b.record).sort((a, b) => b.createdAt - a.createdAt)

  // Members
  const activeMembers = raw.priveMembers.filter((m) => {
    const s = str(m.data.status).toLowerCase()
    return s === '' || s === 'active'
  })
  const joinedDates = activeMembers.map((m) =>
    toDate(m.data.createdAt ?? m.data.joinedAt ?? m.data.approvedAt ?? m.data.membershipSince),
  )
  const hasJoinDates = joinedDates.some(Boolean)
  const newMembers = joinedDates.filter((d) => sameMonth(d, now)).length

  // Metrics
  const sales = sum(thisMonth(live).map((b) => b.record.amount))
  const salesPrev = sum(lastMonth(live).map((b) => b.record.amount))
  const received = sum(thisMonth(live).filter((b) => b.paid).map((b) => b.record.amount))
  const receivedPrev = sum(lastMonth(live).filter((b) => b.paid).map((b) => b.record.amount))
  const upcoming = bookings.filter((b) => b.record.status === 'Confirmed' && b.day && b.day >= today)
  const pending = bookings.filter((b) => b.record.status === 'Pending')
  const bespoke = bookings.filter((b) => b.bespoke)

  const metrics: MetricData[] = [
    { id: 'sales', label: 'Current Month Sales', value: sales, format: 'currency', icon: 'rupee', featured: true, trend: pctTrend(sales, salesPrev), caption: 'vs previous month' },
    { id: 'payments', label: 'Payments Received', value: received, format: 'currency', icon: 'wallet', trend: pctTrend(received, receivedPrev), caption: 'vs previous month' },
    {
      id: 'prive-members',
      label: 'Privé Members',
      value: activeMembers.length,
      format: 'number',
      icon: 'gem',
      trend: hasJoinDates ? countTrend(newMembers) : { label: 'Active', direction: 'flat', sentiment: 'neutral' },
      caption: hasJoinDates ? 'new this month' : 'in good standing',
    },
    { id: 'upcoming', label: 'Upcoming Bookings', value: upcoming.length, format: 'number', icon: 'calendar', trend: countTrend(lastDays(upcoming, 7).length), caption: 'added this week' },
    { id: 'pending', label: 'Pending Bookings', value: pending.length, format: 'padded', icon: 'hourglass', trend: countTrend(lastDays(pending, 7).length, 'neutral'), caption: 'added this week' },
    { id: 'total', label: 'Total Bookings', value: bookings.length, format: 'number', icon: 'layers', trend: countTrend(thisMonth(bookings).length), caption: 'new this month' },
    { id: 'bespoke', label: 'Total Bespoke Bookings', value: bespoke.length, format: 'number', icon: 'bespoke', trend: countTrend(thisMonth(bespoke).length), caption: 'new this month' },
  ]

  // Daily series, last 60 days
  const days = 60
  const series: BookingPoint[] = Array.from({ length: days }, (_, i) => ({
    date: toISODate(addDays(today, i - (days - 1))),
    regular: 0,
    prive: 0,
  }))
  const byDate = new Map(series.map((p) => [p.date, p]))
  bookings.forEach((b) => {
    const p = b.created ? byDate.get(toISODate(b.created)) : undefined
    if (p) b.prive ? (p.prive += 1) : (p.regular += 1)
  })
  const monthDays = Math.max(now.getDate(), 2)

  // Looks: curated look, else the service booked
  const lookCounts = new Map<string, number>()
  live.forEach((b) => {
    if (b.record.look) lookCounts.set(b.record.look, (lookCounts.get(b.record.look) ?? 0) + 1)
  })
  const looks = [...lookCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 5)
    .map(([name, count], i) => ({ id: `look-${i}`, name, bookings: count }))

  // Recent bookings
  const recent: Booking[] = allBookings.slice(0, 8).map((b) => ({
    id: b.ref,
    client: b.client,
    look: b.look || 'Not specified',
    type: b.type,
    date: b.date,
    amount: b.amount,
    status: b.status,
  }))

  // Privé summary
  const priveLive = live.filter((b) => b.prive)
  const priveMonth = thisMonth(priveLive)
  const priveRevenue = sum(priveMonth.map((b) => b.record.amount))
  const weekly = Array.from({ length: 8 }, (_, i) => ({ week: `Week ${i + 1}`, revenue: 0 }))
  priveLive.forEach((b) => {
    if (!b.created) return
    const ago = Math.floor((today.getTime() - startOfDay(b.created).getTime()) / 86400000)
    const idx = 7 - Math.floor(ago / 7)
    if (ago >= 0 && idx >= 0 && idx < 8) weekly[idx].revenue += b.record.amount
  })
  const recent4 = sum(weekly.slice(4).map((w) => w.revenue))
  const prior4 = sum(weekly.slice(0, 4).map((w) => w.revenue))
  const prive: PriveSummary = {
    activeMembers: activeMembers.length,
    newMembers,
    bookings: priveMonth.length,
    revenue: priveRevenue,
    averageBookingValue: priveMonth.length ? priveRevenue / priveMonth.length : 0,
    revenueTrendLabel: prior4 > 0 ? pctTrend(recent4, prior4).label : '',
    weeklyRevenue: weekly,
  }

  // Privé applications
  const applications: PriveApplicationRecord[] = raw.priveApplications
    .map(({ id, data }) => {
      const dial = str(data.dialCode)
      const phone = str(data.phone)
      return {
        id,
        name: str(data.name) || str(data.fullName) || 'Unnamed applicant',
        email: str(data.email),
        phone: phone ? `${dial ? `${dial} ` : ''}${phone}` : '',
        instagram: str(data.instagram),
        interest: str(data.interest),
        occasion: str(data.occasion),
        ageRange: str(data.ageRange),
        gender: str(data.gender),
        country: str(data.country),
        language: str(data.language),
        createdAt: toDate(data.createdAt)?.getTime() ?? 0,
        status: normalizeApplicationStatus(data.status),
        membershipId: str(data.membershipId),
        styleProfile: Array.isArray(data.styleProfile)
          ? data.styleProfile
              .map((x) => x as Record<string, unknown>)
              .map((x) => ({ question: str(x?.question), answer: str(x?.answer) }))
              .filter((x) => x.question || x.answer)
          : [],
      }
    })
    .sort((a, b) => Number(b.status === 'Pending') - Number(a.status === 'Pending') || b.createdAt - a.createdAt)

  // Members: priveMembers docs, enriched from the approved application and the user account
  const members: MemberRecord[] = raw.priveMembers
    .map(({ id, data }) => {
      const app = applications.find((a) => a.membershipId === id || a.id === str(data.applicationId))
      const user = raw.users.find((u) => str(u.data.membershipId) === id)
      const since = toDate(data.membershipSince ?? data.createdAt ?? data.approvedAt ?? user?.data.membershipSince)
      return {
        id,
        name: str(user?.data.name) || app?.name || '',
        email: str(user?.data.email) || app?.email || '',
        phone: str(user?.data.phone) || app?.phone || '',
        photoURL: str(user?.data.photoURL),
        instagram: app?.instagram ?? '',
        since: since ? toISODate(since) : '',
        status: str(data.status) || 'Active',
        applicationId: str(data.applicationId) || app?.id || '',
      }
    })
    .sort((a, b) => membershipNumber(b.id) - membershipNumber(a.id))

  // Notifications: things waiting on a person
  type Note = NotificationItem & { at: number }
  const notes: Note[] = []
  const push = (id: string, title: string, detail: string, at: Date | null, unread: boolean) =>
    notes.push({ id, title, detail, time: timeAgo(at, now), unread, at: at?.getTime() ?? 0 })
  allBookings.slice(0, 50).forEach((b) =>
    push(`b-${b.id}`, 'New booking', joinParts(b.client, b.look), new Date(b.createdAt || 0), b.createdAt >= today.getTime()),
  )
  applications.forEach((a) =>
    push(`pa-${a.id}`, 'Privé application', joinParts(a.name, a.interest), a.createdAt ? new Date(a.createdAt) : null, a.status === 'Pending'),
  )
  raw.jobApplications.forEach(({ id, data }) =>
    push(`ja-${id}`, 'Job application', joinParts(data.name, data.roleTitle), toDate(data.submittedAt ?? data.createdAt), normalizeStatus(data.status) === 'Pending'),
  )
  const notifications: NotificationItem[] = notes
    .sort((a, b) => b.at - a.at)
    .slice(0, 6)
    .map(({ at: _at, ...n }) => n)

  return {
    metrics,
    allBookings,
    applications,
    members,
    bookingSeries: { '7d': series.slice(-7), '30d': series.slice(-30), month: series.slice(-monthDays) },
    looks,
    bookings: recent,
    statusBreakdown: STATUS_ORDER.map((status) => ({ status, count: bookings.filter((b) => b.record.status === status).length })),
    prive,
    notifications,
    pendingApplications: applications.filter((a) => a.status === 'Pending').length,
  }
}
