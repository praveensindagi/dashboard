import type { ReactNode } from 'react'
import { Box, type SxProps, type Theme } from '@mui/material'
import { keyframes } from '@mui/material/styles'
import { tokens } from '../theme'

const reveal = keyframes`
  from { opacity: 0; transform: translateY(8px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
`

interface RevealProps {
  children: ReactNode
  /** Position in the page-load sequence; each step waits 60ms longer. */
  index?: number
  sx?: SxProps<Theme>
}

/** Soft fade, slide-up and 0.98 to 1 scale on first paint. */
export function Reveal({ children, index = 0, sx }: RevealProps) {
  return (
    <Box
      sx={[
        {
          animation: `${reveal} 500ms ${tokens.ease} both`,
          animationDelay: `${40 + index * 60}ms`,
          '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Box>
  )
}
