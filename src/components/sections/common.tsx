import { useRef, useState, type ReactNode } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import type { SvgIconComponent } from '@mui/icons-material'
import CloseRounded from '@mui/icons-material/CloseRounded'
import SearchOutlined from '@mui/icons-material/SearchOutlined'
import { tokens } from '../../theme'
import { Bar, EmptyState, fadeInSx, Surface } from '../ui'

export interface Column<T> {
  key: string
  header: string
  align?: 'left' | 'right'
  render: (row: T) => ReactNode
  nowrap?: boolean
}

interface DataListProps<T> {
  label: string
  rows: T[]
  columns: Column<T>[]
  rowKey: (row: T) => string
  renderCard: (row: T) => ReactNode
  loading?: boolean
  empty: { icon: SvgIconComponent; title: string; description?: string; action?: ReactNode }
  onRowClick?: (row: T) => void
  /** Changing this (search text, filter) sends the list back to page 1. */
  resetKey?: unknown
}

const edge = { '&:first-of-type': { pl: 4 }, '&:last-of-type': { pr: 4 } }

/** Table from 1024px, cards below. Paginated. */
export function DataList<T>({ label, rows, columns, rowKey, renderCard, loading, empty, onRowClick, resetKey }: DataListProps<T>) {
  const [state, setState] = useState({ page: 0, perPage: 10, key: resetKey })
  const page = state.key === resetKey ? state.page : 0
  const maxPage = Math.max(0, Math.ceil(rows.length / state.perPage) - 1)
  const safePage = Math.min(page, maxPage)
  const visible = rows.slice(safePage * state.perPage, safePage * state.perPage + state.perPage)

  return (
    <Surface role="region" aria-label={label} sx={{ pt: 3, pb: 1 }}>
      {loading ? (
        <Box aria-hidden sx={{ px: { xs: 3, md: 4 }, pb: 3, display: 'grid', gap: 2.5 }}>
          {Array.from({ length: 6 }, (_, i) => (
            <Bar key={i} w="100%" h={40} />
          ))}
        </Box>
      ) : rows.length === 0 ? (
        <EmptyState {...empty} />
      ) : (
        <>
          <TableContainer sx={{ display: { xs: 'none', lg: 'block' }, ...fadeInSx }}>
            <Table sx={{ minWidth: 860 }} aria-label={label}>
              <TableHead>
                <TableRow>
                  {columns.map((c) => (
                    <TableCell key={c.key} align={c.align ?? 'left'} sx={edge}>
                      {c.header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {visible.map((row) => (
                  <TableRow
                    key={rowKey(row)}
                    hover
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    sx={{
                      cursor: onRowClick ? 'pointer' : 'default',
                      '&:last-child td': { borderBottom: 0 },
                      '&.MuiTableRow-hover:hover': { backgroundColor: 'rgba(245,243,238,0.025)' },
                    }}
                  >
                    {columns.map((c) => (
                      <TableCell key={c.key} align={c.align ?? 'left'} sx={{ ...edge, whiteSpace: c.nowrap ? 'nowrap' : 'normal', verticalAlign: 'middle' }}>
                        {c.render(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, px: { xs: 3, md: 4 }, display: { xs: 'block', lg: 'none' }, ...fadeInSx }}>
            {visible.map((row, i) => (
              <Box component="li" key={rowKey(row)} sx={{ py: 2.5, borderTop: i ? `1px solid ${tokens.line}` : 0 }}>
                {renderCard(row)}
              </Box>
            ))}
          </Box>

          <TablePagination
            component="div"
            count={rows.length}
            page={safePage}
            rowsPerPage={state.perPage}
            rowsPerPageOptions={[10, 25, 50]}
            onPageChange={(_, p) => setState((s) => ({ ...s, page: p, key: resetKey }))}
            onRowsPerPageChange={(e) => setState({ page: 0, perPage: Number(e.target.value), key: resetKey })}
            sx={{ borderTop: `1px solid ${tokens.line}`, color: 'text.secondary', '& .MuiTablePagination-toolbar': { px: { xs: 2, md: 3 } }, '& .MuiSelect-icon': { color: 'text.secondary' } }}
          />
        </>
      )}
    </Surface>
  )
}

interface ListToolbarProps {
  search: string
  onSearch: (value: string) => void
  placeholder: string
  count: string
  children?: ReactNode
}

export function ListToolbar({ search, onSearch, placeholder, count, children }: ListToolbarProps) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, minWidth: 0, flex: { xs: '1 1 100%', md: '0 1 auto' } }}>
        <TextField
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={placeholder}
          size="small"
          inputProps={{ 'aria-label': placeholder }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined sx={{ fontSize: 18, color: 'text.secondary' }} aria-hidden />
              </InputAdornment>
            ),
          }}
          sx={{
            flex: { xs: '1 1 100%', sm: '0 0 300px' },
            '& .MuiOutlinedInput-root': {
              height: 40,
              borderRadius: '10px',
              bgcolor: tokens.surface,
              fontSize: '0.8125rem',
              '& fieldset': { borderColor: tokens.line },
              '&:hover fieldset': { borderColor: tokens.lineStrong },
              '&.Mui-focused fieldset': { borderColor: 'rgba(214,190,131,0.5)', borderWidth: 1 },
            },
            '& input::placeholder': { color: tokens.stone, opacity: 1 },
          }}
        />
        {children}
      </Box>
      <Typography variant="caption" color="text.secondary" role="status">
        {count}
      </Typography>
    </Box>
  )
}

export function DetailDialog({
  open,
  title,
  subtitle,
  onClose,
  children,
  actions,
}: {
  open: boolean
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
  actions?: ReactNode
}) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" scroll="paper" aria-labelledby="detail-title">
      <DialogTitle id="detail-title" component="div" sx={{ px: 3.5, pt: 3.5, pb: 1, pr: 8 }}>
        <Typography component="h2" variant="h6" sx={{ fontSize: '1.5rem' }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
        <IconButton aria-label="Close" onClick={onClose} sx={{ position: 'absolute', right: 20, top: 24 }}>
          <CloseRounded sx={{ fontSize: 18 }} aria-hidden />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ px: 3.5, py: 3, borderColor: tokens.line }}>
        {children}
      </DialogContent>
      <DialogActions sx={{ px: 3.5, py: 2.5, gap: 1.5 }}>
        {actions}
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export function FieldGrid({ children }: { children: ReactNode }) {
  return <Box component="dl" sx={{ m: 0, display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' } }}>{children}</Box>
}

export function Field({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <Box sx={{ gridColumn: wide ? { sm: '1 / -1' } : undefined, minWidth: 0 }}>
      <Typography component="dt" variant="overline" color="text.secondary" sx={{ letterSpacing: '0.1em' }}>
        {label}
      </Typography>
      <Typography component="dd" sx={{ m: 0, mt: 0.5, color: 'text.primary', overflowWrap: 'anywhere' }}>
        {children || '—'}
      </Typography>
    </Box>
  )
}

/** Keeps showing the last value while a dialog fades out, so it does not go blank mid-animation. */
export function useLast<T>(value: T | null): T | null {
  const last = useRef<T | null>(null)
  if (value !== null) last.current = value
  return value ?? last.current
}

export const smallButtonSx = { height: 34, px: 1.75, fontSize: '0.75rem' } as const
