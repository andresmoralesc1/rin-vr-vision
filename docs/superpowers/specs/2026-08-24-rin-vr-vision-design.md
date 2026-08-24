# WebAR Auto Rim Visualizer — Design Spec

**Date:** 2026-08-24
**Status:** Approved (brainstorming complete)
**Repo:** github.com/andresmoralesc1/rin-vr-vision
**Domain (prod):** rin.andresmorales.com.co

## Goal

Build a production WebAR rim visualizer at `/app` plus a marketing landing page at `/`, deployed via Docker + Caddy. Success is defined by the acceptance checklist, not subjective impression.

## Stack

- **Framework:** Next.js 14 App Router, TypeScript strict, React 18
- **3D:** @react-three/fiber + @react-three/drei + three.js (lazy-loaded for `/app`)
- **Styling:** Tailwind CSS with shared design tokens
- **Camera:** Web getUserMedia API
- **Image API:** Pexels (server-side only, key hidden)
- **Detection (stretch):** OpenCV.js (lazy import, background preload after first paint)
- **Container:** Docker multi-stage, Next.js `output: 'standalone'`
- **Reverse proxy:** Caddy (auto-TLS via Let's Encrypt)
- **DNS:** Namecheap API (script reads everything from env)
- **Package manager:** pnpm

## Architecture Decision

**Monolith Next.js app.** Single repo, single build, single Docker deploy. Code-splitting by route means landing visitors don't pull Three.js; AR visitors don't run the landing RSC.

Rejected alternatives:
- Monorepo (apps/web + apps/ar + packages/ui): YAGNI for MVP
- Two deploys (Vercel + Docker): unnecessary operational complexity

## Components & Pieces

### Piece 0 — Foundation (serial, blocks all others)

- Next.js 14 init (App Router, TS strict, ESLint, Tailwind)
- `next.config.mjs` with `output: 'standalone'`, `experimental.typedRoutes`
- `tailwind.config.ts` with shared tokens (see Design Tokens)
- `.env.example` with: `PEXELS_API_KEY`, `NAMECHEAP_API_USER`, `NAMECHEAP_API_KEY`, `NAMECHEAP_IP`
- 3-5 `.glb` models sourced from Poly Haven Models (CC0). Specific URLs verified and pinned in `public/models/SOURCES.md` before inclusion.
- Folder structure:

```
src/
  app/
    page.tsx               # landing (Server Component)
    app/page.tsx           # AR (Client Component)
    layout.tsx
    api/pexels/route.ts    # proxy (keeps key server-side)
  components/
    landing/{Header,Hero,Features,Gallery,Footer}.tsx
    ar/{CameraStage,RimViewer,CalibrationDrawer,RimCarousel}.tsx
    ui/{Slider,Button,Skeleton}.tsx
  lib/
    camera/{useCamera.ts,permissionStates.ts}
    three/{loader.ts,materials.ts}
    opencv/{detect.ts}              # lazy import
    pexels/{client.ts,types.ts}
    design-tokens.ts
  styles/{tokens.css,globals.css}
public/
  models/*.glb
scripts/
  dns-set.sh
Dockerfile
docker-compose.yml
Caddyfile
next.config.mjs
tailwind.config.ts
tsconfig.json
.env.example
```

### Piece 1 — Landing (`/`)

Server Component. Sections:
- Sticky header (logo + nav)
- Hero with Pexels-sourced backdrop (server-fetched, cached 1h)
- Feature showcase (3-4 cards)
- Gallery grid (6-9 Pexels images, skeleton loaders)
- Footer with Pexels attribution

Pexels fetch:
```
GET https://api.pexels.com/v1/search?query=car+wheel&per_page=12
Header: Authorization: <PEXELS_API_KEY>
```
Server-only. Images served directly from `images.pexels.com` CDN.

### Piece 2 — AR Core (`/app`)

Client Component. Subcomponents:

**`useCamera()` hook** returns `{ status, stream, error }`:
- States: `idle | requesting | granted | denied | unsupported`
- Calls `navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })`

**`<CameraStage>`** handles permission UX:
- `idle` → "Start AR" button
- `requesting` → spinner
- `granted` → mounts `<video>` with stream, `<RimViewer>` over it
- `denied` → instructions + retry button
- `unsupported` → browser-not-supported message

**`<RimViewer>`** (R3F via `dynamic(..., { ssr: false })`):
- Reads `Calibration` from Context
- Renders `<mesh>` with `.glb` from `public/models/`
- PBR material switched by `finish`
- Canvas: transparent, `position:absolute; inset:0`
- DPR clamp `[1, 2]`
- `frameloop="demand"` after 2s idle

**Calibration state** (Context, single source of truth):
```ts
type Calibration = {
  x: number;          // -1..1, normalized
  y: number;          // -1..1, normalized
  scale: number;      // 0.2..2
  pitch: number;      // -90..90 deg
  yaw: number;        // -180..180 deg
  roll: number;       // -90..90 deg
  finish: 'chrome' | 'matte-black' | 'silver';
};
```

### Piece 3 — Controls + Carousel

**`<CalibrationDrawer>`** — HTML overlay with sliders for all 6 fields. Discrete +/- buttons as alternative.

**`<RimCarousel>`** — 3 finishes (chrome, matte black, silver). Updates `calibration.finish`.

**Gestures** — unified via Pointer Events on canvas (`touch-action: none`):
- Drag (1 finger / mouse): `x`, `y`
- Pinch (2 fingers): `scale`
- 2-finger rotate: `yaw`
- Sliders: any field
- All gestures write to Context; R3F reads.

### Piece 4 — Deploy

**Dockerfile** (multi-stage):
- Stage 1: `node:24-alpine`, install deps, `pnpm build`
- Stage 2: `node:24-alpine`, copy `.next/standalone`, `public/`, `.next/static/`
- Non-root user, `EXPOSE 3000`

**docker-compose.yml**:
- `app` service (built locally)
- `caddy` service (image `caddy:2`, volumes: certs + config)
- Internal network; only Caddy exposes 80/443

**Caddyfile**:
```
rin.andresmorales.com.co {
    reverse_proxy app:3000
    encode gzip zstd
}
```

**`scripts/dns-set.sh`** — Namecheap API:
- Reads `NAMECHEAP_API_USER`, `NAMECHEAP_API_KEY`, `NAMECHEAP_IP`, `NAMECHEAP_SUBDOMAIN` from env
- First calls `namecheap.domains.dns.getHosts` on the registered domain (discovered via `namecheap.domains.getList`) to dump current zone (preserves prior records)
- Then calls `namecheap.domains.dns.setHosts` with the merged zone, adding the A record for `${NAMECHEAP_SUBDOMAIN}.andresmorales.com.co`
- No credentials inline
- Mirrors the existing pattern from `cleida-docs` (Namecheap DNS writes = POST + indexed)

**Secrets**:
- `.env` (chmod 600) on host, mounted via `env_file`
- Never committed, never hardcoded in scripts

### Piece 2b — OpenCV Auto-Detect (Stretch, conditional)

Only built after Piece 2 passes MVP checklist.

```
after first manual paint of /app
  ↓
await import('opencv.js')  // ~10MB, background, non-blocking
  ↓
on success: surface "Auto-detect" toggle
on failure: toggle hidden silently
  ↓
toggle on:
  start requestVideoFrameCallback loop
  → downscale frame to 256x256
  → cvtColor to grayscale
  → HoughCircles (conservative params)
  → if score > 0.7: dispatch CalibrationUpdate with detected position/scale
  → max 5 fps (throttle)
toggle off:
  cancel loop
  manual control resumes
```

Failure modes (silent fallback):
- OpenCV.js import throws → toggle never appears
- HoughCircles returns no circles → no state update
- Detection score < 0.7 → no state update

User never sees an error. Manual mode is always functional.

## Data Flow

```
User taps "Start AR"
  ↓
useCamera() → getUserMedia
  ↓
MediaStream → <video srcObject={stream}>
  ↓
<RimViewer> (R3F) mounted absolutely over <video>
  ↓
Each frame: R3F reads Calibration from Context, applies transform to rim mesh
  ↓
User drags / pinches / uses sliders
  ↓
Pointer events → CalibrationReducer → Context update
  ↓
Next frame: R3F reads updated Calibration
```

OpenCV parallel path (stretch):
```
useEffect(() => {
  // background preload after first paint
  import('opencv.js').then(...)
}, []);
```
Independent from main render loop.

## Error Handling

| Trigger | UI |
|---------|-----|
| `camera.requesting` | spinner + "Pedimos permiso..." |
| `camera.granted` | AR overlay active |
| `camera.denied` | instructions to re-enable in browser settings + "Reintentar" button |
| `camera.unsupported` | "Tu navegador no soporta cámara. Probá Chrome/Safari." |
| `location.protocol !== 'https:' && !localhost` | sticky banner: "Cámara requiere HTTPS. Abrí: https://rin.andresmorales.com.co/app" |
| Pexels API 4xx/5xx | hero uses placeholder gradient + `console.warn`. Landing not blocked. |
| `.glb` load error | retry overlay; 3 attempts with backoff; then "Reintentá más tarde" |
| OpenCV import or detection failure | toggle hidden. Manual mode unaffected. |

## Design Tokens

Single source in `lib/design-tokens.ts`, consumed by Tailwind config:

```ts
export const tokens = {
  colors: {
    bg: { primary: '#0A0A0A', surface: '#141414' },
    text: { primary: '#FAFAFA', muted: '#A1A1AA' },
    accent: { primary: '#3B82F6', success: '#22C55E', warning: '#F59E0B', danger: '#EF4444' },
    finish: { chrome: '#E5E7EB', matteBlack: '#1F2937', silver: '#CBD5E1' },
  },
  fonts: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
  },
  spacing: {
    // uses Tailwind defaults; no override
  },
  radius: { sm: '0.375rem', md: '0.5rem', lg: '1rem' },
};
```

Both `/` and `/app` consume these via Tailwind classes.

## Acceptance Checklist (per piece, verified by fresh sub-agent reviewer)

Each piece: cap 4 review rounds. If still failing, surface blocker for human decision.

**Global:**
- [ ] Zero TypeScript errors
- [ ] ESLint clean
- [ ] Zero console errors in `next build && next start`
- [ ] `docker compose up` serves app on :3000
- [ ] Caddy issues valid TLS cert on rin.andresmorales.com.co
- [ ] Landing page keyboard-navigable
- [ ] Gallery images have alt text
- [ ] Pexels attribution present per API terms

**Piece 1 (Landing):**
- [ ] Lighthouse mobile performance ≥90
- [ ] Sticky header functional
- [ ] Hero loads with Pexels backdrop
- [ ] Gallery shows skeleton during load
- [ ] All controls work via touch AND mouse (carousel)
- [ ] Pexels API failure shows fallback hero

**Piece 2 (AR Core):**
- [ ] All camera states have explicit UI
- [ ] First camera frame renders in <2s (on user's device, 4G)
- [ ] Sustains ≥30fps, target 60fps (user reports from device)
- [ ] Zero console errors during AR session
- [ ] Non-HTTPS context shows banner
- [ ] Permission denied flow recoverable via "Reintentar"

**Piece 3 (Controls + Carousel):**
- [ ] All sliders functional
- [ ] Drag updates x/y
- [ ] Pinch updates scale (touch)
- [ ] Scroll wheel updates scale (mouse)
- [ ] 2-finger rotate updates yaw
- [ ] Carousel switches finishes with visible PBR change
- [ ] Same gestures work on touch AND mouse

**Piece 4 (Deploy):**
- [ ] `docker compose up` → http://localhost:3000 responds
- [ ] `https://rin.andresmorales.com.co` resolves with valid cert
- [ ] DNS script writes A record successfully
- [ ] Secrets sourced from env, no inline credentials
- [ ] Logs accessible via `docker compose logs`

**Piece 2b (Stretch):**
- [ ] OpenCV.js loads without blocking first paint
- [ ] Toggle appears only after OpenCV.js ready
- [ ] Detection pre-fills calibration when confidence >0.7
- [ ] Silent fallback on OpenCV failure
- [ ] Manual mode unaffected by toggle state

## Review Process

- Each piece built by main agent
- Fresh sub-agent dispatched with NO context from builder
- Reviewer scores strictly against checklist, names specific unchecked line
- "Not good enough" / "not wowed" is not a valid verdict
- 4 rounds max per piece; after that, surface blocker for human
- Progress tracker: `docs/superpowers/progress.md` — piece | checklist pass/fail | last verdict | timestamp

## Testing Strategy

- **Unit (Vitest):** calibration reducer, Pexels client wrapper, OpenCV detection wrapper (with mock)
- **Integration:** none for MVP (YAGNI)
- **E2E:** none for MVP
- **Lighthouse:** run against local `next build && next start`, target ≥90 mobile performance
- **Manual device tests:** user runs on Android + iPhone, completes checklist, reports results
- **TypeScript:** `tsc --noEmit` clean
- **Linting:** ESLint clean
- **Console:** zero errors in production build

## Out of Scope (MVP)

- User accounts / authentication
- Saved configurations / favorites
- Multiple wheel sizes beyond what fits the rim model
- Real wheel circumference detection
- ARKit / ARCore native bridges
- Sharing / social features
- Analytics beyond basic `console.warn`

These are explicitly deferred. Adding them requires re-evaluation of architecture.

## Risk Register

| Risk | Mitigation |
|------|------------|
| Poly Haven has limited wheel/rim selection | Verify asset availability during Piece 0; fallback: ask user to provide 1-2 .glb models |
| OpenCV.js bundle size hurts mobile first load | Background preload after first paint; lazy toggle |
| getUserMedia varies across mobile browsers | Detect `unsupported` state; show fallback message; not silently broken |
| Camera permission UX differs Safari vs Chrome | State machine abstracts; tested manually on user's devices |
| Lighthouse mobile <90 due to R3F/Three.js | R3F lives on `/app` only; landing is RSC, zero JS by default |
| DNS script format specific to andresmorales.com.co | Documented in `scripts/dns-set.sh` header; uses `NAMECHEAP_SUBDOMAIN` env |

## Open Items / Future

- Real auto-detect (after OpenCV stretch ships) may justify ML model (TensorFlow.js + wheel detector)
- E-commerce integration (Shopify) to turn visualizations into purchases
- Saved configurations stored in user account
- Multiple wheel sizes per car model (currently: one rim model, scaled)

## Approval

Spec approved by user on 2026-08-24 during brainstorming session. Next step: invoke writing-plans skill to produce implementation plan.
