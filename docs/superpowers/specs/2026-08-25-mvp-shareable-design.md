# Rin VR Vision — MVP-compartible-en-redes Design Spec

**Date:** 2026-08-25
**Status:** Approved (brainstorming complete)
**Repo:** github.com/andresmoralesc1/rin-vr-vision
**Domain (prod):** rin.andresmorales.com.co
**Supersedes:** none
**Related:** `2026-08-24-rin-vr-vision-design.md` (base spec for v1)

## Goal

Make Rin VR Vision shareable in WhatsApp / LinkedIn / Twitter without
embarrassment: every link-preview shows a designed OG image, the AR
view never goes to a white screen on a crash, and a minimal set of
accessibility / discoverability affordances exist.

**Success criteria:**

1. Posting `https://rin.andresmorales.com.co/` on WhatsApp surfaces a
   1200×630 image with the brand name and a tagline. Verified by
   `https://www.opengraph.xyz/url/https%3A%2F%2Frin.andresmorales.com.co%2F`.
2. Posting `https://rin.andresmorales.com.co/app` on WhatsApp surfaces
   a different OG image tailored to the AR experience.
3. Throwing an exception in any client component inside `/app`
   (verified by an `app/error.tsx` test) renders the fallback UI
   with a working "Reintentar" button (resets state via `reset()`)
   and a "Volver al inicio" link.
4. Pressing Tab in the AR view (when camera is granted) reaches the
   three TopBar buttons and the rim picker without trapping focus.
5. `pnpm typecheck && pnpm test && pnpm build` all green. `/app`
   First Load JS remains under 110 kB (currently 101 kB).
6. All existing 48 tests still pass; new tests bring total to ~54.

**Out of scope for this round:**

- Backend for the contact form (mailto + visible WhatsApp stays).
- Sentry / observability / monitoring.
- CI / GitHub Actions.
- Rate limiting on `/api/pexels`.
- i18n switcher (Spanish only).
- Service worker / offline support.
- Lighthouse score chasing beyond what's free with the above.

## Approach

Layered file additions using Next.js 14 App Router conventions
(`app/*.{ts,tsx}` co-located routes for cross-cutting metadata). No
new dependencies, no Docker / Caddy / DNS changes. Each addition is
a standalone file that Next.js picks up automatically.

## Architecture

### 1. Open Graph image (dynamic)

**Files:**
- `src/app/opengraph-image.tsx` — landing OG image (used by `/`, `/contacto`, `/nosotros`).
- `src/app/app/opengraph-image.tsx` — AR-view OG image (used by `/app`).

**API:** `next/og`'s `ImageResponse` (already a dep of Next 14).
Renders at build time, cached at the edge indefinitely (Next marks
it `immutable`).

**Design language (both):**
- Solid dark background matching `bg-bg-primary` from
  `src/lib/design-tokens.ts`.
- Brand wordmark (text-only, font `Inter` via Satori-compatible
  fallback).
- Single-line tagline below.
- No logos (no assets exist yet — text avoids early brand commitments).

**Landing tagline:** "Probá rines en AR desde tu celular."

**AR-view tagline:** "Apuntá la cámara y elegí tu próximo rin."

### 2. Favicon (dynamic)

**File:** `src/app/icon.tsx`

Single-letter monogram "R" on rounded background, rendered via
`next/og`'s `ImageResponse`. Same code path as OG image. Produces a
32×32 ICO-equivalent. Browser picks it up automatically via the
auto-injected `<link rel="icon">`.

### 3. robots.txt

**File:** `src/app/robots.ts`

Exports a default object via Next's `MetadataRoute.Robots`:
```ts
{ rules: { userAgent: '*', allow: '/' }, sitemap: 'https://rin.andresmorales.com.co/sitemap.xml' }
```

### 4. sitemap.xml

**File:** `src/app/sitemap.ts`

Exports via `MetadataRoute.Sitemap`. Lists `/`, `/app`, `/contacto`,
`/nosotros` with `changeFrequency: 'weekly'` and `priority: 1.0 | 0.9 | 0.5 | 0.5`.
Sitemap URL hardcoded to prod domain.

### 5. Web App Manifest

**File:** `src/app/manifest.ts`

Exports via `MetadataRoute.Manifest`:
- `name`: "Rin VR Vision"
- `short_name`: "Rin VR"
- `description`: "Probá rines en AR desde tu celular."
- `theme_color`: matches `--accent-primary` token
- `background_color`: matches `--bg-primary` token
- `display`: "standalone"
- `icons`: array referencing the favicon route (`/icon`)

This is enough to make Chrome offer the "Install" prompt on mobile.
Service worker remains out of scope.

### 6. /app error boundary

**File:** `src/app/app/error.tsx`

`'use client'` component per Next 14 convention. Receives
`{ error, reset }` from React. Renders fallback UI:

