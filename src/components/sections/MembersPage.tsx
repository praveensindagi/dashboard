import { useMemo, useState } from 'react'
import { Avatar, Box, Typography } from '@mui/material'
import DiamondOutlined from '@mui/icons-material/DiamondOutlined'
import type { MemberRecord } from '../../types'
import { formatDate, initials, plural } from '../../lib/format'
import { tokens } from '../../theme'
import { Pill } from '../ui'
import { DataList, ListToolbar, type Column } from './common'

const statusColor = (s: string) => (s.toLowerCase() === 'active' ? tokens.gold : '#9A9AA4')

export function MembersPage({ members, loading }: { members: MemberRecord[]; loading?: boolean }) {
  const [search, setSearch] = useState('')

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return q ? members.filter((m) => `${m.id} ${m.name} ${m.email} ${m.phone} ${m.instagram}`.toLowerCase().includes(q)) : members
  }, [members, search])

  const person = (m: MemberRecord) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
      <Avatar
        src={m.photoURL || undefined}
        alt=""
        sx={{ width: 32, height: 32, bgcolor: 'transparent', border: `1px solid ${tokens.lineStrong}`, color: 'primary.main', fontFamily: tokens.serif, fontSize: 14 }}
      >
        {initials(m.name || m.id)}
      </Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Typography noWrap sx={{ fontWeight: 500, color: 'text.primary' }}>{m.name || 'Name not recorded'}</Typography>
        <Typography noWrap variant="caption" color="text.secondary">{m.email || '—'}</Typography>
      </Box>
    </Box>
  )

  const columns: Column<MemberRecord>[] = [
    { key: 'member', header: 'Member', render: person },
    { key: 'id', header: 'Membership ID', render: (m) => <Box sx={{ color: 'primary.main', fontWeight: 500, letterSpacing: '0.04em' }}>{m.id}</Box>, nowrap: true },
    { key: 'phone', header: 'Phone', render: (m) => <Box sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>{m.phone || '—'}</Box>, nowrap: true },
    { key: 'ig', header: 'Instagram', render: (m) => <Box sx={{ color: 'text.secondary' }}>{m.instagram || '—'}</Box> },
    { key: 'since', header: 'Member since', render: (m) => <Box sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>{m.since ? formatDate(m.since) : '—'}</Box>, nowrap: true },
    { key: 'status', header: 'Status', render: (m) => <Pill label={m.status} color={statusColor(m.status)} /> },
  ]

  return (
    <>
      <ListToolbar
        search={search}
        onSearch={setSearch}
        placeholder="Search name, ID or email"
        count={loading ? '' : `${rows.length} ${plural(rows.length, 'member')}`}
      />
      <DataList
        label="Privé members"
        rows={rows}
        columns={columns}
        rowKey={(m) => m.id}
        loading={loading}
        resetKey={search}
        empty={{
          icon: DiamondOutlined,
          title: search ? 'No matching members' : 'No Privé members yet',
          description: search ? 'Try a different search.' : 'Approved applications appear here with their membership ID.',
        }}
        renderCard={(m) => (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
              {person(m)}
              <Pill label={m.status} color={statusColor(m.status)} />
            </Box>
            <Typography variant="caption" sx={{ mt: 1.5, display: 'block', color: 'primary.main', fontWeight: 500, letterSpacing: '0.04em' }}>{m.id}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              {[m.phone, m.since ? `Since ${formatDate(m.since)}` : ''].filter(Boolean).join(', ')}
            </Typography>
          </Box>
        )}
      />
    </>
  )
}
