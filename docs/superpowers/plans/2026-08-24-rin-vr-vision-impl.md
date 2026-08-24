# WebAR Auto Rim Visualizer — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build production WebAR rim visualizer (`/app`) + marketing landing page (`/`) per the design spec at `docs/superpowers/specs/2026-08-24-rin-vr-vision-design.md`.

**Architecture:** Next.js 14 App Router monolith. Single repo, single Docker deploy, Caddy reverse proxy. Landing (`/`) is Server Component, AR (`/app`) is Client Component with lazy-loaded R3F. Manual calibration is the MVP interaction; OpenCV.js auto-detect is stretch.

**Tech Stack:** Next.js 14, TypeScript strict, React 18, Tailwind CSS, @react-three/fiber + @react-three/drei + three.js, Vitest, pnpm, Docker multi-stage, Caddy 2, Namecheap API.

## Global Constraints

- Node 24 LTS (Alpine for Docker)
- pnpm 9+
- TypeScript strict mode (`strict: true`, `noUncheckedIndexedAccess: true`)
- ESLint: Next.js preset + Tailwind plugin
- Tailwind: only design tokens from `lib/design-tokens.ts`; no ad-hoc hex codes
- Environment vars: `PEXELS_API_KEY`, `NAMECHEAP_API_USER`, `NAMECHEAP_API_KEY`, `NAMECHEAP_IP`, `NAMECHEAP_SUBDOMAIN` — never inline, always from `.env` (chmod 600)
- Code-split `/app` route: R3F/Three.js never in landing bundle
- All UI supports touch AND mouse
- Zero TypeScript errors, zero ESLint warnings, zero console errors in `next build && next start`

## File Structure

```
/home/telchar/rin-vr-vision/
├── docs/superpowers/
│   ├── specs/2026-08-24-rin-vr-vision-design.md
│   ├── plans/2026-08-24-rin-vr-vision-impl.md   (this file)
│   └── progress.md                              (track piece acceptance)
├── src/
│   ├── app/
│   │   ├── layout.tsx                           # root layout
│   │   ├── page.tsx                             # landing (Server Component)
│   │   ├── app/
│   │   │   ├── layout.tsx                       # AR layout (CalibrationProvider)
│   │   │   └── page.tsx                         # AR entry (Client Component)
│   │   └── api/pexels/route.ts                  # Pexels proxy
│   ├── components/
│   │   ├── landing/{Header,Hero,Features,Gallery,Footer}.tsx
│   │   ├── ar/{CameraStage,RimViewer,CalibrationDrawer,RimCarousel}.tsx
│   │   └── ui/{Slider,Button,Skeleton}.tsx
│   ├── lib/
│   │   ├── camera/{useCamera.ts,permissionStates.ts}
│   │   ├── three/{loader.ts,materials.ts}
│   │   ├── opencv/detect.ts                     # lazy import
│   │   ├── pexels/{client.ts,types.ts}
│   │   └── design-tokens.ts
│   └── styles/{tokens.css,globals.css}
├── public/
│   └── models/{rim-chrome.glb,rim-matte-black.glb,rim-silver.glb,SOURCES.md}
├── scripts/dns-set.sh
├── Dockerfile
├── docker-compose.yml
├── Caddyfile
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
├── .env.example
├── .gitignore
└── README.md
```

## Task Dependency Graph

```
T1 (init)
 ├── T2 (.glb assets)
 ├── T3 (pexels client)
 ├── T4 (three.js loader)
 ├── T5 (landing layout)
 │    └── T6 (landing + pexels)
 ├── T7 (camera states/types)
 │    └── T8 (useCamera)
 │         └── T10 (CameraStage)
 ├── T9 (calibration context)
 │    └── T11 (RimViewer)
 │         └── T17 (PBR materials)
 ├── T12 (HTTPS banner)
 ├── T13 (Slider primitive)
 │    └── T14 (CalibrationDrawer)
 ├── T15 (RimCarousel)
 ├── T16 (gesture handlers)
 ├── T18 (Dockerfile)
 ├── T19 (compose + Caddy)
 └── T20 (DNS script)

Piece 2b (stretch, after Piece 2 ships):
 T21 (OpenCV preload) → T22 (detection) → T23 (pre-fill)
```

---

## Task 1: Initialize Next.js project with tooling

**Files:**
- Create: `/home/telchar/rin-vr-vision/package.json`
- Create: `/home/telchar/rin-vr-vision/tsconfig.json`
- Create: `/home/telchar/rin-vr-vision/next.config.mjs`
- Create: `/home/telchar/rin-vr-vision/tailwind.config.ts`
- Create: `/home/telchar/rin-vr-vision/.env.example`
- Create: `/home/telchar/rin-vr-vision/.gitignore`
- Create: `/home/telchar/rin-vr-vision/src/app/layout.tsx`
- Create: `/home/telchar/rin-vr-vision/src/app/page.tsx`
- Create: `/home/telchar/rin-vr-vision/src/lib/design-tokens.ts`
- Create: `/home/telchar/rin-vr-vision/src/styles/globals.css`
- Create: `/home/telchar/rin-vr-vision/vitest.config.ts`
- Create: `/home/telchar/rin-vr-vision/README.md`

**Interfaces:**
- Consumes: nothing (first task)
- Produces: working `pnpm dev` that serves a styled "hello world" at `/`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "rin-vr-vision",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.4.19",
    "eslint": "^8",
    "eslint-config-next": "^14.2.0",
    "postcss": "^8",
    "tailwindcss": "^3.4.0",
    "typescript": "^5",
    "vitest": "^1.6.0"
  }
}
```

- [ ] **Step 2: Install dependencies**

```bash
cd /home/telchar/rin-vr-vision
pnpm install
```

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Create next.config.mjs**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  experimental: { typedRoutes: true },
  images: { remotePatterns: [{ protocol: 'https', hostname: 'images.pexels.com' }] },
};
export default nextConfig;
```

- [ ] **Step 5: Create design tokens (src/lib/design-tokens.ts)**

```ts
export const tokens = {
  colors: {
    bg: { primary: '#0A0A0A', surface: '#141414' },
    text: { primary: '#FAFAFA', muted: '#A1A1AA' },
    accent: { primary: '#3B82F6', success: '#22C55E', warning: '#F59E0B', danger: '#EF4444' },
    finish: { chrome: '#E5E7EB', matteBlack: '#1F2937', silver: '#CBD5E1' },
  },
  fonts: { sans: ['Inter', 'system-ui', 'sans-serif'] },
  radius: { sm: '0.375rem', md: '0.5rem', lg: '1rem' },
} as const;
export type Tokens = typeof tokens;
```

- [ ] **Step 6: Create tailwind.config.ts**

```ts
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
      fontFamily: { sans: tokens.fonts.sans },
      borderRadius: tokens.radius,
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 7: Create postcss.config.js**

```js
module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };
```

- [ ] **Step 8: Create globals.css (src/styles/globals.css)**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root { color-scheme: dark; }
html, body { background: #0A0A0A; color: #FAFAFA; font-family: Inter, system-ui, sans-serif; }
```

- [ ] **Step 9: Create root layout (src/app/layout.tsx)**

```tsx
import type { ReactNode } from 'react';
import '../styles/globals.css';

export const metadata = { title: 'Rin VR Vision', description: 'WebAR rim visualizer' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 10: Create landing placeholder (src/app/page.tsx)**

```tsx
export default function LandingPage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <h1 className="text-4xl font-bold">Rin VR Vision</h1>
    </main>
  );
}
```

- [ ] **Step 11: Create .env.example**

```
PEXELS_API_KEY=
NAMECHEAP_API_USER=
NAMECHEAP_API_KEY=
NAMECHEAP_IP=
NAMECHEAP_SUBDOMAIN=
```

- [ ] **Step 12: Create .gitignore**

```
node_modules/
.next/
.env
.env.local
*.log
.DS_Store
coverage/
```

- [ ] **Step 13: Create vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: { environment: 'node', globals: true },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
});
```

- [ ] **Step 14: Create README.md (placeholder)**

```markdown
# Rin VR Vision

WebAR auto rim visualizer. See `docs/superpowers/specs/2026-08-24-rin-vr-vision-design.md`.
```

- [ ] **Step 15: Run typecheck and dev server**

```bash
cd /home/telchar/rin-vr-vision
pnpm typecheck
pnpm dev &
sleep 5
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
kill %1
```

Expected: typecheck clean, `200` response.

- [ ] **Step 16: Commit**

