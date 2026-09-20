import AdminDashboard from './components/AdminDashboard'
import { LoadingScreen, SetupScreen, SignInScreen, UnauthorizedScreen } from './components/AuthScreens'
import { isFirebaseConfigured } from './firebase/config'
import { approvePriveApplication } from './firebase/actions'
import { useAuth } from './firebase/useAuth'

/** Mount <AdminDashboard /> inside your own router and auth guard if you already have them. */
export default function App() {
  if (!isFirebaseConfigured) return <SetupScreen />
  return <AuthGate />
}

function AuthGate() {
  const { state, signInWithEmail, signInWithGoogle, signOut } = useAuth()

  switch (state.status) {
    case 'loading':
      return <LoadingScreen />
    case 'signedOut':
      return <SignInScreen onEmail={signInWithEmail} onGoogle={signInWithGoogle} />
    case 'unauthorized':
      return <UnauthorizedScreen email={state.email} onSignOut={signOut} />
    case 'ready':
      return <AdminDashboard user={state.user} onSignOut={signOut} onApproveApplication={(a) => approvePriveApplication(a.id)} />
  }
}
