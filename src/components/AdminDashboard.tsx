import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Box, Button, Drawer, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import ErrorOutlineOutlined from '@mui/icons-material/ErrorOutlineOutlined'
import type { AdminUser, Booking, NavKey, NotificationItem, PriveApplicationRecord, SearchItem } from '../types'
import { layout, tokens } from '../theme'
import type { DataSource } from '../firebase/buildDashboardData'
import { firestoreSource } from '../firebase/source'
import { useDashboardData } from '../hooks/useDashboardData'
import { BookingOverview } from './BookingOverview'
import { BookingStatus } from './BookingStatus'
import { ConfirmDialog } from './ConfirmDialog'
import { Header } from './Header'
import { MetricCard } from './MetricCard'
import { MostBookedLooks } from './MostBookedLooks'
import { PriveOverview } from './PriveOverview'
import { QuickActions, type QuickActionKey } from './QuickActions'
import { RecentBookings } from './RecentBookings'
import { Reveal } from './Reveal'
import { Sidebar } from './Sidebar'
import { NAV_ITEMS } from './nav'
import { ApplicationsPage } from './sections/ApplicationsPage'
import { BookingsPage } from './sections/BookingsPage'
import { MembersPage } from './sections/MembersPage'
import { EmptyState, Surface } from './ui'

export interface AdminDashboardProps {
  user?: AdminUser
  /** Highlighted navigation item. Defaults to the dashboard. */
  activeRoute?: NavKey
  /** Called when a navigation item is chosen. Wire this to your router. */
  onNavigate?: (key: NavKey) => void
  /** Called after the person confirms sign out. May be async. */
  onSignOut?: () => void | Promise<void>
  onQuickAction?: (key: QuickActionKey) => void
  onSelectBooking?: (booking: Booking) => void
  onSearchSelect?: (item: SearchItem) => void
  /** Render your own page for routes other than the dashboard. */
  renderRoute?: (key: NavKey) => ReactNode
  /** Approve a Privé application. Resolves with the new membership ID. */
  onApproveApplication?: (application: PriveApplicationRecord) => Promise<string>
  /** Replace the data source. Defaults to live Firestore (src/firebase/source.ts). */
  dataSource?: DataSource
}

const DEFAULT_USER: AdminUser = { name: 'Studio Admin', role: 'Administrator', email: 'admin@amourestilo.com' }
const METRIC_PLACEHOLDERS = [true, false, false, false, false, false, false]

const drawerPaperSx = {
  boxSizing: 'border-box',
  backgroundColor: tokens.surface,
  backgroundImage: 'none',
  borderRight: `1px solid ${tokens.line}`,
} as const

