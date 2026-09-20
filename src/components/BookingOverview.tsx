import { useMemo, useState } from 'react'
import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { LineChart } from '@mui/x-charts/LineChart'
import EventBusyOutlined from '@mui/icons-material/EventBusyOutlined'
import type { BookingPoint, RangeKey } from '../types'
import { formatDayMonth, formatTooltipDate, formatWeekdayDay } from '../lib/format'
import { usePrefersReducedMotion } from '../hooks/interaction'
import { tokens } from '../theme'
import { Bar, EmptyState, fadeInSx, SectionHeader, Surface } from './ui'

const RANGES: { value: RangeKey; label: string }[] = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: 'month', label: 'This Month' },
]

const SUBTITLES: Record<RangeKey, string> = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  month: 'Current month performance',
}

interface BookingOverviewProps {
  series?: Record<RangeKey, BookingPoint[]>
  loading?: boolean
}

export function BookingOverview({ series, loading }: BookingOverviewProps) {
  const [range, setRange] = useState<RangeKey>('month')
  const reduced = usePrefersReducedMotion()
  const points = useMemo(() => series?.[range] ?? [], [series, range])

  const totals = useMemo(
    () => ({
      regular: points.reduce((sum, p) => sum + p.regular, 0),
      prive: points.reduce((sum, p) => sum + p.prive, 0),
    }),
    [points],
  )

  const tickStep = Math.max(1, Math.ceil(points.length / 8))
  const tick = range === '7d' ? formatWeekdayDay : formatDayMonth

  return (
    <Surface role="region" aria-labelledby="booking-overview-title" sx={{ height: '100%', p: { xs: 3, md: 4 } }}>
      <SectionHeader
        id="booking-overview-title"
        title="Booking Overview"
        subtitle={SUBTITLES[range]}
        action={
          <ToggleButtonGroup
            exclusive
            size="small"
            value={range}
            onChange={(_, next: RangeKey | null) => next && setRange(next)}
            aria-label="Date range"
          >
            {RANGES.map((r) => (
              <ToggleButton key={r.value} value={r.value}>
                {r.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        }
      />

      {loading ? (
        <Box aria-hidden>
          <Box sx={{ mt: 3, display: 'flex', gap: 5 }}>
            <Bar w={144} h={48} />
            <Bar w={144} h={48} />
          </Box>
          <Bar w="100%" h={280} sx={{ mt: 4 }} />
        </Box>
      ) : points.length === 0 ? (
        <EmptyState icon={EventBusyOutlined} title="No bookings in this range" description="Bookings will chart here as soon as they are made." />
      ) : (
        <Box sx={fadeInSx}>
          <Box component="dl" sx={{ m: 0, mt: 3, display: 'flex', flexWrap: 'wrap', gap: '16px 48px' }}>
            <Box>
              <Typography component="dt" variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box aria-hidden component="span" sx={{ width: 20, height: '1px', bgcolor: tokens.stone }} />
                Regular Bookings
              </Typography>
              <Typography component="dd" variant="h4" sx={{ m: 0, mt: 0.5 }}>
                {totals.regular}
              </Typography>
            </Box>
            <Box>
              <Typography component="dt" variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box aria-hidden component="span" sx={{ width: 20, height: '2px', bgcolor: tokens.gold }} />
                Privé Member Bookings
              </Typography>
              <Typography component="dd" variant="h4" sx={{ m: 0, mt: 0.5, color: 'primary.main' }}>
                {totals.prive}
              </Typography>
            </Box>
          </Box>

          {/* Narrow screens keep a readable chart width and scroll sideways. */}
          <Box sx={{ mt: 3, mx: -1, overflowX: 'auto' }}>
            <Box sx={{ minWidth: 560 }}>
              <LineChart
                key={range}
                height={300}
                skipAnimation={reduced}
                margin={{ top: 10, right: 16, bottom: 30, left: 8 }}
                grid={{ horizontal: true }}
                slotProps={{ legend: { hidden: true } }}
                series={[
                  { id: 'prive', label: 'Privé Member Bookings', data: points.map((p) => p.prive), color: tokens.gold, area: true, showMark: false, curve: 'monotoneX' },
                  { id: 'regular', label: 'Regular Bookings', data: points.map((p) => p.regular), color: tokens.stone, showMark: false, curve: 'monotoneX' },
                ]}
                xAxis={[
                  {
                    scaleType: 'point',
                    data: points.map((p) => p.date),
                    tickLabelInterval: (_: string, i: number) => i % tickStep === 0,
                    valueFormatter: (v: string, ctx) => (ctx.location === 'tick' ? tick(v) : formatTooltipDate(v)),
                  },
                ]}
                yAxis={[{ tickMinStep: 1, min: 0 }]}
                sx={{
                  '& .MuiChartsAxis-line, & .MuiChartsAxis-tick': { display: 'none' },
                  '& .MuiChartsAxis-tickLabel': { fill: tokens.stone, fontSize: 11, fontFamily: tokens.sans },
                  '& .MuiChartsGrid-line': { stroke: 'rgba(245,243,238,0.05)' },
                  '& .MuiLineElement-series-prive': { strokeWidth: 1.75 },
                  '& .MuiLineElement-series-regular': { strokeWidth: 1.25 },
                  '& .MuiAreaElement-series-prive': { fillOpacity: 0.12 },
                  '& .MuiChartsAxisHighlight-root': { stroke: 'rgba(214,190,131,0.28)' },
                }}
              />
            </Box>
          </Box>
        </Box>
      )}
    </Surface>
  )
}