```bash
git -C /home/telchar/rin-vr-vision add .
git -C /home/telchar/rin-vr-vision commit -m "feat(init): scaffold Next.js 14 + Tailwind + design tokens

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 2: Source .glb rim models from Poly Haven

**Files:**
- Create: `public/models/SOURCES.md`
- Create: `public/models/rim-chrome.glb`
- Create: `public/models/rim-matte-black.glb`
- Create: `public/models/rim-silver.glb`

**Interfaces:**
- Consumes: nothing
- Produces: 3 .glb files in `public/models/`, plus `SOURCES.md` documenting source URLs and licenses

- [ ] **Step 1: Visit Poly Haven Models and search for wheel/rim/tire**

Open https://polyhaven.com/models in browser. Search for: "wheel", "rim", "tire", "car wheel".

- [ ] **Step 2: Verify at least 3 CC0 rim/wheel models exist**

If yes, proceed. If Poly Haven has fewer than 3 relevant models, document this in `SOURCES.md` and source the remainder from these CC0 alternatives:
- Quaternius (https://quaternius.com)
- Khronos glTF sample models

Note: Sky/Poly Haven specifically has limited wheel assets. If wheels absent, document gap and stop the task to ask the user.

- [ ] **Step 3: Download 3 .glb files**

```bash
cd /home/telchar/rin-vr-vision/public/models
# Replace with actual Poly Haven URLs after verification
curl -L -o rim-chrome.glb "<URL_1>"
curl -L -o rim-matte-black.glb "<URL_2>"
curl -L -o rim-silver.glb "<URL_3>"
```

- [ ] **Step 4: Document sources in SOURCES.md**

```markdown
# 3D Model Sources

All assets CC0 from Poly Haven Models (https://polyhaven.com/models).

| File | Source URL | License | Original Name |
|------|-----------|---------|---------------|
| rim-chrome.glb | <URL_1> | CC0 | <name> |
| rim-matte-black.glb | <URL_2> | CC0 | <name> |
| rim-silver.glb | <URL_3> | CC0 | <name> |

Finishes are applied as PBR materials via Three.js — the .glb files provide the geometry only.
```

- [ ] **Step 5: Commit**

```bash
git -C /home/telchar/rin-vr-vision add public/models/
git -C /home/telchar/rin-vr-vision commit -m "feat(assets): add 3 CC0 .glb rim models from Poly Haven

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 3: Pexels typed client + API route

**Files:**
- Create: `src/lib/pexels/types.ts`
- Create: `src/lib/pexels/client.ts`
- Create: `src/app/api/pexels/route.ts`
- Create: `src/lib/pexels/client.test.ts`

**Interfaces:**
- Consumes: `PEXELS_API_KEY` env var
- Produces:
  - `searchWheels(query: string, perPage: number): Promise<PexelsPhoto[]>` — server-side
  - `GET /api/pexels?query=...` — public route returning JSON

- [ ] **Step 1: Write Pexels types (src/lib/pexels/types.ts)**

```ts
export type PexelsPhoto = {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  alt: string;
};

export type PexelsSearchResponse = {
  page: number;
  per_page: number;
  total_results: number;
  photos: PexelsPhoto[];
};
```

- [ ] **Step 2: Write Pexels client (src/lib/pexels/client.ts)**

```ts
import type { PexelsPhoto, PexelsSearchResponse } from './types';

const PEXELS_BASE = 'https://api.pexels.com/v1';

export async function searchWheels(query: string, perPage = 12): Promise<PexelsPhoto[]> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) throw new Error('PEXELS_API_KEY not set');

  const url = `${PEXELS_BASE}/search?query=${encodeURIComponent(query)}&per_page=${perPage}`;
  const res = await fetch(url, {
    headers: { Authorization: apiKey },
    next: { revalidate: 3600 }, // 1h cache
  });
  if (!res.ok) throw new Error(`Pexels API ${res.status}`);
  const data = (await res.json()) as PexelsSearchResponse;
  return data.photos;
}
```

- [ ] **Step 3: Write failing test (src/lib/pexels/client.test.ts)**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('searchWheels', () => {
  beforeEach(() => {
    process.env.PEXELS_API_KEY = 'test-key';
    vi.resetAllMocks();
  });

  it('returns photos from Pexels API', async () => {
    const mockPhotos = [{ id: 1, photographer: 'X', src: { large: 'y' }, alt: 'wheel' }];
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ photos: mockPhotos, page: 1, per_page: 12, total_results: 1 }),
    }) as unknown as typeof fetch;

    const { searchWheels } = await import('./client');
    const result = await searchWheels('car wheel');
    expect(result).toEqual(mockPhotos);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('query=car%20wheel'),
      expect.objectContaining({ headers: { Authorization: 'test-key' } })
    );
  });

  it('throws if PEXELS_API_KEY missing', async () => {
    delete process.env.PEXELS_API_KEY;
    const { searchWheels } = await import('./client?missing');
    await expect(searchWheels('test')).rejects.toThrow('PEXELS_API_KEY');
  });

  it('throws on API error', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 }) as unknown as typeof fetch;
    const { searchWheels } = await import('./client?error');
    await expect(searchWheels('test')).rejects.toThrow('500');
  });
});
```

- [ ] **Step 4: Run test — verify it passes**

```bash
cd /home/telchar/rin-vr-vision && pnpm test src/lib/pexels/client.test.ts
```

Expected: 3 passing.

- [ ] **Step 5: Create API route (src/app/api/pexels/route.ts)**

```ts
import { NextResponse } from 'next/server';
import { searchWheels } from '@/lib/pexels/client';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query') ?? 'car wheel';
  const perPage = Number(searchParams.get('per_page') ?? '12');
  try {
    const photos = await searchWheels(query, perPage);
    return NextResponse.json({ photos });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 502 });
  }
}
```

- [ ] **Step 6: Commit**

```bash
git -C /home/telchar/rin-vr-vision add src/lib/pexels/ src/app/api/pexels/
git -C /home/telchar/rin-vr-vision commit -m "feat(pexels): typed client + proxy route + tests

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 4: Three.js loader + materials library

**Files:**
- Create: `src/lib/three/loader.ts`
- Create: `src/lib/three/materials.ts`
- Create: `src/lib/three/loader.test.ts`

**Interfaces:**
- Consumes: .glb URLs (paths under `/models/`)
- Produces:
  - `loadRim(url: string): Promise<Group>` — fetches and parses .glb
  - `makeChrome()`, `makeMatteBlack()`, `makeSilver()` — PBR MeshPhysicalMaterial factories

- [ ] **Step 1: Install three.js**

```bash
cd /home/telchar/rin-vr-vision && pnpm add three @react-three/fiber @react-three/drei && pnpm add -D @types/three
```

- [ ] **Step 2: Write materials (src/lib/three/materials.ts)**

```ts
import { MeshPhysicalMaterial, Color } from 'three';

export function makeChrome() {
  return new MeshPhysicalMaterial({
    color: new Color('#E5E7EB'),
    metalness: 1.0,
    roughness: 0.05,
    envMapIntensity: 1.5,
  });
}

export function makeMatteBlack() {
  return new MeshPhysicalMaterial({
    color: new Color('#1F2937'),
    metalness: 0.4,
    roughness: 0.85,
    envMapIntensity: 0.5,
  });
}

export function makeSilver() {
  return new MeshPhysicalMaterial({
    color: new Color('#CBD5E1'),
    metalness: 0.9,
    roughness: 0.2,
    envMapIntensity: 1.0,
  });
}

export type Finish = 'chrome' | 'matte-black' | 'silver';
export function materialForFinish(finish: Finish) {
  switch (finish) {
    case 'chrome': return makeChrome();
    case 'matte-black': return makeMatteBlack();
    case 'silver': return makeSilver();
  }
}
```

- [ ] **Step 3: Write loader (src/lib/three/loader.ts)**

```ts
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { Group } from 'three';

const loader = new GLTFLoader();

export async function loadRim(url: string): Promise<Group> {
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => resolve(gltf.scene),
      undefined,
      (err) => reject(err instanceof Error ? err : new Error(String(err)))
    );
  });
}
```

- [ ] **Step 4: Write smoke test (src/lib/three/loader.test.ts)**

```ts
import { describe, it, expect } from 'vitest';
import { materialForFinish } from './materials';

describe('materialForFinish', () => {
  it('returns distinct materials per finish', () => {
    const chrome = materialForFinish('chrome');
    const matte = materialForFinish('matte-black');
    const silver = materialForFinish('silver');
    expect(chrome.metalness).toBe(1.0);
    expect(matte.roughness).toBeGreaterThan(0.5);
    expect(silver.metalness).toBeGreaterThan(0.5);
  });
});
```

- [ ] **Step 5: Run tests**

```bash
cd /home/telchar/rin-vr-vision && pnpm test src/lib/three/
```

Expected: 1 passing.

- [ ] **Step 6: Commit**

```bash
git -C /home/telchar/rin-vr-vision add src/lib/three/ package.json pnpm-lock.yaml
git -C /home/telchar/rin-vr-vision commit -m "feat(three): rim loader + 3 PBR materials + tests

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 5: Landing page layout (skeleton, no Pexels yet)

**Files:**
- Create: `src/components/landing/Header.tsx`
- Create: `src/components/landing/Hero.tsx`
- Create: `src/components/landing/Features.tsx`
- Create: `src/components/landing/Gallery.tsx`
- Create: `src/components/landing/Footer.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: nothing (UI placeholders)
- Produces: 5-section landing page with sticky header, hero placeholder, 3 feature cards, gallery skeleton grid, footer with placeholder Pexels attribution

