export const tokens = {
  colors: {
    bg: { primary: '#0A0A0A', surface: '#141414' },
    text: { primary: '#FAFAFA', muted: '#A1A1AA' },
    accent: { primary: '#3B82F6', success: '#22C55E', warning: '#F59E0B', danger: '#EF4444' },
    finish: { chrome: '#E5E7EB', matteBlack: '#1F2937', silver: '#CBD5E1' },
  },
  fonts: { sans: ['Manrope', 'system-ui', 'sans-serif'] },
  radius: { sm: '0.375rem', md: '0.5rem', lg: '1rem' },
} as const;
export type Tokens = typeof tokens;
