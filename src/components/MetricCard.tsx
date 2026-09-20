import { Box, Skeleton, Typography } from '@mui/material'
import type { SvgIconComponent } from '@mui/icons-material'
import AccountBalanceWalletOutlined from '@mui/icons-material/AccountBalanceWalletOutlined'
import CurrencyRupeeOutlined from '@mui/icons-material/CurrencyRupeeOutlined'
import DiamondOutlined from '@mui/icons-material/DiamondOutlined'
import EventNoteOutlined from '@mui/icons-material/EventNoteOutlined'
import HourglassEmptyOutlined from '@mui/icons-material/HourglassEmptyOutlined'
import ListAltOutlined from '@mui/icons-material/ListAltOutlined'
import NorthEast from '@mui/icons-material/NorthEast'
import Remove from '@mui/icons-material/Remove'
import SouthEast from '@mui/icons-material/SouthEast'
import type { MetricData, MetricIconKey, Sentiment } from '../types'
import { formatINR, formatNumber, pad2 } from '../lib/format'
import { useCountUp } from '../hooks/interaction'
import { tokens } from '../theme'
import { BespokeIcon } from './icons'
import { fadeInSx, Surface } from './ui'

const ICONS: Record<MetricIconKey, SvgIconComponent> = {
  calendar: EventNoteOutlined,
  hourglass: HourglassEmptyOutlined,
  layers: ListAltOutlined,
  rupee: CurrencyRupeeOutlined,
  wallet: AccountBalanceWalletOutlined,
  gem: DiamondOutlined,
  bespoke: BespokeIcon,
}

const SENTIMENT: Record<Sentiment, string> = {
  positive: tokens.positive,
  negative: tokens.negative,
  neutral: tokens.stone,
}

const formatValue = (metric: MetricData, n: number) => {
  if (metric.format === 'currency') return formatINR(n)
  if (metric.format === 'padded') return pad2(n)
  return formatNumber(n)
}

interface MetricCardProps {
  metric?: MetricData
  loading?: boolean
  featured?: boolean
}

export function MetricCard({ metric, loading, featured }: MetricCardProps) {
  if (loading || !metric) {
    return (
      <Surface sx={{ height: '100%', p: 3 }} aria-hidden>
        <Skeleton variant="rounded" width={112} height={12} />
        <Skeleton variant="rounded" width={featured ? 190 : 128} height={32} sx={{ mt: 3.5 }} />
        <Skeleton variant="rounded" width={144} height={12} sx={{ mt: 2 }} />
      </Surface>
    )
  }
  return <MetricCardLoaded metric={metric} />
}

function MetricCardLoaded({ metric }: { metric: MetricData }) {
  const value = useCountUp(metric.value, true)
  const Icon = ICONS[metric.icon]
  const Arrow = metric.trend.direction === 'up' ? NorthEast : metric.trend.direction === 'down' ? SouthEast : Remove
  const featured = metric.featured

  return (
    <Surface interactive sx={{ height: '100%', p: 3, ...fadeInSx }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
        <Typography variant="overline" color="text.secondary">
          {metric.label}
        </Typography>
        <Icon sx={{ fontSize: 20, flexShrink: 0, color: featured ? 'primary.main' : tokens.ash }} aria-hidden />
      </Box>

      <Typography
        variant="h4"
        component="p"
        sx={{ mt: 3, fontSize: featured ? '2.125rem' : '1.75rem', color: featured ? tokens.goldLight : 'text.primary' }}
      >
        <span aria-hidden>{formatValue(metric, value)}</span>
        <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>{formatValue(metric, metric.value)}</span>
      </Typography>

      <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.75rem' }}>
        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25, fontWeight: 500, color: SENTIMENT[metric.trend.sentiment] }}>
          <Arrow sx={{ fontSize: 14 }} aria-hidden />
          {metric.trend.label}
        </Box>
        <Typography component="span" variant="caption" color="text.secondary">
          {metric.caption}
        </Typography>
      </Box>
    </Surface>
  )
}
