import { useState } from 'react'
import { Badge, Box, Button, Divider, IconButton, List, ListItem, Popover, Tooltip, Typography } from '@mui/material'
import NotificationsNoneOutlined from '@mui/icons-material/NotificationsNoneOutlined'
import NotificationsOffOutlined from '@mui/icons-material/NotificationsOffOutlined'
import type { NotificationItem } from '../../types'
import { tokens } from '../../theme'

interface NotificationsMenuProps {
  items: NotificationItem[]
  onMarkAllRead: () => void
}

export function NotificationsMenu({ items, onMarkAllRead }: NotificationsMenuProps) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const open = Boolean(anchor)
  const unread = items.filter((i) => i.unread).length

  return (
    <>
      <Tooltip title={open ? '' : 'Notifications'}>
        <IconButton
          aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
          aria-haspopup="true"
          aria-expanded={open}
          onClick={(e) => setAnchor(e.currentTarget)}
        >
          <Badge variant="dot" color="primary" invisible={unread === 0} overlap="circular">
            <NotificationsNoneOutlined sx={{ fontSize: 20 }} aria-hidden />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { mt: 1.5, width: 340, maxWidth: 'calc(100vw - 32px)' } } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 2 }}>
          <Typography variant="h6" component="h2">
            Notifications
          </Typography>
          <Button
            size="small"
            onClick={onMarkAllRead}
            disabled={!unread}
            sx={{ height: 'auto', p: 0, minWidth: 0, fontSize: '0.75rem', '&:hover': { backgroundColor: 'transparent', color: tokens.goldLight } }}
          >
            Mark all as read
          </Button>
        </Box>
        <Divider />
        {items.length ? (
          <List disablePadding sx={{ maxHeight: 360, overflowY: 'auto' }}>
            {items.map((n, i) => (
              <ListItem
                key={n.id}
                alignItems="flex-start"
                sx={{ gap: 1.5, px: 2.5, py: 2, borderTop: i ? `1px solid ${tokens.line}` : 0 }}
              >
                <Box aria-hidden sx={{ mt: '7px', width: 6, height: 6, flexShrink: 0, borderRadius: '50%', bgcolor: n.unread ? 'primary.main' : 'transparent' }} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                    {n.title}
                    {n.unread && <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}> (unread)</span>}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                    {n.detail}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75, fontSize: '0.6875rem' }}>
                    {n.time}
                  </Typography>
                </Box>
              </ListItem>
            ))}
          </List>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', px: 3, py: 5, textAlign: 'center' }}>
            <NotificationsOffOutlined sx={{ fontSize: 22, color: 'primary.main' }} aria-hidden />
            <Typography variant="body2" sx={{ mt: 1.5, color: 'text.primary' }}>
              You’re all caught up
            </Typography>
            <Typography variant="caption" color="text.secondary">
              New bookings and applications will appear here.
            </Typography>
          </Box>
        )}
      </Popover>
    </>
  )
}
