import { useMemo, useState } from 'react'
import { Alert, Box, Button, Snackbar, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined'
import DiamondOutlined from '@mui/icons-material/DiamondOutlined'
import type { ApplicationStatus, PriveApplicationRecord } from '../../types'
import { formatDate, formatLongDate, plural, toISODate } from '../../lib/format'
import { ApplicationChip } from '../ui'
import { ConfirmDialog } from '../ConfirmDialog'
import { DataList, DetailDialog, Field, FieldGrid, ListToolbar, smallButtonSx, useLast, type Column } from './common'

interface ApplicationsPageProps {
  applications: PriveApplicationRecord[]
  loading?: boolean
  /** Resolves with the new membership ID. */
  onApprove?: (application: PriveApplicationRecord) => Promise<string>
}

type Filter = 'All' | ApplicationStatus
const FILTERS: Filter[] = ['All', 'Pending', 'Approved']

export function ApplicationsPage({ applications, loading, onApprove }: ApplicationsPageProps) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('All')
  const [viewing, setViewing] = useState<PriveApplicationRecord | null>(null)
  const [approving, setApproving] = useState<PriveApplicationRecord | null>(null)
  const shownView = useLast(viewing)
  const shownApproving = useLast(approving)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState<{ severity: 'success' | 'error'; text: string } | null>(null)

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return applications
      .filter((a) => filter === 'All' || a.status === filter)
      .filter((a) => !q || `${a.name} ${a.email} ${a.phone} ${a.instagram} ${a.interest} ${a.membershipId}`.toLowerCase().includes(q))
  }, [applications, filter, search])

  const confirmApprove = async () => {
    if (!approving || !onApprove) return
    setBusy(true)
    try {
      const membershipId = await onApprove(approving)
      setToast({ severity: 'success', text: `${approving.name} approved. Membership ID ${membershipId}.` })
      setApproving(null)
      setViewing(null)
    } catch (e) {
      setToast({ severity: 'error', text: e instanceof Error ? e.message : 'Could not approve this application.' })
      setApproving(null)
    } finally {
      setBusy(false)
    }
  }

  const applied = (a: PriveApplicationRecord) => (a.createdAt ? formatDate(toISODate(new Date(a.createdAt))) : '—')

  const actions = (a: PriveApplicationRecord) => (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
      <Button variant="outlined" sx={smallButtonSx} onClick={(e) => { e.stopPropagation(); setViewing(a) }}>View</Button>
      {a.status === 'Pending' && (
        <Button variant="contained" sx={smallButtonSx} disabled={!onApprove} onClick={(e) => { e.stopPropagation(); setApproving(a) }}>
          Approve
        </Button>
      )}
    </Box>
  )

  const columns: Column<PriveApplicationRecord>[] = [
    {
      key: 'name',
      header: 'Applicant',
      render: (a) => (
        <Box>
          <Box sx={{ fontWeight: 500, color: 'text.primary' }}>{a.name}</Box>
          <Typography variant="caption" color="text.secondary">{a.email}</Typography>
        </Box>
      ),
    },
    { key: 'ig', header: 'Instagram', render: (a) => <Box sx={{ color: 'text.secondary' }}>{a.instagram || '—'}</Box> },
    { key: 'interest', header: 'Interest', render: (a) => <Box sx={{ color: 'rgba(245,243,238,0.8)' }}>{a.interest || '—'}</Box> },
    { key: 'applied', header: 'Applied', render: (a) => <Box sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>{applied(a)}</Box>, nowrap: true },
    {
      key: 'status',
      header: 'Status',
      render: (a) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ApplicationChip status={a.status} />
          {a.membershipId && <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 500 }}>{a.membershipId}</Typography>}
        </Box>
      ),
      nowrap: true,
    },
    { key: 'actions', header: '', align: 'right', render: actions, nowrap: true },
  ]

  return (
    <>
      <ListToolbar
        search={search}
        onSearch={setSearch}
        placeholder="Search name, email or Instagram"
        count={loading ? '' : `${rows.length} ${plural(rows.length, 'application')}`}
      >
        <ToggleButtonGroup exclusive size="small" value={filter} onChange={(_, next: Filter | null) => next && setFilter(next)} aria-label="Filter by status">
          {FILTERS.map((f) => (
            <ToggleButton key={f} value={f}>{f}</ToggleButton>
          ))}
        </ToggleButtonGroup>
      </ListToolbar>

      <DataList
        label="Privé applications"
        rows={rows}
        columns={columns}
        rowKey={(a) => a.id}
        loading={loading}
        resetKey={`${filter}|${search}`}
        onRowClick={setViewing}
        empty={{
          icon: DescriptionOutlined,
          title: search || filter !== 'All' ? 'No matching applications' : 'No applications yet',
          description: search || filter !== 'All' ? 'Try a different search or filter.' : 'Requests to join Privé appear here.',
        }}
        renderCard={(a) => (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography noWrap sx={{ fontWeight: 500, color: 'text.primary' }}>{a.name}</Typography>
                <Typography noWrap variant="caption" color="text.secondary">{a.email}</Typography>
              </Box>
              <ApplicationChip status={a.status} />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {[a.interest, `Applied ${applied(a)}`].filter(Boolean).join(', ')}
            </Typography>
            {a.membershipId && <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'primary.main', fontWeight: 500 }}>{a.membershipId}</Typography>}
            <Box sx={{ mt: 2 }}>{actions(a)}</Box>
          </Box>
        )}
      />

      <DetailDialog
        open={Boolean(viewing)}
        title={shownView?.name ?? ''}
        subtitle={shownView?.createdAt ? `Applied ${formatLongDate(new Date(shownView.createdAt))}` : ''}
        onClose={() => setViewing(null)}
        actions={
          viewing?.status === 'Pending' && onApprove ? (
            <Button variant="contained" startIcon={<DiamondOutlined />} onClick={() => setApproving(viewing)}>
              Approve
            </Button>
          ) : undefined
        }
      >
        {shownView && (
          <>
            <FieldGrid>
              <Field label="Status"><ApplicationChip status={shownView.status} /></Field>
              <Field label="Membership ID">{shownView.membershipId}</Field>
              <Field label="Email">{shownView.email}</Field>
              <Field label="Phone">{shownView.phone}</Field>
              <Field label="Instagram">{shownView.instagram}</Field>
              <Field label="Interest">{shownView.interest}</Field>
              <Field label="Age range">{shownView.ageRange}</Field>
              <Field label="Gender">{shownView.gender}</Field>
              <Field label="Country">{shownView.country}</Field>
              <Field label="Language">{shownView.language}</Field>
              <Field label="Occasion" wide>{shownView.occasion}</Field>
            </FieldGrid>
            {shownView.styleProfile.length > 0 && (
              <Box sx={{ mt: 3.5 }}>
                <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: '0.1em' }}>Style profile</Typography>
                <Box component="ol" sx={{ m: 0, mt: 1.5, p: 0, listStyle: 'none', display: 'grid', gap: 2 }}>
                  {shownView.styleProfile.map((qa, i) => (
                    <li key={i}>
                      <Typography variant="caption" color="text.secondary">{qa.question}</Typography>
                      <Typography sx={{ color: 'text.primary' }}>{qa.answer || '—'}</Typography>
                    </li>
                  ))}
                </Box>
              </Box>
            )}
          </>
        )}
      </DetailDialog>

      <ConfirmDialog
        open={Boolean(approving)}
        title={`Approve ${shownApproving?.name ?? ''}?`}
        description="A Privé membership ID will be generated and saved, and they will appear under Privé Members."
        confirmLabel="Approve"
        pendingLabel="Approving"
        pending={busy}
        onConfirm={confirmApprove}
        onCancel={() => setApproving(null)}
      />

      <Snackbar open={Boolean(toast)} autoHideDuration={6000} onClose={() => setToast(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        {toast ? (
          <Alert severity={toast.severity} variant="outlined" onClose={() => setToast(null)} sx={{ bgcolor: '#191A1D', width: '100%' }}>
            {toast.text}
          </Alert>
        ) : undefined}
      </Snackbar>
    </>
  )
}
