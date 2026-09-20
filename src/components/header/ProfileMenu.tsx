import { useState } from 'react'
import { Avatar, Box, ButtonBase, Divider, ListItemIcon, Menu, MenuItem, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded'
import LogoutOutlined from '@mui/icons-material/LogoutOutlined'
import PersonOutline from '@mui/icons-material/PersonOutline'
import SettingsOutlined from '@mui/icons-material/SettingsOutlined'
import type { AdminUser } from '../../types'
import { initials } from '../../lib/format'
import { tokens } from '../../theme'

interface ProfileMenuProps {
  user: AdminUser
  onSignOut: () => void
}

export function ProfileMenu({ user, onSignOut }: ProfileMenuProps) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const open = Boolean(anchor)
  const close = () => setAnchor(null)

  return (
    <>
      <ButtonBase
        aria-label={`Account menu for ${user.name}`}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{
          height: 40,
          gap: 1.5,
          pl: 0.75,
          pr: { xs: 1, lg: 1.5 },
          borderRadius: '10px',
          border: `1px solid ${tokens.line}`,
          bgcolor: tokens.card,
          transition: `border-color 200ms, transform 150ms ${tokens.ease}`,
          '&:hover': { borderColor: alpha(tokens.gold, 0.3) },
          '&:active': { transform: 'scale(0.98)' },
        }}
      >
        <Avatar
          sx={{
            width: 28,
            height: 28,
            bgcolor: 'transparent',
            border: `1px solid ${alpha(tokens.gold, 0.4)}`,
            color: 'primary.main',
            fontFamily: tokens.serif,
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: '0.04em',
          }}
        >
          {initials(user.name)}
        </Avatar>
        <Box sx={{ display: { xs: 'none', lg: 'block' }, textAlign: 'left' }}>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, lineHeight: '16px', color: 'text.primary' }}>{user.name}</Typography>
          <Typography sx={{ fontSize: '0.6875rem', lineHeight: '16px', color: 'text.secondary' }}>{user.role}</Typography>
        </Box>
        <ExpandMoreRounded
          aria-hidden
          sx={{ display: { xs: 'none', lg: 'block' }, fontSize: 16, color: 'text.secondary', transition: 'transform 200ms', transform: open ? 'rotate(180deg)' : 'none' }}
        />
      </ButtonBase>

      <Menu
        anchorEl={anchor}
        open={open}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { mt: 1.5, width: 264 } } }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
            {user.name}
          </Typography>
          <Typography noWrap variant="caption" color="text.secondary">
            {user.email}
          </Typography>
        </Box>
        <Divider sx={{ mb: 0.75 }} />
        <MenuItem onClick={close}>
          <ListItemIcon sx={{ minWidth: 0, color: 'inherit' }}>
            <PersonOutline sx={{ fontSize: 18 }} />
          </ListItemIcon>
          View profile
        </MenuItem>
        <MenuItem onClick={close}>
          <ListItemIcon sx={{ minWidth: 0, color: 'inherit' }}>
            <SettingsOutlined sx={{ fontSize: 18 }} />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider sx={{ my: 0.75 }} />
        <MenuItem
          onClick={() => {
            close()
            onSignOut()
          }}
        >
          <ListItemIcon sx={{ minWidth: 0, color: 'inherit' }}>
            <LogoutOutlined sx={{ fontSize: 18 }} />
          </ListItemIcon>
          Sign Out
        </MenuItem>
      </Menu>
    </>
  )
}