```
┌───────────────────────────────┐
│      ⚠ (warning icon)         │
│ Algo explotó.                 │
│ Probá Reintentar o volvé al   │
│ inicio.                       │
│                               │
│ [ Reintentar ] [ Ir al inicio]│
└───────────────────────────────┘
```

- Reintentar: calls `reset()` (re-mounts the segment).
- Volver: `<Link href="/">`.
- Background: solid black (`bg-black`) so the immersive feel continues.
- `role="alert"`, `aria-live="assertive"` so screen readers announce.
- Logs `error.message` to `console.error` for debugging.

Boundary covers GLB 404s (`RimViewer` throws in `useEffect`),
MediaPipe init failures, and Three.js render errors.

### 7. /app metadata layer

**File:** `src/app/app/layout.tsx` (new, minimal)

Currently `/app/page.tsx` exists but no `layout.tsx` for that
segment. Add a tiny `<>{children}</>` layout that exports its own
`Metadata` with:
- `title`: "Rin VR Vision · Probador AR de rines"
- `description`: AR-specific.
- `openGraph`: reference the segment's `opengraph-image.tsx`.

This is required for `/app` to advertise its own OG image and title
in link previews.

### 8. A11y surgical fixes

**Files modified:**
- `src/components/ar/TopBar.tsx`: Settings gear gets `aria-expanded={isOpen}`
  via prop drilling from CameraStage. Settings button also gets
  `aria-haspopup="dialog"`.
- `src/components/ar/CalibrationDrawer.tsx`: backdrop and dialog already
  meet most ARIA. Add `focus` on the first slider when drawer opens
  (`useEffect` with `dialogRef.current?.querySelector('input')?.focus()`).
- `src/components/ar/GestureCanvas.tsx` and surrounding: add
  `aria-hidden="true"` and `tabindex={-1}` to the gesture canvas
  (it's a visual layer, not interactive from a11y standpoint; the
  controls above it are the real interface).
- `src/components/landing/Footer.tsx`, `Header.tsx`: ensure visible
  focus on all interactive items (`focus-visible:ring`).
- `src/styles/globals.css`: respect
  `@media (prefers-reduced-motion: reduce)` to disable the
  CalibrationDrawer slide-up transition (replace with instant).

## Components

| Component | Purpose | Depends on |
|---|---|---|
| `OGBackdrop` (private to `opengraph-image.tsx`) | Solid-fill + centered text block | `next/og`'s `ImageResponse` |
| `AppErrorBoundary` (`src/app/app/error.tsx`) | Render fallback UI on errors inside `/app` | React 18 `reset()` from error boundary contract |
| `robots.ts`, `sitemap.ts`, `manifest.ts` | Static metadata emission | Next 14 `MetadataRoute.*` types |

## Data flow

No new data flow. None of these additions introduce new state, new
APIs, or new persistence. All are file-system-or-build-time metadata.

For `/app` OG: the `opengraph-image.tsx` file runs in Node at request
time (or build-time for static segments — `/app` is marked
`dynamic = 'force-dynamic'` elsewhere? verify during impl).
Confirmed in plan: `/app` page does NOT force-dynamic — the `force-dynamic`
flag is on the landing (`/`) only. So `app/app/opengraph-image.tsx`
runs at build time, cached by Next's image cache.

## Error handling

| Failure | Surface |
|---|---|
| GLB 404 (`/models/wheel.glb` missing) | Bubbles to `RimViewer` `useEffect` → component error → caught by `app/error.tsx`. Fallback shown. |
| MediaPipe WASM load failure | Logged by `useWheelDetector`; status flips to `not-found`. UI shows "No se detectó auto", not a crash. No boundary involvement. |
| Three.js WebGL context loss | R3F's `<ErrorBoundary>` (optional addition) or just `RimViewer` throws → `app/error.tsx`. Decide during impl. |
| OG image render failure | Next logs, falls back to no `<meta property="og:image">`. Link previews show generic site icon. Acceptable. |

## Testing

| Test file | Tests |
|---|---|
| `src/app/app/error.test.tsx` | Render a child that throws; verify fallback UI renders, "Reintentar" button is present, "Ir al inicio" link points to `/`. |
| `src/components/ar/TopBar.test.tsx` (extend) | Settings button has `aria-expanded="false"` initially; passing `settingsOpen` toggles it. |
| `src/components/ar/CalibrationDrawer.test.tsx` (extend) | When `open={true}`, focus lands on the first slider (X). |
| `src/styles/reduced-motion.test.ts` (manual CSS) | Not testable without Playwright. Document in spec; skip CI. |

Mocking strategy: use `vi.spyOn(console, 'error')` in error boundary
test to avoid noisy test output (React logs on caught errors).

