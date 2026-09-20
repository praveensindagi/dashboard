import { doc, serverTimestamp, writeBatch } from 'firebase/firestore'
import { db } from './config'
import { parsePreferredDate, planStatus, toDate, type RawCollections } from './buildDashboardData'

/** Ids already written this session, so a failed write is not retried in a loop. */
const attempted = new Set<string>()

/**
 * Writes the automatic status changes back to Firestore:
 *  - a new booking becomes `confirmed` instead of staying `pending`
 *  - a confirmed booking whose appointment date has passed becomes `completed`
 * Runs while a staff member has the dashboard open (see README for a server-side option).
 */
export async function syncBookingStatuses(raw: RawCollections, now: Date): Promise<void> {
  const firestore = db
  if (!firestore) return
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const changes = raw.bookings.flatMap(({ id, data }) => {
    const day = parsePreferredDate(data.preferredDate) ?? toDate(data.createdAt)
    const { write } = planStatus(data, day, today)
    const key = write ? `${id}:${write.status}` : ''
    if (!write || attempted.has(key)) return []
    attempted.add(key)
    return [{ id, write }]
  })
  if (!changes.length) return

  try {
    for (let i = 0; i < changes.length; i += 400) {
      const batch = writeBatch(firestore)
      changes.slice(i, i + 400).forEach(({ id, write }) => {
        batch.update(doc(firestore, 'bookings', id), {
          status: write.status,
          ...(write.confirmed ? { confirmedAt: serverTimestamp() } : {}),
          ...(write.status === 'completed' ? { completedAt: serverTimestamp() } : {}),
        })
      })
      await batch.commit()
    }
  } catch (e) {
    console.warn('Could not update booking statuses in Firestore:', e)
  }
}
