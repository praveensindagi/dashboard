import { useMemo, useState } from 'react'
import { Box, Button, Chip, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined'
import TaskAltOutlined from '@mui/icons-material/TaskAltOutlined'
import UpcomingOutlined from '@mui/icons-material/UpcomingOutlined'
import type { SvgIconComponent } from '@mui/icons-material'
import type { BookingRecord, BookingStatus } from '../../types'
import { formatDate, formatINR, formatLongDate, parseISODate, plural, toISODate } from '../../lib/format'
import { STATUS_ORDER } from '../../lib/status'
import { tokens } from '../../theme'
import { BespokeIcon } from '../icons'
import { StatusChip, TypeLabel } from '../ui'
import { DataList, DetailDialog, Field, FieldGrid, ListToolbar, smallButtonSx, useLast, type Column } from './common'

export type BookingsKind = 'all' | 'bespoke' | 'upcoming' | 'completed'

interface BookingsPageProps {
  kind: BookingsKind
  bookings: BookingRecord[]
  loading?: boolean
  today: Date
}

type StatusFilter = 'All' | BookingStatus
const FILTERS: StatusFilter[] = ['All', ...STATUS_ORDER]

const COPY: Record<BookingsKind, { noun: string; icon: SvgIconComponent; empty: string; emptyHint: string }> = {
  all: { noun: 'booking', icon: CalendarMonthOutlined, empty: 'No bookings yet', emptyHint: 'Bookings appear here the moment a client books.' },
  bespoke: { noun: 'bespoke booking', icon: BespokeIcon, empty: 'No bespoke bookings yet', emptyHint: 'Customised bookings with a curated look appear here.' },
  upcoming: { noun: 'upcoming booking', icon: UpcomingOutlined, empty: 'Nothing coming up', emptyHint: 'Confirmed bookings with a future date appear here, and move to Completed once the date passes.' },
  completed: { noun: 'completed booking', icon: TaskAltOutlined, empty: 'No completed bookings yet', emptyHint: 'Bookings move here automatically once their date has passed.' },
}

/** "Today", "Tomorrow", "In 3 days" */
function relativeDay(iso: string, today: Date) {
  const days = Math.round((parseISODate(iso).getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  return days > 1 ? `In ${days} days` : ''
}

export function BookingsPage({ kind, bookings, loading, today }: BookingsPageProps) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<StatusFilter>('All')
  const [open, setOpen] = useState<BookingRecord | null>(null)
  const shown = useLast(open)
  const copy = COPY[kind]
  const todayISO = toISODate(today)
  const showFilter = kind === 'all' || kind === 'bespoke'

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    let list = bookings
    if (kind === 'bespoke') list = list.filter((b) => b.bespoke)
    if (kind === 'upcoming') list = list.filter((b) => b.status === 'Confirmed' && b.date >= todayISO).sort((a, b) => a.startsAt - b.startsAt)
    if (kind === 'completed') list = list.filter((b) => b.status === 'Completed').sort((a, b) => b.startsAt - a.startsAt)
    if (showFilter && status !== 'All') list = list.filter((b) => b.status === status)
    if (q) list = list.filter((b) => `${b.ref} ${b.client} ${b.email} ${b.phone} ${b.service} ${b.look}`.toLowerCase().includes(q))
    return list
  }, [bookings, kind, todayISO, showFilter, status, search])

  const when = (b: BookingRecord) => (
    <Box>
      <Box component="span" sx={{ fontVariantNumeric: 'tabular-nums' }}>{formatDate(b.date)}</Box>
      {b.time && (
        <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1, fontVariantNumeric: 'tabular-nums' }}>
          {b.time}
        </Typography>
      )}
      {kind === 'upcoming' && relativeDay(b.date, today) && (
        <Chip size="small" label={relativeDay(b.date, today)} sx={{ ml: 1.5, height: 22, color: 'primary.main', bgcolor: alpha(tokens.gold, 0.1), border: `1px solid ${alpha(tokens.gold, 0.25)}` }} />
      )}
    </Box>
  )

  const columns: Column<BookingRecord>[] = [
    { key: 'ref', header: 'Booking ID', render: (b) => <Box sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>{b.ref}</Box>, nowrap: true },
    {
      key: 'client',
      header: 'Client',
      render: (b) => (
        <Box>
          <Box sx={{ fontWeight: 500, color: 'text.primary' }}>{b.client}</Box>
          <Typography variant="caption" color="text.secondary">{b.phone || b.email}</Typography>
        </Box>
      ),
    },
    { key: 'look', header: 'Service or look', render: (b) => <Box sx={{ color: 'rgba(245,243,238,0.8)' }}>{b.look || '—'}</Box> },
    { key: 'type', header: 'Type', render: (b) => <TypeLabel type={b.type} /> },
    { key: 'when', header: 'Appointment', render: when, nowrap: true },
    { key: 'amount', header: 'Amount', align: 'right', render: (b) => <Box sx={{ fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{formatINR(b.amount)}</Box>, nowrap: true },
    { key: 'status', header: 'Status', render: (b) => <StatusChip status={b.status} /> },
    { key: 'view', header: '', align: 'right', render: (b) => <Button variant="outlined" sx={smallButtonSx} onClick={(e) => { e.stopPropagation(); setOpen(b) }}>View</Button> },
  ]

  return (
    <>
      <ListToolbar
        search={search}
        onSearch={setSearch}
        placeholder="Search client, phone or booking ID"
        count={loading ? '' : `${rows.length} ${plural(rows.length, copy.noun)}`}
      >
        {showFilter && (
          <ToggleButtonGroup exclusive size="small" value={status} onChange={(_, next: StatusFilter | null) => next && setStatus(next)} aria-label="Filter by status">
            {FILTERS.map((f) => (
              <ToggleButton key={f} value={f}>{f}</ToggleButton>
            ))}
          </ToggleButtonGroup>
        )}
      </ListToolbar>

      <DataList
        label={`${copy.noun}s`}
        rows={rows}
        columns={columns}
        rowKey={(b) => b.id}
        loading={loading}
        resetKey={`${kind}|${status}|${search}`}
        onRowClick={setOpen}
        empty={{
          icon: copy.icon,
          title: search || status !== 'All' ? 'No matching bookings' : copy.empty,
          description: search || status !== 'All' ? 'Try a different search or filter.' : copy.emptyHint,
        }}
        renderCard={(b) => (
          <Box onClick={() => setOpen(b)} sx={{ cursor: 'pointer' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography noWrap sx={{ fontWeight: 500, color: 'text.primary' }}>{b.client}</Typography>
                <Typography noWrap variant="caption" sx={{ color: 'rgba(245,243,238,0.8)' }}>{b.look || '—'}</Typography>
              </Box>
              <Typography sx={{ flexShrink: 0, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{formatINR(b.amount)}</Typography>
            </Box>
            <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '8px 16px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TypeLabel type={b.type} />
                <Typography variant="caption" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatDate(b.date)}{b.time ? `, ${b.time}` : ''}
                </Typography>
              </Box>
              <StatusChip status={b.status} />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', fontSize: '0.6875rem' }}>{b.ref}</Typography>
          </Box>
        )}
      />

      <DetailDialog open={Boolean(open)} title={shown?.client ?? ''} subtitle={shown ? `${shown.ref}, booked ${shown.createdAt ? formatLongDate(new Date(shown.createdAt)) : ''}` : ''} onClose={() => setOpen(null)}>
        {shown && (
          <FieldGrid>
            <Field label="Status"><StatusChip status={shown.status} /></Field>
            <Field label="Type"><TypeLabel type={shown.type} /></Field>
            <Field label="Service">{shown.service}</Field>
            <Field label="Curated look">{shown.look !== shown.service ? shown.look : ''}</Field>
            <Field label="Appointment">{`${formatDate(shown.date)}${shown.time ? `, ${shown.time}` : ''}`}</Field>
            <Field label="Booking fee">{formatINR(shown.amount)}</Field>
            <Field label="Phone">{shown.phone}</Field>
            <Field label="Email">{shown.email}</Field>
            <Field label="Address" wide>{shown.address}</Field>
            <Field label="Skin type">{shown.skinType}</Field>
            <Field label="Skin concerns">
              {shown.skinConcerns.length ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {shown.skinConcerns.map((c) => <Chip key={c} size="small" label={c} variant="outlined" />)}
                </Box>
              ) : ''}
            </Field>
            {shown.membershipId && <Field label="Membership ID">{shown.membershipId}</Field>}
            <Field label="Notes" wide>{shown.notes}</Field>
          </FieldGrid>
        )}
      </DetailDialog>
    </>
  )
}