OG image / robots / sitemap / manifest: not unit-tested. They are
declarative metadata files; their correctness is verified by
inspecting the build output and by hitting the URLs in production.
The `pnpm build` step that runs in CI catches structural errors
(typecheck + Next's metadata validation).

## Critical files

**Add (8 files):**
- `src/app/opengraph-image.tsx`
- `src/app/app/opengraph-image.tsx`
- `src/app/icon.tsx`
- `src/app/robots.ts`
- `src/app/sitemap.ts`
- `src/app/manifest.ts`
- `src/app/app/error.tsx`
- `src/app/app/layout.tsx` (minimal; for `/app` metadata override)

**Modify (~6 files):**
- `src/components/ar/TopBar.tsx` — accept `settingsOpen` prop, `aria-expanded`, `aria-haspopup`.
- `src/components/ar/CameraStage.tsx` — pass `settingsOpen` to TopBar.
- `src/components/ar/CalibrationDrawer.tsx` — focus first slider when opened.
- `src/components/ar/GestureCanvas.tsx` — `aria-hidden="true"`, `tabindex={-1}`.
- `src/components/landing/Header.tsx`, `Footer.tsx` — focus-visible rings.
- `src/styles/globals.css` — `prefers-reduced-motion` media query.

**New tests (~4 files / ~6 tests):**
- `src/app/app/error.test.tsx`
- `src/components/ar/TopBar.test.tsx` (extend existing)
- `src/components/ar/CalibrationDrawer.test.tsx` (extend existing)

**Total:**
- 9 new files, 7 modified.
- Tests: 48 → ~54 (+ ~6).
- LoC added: ~250 (mostly the two OG image files and the error boundary UI).

## Verification

1. `pnpm install` (no new deps; nothing to install).
2. `pnpm typecheck` — clean.
3. `pnpm test` — ~54 passing.
4. `pnpm build` — generates `/icon`, `/opengraph-image`, `/sitemap.xml`,
   `/robots.txt`, `/manifest.webmanifest`, `/app/opengraph-image`.
5. `docker compose up -d --build` — pushes locally, then push to
   `andresmorales.com.co` Caddy origin.
6. Manual checks once deployed:
   - `curl -s https://rin.andresmorales.com.co/opengraph-image | head`
     → first bytes of a PNG (not HTML 404).
   - `curl -s https://rin.andresmorales.com.co/robots.txt` →
     contains `Sitemap: https://rin.andresmorales.com.co/sitemap.xml`.
   - `curl -s https://rin.andresmorales.com.co/sitemap.xml` → valid
     XML listing 4 routes.
   - `curl -s https://rin.andresmorales.com.co/manifest.webmanifest`
     → valid JSON with `name`, `short_name`, `icons`.
   - Browser DevTools on `/app`: introduce `throw new Error('test')`
     in `RimViewer`, reload, see fallback UI with "Reintentar".
   - LinkedIn Post Inspector / opengraph.xyz on `/`, `/app`,
     `/contacto` → each shows the designed image.
7. Lighthouse accessibility score ≥ 95 on `/` and `/contacto`
   (verify in DevTools; not a CI gate for this round).

## Migration / rollback

No migration. To roll back: `git revert` of the single PR restores
the prior state. No data, no schema, no env.

## Risks

1. **`next/og` font availability** — Satori (under `next/og`) does
   not have access to all Google Fonts at build time. Mitigation: use
   only Inter or system sans; if Inter fails, fall back to Satori's
   default. Verified during impl.
2. **OG image bundle size** — each OG image is ~10-20 KB PNG. With
   2 images, that's < 50 KB total, served once-per-cache. Acceptable.
3. **Error boundary re-throw on initial mount** — If the error is
   thrown during hydration (rare; mostly comes from `useEffect`),
   boundary catches. If thrown during SSR, Next renders its own
   error page; `/app` is a client component so SSR-side errors are
   vanishingly rare. Verified during impl.
4. **`/app/layout.tsx` interaction with root `layout.tsx`** — Adding
   a segment layout in `/app` doesn't replace the root; it nests.
   Confirmed by Next 14 docs. Both render.
5. **`prefers-reduced-motion` not respected** if user has it on but
   our CSS forgets. Mitigation: explicit `@media` block in
   `globals.css` + visual check.

## Open questions (decided during brainstorming)

- **Q1:** What does "production" mean for this app? **A:** MVP
  shareable in social networks. **Decision logged.**
- **Q2:** What scope? **A:** Polish + safety net. **Decision logged.**

## Self-review

(Completed 2026-08-25 before this final commit.)

- Placeholders: none. All numbers, paths, and class names concrete.
- Internal consistency: out-of-scope list mirrors the "approach"
  description; success criteria mirror the deliverables; error table
  references actual files in the design.
- Scope: appropriate for a single implementation plan; not decomposable.
- Ambiguity: "minimal layout" for `/app/layout.tsx` — the only
  ambient thing it does is set `<Metadata>`; rendering is bare
  `<>{children}</>`. Codified above as "export Metadata + return
  `<>{children}</>`".
