import { AppBar, Box, IconButton, Toolbar, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import MenuRounded from '@mui/icons-material/MenuRounded'
import type { AdminUser, NotificationItem, SearchItem } from '../types'
import { formatLongDate } from '../lib/format'
import { tokens } from '../theme'
import { NotificationsMenu } from './header/NotificationsMenu'
import { ProfileMenu } from './header/ProfileMenu'
import { SearchBox } from './header/SearchBox'

interface HeaderProps {
  title: string
  subtitle: string
  user: AdminUser
  today: Date
  notifications: NotificationItem[]
  onMarkAllNotificationsRead: () => void
  searchItems: SearchItem[]
  onSearchSelect?: (item: SearchItem) => void
  onOpenNav: () => void
  onSignOut: () => void
}

export function Header({
  title,
  subtitle,
  user,
  today,
  notifications,
  onMarkAllNotificationsRead,
  searchItems,
  onSearchSelect,
  onOpenNav,
  onSignOut,
}: HeaderProps) {
  const date = formatLongDate(today)

  return (
    <Box component="header">
      {/* Mobile: sticky bar */}
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{
          display: { md: 'none' },
          backgroundImage: 'none',
          bgcolor: alpha(tokens.base, 0.9),
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${tokens.line}`,
          pt: 'env(safe-area-inset-top)',
        }}
      >
        <Toolbar disableGutters sx={{ minHeight: 56, justifyContent: 'space-between', gap: 1.5, px: 2 }}>
          <IconButton aria-label="Open navigation" onClick={onOpenNav}>
            <MenuRounded sx={{ fontSize: 20 }} aria-hidden />
          </IconButton>
          <Typography aria-label="Amour Estilo" sx={{ fontFamily: tokens.serif, fontSize: 15, fontWeight: 500, letterSpacing: '0.3em', color: 'text.primary' }}>
            AMOUR ESTILO
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NotificationsMenu items={notifications} onMarkAllRead={onMarkAllNotificationsRead} />
            <ProfileMenu user={user} onSignOut={onSignOut} />
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { md: 'flex-end' },
          justifyContent: { md: 'space-between' },
          gap: { xs: 3, md: 4 },
          px: { xs: 2, md: 4, xl: 6 },
          pt: { xs: 4, md: 6 },
          pb: { xs: 4, md: 5 },
        }}
      >
        <Box>
          <Typography component="h1" variant="h1" sx={{ fontSize: { xs: '2.25rem', md: '2.625rem' } }}>
            {title}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1.25 }}>
            {subtitle}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: { md: 'none' }, fontVariantNumeric: 'tabular-nums' }}>
            {date}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, alignItems: { md: 'flex-end' } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: { xs: '100%', md: 'auto' } }}>
            <Box sx={{ flex: { xs: 1, md: 'none' }, width: { md: 260, lg: 300 }, minWidth: 0 }}>
              <SearchBox items={searchItems} onSelect={onSearchSelect} />
            </Box>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1.5 }}>
              <NotificationsMenu items={notifications} onMarkAllRead={onMarkAllNotificationsRead} />
              <ProfileMenu user={user} onSignOut={onSignOut} />
            </Box>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' }, fontVariantNumeric: 'tabular-nums' }}>
            {date}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
