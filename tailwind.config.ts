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
      },
      fontFamily: { sans: tokens.fonts.sans as unknown as string[] },
      borderRadius: tokens.radius,
    },
  },
  plugins: [],
};
export default config;
