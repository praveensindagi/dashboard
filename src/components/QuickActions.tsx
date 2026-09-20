import { Box, Button } from '@mui/material'
import AddRounded from '@mui/icons-material/AddRounded'
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined'
import PersonAddAltOutlined from '@mui/icons-material/PersonAddAltOutlined'
import type { SvgIconComponent } from '@mui/icons-material'
import { BespokeIcon } from './icons'

export type QuickActionKey = 'new-booking' | 'new-bespoke' | 'review-applications' | 'add-member'

interface Action {
  key: QuickActionKey
  label: string
  icon: SvgIconComponent
  primary?: boolean
}

const ACTIONS: Action[] = [
  { key: 'new-booking', label: 'New Booking', icon: AddRounded, primary: true },
  { key: 'new-bespoke', label: 'New Bespoke Booking', icon: BespokeIcon },
  { key: 'review-applications', label: 'Review Privé Applications', icon: DescriptionOutlined },
  { key: 'add-member', label: 'Add Privé Member', icon: PersonAddAltOutlined },
]

export function QuickActions({ onAction }: { onAction?: (key: QuickActionKey) => void }) {
  return (
    <Box component="section" aria-label="Quick actions" sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, auto)' }, justifyContent: { lg: 'start' } }}>
      {ACTIONS.map(({ key, label, icon: Icon, primary }) => (
        <Button
          key={key}
          variant={primary ? 'contained' : 'outlined'}
          color="primary"
          startIcon={<Icon aria-hidden />}
          onClick={() => onAction?.(key)}
          sx={!primary ? { color: 'text.primary' } : undefined}
        >
          {label}
        </Button>
      ))}
    </Box>
  )
}
