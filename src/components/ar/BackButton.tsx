'use client';
import Link from 'next/link';

/**
 * Back link to the landing page. Used by both the AR view's
 * pre-grant CameraStage (no header yet) and the granted-state TopBar.
 * Single source of truth so the icon, label and destination never
 * drift between the two surfaces.
 */
export function BackButton() {
  return (
    <Link
      href="/"
      aria-label="Volver al inicio"
      className="inline-flex items-center justify-center rounded-full bg-black/40 p-2 text-text-primary backdrop-blur transition-colors hover:bg-black/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
      </svg>
    </Link>
  );
}