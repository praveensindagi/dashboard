import { Box, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { SparkLineChart } from '@mui/x-charts/SparkLineChart'
import DiamondOutlined from '@mui/icons-material/DiamondOutlined'
import NorthEast from '@mui/icons-material/NorthEast'
import type { PriveSummary } from '../types'
import { formatINR, formatNumber } from '../lib/format'
import { useCountUp, usePrefersReducedMotion } from '../hooks/interaction'
import { tokens } from '../theme'
import { Bar, fadeInSx, Surface } from './ui'

export function PriveOverview({ prive, loading }: { prive?: PriveSummary; loading?: boolean }) {
  if (loading || !prive) {
    return (
      <Surface tone="prive" role="region" aria-label="Privé" sx={{ height: '100%', p: { xs: 3, md: 4 } }}>
        <Box aria-hidden>
          <Bar w={96} h={28} />
          <Bar w={176} h={12} sx={{ mt: 1.5 }} />
          <Bar w="100%" h={96} sx={{ mt: 4 }} />
          <Box sx={{ mt: 4, display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3 }}>
            {Array.from({ length: 4 }, (_, i) => (
              <Bar key={i} w="100%" h={48} />
            ))}
          </Box>
        </Box>
      </Surface>
    )
  }
  return <PriveLoaded prive={prive} />
}

function PriveLoaded({ prive }: { prive: PriveSummary }) {
  const reduced = usePrefersReducedMotion()
  const members = useCountUp(prive.activeMembers)
  const revenues = prive.weeklyRevenue.map((w) => w.revenue)

  const stats = [
    { label: 'New Members', value: `+${prive.newMembers}` },
    { label: 'Privé Bookings', value: formatNumber(prive.bookings) },
    { label: 'Privé Revenue', value: formatINR(prive.revenue) },
    { label: 'Average Booking Value', value: formatINR(prive.averageBookingValue) },
  ]

  return (
    <Surface tone="prive" role="region" aria-labelledby="prive-title" sx={{ height: '100%', overflow: 'hidden', p: { xs: 3, md: 4 }, ...fadeInSx }}>
      {/* A single gold hairline is the whole ornament. */}
      <Box aria-hidden sx={{ position: 'absolute', top: 0, left: 32, right: 32, height: '1px', bgcolor: alpha(tokens.gold, 0.5) }} />

      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Typography id="prive-title" component="h2" variant="h3" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: tokens.goldLight }}>
            <DiamondOutlined sx={{ fontSize: 22, color: 'primary.main' }} aria-hidden />
            Privé
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1.25, display: 'block' }}>
            Private membership overview
          </Typography>
        </Box>
        {prive.revenueTrendLabel && (
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            px: 1.5,
            py: 0.5,
            borderRadius: 999,
            border: `1px solid ${alpha(tokens.gold, 0.25)}`,
            fontSize: '0.75rem',
            fontWeight: 500,
            color: 'primary.main',
            whiteSpace: 'nowrap',
          }}
        >
          <NorthEast sx={{ fontSize: 14 }} aria-hidden />
          {prive.revenueTrendLabel}
          <Box component="span" sx={{ fontWeight: 400, color: 'text.secondary' }}>revenue</Box>
        </Box>
        )}
      </Box>

      <Box sx={{ mt: 4, display: 'grid', alignItems: 'end', gap: { xs: 3, sm: 5 }, gridTemplateColumns: { xs: '1fr', sm: 'auto 1fr' } }}>
        <Box>
          <Typography component="p" variant="h4" sx={{ fontSize: '2.5rem', lineHeight: 1, color: tokens.goldLight }}>
            <span aria-hidden>{Math.round(members)}</span>
            <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>{prive.activeMembers}</span>
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Active Members
          </Typography>
        </Box>

        <Box component="figure" sx={{ m: 0, minWidth: 0 }}>
          <SparkLineChart
            data={revenues}
            height={84}
            area
            curve="monotoneX"
            colors={[tokens.gold]}
            showTooltip
            showHighlight
            skipAnimation={reduced}
            xAxis={{ scaleType: 'point', data: prive.weeklyRevenue.map((w) => w.week) }}
            yAxis={{ min: Math.min(...revenues) * 0.8 }}
            valueFormatter={(v: number | null) => (v === null ? '' : formatINR(v))}
            margin={{ top: 6, right: 4, bottom: 2, left: 4 }}
            sx={{
              '& .MuiLineElement-root': { strokeWidth: 1.5 },
              '& .MuiAreaElement-root': { fillOpacity: 0.14 },
            }}
          />
          <Typography component="figcaption" variant="caption" color="text.secondary" sx={{ mt: 0.75, display: 'block', fontSize: '0.6875rem' }}>
            Weekly Privé revenue, last 8 weeks
          </Typography>
        </Box>
      </Box>

      <Box
        component="dl"
        sx={{ m: 0, mt: 4, display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, columnGap: 2, rowGap: 3 }}
      >
        {stats.map((s) => (
          <Box key={s.label} sx={{ pl: 2, borderLeft: `1px solid ${alpha(tokens.gold, 0.2)}` }}>
            <Typography component="dt" variant="overline" color="text.secondary" sx={{ letterSpacing: '0.1em' }}>
              {s.label}
            </Typography>
            <Typography component="dd" variant="h5" sx={{ m: 0, mt: 1 }}>
              {s.value}
            </Typography>
          </Box>
        ))}
      </Box>
    </Surface>
  )
}
