import { useMemo, useState } from 'react'
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import InboxOutlined from '@mui/icons-material/InboxOutlined'
import type { Booking, BookingStatus } from '../types'
import { formatDate, formatINR } from '../lib/format'
import { STATUS_ORDER } from '../lib/status'
import { tokens } from '../theme'
import { Bar, EmptyState, fadeInSx, SectionHeader, StatusChip, Surface, TypeLabel } from './ui'

type Filter = 'All' | BookingStatus
const FILTERS: Filter[] = ['All', ...STATUS_ORDER]

const edge = { '&:first-of-type': { pl: 4 }, '&:last-of-type': { pr: 4 } }

interface RecentBookingsProps {
  bookings?: Booking[]
  loading?: boolean
  onSelectBooking?: (booking: Booking) => void
}

export function RecentBookings({ bookings, loading, onSelectBooking }: RecentBookingsProps) {
  const [filter, setFilter] = useState<Filter>('All')
  const rows = useMemo(() => (bookings ?? []).filter((b) => filter === 'All' || b.status === filter), [bookings, filter])

  return (
    <Surface role="region" aria-labelledby="recent-title" sx={{ height: '100%', pt: { xs: 3, md: 4 }, pb: 1 }}>
      <Box sx={{ px: { xs: 3, md: 4 } }}>
        <SectionHeader
          id="recent-title"
          title="Recent Bookings"
          subtitle="The latest activity across the studio"
          action={
            <ToggleButtonGroup
              exclusive
              size="small"
              value={filter}
              onChange={(_, next: Filter | null) => next && setFilter(next)}
              aria-label="Filter by status"
            >
              {FILTERS.map((f) => (
                <ToggleButton key={f} value={f}>
                  {f}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          }
        />
      </Box>

      {loading ? (
        <Box aria-hidden sx={{ mt: 4, px: { xs: 3, md: 4 }, pb: 3, display: 'grid', gap: 2.5 }}>
          {Array.from({ length: 5 }, (_, i) => (
            <Bar key={i} w="100%" h={40} />
          ))}
        </Box>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={InboxOutlined}
          title={filter === 'All' ? 'No bookings yet' : `No ${filter.toLowerCase()} bookings`}
          description={filter === 'All' ? 'New bookings will appear here.' : 'Nothing matches this status right now.'}
          action={
            filter === 'All' ? undefined : (
              <Button variant="outlined" onClick={() => setFilter('All')} sx={{ height: 40 }}>
                Show all bookings
              </Button>
            )
          }
        />
      ) : (
        <>
          {/* Desktop and wide tablet: table */}
          <TableContainer sx={{ mt: 3, display: { xs: 'none', lg: 'block' }, ...fadeInSx }}>
            <Table sx={{ minWidth: 860 }} aria-label="Recent bookings">
              <TableHead>
                <TableRow>
                  {['Booking ID', 'Client', 'Look', 'Type', 'Date', 'Amount', 'Status'].map((h) => (
                    <TableCell key={h} align={h === 'Amount' ? 'right' : 'left'} sx={edge}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((b) => (
                  <TableRow
                    key={b.id}
                    hover
                    onClick={onSelectBooking ? () => onSelectBooking(b) : undefined}
                    sx={{
                      cursor: onSelectBooking ? 'pointer' : 'default',
                      transition: 'background-color 200ms',
                      '&:last-child td': { borderBottom: 0 },
                      '&.MuiTableRow-hover:hover': { backgroundColor: 'rgba(245,243,238,0.025)' },
                    }}
                  >
                    <TableCell sx={{ ...edge, color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>{b.id}</TableCell>
                    <TableCell sx={{ ...edge, fontWeight: 500, color: 'text.primary' }}>{b.client}</TableCell>
                    <TableCell sx={{ ...edge, color: 'rgba(245,243,238,0.8)' }}>{b.look}</TableCell>
                    <TableCell sx={edge}><TypeLabel type={b.type} /></TableCell>
                    <TableCell sx={{ ...edge, whiteSpace: 'nowrap', color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>{formatDate(b.date)}</TableCell>
                    <TableCell align="right" sx={{ ...edge, fontWeight: 500, color: 'text.primary', fontVariantNumeric: 'tabular-nums' }}>{formatINR(b.amount)}</TableCell>
                    <TableCell sx={edge}><StatusChip status={b.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Mobile and small tablet: cards */}
          <Box component="ul" sx={{ listStyle: 'none', m: 0, mt: 3, p: 0, px: { xs: 3, md: 4 }, display: { xs: 'block', lg: 'none' }, ...fadeInSx }}>
            {rows.map((b, i) => (
              <Box component="li" key={b.id} sx={{ py: 2.5, borderTop: i ? `1px solid ${tokens.line}` : 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography noWrap sx={{ fontWeight: 500, color: 'text.primary' }}>{b.client}</Typography>
                    <Typography noWrap variant="caption" sx={{ color: 'rgba(245,243,238,0.8)' }}>{b.look}</Typography>
                  </Box>
                  <Typography sx={{ flexShrink: 0, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{formatINR(b.amount)}</Typography>
                </Box>
                <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '8px 16px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <TypeLabel type={b.type} />
                    <Typography variant="caption" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>{formatDate(b.date)}</Typography>
                  </Box>
                  <StatusChip status={b.status} />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', fontSize: '0.6875rem', fontVariantNumeric: 'tabular-nums' }}>
                  {b.id}
                </Typography>
              </Box>
            ))}
          </Box>
        </>
      )}
    </Surface>
  )
}
