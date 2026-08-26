'use client';
import type { RefObject } from 'react';
import { BackButton } from './BackButton';
import { DetectButton } from './DetectButton';

type Props = {
  videoRef: RefObject<HTMLVideoElement | null>;
  onSettingsClick: () => void;
  settingsOpen: boolean;
};

/**
 * Sticky top bar for the AR view. Three actions:
 *  - Back link to the landing page (so users can leave the immersive
 *    camera view without using the browser back gesture).
 *  - Auto-detect trigger (delegated to DetectButton).
 *  - Settings gear, which opens the calibration sheet.
 */
export function TopBar({ videoRef, onSettingsClick, settingsOpen }: Props) {
  return (
    <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-2 px-3 pt-3">
      <BackButton />

      <DetectButton videoRef={videoRef} />

      <button
        onClick={onSettingsClick}
        aria-label="Ajustes de calibración"
        aria-haspopup="dialog"
        aria-expanded={settingsOpen}
        className="inline-flex items-center justify-center rounded-full bg-black/40 p-2 text-text-primary backdrop-blur transition-colors hover:bg-black/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>
    </div>
  );
}
