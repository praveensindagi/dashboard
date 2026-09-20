import { collection, onSnapshot } from 'firebase/firestore'
import { db } from './config'
import type { DataSource, RawCollections, RawDoc } from './buildDashboardData'
import { syncBookingStatuses } from './sync'

type Name = 'bookings' | 'priveApplications' | 'priveMembers' | 'applications' | 'users'
const NAMES: Name[] = ['bookings', 'priveApplications', 'priveMembers', 'applications', 'users']
/** Nice to have. If reading one is denied, the dashboard still loads without it. */
const OPTIONAL: Name[] = ['applications', 'users']

/** Live listeners: bookings, applications and members update on screen the moment they change. */
export const firestoreSource: DataSource = {
  subscribe(onRaw, onError) {
    const firestore = db
    if (!firestore) {
      onError(new Error('Firebase is not configured. Check your .env file and restart.'))
      return () => undefined
    }
    const state: Partial<Record<Name, RawDoc[]>> = {}
    const emit = () => {
      if (!NAMES.every((n) => state[n])) return
      const raw: RawCollections = {
        bookings: state.bookings ?? [],
        priveApplications: state.priveApplications ?? [],
        priveMembers: state.priveMembers ?? [],
        jobApplications: state.applications ?? [],
        users: state.users ?? [],
      }
      onRaw(raw)
    }

    const unsubs = NAMES.map((name) =>
      onSnapshot(
        collection(firestore, name),
        (snap) => {
          state[name] = snap.docs.map((d) => ({ id: d.id, data: d.data() as Record<string, unknown> }))
          emit()
        },
        (err) => {
          if (OPTIONAL.includes(name)) {
            console.warn(`Could not read ${name}:`, err.message)
            state[name] = state[name] ?? []
            emit()
            return
          }
          onError(
            err.code === 'permission-denied'
              ? new Error(`Firestore denied access to ${name}. Publish the rules from firestore.rules and make sure your staff document exists.`)
              : err,
          )
        },
      ),
    )
    return () => unsubs.forEach((u) => u())
  },
  sync: syncBookingStatuses,
}
