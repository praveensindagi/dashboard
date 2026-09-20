import { useEffect, useMemo, useRef, useState } from 'react'
import { Autocomplete, Box, InputAdornment, TextField, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import SearchOffOutlined from '@mui/icons-material/SearchOffOutlined'
import SearchOutlined from '@mui/icons-material/SearchOutlined'
import type { SearchItem } from '../../types'
import { tokens } from '../../theme'

interface SearchBoxProps {
  items: SearchItem[]
  onSelect?: (item: SearchItem) => void
}

const shortcutLabel = () => (typeof navigator !== 'undefined' && /mac/i.test(navigator.platform) ? '⌘K' : 'Ctrl K')

export function SearchBox({ items, onSelect }: SearchBoxProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const q = query.trim()
  const shortcut = useMemo(shortcutLabel, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <Autocomplete<SearchItem, false, false, false>
      fullWidth
      options={items}
      value={null}
      inputValue={query}
      open={open && q.length > 0}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      onInputChange={(_, value, reason) => {
        if (reason === 'input') setQuery(value)
        if (reason === 'clear') setQuery('')
      }}
      onChange={(_, item) => {
        if (item) {
          onSelect?.(item)
          setQuery('')
          inputRef.current?.blur()
        }
      }}
      filterOptions={(options) => {
        const needle = q.toLowerCase()
        return options.filter((o) => `${o.label} ${o.sublabel}`.toLowerCase().includes(needle)).slice(0, 6)
      }}
      getOptionLabel={(o) => o.label}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      forcePopupIcon={false}
      clearOnEscape
      handleHomeEndKeys
      noOptionsText={
        <Box>
          <SearchOffOutlined sx={{ fontSize: 20, color: 'primary.main' }} aria-hidden />
          <Typography variant="body2" sx={{ mt: 1, color: 'text.primary' }}>
            No matches for “{q}”
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Try a client name, booking ID or look.
          </Typography>
        </Box>
      }
      renderOption={(props, option) => {
        const { key, ...rest } = props as typeof props & { key: string }
        return (
          <li key={key} {...rest}>
            <Box sx={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography noWrap variant="body2" sx={{ color: 'text.primary' }}>
                  {option.label}
                </Typography>
                <Typography noWrap variant="caption" color="text.secondary">
                  {option.sublabel}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                {option.kind}
              </Typography>
            </Box>
          </li>
        )
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          inputRef={inputRef}
          placeholder="Search"
          inputProps={{ ...params.inputProps, 'aria-label': 'Search bookings, clients and looks' }}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start" sx={{ mr: 0 }}>
                <SearchOutlined sx={{ fontSize: 18, color: 'text.secondary' }} aria-hidden />
              </InputAdornment>
            ),
            endAdornment: (
              <Box
                component="kbd"
                sx={{
                  display: { xs: 'none', lg: 'inline' },
                  px: 0.75,
                  py: '1px',
                  borderRadius: '4px',
                  border: `1px solid ${tokens.lineStrong}`,
                  fontFamily: 'inherit',
                  fontSize: '0.625rem',
                  color: 'text.secondary',
                }}
              >
                {shortcut}
              </Box>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              height: 40,
              borderRadius: '10px',
              bgcolor: tokens.surface,
              fontSize: '0.8125rem',
              px: '14px',
              py: 0,
              transition: 'box-shadow 200ms',
              '& fieldset': { borderColor: tokens.line, transition: 'border-color 200ms' },
              '&:hover fieldset': { borderColor: tokens.lineStrong },
              '&.Mui-focused': { boxShadow: `0 0 0 3px ${alpha(tokens.gold, 0.12)}` },
              '&.Mui-focused fieldset': { borderColor: alpha(tokens.gold, 0.5), borderWidth: 1 },
              '& .MuiAutocomplete-input': { p: '0 0 0 10px' },
            },
            '& input::placeholder': { color: tokens.stone, opacity: 1 },
          }}
        />
      )}
    />
  )
}
