import { Box, Typography } from '@mui/material'
import { PieChart } from '@mui/x-charts/PieChart'
import PieChartOutlineOutlined from '@mui/icons-material/PieChartOutlineOutlined'
import type { StatusSlice } from '../types'
import { STATUS_COLOR } from '../lib/status'
import { tokens } from '../theme'
import { usePrefersReducedMotion, useCountUp } from '../hooks/interaction'
import { Bar, EmptyState, fadeInSx, SectionHeader, Surface } from './ui'

const SIZE = 210

export function BookingStatus({ slices, loading }: { slices?: StatusSlice[]; loading?: boolean }) {
  const reduced = usePrefersReducedMotion()
  const total = (slices ?? []).reduce((sum, s) => sum + s.count, 0)
  const counted = useCountUp(total, !loading && total > 0, 1200)

  return (
    <Surface role="region" aria-labelledby="status-title" sx={{ height: '100%', p: { xs: 3, md: 4 } }}>
      <SectionHeader id="status-title" title="Booking Status" subtitle="All bookings by stage" />

      {loading ? (
        <Box aria-hidden sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ width: SIZE, height: SIZE, borderRadius: '50%', overflow: 'hidden' }}>
            <Bar w={SIZE} h={SIZE} sx={{ borderRadius: '50%' }} />
          </Box>
          <Bar w="100%" h={96} sx={{ mt: 4 }} />
        </Box>
      ) : total === 0 ? (
        <EmptyState icon={PieChartOutlineOutlined} title="No bookings to chart" description="Booking stages will appear here." />
      ) : (
        <Box sx={fadeInSx}>
          <Box sx={{ position: 'relative', mx: 'auto', mt: 3, width: SIZE, height: SIZE }}>
            <PieChart
              width={SIZE}
              height={SIZE}
              margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
              skipAnimation={reduced}
              slotProps={{ legend: { hidden: true } }}
              series={[
                {
                  id: 'status',
                  data: (slices ?? []).map((s) => ({ id: s.status, label: s.status, value: s.count, color: STATUS_COLOR[s.status] })),
                  innerRadius: 91,
                  outerRadius: 100,
                  paddingAngle: 3,
                  cornerRadius: 2,
                  highlightScope: { highlight: 'item', fade: 'global' },
                },
              ]}
              sx={{ '& .MuiPieArc-root': { stroke: 'none', outline: 'none' } }}
            />
            <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <Typography variant="h4" component="span" sx={{ fontSize: '2.375rem', lineHeight: 1 }}>
                <span aria-hidden>{Math.round(counted)}</span>
                <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>{total}</span>
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Total Bookings
              </Typography>
            </Box>
          </Box>

          <Box component="ul" sx={{ listStyle: 'none', m: 0, mt: 4, p: 0 }}>
            {(slices ?? []).map((s, i) => (
              <Box
                component="li"
                key={s.status}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, py: 1.5, borderTop: i ? `1px solid ${tokens.line}` : 0, fontSize: '0.8125rem' }}
              >
                <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.primary' }}>
                  <Box aria-hidden component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: STATUS_COLOR[s.status] }} />
                  {s.status}
                </Box>
                <Box component="span" sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, fontVariantNumeric: 'tabular-nums' }}>
                  <Box component="span" sx={{ fontWeight: 500 }}>{s.count}</Box>
                  <Box component="span" sx={{ width: 44, textAlign: 'right', fontSize: '0.75rem', color: 'text.secondary' }}>
                    {((s.count / total) * 100).toFixed(1)}%
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Surface>
  )
}
