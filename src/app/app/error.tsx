'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

type Props = {
  error: Error;
  reset: () => void;
  // Children are managed by Next.js's error-boundary wrapper in production.
  // Declared optional so the component can be unit-tested with a throwing
  // child without a typecheck error.
  children?: ReactNode;
};

export default function AppErrorBoundary({ error, reset }: Props) {
  // Server-rendering of errors in /app is rare (it's a client component);
  // logging here helps the user detect failures during dev and crashed
  // mobile devices in prod.
  // eslint-disable-next-line no-console
  console.error(error);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-black p-6 text-center text-text-primary"
    >
      <svg
        width="56"
        height="56"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
      <p className="text-lg font-semibold">Algo explotó.</p>
      <p className="text-sm text-text-muted">Probá reintentar o volvé al inicio.</p>
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-accent-primary px-5 py-2 font-semibold text-white hover:bg-accent-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
        >
          Reintentar
        </button>
        <Link
          href="/"
          className="rounded-md border border-white/20 px-5 py-2 font-semibold text-text-primary hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
