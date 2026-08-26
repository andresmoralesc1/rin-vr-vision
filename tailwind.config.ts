import type { Config } from 'tailwindcss';
import { tokens } from './src/lib/design-tokens';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-primary': tokens.colors.bg.primary,
        'bg-surface': tokens.colors.bg.surface,
        'text-primary': tokens.colors.text.primary,
        'text-muted': tokens.colors.text.muted,
        'accent-primary': tokens.colors.accent.primary,
        'accent-success': tokens.colors.accent.success,
        'accent-warning': tokens.colors.accent.warning,
        'accent-danger': tokens.colors.accent.danger,
      },
      fontFamily: { sans: ['var(--font-manrope)', 'system-ui', 'sans-serif'] },
      borderRadius: tokens.radius,
    },
  },
  plugins: [],
};
export default config;
