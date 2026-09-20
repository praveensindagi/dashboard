export const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ')

const inr = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })

/** 1842500 -> ₹18,42,500 */
export const formatINR = (n: number) => `₹${inr.format(Math.round(n))}`
export const formatNumber = (n: number) => inr.format(Math.round(n))
export const pad2 = (n: number) => String(Math.round(n)).padStart(2, '0')

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export const toISODate = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`

export const parseISODate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** 20 Sep 2026 */
export const formatDate = (iso: string) => {
  const d = parseISODate(iso)
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`
}
/** 20 Sep */
export const formatDayMonth = (iso: string) => {
  const d = parseISODate(iso)
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`
}
/** Sun 20 */
export const formatWeekdayDay = (iso: string) => {
  const d = parseISODate(iso)
  return `${DAYS_SHORT[d.getDay()]} ${d.getDate()}`
}
/** Sunday, 20 September */
export const formatTooltipDate = (iso: string) => {
  const d = parseISODate(iso)
  return `${DAYS_LONG[d.getDay()]}, ${d.getDate()} ${MONTHS_LONG[d.getMonth()]}`
}
/** Sunday, 20 September 2026 */
export const formatLongDate = (d: Date) =>
  `${DAYS_LONG[d.getDay()]}, ${d.getDate()} ${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')

export const plural = (n: number, one: string, many = `${one}s`) => (n === 1 ? one : many)
