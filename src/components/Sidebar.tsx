import type { ReactNode } from 'react'
import { Badge, Box, List, ListItem, ListItemButton, ListItemIcon, Tooltip, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import LogoutOutlined from '@mui/icons-material/LogoutOutlined'
import type { NavKey } from '../types'
import { tokens } from '../theme'
import { NAV_ITEMS } from './nav'

interface SidebarProps {
  active: NavKey
  onNavigate: (key: NavKey) => void
  onSignOut: () => void
  /** Icon-only rail (tablet). The full sidebar shows labels. */
  rail: boolean
  badges?: Partial<Record<NavKey, number>>
}

function Brand({ rail }: { rail: boolean }) {
  return (
    <Box
      role="img"
      aria-label="Amour Estilo"
      sx={{ display: 'flex', flexDirection: 'column', alignItems: rail ? 'center' : 'flex-start' }}
    >
      <Typography
        aria-hidden
        sx={{
          fontFamily: tokens.serif,
          fontWeight: 500,
          fontSize: rail ? 22 : 17,
          letterSpacing: rail ? '0.18em' : '0.34em',
          color: 'text.primary',
          lineHeight: 1.2,
          pl: rail ? '0.18em' : 0,
        }}
      >
        {rail ? 'AE' : 'AMOUR ESTILO'}
      </Typography>
      <Box aria-hidden sx={{ mt: 1.25, height: '1px', width: 32, bgcolor: alpha(tokens.gold, 0.6) }} />
    </Box>
  )
}

interface NavButtonProps {
  icon: ReactNode
  label: string
  rail: boolean
  selected?: boolean
  badge?: number
  onClick: () => void
}

function NavButton({ icon, label, rail, selected, badge, onClick }: NavButtonProps) {
  const button = (
      <ListItemButton
        selected={selected}
        aria-current={selected ? 'page' : undefined}
        onClick={onClick}
        sx={{
          minHeight: 44,
          borderRadius: '10px',
          px: rail ? 0 : 1.75,
          justifyContent: rail ? 'center' : 'flex-start',
          gap: 1.5,
          color: 'text.secondary',
          transition: `background-color 250ms ${tokens.ease}, color 200ms, box-shadow 300ms ${tokens.ease}`,
          '&:hover': { backgroundColor: 'action.hover', color: 'text.primary' },
          '&.Mui-selected': {
            color: 'primary.main',
            backgroundColor: alpha(tokens.gold, 0.1),
            boxShadow: `0 0 28px -10px ${alpha(tokens.gold, 0.45)}, inset 0 0 0 1px ${alpha(tokens.gold, 0.15)}`,
            '&:hover': { backgroundColor: alpha(tokens.gold, 0.14) },
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: 0, color: 'inherit', justifyContent: 'center' }}>
          {badge && rail ? (
            <Badge variant="dot" color="primary" overlap="circular">
              {icon}
            </Badge>
          ) : (
            icon
          )}
        </ListItemIcon>
        {!rail && (
          <>
            <Typography component="span" noWrap sx={{ flex: 1, fontSize: '0.8125rem', fontWeight: 500, color: 'inherit' }}>
              {label}
            </Typography>
            {badge ? (
              <Box
                component="span"
                sx={{
                  minWidth: 20,
                  px: 0.75,
                  borderRadius: 999,
                  textAlign: 'center',
                  fontSize: '0.6875rem',
                  fontWeight: 500,
                  fontVariantNumeric: 'tabular-nums',
                  color: 'primary.main',
                  bgcolor: alpha(tokens.gold, 0.15),
                }}
              >
                {badge}
              </Box>
            ) : null}
          </>
        )}
      </ListItemButton>
  )
  return rail ? (
    <Tooltip title={label} placement="right">
      {button}
    </Tooltip>
  ) : (
    button
  )
}

export function Sidebar({ active, onNavigate, onSignOut, rail, badges = {} }: SidebarProps) {
  return (
    <Box sx={{ display: 'flex', height: '100%', flexDirection: 'column', bgcolor: tokens.surface }}>
      <Box sx={{ display: 'flex', height: 92, flexShrink: 0, alignItems: 'center', justifyContent: rail ? 'center' : 'flex-start', px: rail ? 1 : 3.5 }}>
        <Brand rail={rail} />
      </Box>

      <Box component="nav" aria-label="Primary" sx={{ flex: 1, overflowY: 'auto', px: 1.5, py: 1 }}>
        <List disablePadding sx={{ display: 'grid', gap: 0.5 }}>
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
            <ListItem key={key} disablePadding>
              <NavButton
                icon={<Icon sx={{ fontSize: 20 }} aria-hidden />}
                label={label}
                rail={rail}
                selected={key === active}
                badge={badges[key]}
                onClick={() => onNavigate(key)}
              />
            </ListItem>
          ))}
        </List>
      </Box>

      <Box sx={{ flexShrink: 0, borderTop: `1px solid ${tokens.line}`, p: 1.5 }}>
        <List disablePadding>
          <ListItem disablePadding>
            <NavButton icon={<LogoutOutlined sx={{ fontSize: 20 }} aria-hidden />} label="Sign Out" rail={rail} onClick={onSignOut} />
          </ListItem>
        </List>
      </Box>
    </Box>
  )
}
