import { useCallback, useEffect, useState } from 'react'
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  type User,
} from 'firebase/auth'
import { collection, doc, getDoc, getDocs, limit, query, where } from 'firebase/firestore'
import type { AdminUser } from '../types'
import { auth, db } from './config'

export type AuthState =
  | { status: 'loading' }
  | { status: 'signedOut' }
  | { status: 'unauthorized'; email: string }
  | { status: 'ready'; user: AdminUser }

/** Set REACT_APP_SKIP_STAFF_CHECK=true while your `staff` collection is still being set up. */
const SKIP_STAFF_CHECK = process.env.REACT_APP_SKIP_STAFF_CHECK === 'true'

/** Staff member = a `staff/{uid}` doc, or a staff doc whose `email` matches. Change here if yours differs. */
async function findStaff(u: User): Promise<Record<string, unknown> | null> {
  if (!db) return null
  try {
    const byUid = await getDoc(doc(db, 'staff', u.uid))
    if (byUid.exists()) return byUid.data()
  } catch {
    /* rules may deny non-staff reads; treat as not staff */
  }
  if (u.email) {
    try {
      const snap = await getDocs(query(collection(db, 'staff'), where('email', '==', u.email), limit(1)))
      if (!snap.empty) return snap.docs[0].data()
    } catch {
      /* same as above */
    }
  }
  return null
}

const text = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : '')

export function useAuth() {
  const [state, setState] = useState<AuthState>({ status: 'loading' })

  useEffect(() => {
    if (!auth) return
    return onAuthStateChanged(auth, async (u) => {
      if (!u) return setState({ status: 'signedOut' })
      setState({ status: 'loading' })
      const staff = SKIP_STAFF_CHECK ? {} : await findStaff(u)
      if (!staff) return setState({ status: 'unauthorized', email: u.email ?? '' })
      setState({
        status: 'ready',
        user: {
          name: text(staff.name) || u.displayName || (u.email ?? 'Staff').split('@')[0],
          role: text(staff.role) || 'Staff',
          email: u.email ?? '',
        },
      })
    })
  }, [])

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase is not configured.')
    await signInWithEmailAndPassword(auth, email, password)
  }, [])

  const signInWithGoogle = useCallback(async () => {
    if (!auth) throw new Error('Firebase is not configured.')
    await signInWithPopup(auth, new GoogleAuthProvider())
  }, [])

  const signOut = useCallback(async () => {
    if (auth) await fbSignOut(auth)
  }, [])

  return { state, signInWithEmail, signInWithGoogle, signOut }
}

export function authErrorMessage(e: unknown): string {
  switch ((e as { code?: string }).code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-email':
      return 'The email or password is not correct.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a moment, then try again.'
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return ''
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled in Firebase Authentication.'
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.'
    default:
      return 'Sign in failed. Please try again.'
  }
}