export default function AdminDashboard({
  user = DEFAULT_USER,
  activeRoute = 'dashboard',
  onNavigate,
  onSignOut,
  onQuickAction,
  onSelectBooking,
  onSearchSelect,
  renderRoute,
  onApproveApplication,
  dataSource = firestoreSource,
}: AdminDashboardProps) {
  const theme = useTheme()
  const fullSidebar = useMediaQuery(theme.breakpoints.up('xl'))

  const [route, setRoute] = useState<NavKey>(activeRoute)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [signOutOpen, setSignOutOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  const { data, loading, error, retry, now: today } = useDashboardData(dataSource)

  useEffect(() => setRoute(activeRoute), [activeRoute])
  useEffect(() => {
    if (data) setNotifications(data.notifications)
  }, [data])

  const navigate = useCallback(
    (key: NavKey) => {
      setRoute(key)
      setDrawerOpen(false)
      onNavigate?.(key)
    },
    [onNavigate],
  )

  const searchItems = useMemo<SearchItem[]>(() => {
    if (!data) return []
    return [
      ...data.bookings.map((b) => ({ id: b.id, label: b.client, sublabel: `${b.id}, ${b.look}`, kind: 'Booking' as const })),
      ...data.looks.map((l) => ({ id: l.id, label: l.name, sublabel: `${l.bookings} bookings`, kind: 'Look' as const })),
    ]
  }, [data])

  const handleSearchSelect = (item: SearchItem) => {
    onSearchSelect?.(item)
    if (item.kind === 'Booking') navigate('bookings')
  }

  const requestSignOut = () => {
    setDrawerOpen(false)
    setSignOutOpen(true)
  }

  const confirmSignOut = async () => {
    setSigningOut(true)
    try {
      await onSignOut?.()
    } finally {
      setSigningOut(false)
      setSignOutOpen(false)
    }
  }

  const section = (() => {
    switch (route) {
      case 'bookings':
      case 'bespoke':
      case 'upcoming':
      case 'completed':
        return <BookingsPage kind={route === 'bookings' ? 'all' : route} bookings={data?.allBookings ?? []} loading={loading} today={today} />
      case 'prive-applications':
        return <ApplicationsPage applications={data?.applications ?? []} loading={loading} onApprove={onApproveApplication} />
      case 'prive-members':
        return <MembersPage members={data?.members ?? []} loading={loading} />
      default:
        return null
    }
  })()

  const current = NAV_ITEMS.find((n) => n.key === route) ?? NAV_ITEMS[0]
  const badges = data ? { 'prive-applications': data.pendingApplications } : {}

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
      <Box
        component="a"
        href="#main"
        sx={{
          position: 'fixed',
          left: 16,
          top: 16,
          zIndex: 2000,
          px: 2,
          py: 1,
          borderRadius: '10px',
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          fontSize: '0.8125rem',
          fontWeight: 500,
          textDecoration: 'none',
          transform: 'translateY(-200%)',
          '&:focus': { transform: 'none' },
        }}
      >
        Skip to content
      </Box>

      {/* Tablet and desktop: permanent sidebar (icon rail below 1280px) */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: fullSidebar ? layout.sidebarFull : layout.sidebarRail,
          '& .MuiDrawer-paper': { ...drawerPaperSx, width: fullSidebar ? layout.sidebarFull : layout.sidebarRail },
        }}
      >
        <Sidebar active={route} onNavigate={navigate} onSignOut={requestSignOut} rail={!fullSidebar} badges={badges} />
      </Drawer>

      {/* Mobile: navigation drawer */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        ModalProps={{ keepMounted: false }}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { ...drawerPaperSx, width: 288, maxWidth: '85vw' } }}
      >
        <Sidebar active={route} onNavigate={navigate} onSignOut={requestSignOut} rail={false} badges={badges} />
      </Drawer>

      <Box sx={{ ml: { md: `${layout.sidebarRail}px`, xl: `${layout.sidebarFull}px` } }}>
        <Header
          title={current.label}
          subtitle={current.subtitle}
          user={user}
          today={today}
          notifications={notifications}
          onMarkAllNotificationsRead={() => setNotifications((list) => list.map((n) => ({ ...n, unread: false })))}
          searchItems={searchItems}
          onSearchSelect={handleSearchSelect}
          onOpenNav={() => setDrawerOpen(true)}
          onSignOut={requestSignOut}
        />

        <Box component="main" id="main" tabIndex={-1} sx={{ mx: 'auto', width: '100%', maxWidth: 1440, px: { xs: 2, md: 4, xl: 6 }, pb: 10, outline: 'none' }}>
          {error ? (
            <Surface>
              <EmptyState
                icon={ErrorOutlineOutlined}
                title="The dashboard could not load"
                description={error.message || 'Check your connection, then try again.'}
                action={
                  <Button variant="contained" onClick={retry}>
                    Try again
                  </Button>
                }
              />
            </Surface>
          ) : route !== 'dashboard' ? (
            <Reveal>{renderRoute?.(route) ?? section}</Reveal>
          ) : (
            <Box sx={{ display: 'grid', gap: { xs: 3, md: 4 } }}>
              <Reveal index={0}>
                <QuickActions onAction={onQuickAction} />
              </Reveal>

              <Box sx={{ display: 'grid', gap: { xs: 2, md: 2.5 }, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' } }}>
                {(loading || !data ? METRIC_PLACEHOLDERS : data.metrics).map((item, i) => {
                  const metric = typeof item === 'boolean' ? undefined : item
                  const featured = typeof item === 'boolean' ? item : item.featured
                  return (
                    <Reveal key={metric?.id ?? i} index={i + 1} sx={featured ? { gridColumn: { sm: 'span 2' } } : undefined}>
                      <MetricCard metric={metric} loading={loading} featured={featured} />
                    </Reveal>
                  )
                })}
              </Box>

              <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', xl: 'repeat(12, 1fr)' } }}>
                <Reveal index={8} sx={{ gridColumn: { xl: 'span 8' }, minWidth: 0 }}>
                  <BookingOverview series={data?.bookingSeries} loading={loading} />
                </Reveal>
                <Reveal index={9} sx={{ gridColumn: { xl: 'span 4' }, minWidth: 0 }}>
                  <BookingStatus slices={data?.statusBreakdown} loading={loading} />
                </Reveal>
              </Box>

              <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', xl: 'repeat(12, 1fr)' } }}>
                <Reveal index={10} sx={{ gridColumn: { xl: 'span 5' }, minWidth: 0 }}>
                  <MostBookedLooks looks={data?.looks} loading={loading} />
                </Reveal>
                <Reveal index={11} sx={{ gridColumn: { xl: 'span 7' }, minWidth: 0 }}>
                  <PriveOverview prive={data?.prive} loading={loading} />
                </Reveal>
              </Box>

              <Reveal index={12} sx={{ minWidth: 0 }}>
                <RecentBookings bookings={data?.bookings} loading={loading} onSelectBooking={onSelectBooking} />
              </Reveal>
            </Box>
          )}
        </Box>
      </Box>

      <ConfirmDialog
        open={signOutOpen}
        title="Sign out of Amour Estilo?"
        description="You will need to sign in again to reach the dashboard."
        confirmLabel="Sign Out"
        pendingLabel="Signing out"
        pending={signingOut}
        onConfirm={confirmSignOut}
        onCancel={() => setSignOutOpen(false)}
      />
    </Box>
  )
}
