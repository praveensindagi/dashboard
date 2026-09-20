import { collection, doc, getDoc, getDocs, limit, query, runTransaction, serverTimestamp, where } from 'firebase/firestore'
import { auth, db } from './config'
import { MEMBERSHIP_PREFIX, membershipNumber, normalizeApplicationStatus } from './buildDashboardData'
import { toISODate } from '../lib/format'

/** First membership number to hand out when there are no members yet (AEPSPRIVE100). */
const FIRST_NUMBER = 100

/**
 * Approves a Privé application and returns the new membership ID.
 *
 * In one transaction it:
 *  1. creates priveMembers/{AEPSPRIVEnnn} with status "Active"
 *  2. marks the application approved and stores the membership ID on it
 *  3. sets isPriveMember, membershipId and membershipSince on the applicant's users doc, when one is found
 *
 * priveMembers can be read by anyone who knows an ID (see firestore.rules), so it holds no personal
 * details. Name, email and phone stay on the application and user documents, which only staff can list.
 */
export async function approvePriveApplication(applicationId: string): Promise<string> {
  const firestore = db
  if (!firestore) throw new Error('Firebase is not configured.')
  const staffUid = auth?.currentUser?.uid ?? ''

  const appRef = doc(firestore, 'priveApplications', applicationId)
  const [appSnap, membersSnap] = await Promise.all([getDoc(appRef), getDocs(collection(firestore, 'priveMembers'))])
  if (!appSnap.exists()) throw new Error('This application no longer exists.')
  const app = appSnap.data()

  // Find the applicant's account so the public app recognises them as a member.
  let userId = typeof app.uid === 'string' ? app.uid : ''
  if (!userId && typeof app.email === 'string' && app.email.trim()) {
    const found = await getDocs(query(collection(firestore, 'users'), where('email', '==', app.email.trim()), limit(1)))
    if (!found.empty) userId = found.docs[0].id
  }

  const highest = Math.max(FIRST_NUMBER - 1, ...membersSnap.docs.map((d) => membershipNumber(d.id)))

  return runTransaction(firestore, async (tx) => {
    const fresh = await tx.get(appRef)
    if (!fresh.exists() || normalizeApplicationStatus(fresh.data().status) !== 'Pending') {
      throw new Error('This application has already been handled.')
    }

    // Take the next free number. Reading each candidate inside the transaction keeps two staff
    // members approving at once from getting the same ID.
    let n = highest + 1
    let memberRef = doc(firestore, 'priveMembers', `${MEMBERSHIP_PREFIX}${n}`)
    while ((await tx.get(memberRef)).exists()) {
      n += 1
      memberRef = doc(firestore, 'priveMembers', `${MEMBERSHIP_PREFIX}${n}`)
    }
    const membershipId = `${MEMBERSHIP_PREFIX}${n}`
    const since = toISODate(new Date())

    tx.set(memberRef, {
      status: 'Active',
      applicationId,
      membershipSince: since,
      approvedAt: serverTimestamp(),
      approvedBy: staffUid,
    })
    tx.update(appRef, {
      status: 'approved',
      membershipId,
      approvedAt: serverTimestamp(),
      approvedBy: staffUid,
    })
    if (userId) {
      tx.update(doc(firestore, 'users', userId), { isPriveMember: true, membershipId, membershipSince: since })
    }
    return membershipId
  })
}
