# MVP-compartible-en-redes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Rin VR Vision shareable in social networks without embarrassment: dynamic OG image, favicon, robots/sitemap/manifest, `/app` error boundary, surgical a11y fixes. No new deps, no Docker / Caddy / DNS changes.

**Architecture:** Use Next.js 14 App Router file conventions (`opengraph-image.tsx`, `icon.tsx`, `robots.ts`, `sitemap.ts`, `manifest.ts`, `app/error.tsx`) plus `next/og`'s `ImageResponse` for SVG/PNG generation. Errors caught at the `/app` segment boundary so a GLB or MediaPipe crash never produces a white screen. A11y fixes are surgical: aria-expanded on the Settings gear, focus management in the drawer, focus-visible rings on Header/Footer, prefers-reduced-motion respected in the drawer slide.

**Tech Stack:** Next.js 14 App Router (already installed), `next/og` (ships with Next), React 18, TypeScript strict, Tailwind, Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-08-25-mvp-shareable-design.md`

## Global Constraints

- TypeScript strict (`strict: true`, `noUncheckedIndexedAccess: true` in `tsconfig.json`).
- Spanish UI (no i18n switcher this round).
- `/app` First Load JS must stay ≤ 110 kB after all changes (currently 101 kB).
- Zero new dependencies. Use what `next` already exports (`next/og`, `next/server`, `MetadataRoute`).
- All file paths absolute from project root: `/home/telchar/rin-vr-vision/...`.
- Tests in the existing jsdom + Vitest setup. Run via `pnpm test`.
- ImageResponse tags must use SVG-compatible elements only (no `<img>`, no external CSS).
- Respect existing Tailwind tokens (`bg-bg-primary`, `bg-bg-surface`, `text-text-primary`, `accent-primary`, `accent-warning`, `accent-danger`) — don't introduce new colors.

---

### Task 1: Error boundary on `/app`

Catches crashes from GLB 404, MediaPipe init failure, or any other client-side error inside `/app`. Renders a black-screen fallback matching the immersive feel, with a "Reintentar" button that calls React's `reset()` and a "Ir al inicio" link.

**Files:**
- Create: `/home/telchar/rin-vr-vision/src/app/app/error.tsx`
- Create: `/home/telchar/rin-vr-vision/src/app/app/error.test.tsx`

**Interfaces:**
- Consumes: Next.js error-boundary contract — `(error: Error, reset: () => void) => JSX.Element`. `reset()` re-mounts the segment. `error.message` available for diagnosis.
- Produces: A single visible fallback when any descendant in `/app` throws. Logs `error.message` to `console.error` for debug.

- [ ] **Step 1: Write the failing test**

```tsx
// src/app/app/error.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import ErrorBoundary from './error';

function Bomb(): JSX.Element {
  throw new Error('boom-from-child');
}

