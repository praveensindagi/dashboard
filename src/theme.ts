import { alpha, createTheme } from '@mui/material/styles'

/** Amour Estilo design tokens. Gold is a material accent, never decoration. */
export const tokens = {
  base: '#0B0B0C',
  surface: '#111214',
  card: '#151619',
  elevated: '#191A1D',
  priveCard: '#171610',
  ivory: '#F5F3EE',
  stone: '#A4A3A0',
  /** Decorative only: below 4.5:1 on cards. */
  ash: '#6F6E6A',
  gold: '#D6BE83',
  goldDeep: '#BFA66A',
  goldLight: '#E3D09A',
  positive: '#9DB59A',
  negative: '#C58F86',
  line: 'rgba(245, 243, 238, 0.07)',
  lineStrong: 'rgba(245, 243, 238, 0.12)',
  sans: '"Inter", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif',
  serif: '"Cormorant Garamond", "DM Serif Display", Georgia, "Times New Roman", serif',
  ease: 'cubic-bezier(0.22, 1, 0.36, 1)',
} as const

export const layout = {
  sidebarFull: 264,
  sidebarRail: 84,
} as const

export const theme = createTheme({
  // Matches the design brief: drawer < 768, icon rail 768-1279, full sidebar 1280+
  breakpoints: { values: { xs: 0, sm: 600, md: 768, lg: 1024, xl: 1280 } },
  palette: {
    mode: 'dark',
    primary: { main: tokens.gold, light: tokens.goldLight, dark: tokens.goldDeep, contrastText: tokens.base },
    background: { default: tokens.base, paper: tokens.card },
    text: { primary: tokens.ivory, secondary: tokens.stone, disabled: tokens.ash },
    divider: tokens.line,
    action: {
      hover: 'rgba(245, 243, 238, 0.04)',
      selected: alpha(tokens.gold, 0.1),
      focus: alpha(tokens.gold, 0.16),
    },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: tokens.sans,
    // Page title (serif)
    h1: { fontFamily: tokens.serif, fontWeight: 500, fontSize: '2.25rem', lineHeight: 1.05, letterSpacing: '-0.005em' },
    // Section title (serif)
    h2: { fontFamily: tokens.serif, fontWeight: 500, fontSize: '1.375rem', lineHeight: 1.27 },
    // Privé title (serif)
    h3: { fontFamily: tokens.serif, fontWeight: 500, fontSize: '1.875rem', lineHeight: 1 },
    // Metric number (sans)
    h4: { fontFamily: tokens.sans, fontWeight: 500, fontSize: '1.75rem', lineHeight: 1.2, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums' },
    // Stat number (sans)
    h5: { fontFamily: tokens.sans, fontWeight: 500, fontSize: '1.1875rem', lineHeight: 1.3, fontVariantNumeric: 'tabular-nums' },
    h6: { fontFamily: tokens.serif, fontWeight: 500, fontSize: '1.25rem', lineHeight: 1.3 },
    body1: { fontSize: '0.875rem', lineHeight: 1.57 },
    body2: { fontSize: '0.8125rem', lineHeight: 1.54 },
    caption: { fontSize: '0.75rem', lineHeight: 1.5 },
    // Eyebrow label
    overline: { fontSize: '0.6875rem', fontWeight: 500, letterSpacing: '0.12em', lineHeight: 1.45, textTransform: 'uppercase' },
    button: { fontSize: '0.8125rem', fontWeight: 500, letterSpacing: 0, textTransform: 'none' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: { WebkitTextSizeAdjust: '100%' },
        body: { fontOpticalSizing: 'auto', textRendering: 'optimizeLegibility', WebkitFontSmoothing: 'antialiased' },
        '::selection': { background: alpha(tokens.gold, 0.28), color: tokens.ivory },
        '*': { scrollbarWidth: 'thin', scrollbarColor: 'rgba(245,243,238,0.14) transparent' },
        '*::-webkit-scrollbar': { width: 6, height: 6 },
        '*::-webkit-scrollbar-thumb': { background: 'rgba(245,243,238,0.14)', borderRadius: 999 },
        // Chart tooltip (rendered in a portal)
        '.MuiChartsTooltip-paper': {
          background: `${tokens.elevated} !important`,
          border: `1px solid ${tokens.lineStrong}`,
          borderRadius: 10,
          boxShadow: '0 24px 60px -24px rgba(0,0,0,0.9)',
        },
        '@media (prefers-reduced-motion: reduce)': {
          '*, *::before, *::after': {
            animationDuration: '0.01ms !important',
            animationIterationCount: '1 !important',
            transitionDuration: '0.01ms !important',
            scrollBehavior: 'auto !important',
          },
        },
      },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiButtonBase: {
      defaultProps: { disableRipple: false },
      styleOverrides: {
        root: {
          '&.Mui-focusVisible': { outline: `2px solid ${alpha(tokens.gold, 0.75)}`, outlineOffset: 2 },
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          height: 44,
          borderRadius: 10,
          padding: '0 20px',
          transition: `background-color 200ms ${tokens.ease}, border-color 200ms ${tokens.ease}, transform 150ms ${tokens.ease}`,
          '&:active': { transform: 'scale(0.98)' },
        },
        containedPrimary: { '&:hover': { backgroundColor: tokens.goldLight } },
        outlined: {
          borderColor: tokens.lineStrong,
          backgroundColor: tokens.card,
          color: tokens.ivory,
          '&:hover': { borderColor: alpha(tokens.gold, 0.4), backgroundColor: tokens.elevated },
        },
        startIcon: { '& > *:first-of-type': { fontSize: 18 } },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          width: 40,
          height: 40,
          borderRadius: 10,
          border: `1px solid ${tokens.line}`,
          backgroundColor: tokens.card,
          color: tokens.stone,
          transition: `color 200ms, border-color 200ms, transform 150ms ${tokens.ease}`,
          '&:hover': { color: tokens.gold, borderColor: alpha(tokens.gold, 0.3), backgroundColor: tokens.card },
          '&:active': { transform: 'scale(0.95)' },
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          padding: 4,
          gap: 4,
          borderRadius: 10,
          border: `1px solid ${tokens.line}`,
          backgroundColor: tokens.surface,
          maxWidth: '100%',
          overflowX: 'auto',
        },
        grouped: {
          border: 0,
          borderRadius: '7px !important',
          margin: 0,
          padding: '5px 12px',
          whiteSpace: 'nowrap',
          fontSize: '0.75rem',
          fontWeight: 500,
          textTransform: 'none',
          color: tokens.stone,
          transition: `color 200ms, background-color 250ms ${tokens.ease}`,
          '&:hover': { color: tokens.ivory, backgroundColor: 'transparent' },
          '&.Mui-selected': {
            color: tokens.gold,
            backgroundColor: alpha(tokens.gold, 0.1),
            boxShadow: `inset 0 0 0 1px ${alpha(tokens.gold, 0.2)}`,
            '&:hover': { backgroundColor: alpha(tokens.gold, 0.14) },
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: tokens.elevated,
          border: `1px solid ${tokens.lineStrong}`,
          color: tokens.ivory,
          fontSize: '0.75rem',
          fontWeight: 400,
          padding: '6px 10px',
          borderRadius: 8,
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          backgroundColor: tokens.elevated,
          border: `1px solid ${tokens.lineStrong}`,
          borderRadius: 14,
          boxShadow: '0 24px 60px -24px rgba(0,0,0,0.9)',
        },
      },
    },
    MuiMenu: {
      styleOverrides: { list: { padding: 6 } },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          gap: 12,
          padding: '9px 12px',
          fontSize: '0.8125rem',
          color: tokens.stone,
          '&:hover': { backgroundColor: 'rgba(245,243,238,0.05)', color: tokens.ivory },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: tokens.elevated,
          border: `1px solid ${tokens.lineStrong}`,
          borderRadius: 14,
          boxShadow: '0 24px 60px -24px rgba(0,0,0,0.9)',
        },
      },
    },
    MuiBackdrop: { styleOverrides: { root: { backgroundColor: 'rgba(0,0,0,0.7)' } } },
    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          backgroundColor: tokens.elevated,
          border: `1px solid ${tokens.lineStrong}`,
          borderRadius: 14,
          boxShadow: '0 24px 60px -24px rgba(0,0,0,0.9)',
          marginTop: 10,
        },
        listbox: { padding: 6 },
        option: {
          borderRadius: 8,
          padding: '9px 12px',
          '&.Mui-focused': { backgroundColor: `${alpha(tokens.gold, 0.1)} !important` },
        },
        noOptions: { padding: '28px 24px', textAlign: 'center', color: tokens.stone },
      },
    },
    MuiSkeleton: {
      defaultProps: { animation: 'pulse' },
      styleOverrides: { root: { backgroundColor: 'rgba(245,243,238,0.06)' } },
    },
    MuiChip: {
      styleOverrides: {
        root: { height: 26, fontSize: '0.6875rem', fontWeight: 500, borderRadius: 999 },
        label: { paddingLeft: 10, paddingRight: 10 },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottom: `1px solid ${tokens.line}`, padding: '16px 12px', fontSize: '0.8125rem' },
        head: {
          borderBottom: 'none',
          padding: '0 12px 12px',
          fontSize: '0.6875rem',
          fontWeight: 500,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: tokens.stone,
        },
      },
    },
  },
})
