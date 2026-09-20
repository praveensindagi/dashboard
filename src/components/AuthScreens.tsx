import { useState, type FormEvent, type ReactNode } from 'react'
import { Alert, Box, Button, CircularProgress, Divider, TextField, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import Google from '@mui/icons-material/Google'
import { authErrorMessage } from '../firebase/useAuth'
import { tokens } from '../theme'
import { Surface } from './ui'

function Shell({ children }: { children: ReactNode }) {
  return (
    <Box component="main" sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 2.5, py: 6 }}>
      <Typography sx={{ fontFamily: tokens.serif, fontSize: 20, fontWeight: 500, letterSpacing: '0.34em', pl: '0.34em' }}>AMOUR ESTILO</Typography>
      <Box aria-hidden sx={{ mt: 1.5, height: '1px', width: 32, bgcolor: alpha(tokens.gold, 0.6) }} />
      <Box sx={{ mt: 6, width: '100%', maxWidth: 400 }}>{children}</Box>
    </Box>
  )
}

export function LoadingScreen() {
  return (
    <Shell>
      <Box sx={{ display: 'flex', justifyContent: 'center' }} role="status" aria-label="Loading">
        <CircularProgress size={22} thickness={3} />
      </Box>
    </Shell>
  )
}

interface SignInProps {
  onEmail: (email: string, password: string) => Promise<void>
  onGoogle: () => Promise<void>
}

export function SignInScreen({ onEmail, onGoogle }: SignInProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState<'email' | 'google' | null>(null)
  const [error, setError] = useState('')

  const run = async (kind: 'email' | 'google', fn: () => Promise<void>) => {
    setBusy(kind)
    setError('')
    try {
      await fn()
    } catch (e) {
      setError(authErrorMessage(e))
    } finally {
      setBusy(null)
    }
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    void run('email', () => onEmail(email.trim(), password))
  }

  return (
    <Shell>
      <Surface sx={{ p: 4 }}>
        <Typography component="h1" variant="h1" sx={{ fontSize: '2rem' }}>
          Sign in
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Staff access to the Amour Estilo admin.
        </Typography>

        <Box component="form" onSubmit={submit} noValidate sx={{ mt: 4, display: 'grid', gap: 2 }}>
          <TextField label="Email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth required />
          <TextField label="Password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth required />
          {error && <Alert severity="error" variant="outlined" sx={{ bgcolor: 'transparent' }}>{error}</Alert>}
          <Button type="submit" variant="contained" disabled={busy !== null || !email || !password} startIcon={busy === 'email' ? <CircularProgress size={14} color="inherit" /> : undefined}>
            Sign In
          </Button>
        </Box>

        <Divider sx={{ my: 3, fontSize: '0.75rem', color: 'text.secondary' }}>or</Divider>

        <Button
          fullWidth
          variant="outlined"
          disabled={busy !== null}
          onClick={() => void run('google', onGoogle)}
          startIcon={busy === 'google' ? <CircularProgress size={14} color="inherit" /> : <Google />}
        >
          Continue with Google
        </Button>
      </Surface>
    </Shell>
  )
}

export function UnauthorizedScreen({ email, onSignOut }: { email: string; onSignOut: () => void }) {
  return (
    <Shell>
      <Surface sx={{ p: 4, textAlign: 'center' }}>
        <Typography component="h1" variant="h1" sx={{ fontSize: '2rem' }}>
          No access
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1.5 }}>
          {email || 'This account'} is not on the staff list, so the dashboard stays closed.
        </Typography>
        <Button variant="outlined" sx={{ mt: 4 }} onClick={onSignOut}>
          Sign Out
        </Button>
      </Surface>
    </Shell>
  )
}

export function SetupScreen() {
  const vars = ['REACT_APP_FIREBASE_API_KEY', 'REACT_APP_FIREBASE_AUTH_DOMAIN', 'REACT_APP_FIREBASE_PROJECT_ID', 'REACT_APP_FIREBASE_APP_ID']
  return (
    <Shell>
      <Surface sx={{ p: 4 }}>
        <Typography component="h1" variant="h1" sx={{ fontSize: '2rem' }}>
          Connect Firebase
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1.5 }}>
          Copy <code>.env.example</code> to <code>.env</code>, fill in these values from Firebase console, Project settings, Your apps, then restart <code>npm start</code>.
        </Typography>
        <Box component="ul" sx={{ mt: 2.5, mb: 0, pl: 2.5, color: 'text.secondary', fontSize: '0.8125rem', display: 'grid', gap: 0.75 }}>
          {vars.map((v) => (
            <li key={v}>
              <code>{v}</code>
            </li>
          ))}
        </Box>
      </Surface>
    </Shell>
  )
}
