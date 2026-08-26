import type { ButtonHTMLAttributes, ReactNode } from 'react';
import Link from 'next/link';

type Variant = 'primary' | 'secondary';
type Size = 'default' | 'hero';

type Props = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  href?: string;
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>;

const base =
  'inline-flex items-center justify-center gap-2 font-semibold text-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary';

const sizes: Record<Size, string> = {
  default: 'rounded-md px-5 py-2.5 text-sm shadow-sm hover:shadow-md',
  hero: 'rounded-xl px-7 py-4 text-base shadow-lg shadow-accent-primary/30 hover:scale-[1.03] hover:shadow-xl hover:shadow-accent-primary/40 active:scale-[0.98]',
};

const variants: Record<Variant, string> = {
  primary: 'bg-accent-primary hover:bg-accent-primary',
  secondary:
    'border border-white/10 bg-white/5 text-text-primary backdrop-blur hover:border-white/20 hover:bg-white/10 focus-visible:outline-text-primary',
};

export function Button({
  children,
  variant = 'primary',
  size = 'default',
  href,
  className = '',
  type = 'button',
  ...rest
}: Props) {
  const cls = `${base} ${sizes[size]} ${variants[variant]} ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={cls} {...rest}>
      {children}
    </button>
  );
}
