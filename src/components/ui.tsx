import type { ReactNode } from 'react'
import { Box, Chip, Paper, Skeleton, Typography, type PaperProps, type SxProps, type Theme } from '@mui/material'
import { alpha, keyframes } from '@mui/material/styles'
import DiamondOutlined from '@mui/icons-material/DiamondOutlined'
import type { SvgIconComponent } from '@mui/icons-material'
import type { ApplicationStatus, BookingStatus, BookingType } from '../types'
import { STATUS_COLOR } from '../lib/status'
import { tokens } from '../theme'

export const fadeIn = keyframes`from { opacity: 0 } to { opacity: 1 }`
export const fadeInSx = { animation: `${fadeIn} 350ms ease-out both` }

interface SurfaceProps extends Omit<PaperProps, 'variant'> {
  tone?: 'default' | 'prive'
  interactive?: boolean
}

/** The one card surface used everywhere. */
export function Surface({ tone = 'default', interactive, sx, ...rest }: SurfaceProps) {
  return (
    <Paper
      variant="outlined"
      sx={[
        {
          position: 'relative',
          borderRadius: '14px',
          borderColor: tone === 'prive' ? alpha(tokens.gold, 0.25) : tokens.line,
          backgroundColor: tone === 'prive' ? tokens.priveCard : tokens.card,
        },
        interactive && {
          transition: `transform 300ms ease-out, border-color 300ms ease-out, background-color 300ms ease-out`,
          '&:hover': { transform: 'translateY(-2px)', borderColor: alpha(tokens.gold, 0.25), backgroundColor: tokens.elevated },
          '@media (prefers-reduced-motion: reduce)': { '&:hover': { transform: 'none' } },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...rest}
    />
  )
}

interface SectionHeaderProps {
  id: string
  title: string
  subtitle?: string
  action?: ReactNode
}

export function SectionHeader({ id, title, subtitle, action }: SectionHeaderProps) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px 24px' }}>
      <Box>
        <Typography id={id} component="h2" variant="h2">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action}
    </Box>
  )
}

interface EmptyStateProps {
  icon: SvgIconComponent
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', px: 3, py: 7 }}>
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          border: `1px solid ${tokens.lineStrong}`,
          color: 'primary.main',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <Icon sx={{ fontSize: 20 }} aria-hidden />
      </Box>
      <Typography variant="h6" sx={{ mt: 2.5 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, maxWidth: 380 }}>
          {description}
        </Typography>
      )}
      {action && <Box sx={{ mt: 3 }}>{action}</Box>}
    </Box>
  )
}

export function Pill({ label, color }: { label: string; color: string }) {
  return (
    <Chip
      size="small"
      label={label}
      icon={<Box component="span" aria-hidden sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: 'currentColor', ml: '10px !important', mr: '-4px !important' }} />}
      sx={{ color, bgcolor: alpha(color, 0.1), border: `1px solid ${alpha(color, 0.25)}`, '& .MuiChip-icon': { color } }}
    />
  )
}

export function StatusChip({ status }: { status: BookingStatus }) {
  return <Pill label={status} color={STATUS_COLOR[status]} />
}

const APPLICATION_COLOR: Record<ApplicationStatus, string> = {
  Pending: '#9A9AA4',
  Approved: '#8FA58F',
  Declined: '#B0776F',
}

export function ApplicationChip({ status }: { status: ApplicationStatus }) {
  return <Pill label={status} color={APPLICATION_COLOR[status]} />
}

export function TypeLabel({ type }: { type: BookingType }) {
  if (type === 'Privé') {
    return (
      <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, color: 'primary.main', fontSize: '0.75rem', fontWeight: 500 }}>
        <DiamondOutlined sx={{ fontSize: 14 }} aria-hidden />
        Privé
      </Box>
    )
  }
  return (
    <Box component="span" sx={{ fontSize: '0.75rem', color: type === 'Bespoke' ? 'text.primary' : 'text.secondary' }}>
      {type}
    </Box>
  )
}

export function Bar({ w, h, sx }: { w: number | string; h: number; sx?: SxProps<Theme> }) {
  return <Skeleton variant="rounded" width={w} height={h} sx={sx} aria-hidden />
}