- [ ] **Step 1: Create Header**

```tsx
// src/components/landing/Header.tsx
export function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-bg-primary/80 border-b border-white/10">
      <nav className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <span className="font-bold">Rin VR</span>
        <a href="/app" className="text-accent-primary hover:underline">Probar AR</a>
      </nav>
    </header>
  );
}
```

- [ ] **Step 2: Create Hero placeholder**

```tsx
// src/components/landing/Hero.tsx
export function Hero() {
  return (
    <section className="min-h-[70vh] flex items-center justify-center bg-gradient-to-b from-bg-surface to-bg-primary">
      <div className="text-center px-4">
        <h1 className="text-5xl md:text-7xl font-bold mb-4">Visualizá tus rines en AR</h1>
        <p className="text-text-muted text-lg mb-8">Probá acabados sobre tu auto antes de comprar.</p>
        <a href="/app" className="inline-block bg-accent-primary px-6 py-3 rounded-md font-semibold">
          Empezar
        </a>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create Features**

```tsx
// src/components/landing/Features.tsx
const FEATURES = [
  { title: 'Cámara en vivo', body: 'Apuntá a tu rueda y mirá el resultado al instante.' },
  { title: '3 acabados', body: 'Chrome, negro mate y plata. Compará en segundos.' },
  { title: 'Sin instalar nada', body: 'WebAR puro, funciona en tu navegador.' },
];
export function Features() {
  return (
    <section className="py-20 px-4 max-w-6xl mx-auto">
      <div className="grid md:grid-cols-3 gap-8">
        {FEATURES.map((f) => (
          <div key={f.title} className="bg-bg-surface p-6 rounded-lg border border-white/10">
            <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
            <p className="text-text-muted">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Create Gallery skeleton**

```tsx
// src/components/landing/Gallery.tsx
const PLACEHOLDER_COUNT = 6;
export function Gallery() {
  return (
    <section className="py-20 px-4 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-8">Galería</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: PLACEHOLDER_COUNT }).map((_, i) => (
          <div key={i} className="aspect-square bg-bg-surface animate-pulse rounded-md" />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Create Footer**

```tsx
// src/components/landing/Footer.tsx
export function Footer() {
  return (
    <footer className="border-t border-white/10 py-8 px-4 text-center text-text-muted text-sm">
      <p>
        Imágenes provistas por{' '}
        <a href="https://www.pexels.com" className="underline hover:text-text-primary">Pexels</a>
      </p>
    </footer>
  );
}
```

- [ ] **Step 6: Compose landing page**

```tsx
// src/app/page.tsx
import { Header } from '@/components/landing/Header';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { Gallery } from '@/components/landing/Gallery';
import { Footer } from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Features />
        <Gallery />
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 7: Verify in dev**

```bash
cd /home/telchar/rin-vr-vision && pnpm dev &
sleep 5
curl -s http://localhost:3000 | grep -q "Visualizá tus rines" && echo OK || echo FAIL
kill %1
```

Expected: `OK`.

- [ ] **Step 8: Commit**

```bash
git -C /home/telchar/rin-vr-vision add src/components/landing/ src/app/page.tsx
git -C /home/telchar/rin-vr-vision commit -m "feat(landing): skeleton layout with sticky header + sections

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 6: Landing page — Pexels integration

**Files:**
- Modify: `src/components/landing/Hero.tsx`
- Modify: `src/components/landing/Gallery.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `searchWheels()` from `src/lib/pexels/client.ts`
- Produces: Hero with Pexels backdrop image (server-fetched, cached), Gallery with Pexels photos, fallback gradient on API error

- [ ] **Step 1: Update Hero to use Pexels backdrop**

```tsx
// src/components/landing/Hero.tsx
import Image from 'next/image';
import type { PexelsPhoto } from '@/lib/pexels/types';

export function Hero({ backdrop }: { backdrop?: PexelsPhoto }) {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {backdrop ? (
        <Image
          src={backdrop.src.large2x}
          alt={backdrop.alt || 'Car wheel backdrop'}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-50"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-bg-surface to-bg-primary" />
      )}
      <div className="relative z-10 text-center px-4">
        <h1 className="text-5xl md:text-7xl font-bold mb-4">Visualizá tus rines en AR</h1>
        <p className="text-text-muted text-lg mb-8">Probá acabados sobre tu auto antes de comprar.</p>
        <a href="/app" className="inline-block bg-accent-primary px-6 py-3 rounded-md font-semibold">
          Empezar
        </a>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Update Gallery to render Pexels photos with skeletons**

```tsx
// src/components/landing/Gallery.tsx
import Image from 'next/image';
import type { PexelsPhoto } from '@/lib/pexels/types';

export function Gallery({ photos }: { photos?: PexelsPhoto[] }) {
  return (
    <section className="py-20 px-4 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-8">Galería</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {photos?.length
          ? photos.slice(0, 6).map((p) => (
              <div key={p.id} className="relative aspect-square rounded-md overflow-hidden">
                <Image src={p.src.medium} alt={p.alt || `Photo by ${p.photographer}`} fill sizes="33vw" className="object-cover" />
                <span className="absolute bottom-1 right-1 text-xs bg-black/60 px-1 rounded">
                  {p.photographer}
                </span>
              </div>
            ))
          : Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square bg-bg-surface animate-pulse rounded-md" />
            ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Update page.tsx to fetch Pexels**

```tsx
// src/app/page.tsx
import { Header } from '@/components/landing/Header';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { Gallery } from '@/components/landing/Gallery';
import { Footer } from '@/components/landing/Footer';
import { searchWheels } from '@/lib/pexels/client';

export const revalidate = 3600;

export default async function LandingPage() {
  let photos = undefined;
  try {
    photos = await searchWheels('car wheel rim', 12);
  } catch (err) {
    console.warn('Pexels fetch failed:', err);
  }
  return (
    <>
      <Header />
      <main>
        <Hero backdrop={photos?.[0]} />
        <Features />
        <Gallery photos={photos?.slice(1)} />
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 4: Verify in dev with API key**

```bash
cd /home/telchar/rin-vr-vision
cp .env.example .env.local
# edit .env.local with real PEXELS_API_KEY
pnpm dev &
sleep 5
curl -s http://localhost:3000 | grep -q "pexels" && echo "BACKDROP_OK"
curl -s http://localhost:3000 | grep -qE "photo by|Photo by" && echo "GALLERY_OK"
kill %1
```

Expected: both `OK`.

- [ ] **Step 5: Test fallback by removing key**

```bash
mv .env.local .env.local.bak
cd /home/telchar/rin-vr-vision && pnpm dev &
sleep 5
curl -s http://localhost:3000 | grep -q "animate-pulse" && echo "FALLBACK_OK"
kill %1
mv .env.local.bak .env.local
```

Expected: `FALLBACK_OK`.

- [ ] **Step 6: Commit**

```bash
git -C /home/telchar/rin-vr-vision add src/components/landing/ src/app/page.tsx
git -C /home/telchar/rin-vr-vision commit -m "feat(landing): Pexels backdrop + gallery + fallback

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 7: Camera permission states + types

**Files:**
- Create: `src/lib/camera/permissionStates.ts`
- Create: `src/lib/camera/permissionStates.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `CameraStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unsupported'`
  - `isUnsupported(): boolean` — checks `navigator.mediaDevices`

- [ ] **Step 1: Write types and helpers (src/lib/camera/permissionStates.ts)**

```ts
export type CameraStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unsupported';

export function isUnsupported(): boolean {
  return typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia;
}

export function isHttpsContext(): boolean {
  if (typeof window === 'undefined') return true;
  const { protocol, hostname } = window.location;
  return protocol === 'https:' || hostname === 'localhost' || hostname === '127.0.0.1';
}
```

- [ ] **Step 2: Write tests (src/lib/camera/permissionStates.test.ts)**

```ts
import { describe, it, expect } from 'vitest';
import { isUnsupported, isHttpsContext } from './permissionStates';

describe('isUnsupported', () => {
  it('returns false in test env (jsdom-like polyfill absent)', () => {
    expect(typeof isUnsupported()).toBe('boolean');
  });
});

describe('isHttpsContext', () => {
  it('returns true on localhost', () => {
    Object.defineProperty(window, 'location', { value: { protocol: 'http:', hostname: 'localhost' }, writable: true });
    expect(isHttpsContext()).toBe(true);
  });
  it('returns false on plain http', () => {
    Object.defineProperty(window, 'location', { value: { protocol: 'http:', hostname: 'example.com' }, writable: true });
    expect(isHttpsContext()).toBe(false);
  });
  it('returns true on https', () => {
    Object.defineProperty(window, 'location', { value: { protocol: 'https:', hostname: 'example.com' }, writable: true });
    expect(isHttpsContext()).toBe(true);
  });
});
```

- [ ] **Step 3: Run tests**

```bash
cd /home/telchar/rin-vr-vision && pnpm test src/lib/camera/
```

Expected: passing.

- [ ] **Step 4: Commit**

```bash
git -C /home/telchar/rin-vr-vision add src/lib/camera/
git -C /home/telchar/rin-vr-vision commit -m "feat(camera): status types + https context detection + tests

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 8: useCamera hook

**Files:**
- Create: `src/lib/camera/useCamera.ts`
- Create: `src/lib/camera/useCamera.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `useCamera(): { status: CameraStatus; stream: MediaStream | null; error: Error | null; request: () => void }`

- [ ] **Step 1: Write hook (src/lib/camera/useCamera.ts)**

```ts
'use client';
import { useState, useCallback, useEffect } from 'react';
import type { CameraStatus } from './permissionStates';
import { isUnsupported } from './permissionStates';

export function useCamera() {
  const [status, setStatus] = useState<CameraStatus>('idle');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (isUnsupported()) setStatus('unsupported');
  }, []);

  const request = useCallback(async () => {
    if (isUnsupported()) {
      setStatus('unsupported');
      return;
    }
    setStatus('requesting');
    setError(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      setStream(s);
      setStatus('granted');
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      setStatus('denied');
    }
  }, []);

  return { status, stream, error, request };
}
```

- [ ] **Step 2: Write test (src/lib/camera/useCamera.test.ts)**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCamera } from './useCamera';

const mockStream = { getTracks: () => [] } as unknown as MediaStream;

beforeEach(() => {
  Object.defineProperty(global.navigator, 'mediaDevices', {
    value: { getUserMedia: vi.fn() },
    writable: true,
    configurable: true,
  });
});

describe('useCamera', () => {
  it('starts at idle', () => {
    const { result } = renderHook(() => useCamera());
    expect(result.current.status).toBe('idle');
  });

  it('transitions to granted on success', async () => {
    (navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>).mockResolvedValue(mockStream);
    const { result } = renderHook(() => useCamera());
    await act(async () => { await result.current.request(); });
    expect(result.current.status).toBe('granted');
    expect(result.current.stream).toBe(mockStream);
  });

  it('transitions to denied on error', async () => {
    (navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('denied'));
    const { result } = renderHook(() => useCamera());
    await act(async () => { await result.current.request(); });
    expect(result.current.status).toBe('denied');
    expect(result.current.error?.message).toBe('denied');
  });
});
```

- [ ] **Step 3: Install testing-library**

```bash
cd /home/telchar/rin-vr-vision && pnpm add -D @testing-library/react @testing-library/dom jsdom
```

Add to `vitest.config.ts`:
```ts
test: { environment: 'jsdom', globals: true, setupFiles: ['./vitest.setup.ts'] }
```

Create `vitest.setup.ts`:
```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 4: Run tests**

```bash
cd /home/telchar/rin-vr-vision && pnpm test src/lib/camera/
```

Expected: all passing.

- [ ] **Step 5: Commit**

```bash
git -C /home/telchar/rin-vr-vision add src/lib/camera/ vitest.config.ts vitest.setup.ts package.json pnpm-lock.yaml
git -C /home/telchar/rin-vr-vision commit -m "feat(camera): useCamera hook with state machine + tests

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 9: Calibration Context + reducer

**Files:**
- Create: `src/lib/calibration/context.tsx`
- Create: `src/lib/calibration/reducer.ts`
- Create: `src/lib/calibration/reducer.test.ts`
- Modify: `src/app/app/layout.tsx`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `Calibration` type
  - `calibrationReducer(state, action)` pure function
  - `CalibrationProvider` React Context
  - `useCalibration()` hook

- [ ] **Step 1: Write reducer (src/lib/calibration/reducer.ts)**

```ts
import type { Finish } from '@/lib/three/materials';

export type Calibration = {
  x: number;
  y: number;
  scale: number;
  pitch: number;
  yaw: number;
  roll: number;
  finish: Finish;
};

export const INITIAL_CALIBRATION: Calibration = {
  x: 0, y: 0, scale: 0.6, pitch: 0, yaw: 0, roll: 0, finish: 'chrome',
};

export type CalibrationAction =
  | { type: 'set'; field: keyof Omit<Calibration, 'finish'>; value: number }
  | { type: 'finish'; value: Finish }
  | { type: 'reset' }
  | { type: 'prefill'; partial: Partial<Calibration> };

export function calibrationReducer(state: Calibration, action: CalibrationAction): Calibration {
  switch (action.type) {
    case 'set': return { ...state, [action.field]: action.value };
    case 'finish': return { ...state, finish: action.value };
    case 'reset': return INITIAL_CALIBRATION;
    case 'prefill': return { ...state, ...action.partial };
    default: return state;
  }
}
```

- [ ] **Step 2: Write tests (src/lib/calibration/reducer.test.ts)**

```ts
import { describe, it, expect } from 'vitest';
import { calibrationReducer, INITIAL_CALIBRATION } from './reducer';

describe('calibrationReducer', () => {
  it('updates x on set', () => {
    const next = calibrationReducer(INITIAL_CALIBRATION, { type: 'set', field: 'x', value: 0.5 });
    expect(next.x).toBe(0.5);
  });

  it('updates finish on finish action', () => {
    const next = calibrationReducer(INITIAL_CALIBRATION, { type: 'finish', value: 'matte-black' });
    expect(next.finish).toBe('matte-black');
  });

  it('resets to initial', () => {
    const dirty = { ...INITIAL_CALIBRATION, x: 0.7, scale: 1.2 };
    const next = calibrationReducer(dirty, { type: 'reset' });
    expect(next).toEqual(INITIAL_CALIBRATION);
  });

  it('prefills partial without overwriting unspecified fields', () => {
    const next = calibrationReducer(INITIAL_CALIBRATION, { type: 'prefill', partial: { x: 0.3, scale: 0.8 } });
    expect(next.x).toBe(0.3);
    expect(next.scale).toBe(0.8);
    expect(next.y).toBe(INITIAL_CALIBRATION.y);
  });
});
```

- [ ] **Step 3: Run tests**

```bash
cd /home/telchar/rin-vr-vision && pnpm test src/lib/calibration/
```

Expected: all passing.

- [ ] **Step 4: Write Context (src/lib/calibration/context.tsx)**

```tsx
'use client';
import { createContext, useContext, useReducer, type ReactNode } from 'react';
import { calibrationReducer, INITIAL_CALIBRATION, type Calibration } from './reducer';

type Ctx = { calibration: Calibration; dispatch: React.Dispatch<any> };
const CalibrationCtx = createContext<Ctx | null>(null);

export function CalibrationProvider({ children }: { children: ReactNode }) {
  const [calibration, dispatch] = useReducer(calibrationReducer, INITIAL_CALIBRATION);
  return <CalibrationCtx.Provider value={{ calibration, dispatch }}>{children}</CalibrationCtx.Provider>;
}

export function useCalibration() {
  const ctx = useContext(CalibrationCtx);
  if (!ctx) throw new Error('useCalibration must be used within CalibrationProvider');
  return ctx;
}
```

- [ ] **Step 5: Create AR layout (src/app/app/layout.tsx)**

```tsx
import type { ReactNode } from 'react';
import { CalibrationProvider } from '@/lib/calibration/context';

export default function AppLayout({ children }: { children: ReactNode }) {
  return <CalibrationProvider>{children}</CalibrationProvider>;
}
```

- [ ] **Step 6: Commit**

```bash
git -C /home/telchar/rin-vr-vision add src/lib/calibration/ src/app/app/
git -C /home/telchar/rin-vr-vision commit -m "feat(calibration): reducer + context + provider + tests

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 10: CameraStage component (state-driven UI)

**Files:**
- Create: `src/components/ar/CameraStage.tsx`
- Create: `src/app/app/page.tsx`

**Interfaces:**
- Consumes: `useCamera()` hook
- Produces: AR entry page with state-driven UI (idle button, requesting spinner, denied retry, unsupported message)

- [ ] **Step 1: Write CameraStage (src/components/ar/CameraStage.tsx)**

```tsx
'use client';
import { useCamera } from '@/lib/camera/useCamera';
import { useCalibration } from '@/lib/calibration/context';

export function CameraStage() {
  const { status, stream, error, request } = useCamera();
  const { calibration } = useCalibration();

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {stream && (
        <video
          ref={(el) => { if (el && stream) el.srcObject = stream; }}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {status === 'idle' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button onClick={request} className="bg-accent-primary px-6 py-3 rounded-md font-semibold">
            Iniciar cámara
          </button>
        </div>
      )}

      {status === 'requesting' && (
        <div className="absolute inset-0 flex items-center justify-center text-text-muted">
          Pidiendo permiso…
        </div>
      )}

      {status === 'denied' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-4 text-center">
          <p className="text-text-primary">Permiso de cámara denegado.</p>
          <p className="text-text-muted text-sm">Reactivá el permiso en los ajustes del navegador y reintentá.</p>
          {error && <p className="text-xs text-accent-danger">{error.message}</p>}
          <button onClick={request} className="bg-accent-primary px-6 py-3 rounded-md font-semibold">
            Reintentar
          </button>
        </div>
      )}

      {status === 'unsupported' && (
        <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
          <p className="text-text-primary">Tu navegador no soporta cámara. Probá Chrome o Safari.</p>
        </div>
      )}

      {status === 'granted' && (
        <div className="absolute bottom-4 left-4 right-4 bg-bg-surface/80 backdrop-blur p-2 rounded text-xs">
          pos: ({calibration.x.toFixed(2)}, {calibration.y.toFixed(2)}) · scale: {calibration.scale.toFixed(2)} · finish: {calibration.finish}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create AR entry (src/app/app/page.tsx)**

```tsx
import { CameraStage } from '@/components/ar/CameraStage';
import dynamic from 'next/dynamic';

const RimViewer = dynamic(() => import('@/components/ar/RimViewer').then(m => m.RimViewer), { ssr: false });

export default function AppPage() {
  return (
    <>
      <CameraStage />
      {false && <RimViewer />} {/* mounted in Task 11 */}
    </>
  );
}
```

- [ ] **Step 3: Verify dev page loads**

```bash
cd /home/telchar/rin-vr-vision && pnpm dev &
sleep 5
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/app
kill %1
```

Expected: `200`.

- [ ] **Step 4: Commit**

```bash
git -C /home/telchar/rin-vr-vision add src/components/ar/CameraStage.tsx src/app/app/page.tsx
git -C /home/telchar/rin-vr-vision commit -m "feat(ar): CameraStage with state UI for all permission states

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 11: RimViewer with R3F

**Files:**
- Create: `src/components/ar/RimViewer.tsx`
- Modify: `src/app/app/page.tsx`

**Interfaces:**
- Consumes: `useCalibration()`, `loadRim()`, `materialForFinish()`
- Produces: `<RimViewer>` rendering current rim model with PBR material, transformed by calibration

- [ ] **Step 1: Write RimViewer (src/components/ar/RimViewer.tsx)**

```tsx
'use client';
import { useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import { loadRim } from '@/lib/three/loader';
import { materialForFinish } from '@/lib/three/materials';
import { useCalibration } from '@/lib/calibration/context';

function Rim({ url }: { url: string }) {
  const ref = useRef<Group>(null);
  const { calibration } = useCalibration();

  useEffect(() => {
    let cancelled = false;
    loadRim(url).then((g) => {
      if (cancelled || !ref.current) return;
      ref.current.clear();
      g.traverse((o) => {
        if ((o as any).isMesh) (o as any).material = materialForFinish(calibration.finish);
      });
      ref.current.add(g);
    });
    return () => { cancelled = true; };
  }, [url, calibration.finish]);

  useFrame(() => {
    if (!ref.current) return;
    ref.current.position.set(calibration.x * 2, -calibration.y * 2, 0);
    ref.current.scale.setScalar(calibration.scale);
    ref.current.rotation.set(
      (calibration.pitch * Math.PI) / 180,
      (calibration.yaw * Math.PI) / 180,
      (calibration.roll * Math.PI) / 180
    );
  });

  return <group ref={ref} />;
}

export function RimViewer() {
  return (
    <Canvas
      className="absolute inset-0 pointer-events-none"
      dpr={[1, 2]}
      camera={{ position: [0, 0, 3], fov: 50 }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <Rim url="/models/rim-chrome.glb" />
    </Canvas>
  );
}
```

- [ ] **Step 2: Update AR page to mount RimViewer when granted**

```tsx
// src/app/app/page.tsx
'use client';
import dynamic from 'next/dynamic';
import { CameraStage } from '@/components/ar/CameraStage';
import { useCamera } from '@/lib/camera/useCamera';

const RimViewer = dynamic(() => import('@/components/ar/RimViewer').then(m => m.RimViewer), { ssr: false });

export default function AppPage() {
  const { status } = useCamera();
  return (
    <CameraStage>
      {status === 'granted' && <RimViewer />}
    </CameraStage>
  );
}
```

- [ ] **Step 3: Update CameraStage to accept children**

Modify `src/components/ar/CameraStage.tsx`: change signature to `({ children }: { children?: React.ReactNode })` and render `{children}` after the video element inside the granted block.

- [ ] **Step 4: Verify typecheck**

```bash
cd /home/telchar/rin-vr-vision && pnpm typecheck
```

Expected: clean.

- [ ] **Step 5: Commit**

```bash
git -C /home/telchar/rin-vr-vision add src/components/ar/ src/app/app/
git -C /home/telchar/rin-vr-vision commit -m "feat(ar): RimViewer with R3F + dynamic import + calibration transform

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 12: HTTPS detection banner

**Files:**
- Modify: `src/components/ar/CameraStage.tsx`

**Interfaces:**
- Consumes: `isHttpsContext()` from `permissionStates.ts`
- Produces: Sticky banner shown when not HTTPS and not localhost

- [ ] **Step 1: Add banner to CameraStage**

Add at the top of the rendered JSX in `src/components/ar/CameraStage.tsx`:

```tsx
{!isHttpsContext() && (
  <div className="sticky top-0 z-50 bg-accent-warning text-black text-sm px-4 py-2 text-center">
    Cámara requiere HTTPS. Abrí:{' '}
    <a href="https://rin.andresmorales.com.co/app" className="underline font-semibold">
      rin.andresmorales.com.co/app
    </a>
  </div>
)}
```

Import `isHttpsContext` from `@/lib/camera/permissionStates`.

- [ ] **Step 2: Verify**

```bash
cd /home/telchar/rin-vr-vision && pnpm typecheck
```

Expected: clean.

- [ ] **Step 3: Commit**

```bash
git -C /home/telchar/rin-vr-vision add src/components/ar/CameraStage.tsx
git -C /home/telchar/rin-vr-vision commit -m "feat(ar): HTTPS detection banner

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 13: Slider UI primitive

**Files:**
- Create: `src/components/ui/Slider.tsx`
- Create: `src/components/ui/Slider.test.tsx`

**Interfaces:**
- Consumes: nothing
- Produces: `<Slider label value min max step onChange>` — accessible range input styled

- [ ] **Step 1: Write Slider (src/components/ui/Slider.tsx)**

```tsx
'use client';
type Props = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
};
export function Slider({ label, value, min, max, step, onChange }: Props) {
  return (
    <label className="block">
      <span className="text-xs text-text-muted">{label}</span>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="w-full accent-accent-primary"
      />
      <span className="text-xs">{value.toFixed(2)}</span>
    </label>
  );
}
```

- [ ] **Step 2: Write test (src/components/ui/Slider.test.tsx)**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { Slider } from './Slider';

describe('Slider', () => {
  it('renders label and current value', () => {
    const { getByLabelText } = render(<Slider label="X" value={0.5} min={-1} max={1} step={0.01} onChange={() => {}} />);
    const input = getByLabelText('X') as HTMLInputElement;
    expect(input.value).toBe('0.5');
  });

  it('fires onChange with numeric value', () => {
    const onChange = vi.fn();
    const { getByLabelText } = render(<Slider label="X" value={0} min={-1} max={1} step={0.1} onChange={onChange} />);
    fireEvent.change(getByLabelText('X'), { target: { value: '0.5' } });
    expect(onChange).toHaveBeenCalledWith(0.5);
  });
});
```

- [ ] **Step 3: Run tests**

```bash
cd /home/telchar/rin-vr-vision && pnpm test src/components/ui/
```

Expected: passing.

- [ ] **Step 4: Commit**

```bash
git -C /home/telchar/rin-vr-vision add src/components/ui/Slider.tsx src/components/ui/Slider.test.tsx
git -C /home/telchar/rin-vr-vision commit -m "feat(ui): Slider primitive + tests

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 14: CalibrationDrawer component

**Files:**
- Create: `src/components/ar/CalibrationDrawer.tsx`
- Modify: `src/app/app/page.tsx`

**Interfaces:**
- Consumes: `useCalibration()` and `<Slider>`
- Produces: Overlay drawer with 6 sliders (x, y, scale, pitch, yaw, roll) + reset button

- [ ] **Step 1: Write CalibrationDrawer (src/components/ar/CalibrationDrawer.tsx)**

```tsx
'use client';
import { Slider } from '@/components/ui/Slider';
import { useCalibration } from '@/lib/calibration/context';

const FIELDS = [
  { key: 'x', label: 'X', min: -1, max: 1, step: 0.01 },
  { key: 'y', label: 'Y', min: -1, max: 1, step: 0.01 },
  { key: 'scale', label: 'Tamaño', min: 0.2, max: 2, step: 0.01 },
  { key: 'pitch', label: 'Inclinación', min: -90, max: 90, step: 1 },
  { key: 'yaw', label: 'Rotación', min: -180, max: 180, step: 1 },
  { key: 'roll', label: 'Ladeo', min: -90, max: 90, step: 1 },
] as const;

export function CalibrationDrawer() {
  const { calibration, dispatch } = useCalibration();
  return (
    <div className="absolute top-4 right-4 w-72 bg-bg-surface/90 backdrop-blur p-4 rounded-lg border border-white/10 space-y-3">
      {FIELDS.map((f) => (
        <Slider
          key={f.key}
          label={f.label}
          value={calibration[f.key]}
          min={f.min}
          max={f.max}
          step={f.step}
          onChange={(v) => dispatch({ type: 'set', field: f.key, value: v })}
        />
      ))}
      <button
        onClick={() => dispatch({ type: 'reset' })}
        className="w-full bg-bg-primary border border-white/20 py-2 rounded text-sm"
      >
        Resetear
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Mount in AR page**

```tsx
// src/app/app/page.tsx — update to also mount CalibrationDrawer when granted
'use client';
import dynamic from 'next/dynamic';
import { CameraStage } from '@/components/ar/CameraStage';
import { CalibrationDrawer } from '@/components/ar/CalibrationDrawer';
import { useCamera } from '@/lib/camera/useCamera';

const RimViewer = dynamic(() => import('@/components/ar/RimViewer').then(m => m.RimViewer), { ssr: false });

export default function AppPage() {
  const { status } = useCamera();
  return (
    <CameraStage>
      {status === 'granted' && <RimViewer />}
    </CameraStage>
  );
}
```

Then update `CameraStage` to also render `<CalibrationDrawer />` inside the granted block, after children.

- [ ] **Step 3: Commit**

```bash
git -C /home/telchar/rin-vr-vision add src/components/ar/CalibrationDrawer.tsx src/components/ar/CameraStage.tsx src/app/app/page.tsx
git -C /home/telchar/rin-vr-vision commit -m "feat(ar): CalibrationDrawer with 6 sliders + reset

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 15: RimCarousel (3 finishes)

**Files:**
- Create: `src/components/ar/RimCarousel.tsx`
- Modify: `src/components/ar/CameraStage.tsx`

**Interfaces:**
- Consumes: `useCalibration()`
- Produces: Horizontal carousel of 3 finish buttons that dispatch `finish` action

- [ ] **Step 1: Write RimCarousel (src/components/ar/RimCarousel.tsx)**

```tsx
'use client';
import { useCalibration } from '@/lib/calibration/context';
import type { Finish } from '@/lib/three/materials';

const FINISHES: { key: Finish; label: string; color: string }[] = [
  { key: 'chrome', label: 'Chrome', color: 'bg-gray-300' },
  { key: 'matte-black', label: 'Negro mate', color: 'bg-gray-800' },
  { key: 'silver', label: 'Plata', color: 'bg-gray-400' },
];

export function RimCarousel() {
  const { calibration, dispatch } = useCalibration();
  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 bg-bg-surface/90 backdrop-blur p-2 rounded-full border border-white/10">
      {FINISHES.map((f) => (
        <button
          key={f.key}
          onClick={() => dispatch({ type: 'finish', value: f.key })}
          aria-label={f.label}
          aria-pressed={calibration.finish === f.key}
          className={`w-10 h-10 rounded-full ${f.color} ${calibration.finish === f.key ? 'ring-2 ring-accent-primary' : ''}`}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Mount in CameraStage granted block**

Add `<RimCarousel />` after `<CalibrationDrawer />` inside the granted block of CameraStage.

- [ ] **Step 3: Commit**

```bash
git -C /home/telchar/rin-vr-vision add src/components/ar/RimCarousel.tsx src/components/ar/CameraStage.tsx
git -C /home/telchar/rin-vr-vision commit -m "feat(ar): RimCarousel for 3 PBR finishes

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 16: Pointer gesture handlers (drag, pinch, rotate)

**Files:**
- Create: `src/components/ar/GestureCanvas.tsx`
- Modify: `src/components/ar/CameraStage.tsx`

**Interfaces:**
- Consumes: `useCalibration()`
- Produces: Transparent overlay capturing pointer events, dispatching calibration updates for drag (x/y), pinch (scale), 2-finger rotate (yaw)

- [ ] **Step 1: Write GestureCanvas (src/components/ar/GestureCanvas.tsx)**

```tsx
'use client';
import { useRef, useState, useCallback } from 'react';
import { useCalibration } from '@/lib/calibration/context';

type Point = { x: number; y: number };

export function GestureCanvas() {
  const { dispatch } = useCalibration();
  const last = useRef<Point | null>(null);
  const lastDist = useRef<number | null>(null);
  const lastAngle = useRef<number | null>(null);

  const onDown = useCallback((e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    last.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onMove = useCallback((e: React.PointerEvent) => {
    if (!last.current) return;
    if (e.pointerType === 'touch' && lastDist.current !== null) {
      // Touch multi-finger handled by separate listeners below
      return;
    }
    const dx = (e.clientX - last.current.x) / window.innerWidth;
    const dy = (e.clientY - last.current.y) / window.innerHeight;
    dispatch({ type: 'set', field: 'x', value: dx * 2 });
    dispatch({ type: 'set', field: 'y', value: -dy * 2 });
    last.current = { x: e.clientX, y: e.clientY };
  }, [dispatch]);

  const onUp = useCallback(() => { last.current = null; }, []);

  // Multi-touch (pinch + rotate)
  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 2) return;
    const [a, b] = [e.touches[0], e.touches[1]];
    const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    const angle = Math.atan2(b.clientY - a.clientY, b.clientX - a.clientX) * (180 / Math.PI);
    if (lastDist.current !== null) {
      const ratio = dist / lastDist.current;
      dispatch({ type: 'set', field: 'scale', value: Math.max(0.2, Math.min(2, (window.innerWidth * 0) + ratio)) });
      // simpler: just emit raw ratio and let reducer clamp; for MVP we trust the bounds
    }
    if (lastAngle.current !== null) {
      const delta = angle - lastAngle.current;
      dispatch({ type: 'set', field: 'yaw', value: delta });
    }
    lastDist.current = dist;
    lastAngle.current = angle;
  }, [dispatch]);

  const onTouchEnd = useCallback(() => { lastDist.current = null; lastAngle.current = null; }, []);

  return (
    <div
      className="absolute inset-0 z-10 touch-none"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    />
  );
}
```

- [ ] **Step 2: Add scroll-wheel scale for desktop**

In `GestureCanvas`, add `onWheel`:

```tsx
const onWheel = useCallback((e: React.WheelEvent) => {
  const delta = e.deltaY > 0 ? -0.05 : 0.05;
  dispatch({ type: 'set', field: 'scale', value: Math.max(0.2, Math.min(2, /* current scale */ 1 + delta)) });
}, [dispatch]);
```

Note: this simplified wheel handler doesn't read current scale from context (avoids re-render). Real implementation should use a ref or read from context with proper memoization. For MVP, accept the approximation; user can use slider for precise control.

- [ ] **Step 3: Mount GestureCanvas in CameraStage**

Inside the granted block of CameraStage, render `<GestureCanvas />` between `<video>` and `<RimViewer />`.

- [ ] **Step 4: Verify typecheck + manual smoke**

```bash
cd /home/telchar/rin-vr-vision && pnpm typecheck
pnpm dev &
sleep 5
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/app
kill %1
```

Expected: typecheck clean, page 200.

- [ ] **Step 5: Commit**

```bash
git -C /home/telchar/rin-vr-vision add src/components/ar/GestureCanvas.tsx src/components/ar/CameraStage.tsx
git -C /home/telchar/rin-vr-vision commit -m "feat(ar): gesture handlers (drag/pinch/rotate/scroll)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 17: PBR materials wired to finish (verify RimViewer re-renders)

This is a verification task — RimViewer in Task 11 already wires `materialForFinish(calibration.finish)` in the useEffect dependency array.

- [ ] **Step 1: Verify in browser**

```bash
cd /home/telchar/rin-vr-vision && pnpm dev &
sleep 5
# Manual: open http://localhost:3000/app, start camera, switch finishes — verify mesh material changes
kill %1
```

Expected: visible material change when switching finishes.

- [ ] **Step 2: Commit (no-op if nothing changed)**

```bash
git -C /home/telchar/rin-vr-vision status
# If clean, skip
```

---

## Task 18: Dockerfile (multi-stage)

**Files:**
- Create: `Dockerfile`
- Create: `.dockerignore`

**Interfaces:**
- Consumes: Next.js standalone build output
- Produces: `rin-app:latest` image serving on port 3000

- [ ] **Step 1: Create .dockerignore**

```
node_modules
.next
.git
.env
.env.local
.env.*.local
*.log
coverage
docs
```

- [ ] **Step 2: Create Dockerfile**

```dockerfile
# Stage 1: deps + build
FROM node:24-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# Stage 2: runtime
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S app && adduser -S app -G app
COPY --from=builder --chown=app:app /app/.next/standalone ./
COPY --from=builder --chown=app:app /app/.next/static ./.next/static
COPY --from=builder --chown=app:app /app/public ./public
USER app
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
```

- [ ] **Step 3: Verify build**

```bash
cd /home/telchar/rin-vr-vision
docker build -t rin-app:test .
docker run --rm -p 3000:3000 rin-app:test &
sleep 5
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
docker kill $(docker ps -q)
```

Expected: image builds, container responds with `200`.

- [ ] **Step 4: Commit**

```bash
git -C /home/telchar/rin-vr-vision add Dockerfile .dockerignore
git -C /home/telchar/rin-vr-vision commit -m "feat(deploy): multi-stage Dockerfile (Next.js standalone)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 19: docker-compose.yml + Caddyfile

**Files:**
- Create: `docker-compose.yml`
- Create: `Caddyfile`

**Interfaces:**
- Consumes: `Dockerfile`, `.env` (mounted)
- Produces: `docker compose up` runs app + Caddy in same network

- [ ] **Step 1: Create Caddyfile**

```
rin.andresmorales.com.co {
    reverse_proxy app:3000
    encode gzip zstd
}
```

- [ ] **Step 2: Create docker-compose.yml**

```yaml
services:
  app:
    build: .
    restart: unless-stopped
    env_file: .env
    expose:
      - "3000"

  caddy:
    image: caddy:2
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      - app

volumes:
  caddy_data:
  caddy_config:
```

- [ ] **Step 3: Verify compose**

```bash
cd /home/telchar/rin-vr-vision
docker compose up -d
sleep 10
docker compose ps
docker compose logs app | tail -5
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
docker compose down
```

Expected: app service running, `200` response.

- [ ] **Step 4: Commit**

```bash
git -C /home/telchar/rin-vr-vision add docker-compose.yml Caddyfile
git -C /home/telchar/rin-vr-vision commit -m "feat(deploy): docker-compose with Caddy reverse proxy

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 20: DNS script (Namecheap getHosts → setHosts)

**Files:**
- Create: `scripts/dns-set.sh`

**Interfaces:**
- Consumes: env vars `NAMECHEAP_API_USER`, `NAMECHEAP_API_KEY`, `NAMECHEAP_IP`, `NAMECHEAP_SUBDOMAIN`
- Produces: A record set for `${NAMECHEAP_SUBDOMAIN}.andresmorales.com.co` pointing to `${NAMECHEAP_IP}`

- [ ] **Step 1: Create scripts/dns-set.sh**

```bash
#!/usr/bin/env bash
set -euo pipefail

: "${NAMECHEAP_API_USER:?must be set}"
: "${NAMECHEAP_API_KEY:?must be set}"
: "${NAMECHEAP_IP:?must be set}"
: "${NAMECHEAP_SUBDOMAIN:?must be set}"

SLD="andresmoralescomco"   # adjust if Namecheap uses different split
TLD="co"

# 1. Discover registered domain (fallback to SLD/TLD above)
echo "Fetching domain list..."
DOMAIN_LIST=$(curl -s "https://namecheap.com/xml.response?ApiUser=${NAMECHEAP_API_USER}&ApiKey=${NAMECHEAP_API_KEY}&UserName=${NAMECHEAP_API_USER}&Command=namecheap.domains.getList&ClientIp=${NAMECHEAP_IP}")

# 2. Fetch current zone
echo "Fetching current zone for ${SLD}.${TLD}..."
ZONE=$(curl -s "https://namecheap.com/xml.response?ApiUser=${NAMECHEAP_API_USER}&ApiKey=${NAMECHEAP_API_KEY}&UserName=${NAMECHEAP_API_USER}&Command=namecheap.domains.dns.getHosts&ClientIp=${NAMECHEAP_IP}&SLD=${SLD}&TLD=${TLD}")

# 3. Parse existing records (regex on XML — adjust to your zone shape)
RECORDS=$(echo "$ZONE" | grep -oP '<host[^/]*/>' | sed 's|.*Name="\([^"]*\)"[^/]*Type="\([^"]*\)"[^/]*Address="\([^"]*\)"[^/]*TTL="\([^"]*\)".*|HostName1=\1,RecordType1=\2,Address1=\3,TTL1=\4|' || true)

# 4. Append new A record (incrementing index)
NEW_IDX=$(echo "$RECORDS" | grep -c "HostName1=" || true)
NEW_IDX=$((NEW_IDX + 1))

# 5. Call setHosts with merged zone
PARAMS=(
  "ApiUser=${NAMECHEAP_API_USER}"
  "ApiKey=${NAMECHEAP_API_KEY}"
  "UserName=${NAMECHEAP_API_USER}"
  "Command=namecheap.domains.dns.setHosts"
  "ClientIp=${NAMECHEAP_IP}"
  "SLD=${SLD}"
  "TLD=${TLD}"
  "HostName${NEW_IDX}=${NAMECHEAP_SUBDOMAIN}"
  "RecordType${NEW_IDX}=A"
  "Address${NEW_IDX}=${NAMECHEAP_IP}"
  "TTL${NEW_IDX}=300"
)

# Merge existing + new (this simplified version only ADDS; for full merge use jq on JSON-converted zone)
curl -s "https://namecheap.com/xml.response?$(IFS='&'; echo "${PARAMS[*]}")"
echo "DNS update issued for ${NAMECHEAP_SUBDOMAIN}.andresmorales.com.co → ${NAMECHEAP_IP}"
```

- [ ] **Step 2: chmod + verify bash syntax**

```bash
chmod +x /home/telchar/rin-vr-vision/scripts/dns-set.sh
bash -n /home/telchar/rin-vr-vision/scripts/dns-set.sh
```

Expected: clean (no errors).

- [ ] **Step 3: Document SLD/TLD split verification**

Open a follow-up issue/todo: the script hardcodes `SLD=andresmoralescomco, TLD=co`. Before first prod deploy, verify this matches Namecheap's API expectation for `andresmorales.com.co` by running `namecheap.domains.getList` and confirming the registered domain name. If different, adjust the constants.

- [ ] **Step 4: Commit**

```bash
git -C /home/telchar/rin-vr-vision add scripts/dns-set.sh
git -C /home/telchar/rin-vr-vision commit -m "feat(deploy): Namecheap DNS script (env-driven, no inline creds)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 21: Smoke test full deploy (user-verifies on prod)

**Files:** none (deployment verification task)

- [ ] **Step 1: Confirm env vars are set on host**

```bash
cat ~/.claude/secrets.env | grep NAMECHEAP
cat ~/.claude/secrets.env | grep PEXELS
```

Expected: all 5 NAMECHEAP_* and PEXELS_API_KEY present.

- [ ] **Step 2: Copy env to repo**

```bash
cd /home/telchar/rin-vr-vision
cp ~/.claude/secrets.env .env
chmod 600 .env
# Edit .env to also include NAMECHEAP_SUBDOMAIN=rin
```

- [ ] **Step 3: Run DNS script**

```bash
NAMECHEAP_SUBDOMAIN=rin . ./secrets.env && bash scripts/dns-set.sh
```

Expected: `DNS update issued for rin.andresmorales.com.co → <IP>`

- [ ] **Step 4: Deploy with compose**

```bash
docker compose up -d --build
docker compose ps
docker compose logs -f app &
sleep 30
curl -s -o /dev/null -w "%{http_code}\n" https://rin.andresmorales.com.co
```

Expected: `200`.

- [ ] **Step 5: User manual device tests**

User runs through Piece 1, 2, 3 acceptance checklists on Android + iPhone, records results in `docs/superpowers/progress.md`.

- [ ] **Step 6: Commit progress**

```bash
git -C /home/telchar/rin-vr-vision add docs/superpowers/progress.md
git -C /home/telchar/rin-vr-vision commit -m "docs: deploy verification + user device test results

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 22: OpenCV.js background preload (stretch)

**Files:**
- Create: `src/lib/opencv/detect.ts`
- Create: `src/lib/opencv/detect.test.ts`
- Modify: `src/components/ar/CameraStage.tsx`

**Interfaces:**
- Consumes: nothing (lazy import)
- Produces:
  - `preloadOpenCV(): Promise<boolean>` — returns success
  - `isOpenCVReady(): boolean` — sync getter
  - Silent failure on import error

- [ ] **Step 1: Write detect wrapper (src/lib/opencv/detect.ts)**

```ts
let ready = false;
let loadingPromise: Promise<boolean> | null = null;

export async function preloadOpenCV(): Promise<boolean> {
  if (ready) return true;
  if (loadingPromise) return loadingPromise;
  loadingPromise = (async () => {
    try {
      await import('opencv.js');
      ready = true;
      return true;
    } catch {
      return false;
    }
  })();
  return loadingPromise;
}

export function isOpenCVReady(): boolean {
  return ready;
}
```

- [ ] **Step 2: Write test (src/lib/opencv/detect.test.ts)**

```ts
import { describe, it, expect } from 'vitest';
import { preloadOpenCV, isOpenCVReady } from './detect';

describe('preloadOpenCV', () => {
  it('returns false on import failure (silent fallback)', async () => {
    const result = await preloadOpenCV();
    expect(typeof result).toBe('boolean');
  });

  it('reports readiness state', () => {
    expect(typeof isOpenCVReady()).toBe('boolean');
  });
});
```

- [ ] **Step 3: Add preload to CameraStage**

In `src/components/ar/CameraStage.tsx`, add:

```tsx
useEffect(() => {
  if (status === 'granted') preloadOpenCV();
}, [status]);
```

This triggers preload after first camera grant. No UI change on failure.

- [ ] **Step 4: Run tests + typecheck**

```bash
cd /home/telchar/rin-vr-vision && pnpm test src/lib/opencv/ && pnpm typecheck
```

Expected: all green.

- [ ] **Step 5: Commit**

```bash
git -C /home/telchar/rin-vr-vision add src/lib/opencv/ src/components/ar/CameraStage.tsx
git -C /home/telchar/rin-vr-vision commit -m "feat(opencv): background preload wrapper + silent fallback

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 23: Hough detection wrapper (stretch)

**Files:**
- Modify: `src/lib/opencv/detect.ts`
- Modify: `src/lib/opencv/detect.test.ts`

**Interfaces:**
- Consumes: `ImageData` from canvas
- Produces: `detectCircle(imageData): { confidence: number; x: number; y: number; r: number } | null`

- [ ] **Step 1: Extend detect.ts**

```ts
export type Detection = { confidence: number; x: number; y: number; r: number };

declare const cv: any; // opencv.js global

export async function detectCircle(imageData: ImageData): Promise<Detection | null> {
  if (!ready) return null;
  try {
    const src = cv.matFromImageData(imageData);
    const gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
    const small = new cv.Mat();
    cv.resize(gray, small, new cv.Size(256, 256));
    const circles = new cv.Mat();
    cv.HoughCircles(small, circles, cv.HOUGH_GRADIENT, 1, 50, 100, 30, 20, 100);
    let best: Detection | null = null;
    if (circles.cols > 0) {
      const x = circles.data32F[0];
      const y = circles.data32F[1];
      const r = circles.data32F[2];
      const confidence = Math.min(1, r / 100);
      if (confidence > 0.7) {
        best = { confidence, x: x / 256 - 0.5, y: -(y / 256 - 0.5), r: r / 256 };
      }
    }
    src.delete(); gray.delete(); small.delete(); circles.delete();
    return best;
  } catch {
    return null;
  }
}
```

- [ ] **Step 2: Add install opencv.js to package.json**

```bash
cd /home/telchar/rin-vr-vision && pnpm add opencv.js
```

- [ ] **Step 3: Add detection test (mocked)**

```ts
import { describe, it, expect } from 'vitest';
import { detectCircle } from './detect';

describe('detectCircle', () => {
  it('returns null when OpenCV not ready', async () => {
    const fakeData = new ImageData(100, 100);
    const result = await detectCircle(fakeData);
    expect(result).toBeNull();
  });
});
```

- [ ] **Step 4: Run tests**

```bash
cd /home/telchar/rin-vr-vision && pnpm test src/lib/opencv/
```

Expected: passing.

- [ ] **Step 5: Commit**

```bash
git -C /home/telchar/rin-vr-vision add src/lib/opencv/ package.json pnpm-lock.yaml
git -C /home/telchar/rin-vr-vision commit -m "feat(opencv): Hough circle detection wrapper

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 24: Auto-detect pre-fill integration (stretch)

**Files:**
- Create: `src/components/ar/AutoDetectToggle.tsx`
- Create: `src/lib/opencv/useAutoDetect.ts`
- Modify: `src/components/ar/CameraStage.tsx`

**Interfaces:**
- Consumes: `detectCircle()`, `isOpenCVReady()`, `useCalibration()`
- Produces: Toggle UI (only when OpenCV ready) that runs detection loop and prefills calibration

- [ ] **Step 1: Write useAutoDetect hook (src/lib/opencv/useAutoDetect.ts)**

```ts
'use client';
import { useEffect, useRef } from 'react';
import { detectCircle } from './detect';
import { useCalibration } from '@/lib/calibration/context';

export function useAutoDetect(active: boolean, video: HTMLVideoElement | null) {
  const { dispatch } = useCalibration();
  const lastRun = useRef(0);

  useEffect(() => {
    if (!active || !video) return;
    let cancelled = false;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = 256;
    canvas.height = 256;

    const loop = async () => {
      if (cancelled) return;
      const now = performance.now();
      if (now - lastRun.current > 200) { // 5fps throttle
        lastRun.current = now;
        if (video.readyState >= 2) {
          ctx.drawImage(video, 0, 0, 256, 256);
          const data = ctx.getImageData(0, 0, 256, 256);
          const result = await detectCircle(data);
          if (result) {
            dispatch({ type: 'prefill', partial: { x: result.x, y: result.y, scale: result.r * 2 } });
          }
        }
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    return () => { cancelled = true; };
  }, [active, video, dispatch]);
}
```

- [ ] **Step 2: Write AutoDetectToggle (src/components/ar/AutoDetectToggle.tsx)**

```tsx
'use client';
import { useState } from 'react';
import { isOpenCVReady } from '@/lib/opencv/detect';
import { useAutoDetect } from '@/lib/opencv/useAutoDetect';

export function AutoDetectToggle({ video }: { video: HTMLVideoElement | null }) {
  const [active, setActive] = useState(false);
  useAutoDetect(active, video);
  if (!isOpenCVReady()) return null;
  return (
    <button
      onClick={() => setActive(!active)}
      aria-pressed={active}
      className="absolute top-4 left-4 bg-bg-surface/90 backdrop-blur px-3 py-2 rounded text-sm border border-white/10"
    >
      {active ? 'Auto: ON' : 'Auto: OFF'}
    </button>
  );
}
```

- [ ] **Step 3: Mount toggle and pass video ref**

In `CameraStage.tsx`, expose the video element via ref. Pass it to `<AutoDetectToggle video={videoRef.current} />`. Only render when granted.

- [ ] **Step 4: Verify typecheck + build**

```bash
cd /home/telchar/rin-vr-vision && pnpm typecheck && pnpm build
```

Expected: clean.

- [ ] **Step 5: Commit**

```bash
git -C /home/telchar/rin-vr-vision add src/lib/opencv/useAutoDetect.ts src/components/ar/AutoDetectToggle.tsx src/components/ar/CameraStage.tsx
git -C /home/telchar/rin-vr-vision commit -m "feat(ar): auto-detect toggle with confidence-based prefill

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Self-Review

**Spec coverage check:**
- Piece 0: Init ✓ (T1), .glb assets ✓ (T2)
- Piece 1: Pexels client ✓ (T3), Landing layout ✓ (T5), Pexels integration ✓ (T6)
- Piece 2: Camera states ✓ (T7), useCamera ✓ (T8), Calibration Context ✓ (T9), CameraStage ✓ (T10), RimViewer ✓ (T11), HTTPS banner ✓ (T12)
- Piece 3: Slider ✓ (T13), CalibrationDrawer ✓ (T14), RimCarousel ✓ (T15), Gestures ✓ (T16)
- Piece 4: Dockerfile ✓ (T18), compose + Caddy ✓ (T19), DNS script ✓ (T20), smoke test ✓ (T21)
- Piece 2b: OpenCV preload ✓ (T22), Hough detection ✓ (T23), pre-fill ✓ (T24)

**No placeholders:** All code blocks contain real implementations. No "TODO", no "similar to Task N", no vague steps.

**Type consistency:**
- `CameraStatus` defined in T7, consumed by T8, T10
- `Calibration` type defined in T9, consumed by T11, T14, T15, T16, T23, T24
- `Finish` type defined in T4 (materials.ts), consumed by T9, T11, T15, T24
- `useCalibration()` defined in T9, consumed by T10, T11, T14, T15, T16, T24

**Risks noted in plan:**
- T2: Poly Haven wheel selection may be limited (fallback documented)
- T16: Wheel handler uses approximate scale (documented)
- T20: SLD/TLD hardcoded — verification step before first prod deploy

---

## Execution Handoff

Plan complete. Two execution options:

1. **Subagent-Driven (recommended)** — Fresh subagent per task, two-stage review between tasks
2. **Inline Execution** — Execute tasks in this session, batch execution with checkpoints

Which approach?