describe('/app error boundary', () => {
  it('renders fallback UI when a child throws', () => {
    // Silence React's expected error log during the throw.
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { getByRole, getByText } = render(
      <ErrorBoundary error={new Error('boom')} reset={() => {}}>
        <Bomb />
      </ErrorBoundary>,
    );
    expect(getByRole('alert')).toBeInTheDocument();
    expect(getByText(/Algo explot/i)).toBeInTheDocument();
  });

  it('renders Reintentar and Ir al inicio buttons', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const reset = vi.fn();
    const { getByRole } = render(
      <ErrorBoundary error={new Error('boom')} reset={reset}>
        <Bomb />
      </ErrorBoundary>,
    );
    expect(getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
    expect(getByRole('link', { name: 'Ir al inicio' })).toHaveAttribute('href', '/');
  });

  it('Reintentar calls reset()', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const reset = vi.fn();
    const { getByRole } = render(
      <ErrorBoundary error={new Error('boom')} reset={reset}>
        <Bomb />
      </ErrorBoundary>,
    );
    fireEvent.click(getByRole('button', { name: 'Reintentar' }));
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/app/app/error.test.tsx`
Expected: FAIL with "Cannot find module './error'" or similar.

- [ ] **Step 3: Implement `error.tsx`**

```tsx
// src/app/app/error.tsx
'use client';

import Link from 'next/link';

type Props = {
  error: Error;
  reset: () => void;
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
          className="rounded-md bg-accent-primary px-5 py-2 font-semibold text-white hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
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
```

The default export name doesn't matter (Next uses the convention of
the file's `default` export). We name it `AppErrorBoundary` for
clarity in the test import — Next accepts any name.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- src/app/app/error.test.tsx`
Expected: 3 passing.

- [ ] **Step 5: Verify in dev (optional)**

Run `pnpm dev` in another shell, navigate to `/app`, grant camera, then in DevTools console type:

```js
throw new Error('test crash')
```

In a child (e.g., inside the Chrome React panel "Pause on exceptions"). Should see the fallback.

- [ ] **Step 6: Commit**

```bash
git -C /home/telchar/rin-vr-vision add src/app/app/error.tsx src/app/app/error.test.tsx
git -C /home/telchar/rin-vr-vision commit -m "feat(ar): add error boundary for /app with retry + home link"
```

---

### Task 2: Surgical a11y fixes (TopBar expanded, drawer focus, gesture a11y, focus rings, reduced-motion)

Bundle of small a11y fixes called out in the spec. Each is small and self-contained but they all serve the same reviewer gate: "did this app become keyboard- and screen-reader-navigable?". Bundled together so a reviewer evaluates them in one pass.

**Files:**
- Modify: `/home/telchar/rin-vr-vision/src/components/ar/TopBar.tsx` — accept `settingsOpen` prop, add `aria-expanded` and `aria-haspopup` to the gear button.
- Modify: `/home/telchar/rin-vr-vision/src/components/ar/CameraStage.tsx` — pass `settingsOpen` down to TopBar.
- Modify: `/home/telchar/rin-vr-vision/src/components/ar/CalibrationDrawer.tsx` — focus the first slider when the drawer opens.
- Modify: `/home/telchar/rin-vr-vision/src/components/ar/GestureCanvas.tsx` — `aria-hidden="true"`, `tabindex={-1}`.
- Modify: `/home/telchar/rin-vr-vision/src/components/landing/Header.tsx` — focus-visible ring on Link elements.
- Modify: `/home/telchar/rin-vr-vision/src/components/landing/Footer.tsx` — focus-visible ring on Link elements.
- Modify: `/home/telchar/rin-vr-vision/src/styles/globals.css` — `@media (prefers-reduced-motion: reduce)` reduces the drawer slide to instant.
- Modify: `/home/telchar/rin-vr-vision/src/components/ar/TopBar.test.tsx` — extend existing tests.
- Modify: `/home/telchar/rin-vr-vision/src/components/ar/CalibrationDrawer.test.tsx` — extend existing tests.

**Interfaces:**
- Consumes: `useRef<HTMLDivElement>(null)` on the dialog container; `tabindex` on the gesture canvas (visual decoration).
- Produces:
  - `TopBar({ videoRef, onSettingsClick, settingsOpen })` — new `settingsOpen: boolean` prop.
  - `CameraStage` passes `settingsOpen={settingsOpen}` from `useState` into TopBar.
  - `CalibrationDrawer` exposes a `firstFieldRef` ref to the first slider input (X).
  - Gesture canvas has `aria-hidden="true"` (decorative).

- [ ] **Step 1: Write failing test for TopBar aria-expanded**

Append to `src/components/ar/TopBar.test.tsx`:

```tsx
it('settings button reflects aria-expanded from settingsOpen prop', () => {
  const { getByLabelText } = render(
    <TopBar videoRef={{ current: null }} onSettingsClick={() => {}} settingsOpen={false} />,
  );
  expect(getByLabelText('Ajustes de calibración')).toHaveAttribute('aria-expanded', 'false');
});

it('settings button has aria-haspopup=dialog', () => {
  const { getByLabelText } = render(
    <TopBar videoRef={{ current: null }} onSettingsClick={() => {}} settingsOpen={false} />,
  );
  expect(getByLabelText('Ajustes de calibración')).toHaveAttribute('aria-haspopup', 'dialog');
});
```

Run: `pnpm test -- src/components/ar/TopBar.test.tsx`
Expected: 2 new tests FAIL (the prop is missing).

- [ ] **Step 2: Update TopBar signature and props**

In `src/components/ar/TopBar.tsx`, change:

```tsx
type Props = {
  videoRef: RefObject<HTMLVideoElement | null>;
  onSettingsClick: () => void;
};

export function TopBar({ videoRef, onSettingsClick }: Props) {
  return (
    <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-2 px-3 pt-3">
      <Link
        href="/"
        aria-label="Volver al inicio"
        className="inline-flex items-center justify-center rounded-full bg-black/40 p-2 text-text-primary backdrop-blur transition-colors hover:bg-black/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
      >
        {/* SVG unchanged */}
      </Link>

      <DetectButton videoRef={videoRef} />

      <button
        onClick={onSettingsClick}
        aria-label="Ajustes de calibración"
        aria-haspopup="dialog"
        aria-expanded={settingsOpen}
        className="inline-flex items-center justify-center rounded-full bg-black/40 p-2 text-text-primary backdrop-blur transition-colors hover:bg-black/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
      >
        {/* SVG unchanged */}
      </button>
    </div>
  );
}
```

(We add `settingsOpen: boolean` to `Props` and destructure it.)

Run: `pnpm test -- src/components/ar/TopBar.test.tsx`
Expected: all 5 tests pass.

- [ ] **Step 3: Update CameraStage to pass `settingsOpen` down**

In `src/components/ar/CameraStage.tsx`:

```tsx
<TopBar videoRef={videoRef} settingsOpen={settingsOpen} onSettingsClick={() => setSettingsOpen(true)} />
```

Run: `pnpm typecheck`
Expected: clean (no errors, all callers updated).

- [ ] **Step 4: Write failing test for CalibrationDrawer auto-focus**

Append to `src/components/ar/CalibrationDrawer.test.tsx`:

```tsx
it('focuses the first slider (X) when opened', () => {
  const { getByLabelText } = renderDrawer({ open: true });
  expect(getByLabelText('X')).toHaveFocus();
});

it('does not steal focus when closed', () => {
  renderDrawer({ open: false });
  // No input should be focused; jsdom leaves focus on body by default.
  expect(document.activeElement?.tagName).not.toBe('INPUT');
});
```

Run: `pnpm test -- src/components/ar/CalibrationDrawer.test.tsx`
Expected: 2 new tests FAIL.

- [ ] **Step 5: Implement focus management in CalibrationDrawer**

In `src/components/ar/CalibrationDrawer.tsx`:

1. Add `import { useRef, useEffect } from 'react';` to the existing import.
2. Inside the component, declare `const firstFieldRef = useRef<HTMLInputElement>(null);`.
3. Add a `useEffect` inside the component body:

```tsx
useEffect(() => {
  if (open) firstFieldRef.current?.focus();
}, [open]);
```

4. On the **first** slider's `Slider` (the X one — first entry in `FIELDS`), pass `inputRef={firstFieldRef}`. The existing `Slider` component must support this prop. If it doesn't, add it.

Inspect `src/components/ui/Slider.tsx`. If it has no `inputRef` prop, add it. Patch:

```tsx
type Props = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  inputRef?: React.Ref<HTMLInputElement>;
};

export function Slider({ inputRef, ...props }: Props) {
  /* forward ref on the <input> */
}
```

Concretely, the rendered `<input>` should accept `ref={inputRef ?? undefined}`.

Run: `pnpm test -- src/components/ar/CalibrationDrawer.test.tsx`
Expected: all 10 tests pass.

- [ ] **Step 6: GestureCanvas: aria-hidden + tabindex**

In `src/components/ar/GestureCanvas.tsx`, modify the outer `<div>`:

```tsx
<div
  className="absolute inset-0 z-10 touch-none"
  aria-hidden="true"
  tabIndex={-1}
  onPointerDown={onDown}
  ...
/>
```

No test needed (purely additive ARIA, no behavior change).

Run: `pnpm test -- src/components/ar`
Expected: all pass.

- [ ] **Step 7: Header + Footer focus-visible rings**

In `src/components/landing/Header.tsx` and `Footer.tsx`, find every `<Link>` element and ensure its `className` includes `focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary rounded` (only what fits the visual style; `rounded` is optional).

Don't add a test for these (visual-only a11y attribute, and existing
snapshot-style coverage in `tests/` doesn't currently cover Header/Footer).

Run: `pnpm typecheck`

- [ ] **Step 8: globals.css prefers-reduced-motion**

At the end of `src/styles/globals.css`, append:

```css
@media (prefers-reduced-motion: reduce) {
  .transition-transform,
  .transition-opacity,
  .transition-colors {
    transition-duration: 0ms !important;
  }
}
```

(CalibrationDrawer uses `transition-transform duration-300 ease-out`;
the slide completes instantly when reduced motion is requested.)

No test; CSS not unit-testable without browser.

- [ ] **Step 9: Verify everything together**

Run: `pnpm typecheck && pnpm test`
Expected: typecheck clean, all 54~ tests pass.

- [ ] **Step 10: Commit**

```bash
git -C /home/telchar/rin-vr-vision add src/components/ar/TopBar.tsx \
  src/components/ar/CameraStage.tsx \
  src/components/ar/CalibrationDrawer.tsx \
  src/components/ar/GestureCanvas.tsx \
  src/components/landing/Header.tsx \
  src/components/landing/Footer.tsx \
  src/styles/globals.css \
  src/components/ar/TopBar.test.tsx \
  src/components/ar/CalibrationDrawer.test.tsx \
  src/components/ui/Slider.tsx
git -C /home/telchar/rin-vr-vision commit -m "feat(a11y): aria-expanded on settings, focus on drawer open, gesture canvas hidden, reduced-motion, focus-visible rings"
```

---

### Task 3: `robots.ts`

**Files:**
- Create: `/home/telchar/rin-vr-vision/src/app/robots.ts`
- Create: `/home/telchar/rin-vr-vision/src/app/robots.test.ts`

**Interfaces:**
- Consumes: `MetadataRoute.Robots` from `next`.
- Produces: A `robots()` function returning `{ rules, sitemap }`. Next materializes it at `/robots.txt` in the build output.

- [ ] **Step 1: Write failing test**

```ts
// src/app/robots.test.ts
import { describe, it, expect } from 'vitest';
import robots from './robots';

describe('robots.txt export', () => {
  it('allows all user agents on all paths', () => {
    const r = robots();
    expect(r.rules).toEqual({ userAgent: '*', allow: '/' });
  });

  it('points to the prod sitemap', () => {
    const r = robots();
    expect(r.sitemap).toBe('https://rin.andresmorales.com.co/sitemap.xml');
  });
});
```

Run: `pnpm test -- src/app/robots.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 2: Implement `robots.ts`**

```ts
// src/app/robots.ts
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: 'https://rin.andresmorales.com.co/sitemap.xml',
  };
}
```

Run: `pnpm test -- src/app/robots.test.ts`
Expected: 2 passing.

- [ ] **Step 3: Commit**

```bash
git -C /home/telchar/rin-vr-vision add src/app/robots.ts src/app/robots.test.ts
git -C /home/telchar/rin-vr-vision commit -m "feat(seo): add robots.txt allowing all + sitemap pointer"
```

---

### Task 4: `sitemap.ts`

**Files:**
- Create: `/home/telchar/rin-vr-vision/src/app/sitemap.ts`
- Create: `/home/telchar/rin-vr-vision/src/app/sitemap.test.ts`

**Interfaces:**
- Consumes: `MetadataRoute.Sitemap` from `next`.
- Produces: A `sitemap()` function returning `[{ url, lastModified }, ...]`. Next materializes it at `/sitemap.xml`.

- [ ] **Step 1: Write failing test**

```ts
// src/app/sitemap.test.ts
import { describe, it, expect } from 'vitest';
import sitemap from './sitemap';

describe('sitemap export', () => {
  it('lists the four public routes under the prod domain', () => {
    const entries = sitemap();
    const urls = entries.map((e) => e.url).sort();
    expect(urls).toEqual([
      'https://rin.andresmorales.com.co/',
      'https://rin.andresmorales.com.co/app',
      'https://rin.andresmorales.com.co/contacto',
      'https://rin.andresmorales.com.co/nosotros',
    ]);
  });

  it('every entry has a lastModified Date', () => {
    const entries = sitemap();
    for (const e of entries) {
      expect(e.lastModified).toBeInstanceOf(Date);
    }
  });

  it('landing has highest priority', () => {
    const entries = sitemap();
    const landing = entries.find((e) => e.url.endsWith('/'));
    expect(landing?.priority).toBe(1);
    expect(landing?.changeFrequency).toBe('weekly');
  });
});
```

Run: `pnpm test -- src/app/sitemap.test.ts`
Expected: FAIL.

- [ ] **Step 2: Implement `sitemap.ts`**

```ts
// src/app/sitemap.ts
import type { MetadataRoute } from 'next';

const BASE = 'https://rin.andresmorales.com.co';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${BASE}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/app`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/contacto`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/nosotros`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];
}
```

Run: `pnpm test -- src/app/sitemap.test.ts`
Expected: 3 passing.

- [ ] **Step 3: Commit**

```bash
git -C /home/telchar/rin-vr-vision add src/app/sitemap.ts src/app/sitemap.test.ts
git -C /home/telchar/rin-vr-vision commit -m "feat(seo): add sitemap.xml for /, /app, /contacto, /nosotros"
```

---

### Task 5: `manifest.ts` (PWA manifest)

**Files:**
- Create: `/home/telchar/rin-vr-vision/src/app/manifest.ts`
- Create: `/home/telchar/rin-vr-vision/src/app/manifest.test.ts`

**Interfaces:**
- Consumes: `MetadataRoute.Manifest` from `next`. No image asset needed; reuses `icon.tsx` route.
- Produces: A `manifest()` function returning `{ name, short_name, description, theme_color, background_color, display, icons }`. Next materializes at `/manifest.webmanifest`.

- [ ] **Step 1: Write failing test**

```ts
// src/app/manifest.test.ts
import { describe, it, expect } from 'vitest';
import manifest from './manifest';

describe('manifest.webmanifest export', () => {
  it('declares name + short_name', () => {
    const m = manifest();
    expect(m.name).toBe('Rin VR Vision');
    expect(m.short_name).toBe('Rin VR');
  });

  it('uses Spanish description', () => {
    const m = manifest();
    expect(m.description).toMatch(/AR/);
  });

  it('renders standalone and references an icon', () => {
    const m = manifest();
    expect(m.display).toBe('standalone');
    expect(m.icons).toBeDefined();
    expect(m.icons!.length).toBeGreaterThan(0);
  });

  it('theme_color and background_color are 6-digit hex', () => {
    const m = manifest();
    expect(m.theme_color).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(m.background_color).toMatch(/^#[0-9a-fA-F]{6}$/);
  });
});
```

Run: `pnpm test -- src/app/manifest.test.ts`
Expected: FAIL.

- [ ] **Step 2: Implement `manifest.ts`**

The theme_color matches `accent-primary` from `src/lib/design-tokens.ts`
and the background_color matches `bg-primary`. Verify those exact
hex values in `design-tokens.ts` before committing.

```ts
// src/app/manifest.ts
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Rin VR Vision',
    short_name: 'Rin VR',
    description: 'Probá rines en AR desde tu celular.',
    theme_color: '#2b6cff',  // matches accent-primary
    background_color: '#0a0a0a',  // matches bg-primary
    display: 'standalone',
    icons: [
      { src: '/icon', sizes: 'any', type: 'image/png', purpose: 'any' },
    ],
  };
}
```

Run: `pnpm test -- src/app/manifest.test.ts`
Expected: 4 passing.

- [ ] **Step 3: Commit**

```bash
git -C /home/telchar/rin-vr-vision add src/app/manifest.ts src/app/manifest.test.ts
git -C /home/telchar/rin-vr-vision commit -m "feat(pwa): add manifest.webmanifest (name, theme, icon)"
```

---

### Task 6: Favicon (`icon.tsx`)

Dynamic icon — `ImageResponse` from `next/og`. Single-letter "R" on rounded background. No test (Next validates at build).

**Files:**
- Create: `/home/telchar/rin-vr-vision/src/app/icon.tsx`

- [ ] **Step 1: Implement `icon.tsx`**

```tsx
// src/app/icon.tsx
import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#2b6cff',  // matches accent-primary
          color: 'white',
          fontSize: 22,
          fontWeight: 700,
          fontFamily: 'system-ui, sans-serif',
          borderRadius: 6,
        }}
      >
        R
      </div>
    ),
    { ...size },
  );
}
```

- [ ] **Step 2: Build to verify**

Run: `pnpm build` and inspect output:

```bash
find .next -name "*.png" | head -10
```

Expected: `favicon.ico` (or `icon-*.png`) appears in `.next` static output.

- [ ] **Step 3: Commit**

```bash
git -C /home/telchar/rin-vr-vision add src/app/icon.tsx
git -C /home/telchar/rin-vr-vision commit -m "feat(seo): add dynamic R-monogram favicon"
```

---

### Task 7: OG images (landing + /app)

Two files using `next/og` `ImageResponse`. Both render a solid dark background with brand name + tagline. No tests; Next's build pipeline validates the output (errors in this file fail the build).

**Files:**
- Create: `/home/telchar/rin-vr-vision/src/app/opengraph-image.tsx`
- Create: `/home/telchar/rin-vr-vision/src/app/app/opengraph-image.tsx`

- [ ] **Step 1: Implement landing OG image**

```tsx
// src/app/opengraph-image.tsx
import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Rin VR Vision — Probá rines en AR desde tu celular.';

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
          color: 'white',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#2b6cff',
            color: 'white',
            fontSize: 64,
            fontWeight: 700,
            borderRadius: 24,
            marginBottom: 32,
          }}
        >
          R
        </div>
        <div style={{ fontSize: 64, fontWeight: 700, marginBottom: 16 }}>
          Rin VR Vision
        </div>
        <div style={{ fontSize: 32, color: '#9ca3af' }}>
          Probá rines en AR desde tu celular.
        </div>
      </div>
    ),
    { ...size },
  );
}
```

- [ ] **Step 2: Implement AR-view OG image**

```tsx
// src/app/app/opengraph-image.tsx
import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Rin VR Vision — Apuntá la cámara y elegí tu próximo rin.';

export default async function AppOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
          color: 'white',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ fontSize: 56, fontWeight: 700, marginBottom: 16 }}>
          Probador AR
        </div>
        <div
          style={{
            fontSize: 28,
            color: '#9ca3af',
            maxWidth: 900,
            textAlign: 'center',
            padding: '0 40px',
          }}
        >
          Apuntá la cámara y elegí tu próximo rin.
        </div>
      </div>
    ),
    { ...size },
  );
}
```

- [ ] **Step 3: Build to verify**

Run: `pnpm build 2>&1 | tail -20`. Inspect:

```bash
ls -la .next/server/app/ 2>/dev/null | head
```

Expected: no build errors related to `next/og`. If `next/og` complains about fonts, fall back to plain `fontFamily: 'sans-serif'` and move on.

- [ ] **Step 4: Commit**

```bash
git -C /home/telchar/rin-vr-vision add src/app/opengraph-image.tsx src/app/app/opengraph-image.tsx
git -C /home/telchar/rin-vr-vision commit -m "feat(seo): dynamic OG images for landing and /app via next/og"
```

---

### Task 8: `/app/layout.tsx` metadata override

Add a minimal segment layout so `/app` advertises its own metadata (especially the AR-tailored OG image and title).

**Files:**
- Create: `/home/telchar/rin-vr-vision/src/app/app/layout.tsx`

- [ ] **Step 1: Implement `/app/layout.tsx`**

```tsx
// src/app/app/layout.tsx
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Rin VR Vision · Probador AR de rines',
  description: 'Apuntá la cámara a tu auto, elegí entre varios rines y previsualizá el acabado en realidad aumentada. Sin descargas.',
  openGraph: {
    title: 'Rin VR Vision · Probador AR de rines',
    description: 'Apuntá la cámara y elegí tu próximo rin.',
    type: 'website',
    locale: 'es_CO',
    url: 'https://rin.andresmorales.com.co/app',
    siteName: 'Rin VR Vision',
  },
};

export default function AppLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
```

- [ ] **Step 2: Verify in build**

Run: `pnpm build`. The route table should still show `/app` as ○
(static, prerendered). Confirm the OpenGraph image is referenced in
the built HTML:

```bash
grep -E 'og:image' .next/server/app/app*.html 2>/dev/null
```

Expected: meta tag with `og:image` references the generated PNG.

- [ ] **Step 3: Commit**

```bash
git -C /home/telchar/rin-vr-vision add src/app/app/layout.tsx
git -C /home/telchar/rin-vr-vision commit -m "feat(seo): /app segment metadata + AR-specific OG title"
```

---

### Task 9: Final verification + push

**Files:** none (verification only).

- [ ] **Step 1: Run full verification suite**

```bash
pnpm typecheck && pnpm test && pnpm build 2>&1 | tail -20
```

Expected:
- typecheck: clean.
- tests: 54~ passing (was 48 before, +6 from robots + sitemap + manifest + error boundary + 2 a11y tests).
- build: success, First Load JS `/app` ≤ 110 kB.

- [ ] **Step 2: Spot-check the generated metadata endpoints locally**

After `pnpm build`, run `pnpm start &`, then:

```bash
curl -s http://127.0.0.1:3000/robots.txt | head -5
curl -s http://127.0.0.1:3000/sitemap.xml | head -8
curl -s http://127.0.0.1:3000/manifest.webmanifest | head
curl -sI http://127.0.0.1:3000/opengraph-image | head -5
curl -sI http://127.0.0.1:3000/app/opengraph-image | head -5
```

Expected:
- `robots.txt`: starts with `User-Agent: *` and `Allow: /`.
- `sitemap.xml`: `<urlset xmlns="...">` plus 4 `<url>` entries.
- `manifest.webmanifest`: JSON with `name: "Rin VR Vision"`.
- `opengraph-image` and `/app/opengraph-image`: `200`, `Content-Type: image/png`.

Kill the dev server: `kill %1` or `pkill -f "next start"`.

- [ ] **Step 3: Update README.md briefly**

In `/home/telchar/rin-vr-vision/README.md`, add a one-line note in the "Tech stack" table:

```
| SEO/PWA | Next.js file conventions (opengraph-image, icon, robots, sitemap, manifest) + next/og dynamic OG |
```

No other README changes. The spec doc already captures the rationale.

- [ ] **Step 4: Push to origin/main**

```bash
git -C /home/telchar/rin-vr-vision push origin main
```

If the host Caddy is configured to serve the latest container (via
`docker compose up -d --build`), trigger that from the host separately
out-of-band. The push to GitHub is sufficient for the deployment story.

- [ ] **Step 5: Tag deployment milestone**

Not strictly required, but useful: `git tag mvp-shareable-2026-08-25`.

---

## Self-review

(Completed before this final commit.)

1. **Spec coverage:**
   - Goal "shareable without embarrassment" → Tasks 3-8 directly.
   - Error boundary catching GLB/MediaPipe/Three.js crashes → Task 1.
   - Tab-reaches-three-TopBar-buttons a11y → Task 2 (focus rings, aria-hidden on gesture canvas).
   - First Load JS ≤ 110 kB → Task 9 verification step.
   - 48 → 54 tests → Tasks 1, 2, 3, 4, 5 contribute tests.

2. **Placeholder scan:** No "TBD"/"TODO"/"implement later" in any task. Each code block is concrete.

3. **Type / name consistency:**
   - `TopBar({ videoRef, onSettingsClick, settingsOpen })` in Task 2 matches the type referenced in Task 1 CameraStage call site.
   - `Slider` `inputRef` added in Task 2 step 5; used only in `CalibrationDrawer`. No cross-task naming drift.
   - `metadata` shape in Task 8 references the standard `Metadata` from `next`.

4. **Scope check:** Single plan, batched into 9 sub-tasks. Each task is independently mergeable. No decomposition needed.
