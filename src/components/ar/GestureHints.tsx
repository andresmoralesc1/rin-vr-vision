'use client';

/**
 * Subtle footer that teaches the three supported gestures. Stays
 * out of the way until the user looks for help; the icons + words are
 * enough to remind drag/pinch/twist without taking real estate.
 */
export function GestureHints() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-2 z-10 flex justify-center gap-4 text-[11px] text-text-muted">
      <span className="inline-flex items-center gap-1">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12h14M12 5l-7 7 7 7" />
        </svg>
        arrastrá
      </span>
      <span className="inline-flex items-center gap-1">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 5v14M5 12l7-7 7 7M5 12l7 7 7-7" />
        </svg>
        pellizcá
      </span>
      <span className="inline-flex items-center gap-1">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 12a9 9 0 1 0 9-9" />
          <polyline points="3 5 3 12 10 12" />
        </svg>
        girá
      </span>
    </div>
  );
}
