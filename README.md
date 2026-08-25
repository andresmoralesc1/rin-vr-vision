# Rin VR Vision

WebAR rim visualizer — point your phone camera at your wheel and preview chrome, matte-black, and silver finishes in real time. No app install.

**Live demo:** https://rin.andresmorales.com.co/

![Landing page — full](./docs/screenshots/landing-full.png)

## What it does

- Live camera feed with the rim composited on top via WebGL
- Three PBR finishes (chrome, matte-black, silver) — switchable from a carousel
- Drag / pinch / scroll gestures to translate, scale, and rotate the rim
- 6-slider calibration drawer for fine positioning
- Gallery sourced from Pexels (CC0) for the landing page
- Spanish UI, mobile-first, works on Android Chrome and iPhone Safari

![Mobile](./docs/screenshots/landing-mobile.png)

## Tech stack

| Layer | |
|---|---|
| Framework | Next.js 14 (App Router) + React 18 + TypeScript strict |
| 3D | `@react-three/fiber` + `@react-three/drei` + `three.js` |
| Styling | Tailwind CSS (custom design tokens in `src/lib/design-tokens.ts`) |
| Testing | Vitest + Testing Library + jsdom |
| Photos | Pexels API (server-side fetch with 1 h ISR) |
| Deploy | Docker (multi-stage, `node:24-alpine`, standalone output, 186 MB image) |
| Reverse proxy | Host Caddy terminates TLS, ACME HTTP-01 |
| DNS | Namecheap API (A record only) |

![AR view — camera permission state](./docs/screenshots/ar-page.png)
*AR view in camera-permission state (headless screenshot). On a real device, this becomes the live camera feed with the rim overlaid.*

## Architecture

Single repo, single Docker container. Two routes:

| Route | Type | What |
|---|---|---|
| `/` | Server Component | Landing page; fetches Pexels photos server-side, renders hero + gallery |
| `/app` | Client Component | AR view; lazy-loads R3F, manages camera permission state machine, mounts the rim |
| `/api/pexels` | API route | Proxied Pexels search (returns typed JSON) |

State management: `useState` for camera permissions, `useReducer` for the calibration transform (x, y, scale, pitch, yaw, roll, finish). No global store needed — the AR view is one client component.

### Why "force-dynamic" on the landing page

`PEXELS_API_KEY` lives in the runtime `env_file`, not baked into the Docker image. With ISR, Next.js would prerender the page at build time without the key and cache the skeleton state for an hour. `export const dynamic = 'force-dynamic'` makes the page render per-request; the inner `fetch({ next: { revalidate: 3600 } })` still caches the Pexels API response.

## Run locally

```bash
pnpm install
pnpm dev                   # http://localhost:3000
pnpm test                  # 24 tests
pnpm typecheck && pnpm lint
```

Required env (see `.env.example`):

```
PEXELS_API_KEY=...
```

Without it, the landing page renders skeleton placeholders. The AR page works without any env.

## Deploy

Build the image and start the container:

```bash
docker compose up -d --build
```

The container binds `127.0.0.1:3000` only. Host Caddy (in `/etc/caddy/Caddyfile`) handles TLS and reverse-proxies `rin.andresmorales.com.co` to it.

### One-time DNS setup (Namecheap)

```bash
# Dry-run first — diff the zone before applying
NAMECHEAP_SUBDOMAIN=rin bash scripts/dns-set.sh

# Review the backup in /tmp/<sld>.<tld>.zone.<ts>.xml, then:
NAMECHEAP_APPLY=true NAMECHEAP_SUBDOMAIN=rin bash scripts/dns-set.sh
```

The script preserves every existing record (MX, SPF, DKIM, CAA, …) and only appends the new A record. See `scripts/dns-set.sh` for the SLD/TLD split quirks of `.com.co` domains.

## Project layout

```
src/
├── app/
│   ├── api/pexels/route.ts   # Pexels proxy
│   ├── app/page.tsx          # AR view (Client Component)
│   ├── layout.tsx
│   └── page.tsx              # Landing (Server Component)
├── components/
│   ├── ar/                   # CameraStage, RimViewer, RimCarousel, CalibrationDrawer, GestureCanvas
│   ├── landing/              # Hero, Features, Gallery, Header, Footer
│   └── ui/Slider.tsx
├── lib/
│   ├── pexels/               # typed Pexels client + types
│   ├── camera/               # permission state machine + useCamera hook
│   ├── calibration/          # reducer + context for transform
│   └── three/                # GLTF loader + PBR materials (3 finishes)
public/
└── models/rim-chrome.glb     # CC0 from Quaternius Cars Pack
docs/
├── superpowers/              # SDD plan + per-task ledger
└── screenshots/              # README screenshots
```

## License

MIT. Pexels photos are CC0. Rim GLB model is CC0 (Quaternius).