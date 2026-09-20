import { useEffect, useState } from 'react'
import { Box, LinearProgress, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import AutoAwesomeOutlined from '@mui/icons-material/AutoAwesomeOutlined'
import type { Look } from '../types'
import { pad2, plural } from '../lib/format'
import { tokens } from '../theme'
import { Bar, EmptyState, SectionHeader, Surface } from './ui'

interface MostBookedLooksProps {
  looks?: Look[]
  loading?: boolean
}

export function MostBookedLooks({ looks, loading }: MostBookedLooksProps) {
  const max = Math.max(1, ...(looks ?? []).map((l) => l.bookings))
  // Bars start empty and grow on mount; the MUI progress bar transitions the change.
  const [grown, setGrown] = useState(false)
  useEffect(() => {
    if (loading) return
    const id = requestAnimationFrame(() => setGrown(true))
    return () => cancelAnimationFrame(id)
  }, [loading])

  return (
    <Surface role="region" aria-labelledby="looks-title" sx={{ height: '100%', p: { xs: 3, md: 4 } }}>
      <SectionHeader id="looks-title" title="Most Booked Looks" subtitle="Ranked by total bookings" />

      {loading ? (
        <Box aria-hidden sx={{ mt: 4, display: 'grid', gap: 3.5 }}>
          {Array.from({ length: 5 }, (_, i) => (
            <Box key={i}>
              <Bar w="66%" h={16} />
              <Bar w="100%" h={2} sx={{ mt: 1.5 }} />
            </Box>
          ))}
        </Box>
      ) : !looks?.length ? (
        <EmptyState icon={AutoAwesomeOutlined} title="No looks booked yet" description="Your most requested looks will be ranked here." />
      ) : (
        <Box component="ol" sx={{ listStyle: 'none', m: 0, mt: 4, p: 0, display: 'grid', gap: 3 }}>
          {looks.map((look, i) => (
            <Box
              component="li"
              key={look.id}
              sx={{ display: 'grid', gridTemplateColumns: '2rem 1fr auto', alignItems: 'baseline', columnGap: 1.5, rowGap: 1.25 }}
            >
              <Typography component="span" sx={{ fontFamily: tokens.serif, fontSize: 19, fontVariantNumeric: 'tabular-nums', color: tokens.goldDeep }}>
                {pad2(i + 1)}
              </Typography>
              <Typography noWrap sx={{ color: 'text.primary' }}>
                {look.name}
              </Typography>
              <Typography component="span" sx={{ fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
                {look.bookings}{' '}
                <Typography component="span" variant="caption" color="text.secondary" sx={{ fontWeight: 400 }}>
                  {plural(look.bookings, 'booking')}
                </Typography>
              </Typography>
              <LinearProgress
                variant="determinate"
                value={grown ? (look.bookings / max) * 100 : 0}
                aria-label={`${look.name}: ${look.bookings} bookings`}
                sx={{
                  gridColumn: '2 / span 2',
                  height: 2,
                  borderRadius: 999,
                  bgcolor: 'rgba(245,243,238,0.07)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 999,
                    bgcolor: alpha(tokens.gold, Math.max(0.4, 0.9 - i * 0.12)),
                    transition: `transform 900ms ${tokens.ease} ${i * 80}ms`,
                  },
                }}
              />
            </Box>
          ))}
        </Box>
      )}
    </Surface>
  )
}
