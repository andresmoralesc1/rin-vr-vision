import type { Metadata } from 'next';
import { MarketingLayout } from '@/components/landing/MarketingLayout';

export const metadata: Metadata = {
  title: 'Nosotros · Rin VR Vision',
  description: 'Construimos la forma más rápida de probar rines antes de comprar.',
};

const VALUES = [
  {
    title: 'Cero fricción',
    body:
      'Probá un acabado sin instalar nada. Apuntás la cámara a tu rueda, elegís el acabado, listo. Sin apps, sin registros.',
    icon: (
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinejoin="round" />
    ),
  },
  {
    title: 'Honestidad visual',
    body:
      'Materiales PBR (chrome, negro mate, plata) renderizados con la misma física que un configurador profesional. Lo que ves es lo que vas a recibir.',
    icon: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v8M8 12h8" strokeLinecap="round" />
      </>
    ),
  },
  {
    title: 'Privacidad primero',
    body:
      'La cámara se procesa en tu dispositivo. No guardamos frames, no subimos videos a ningún servidor. El permiso se puede revocar en cualquier momento.',
    icon: (
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinejoin="round" />
        <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
];

const STATS = [
  { label: 'Acabados disponibles', value: '3' },
  { label: 'Dispositivos soportados', value: 'iOS + Android' },
  { label: 'Tiempo de prueba', value: '< 30 s' },
];

export default function NosotrosPage() {
  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-bg-surface via-bg-primary to-bg-surface" />
        <div className="relative mx-auto max-w-3xl px-4 py-20 text-center md:py-28">
          <span className="mb-3 inline-block text-sm font-medium uppercase tracking-widest text-accent-primary">
            Nosotros
          </span>
          <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            Comprar rines debería ser más fácil
          </h1>
          <p className="text-lg text-text-muted md:text-xl">
            Nacimos de una frustración concreta: elegir acabado sin ver cómo queda en tu propio vehículo es una decisión a ciegas. Construimos la herramienta que queríamos tener cuando compramos nuestros primeros rines.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="mx-auto max-w-3xl px-4 py-16 md:py-20">
        <h2 className="mb-6 text-2xl font-bold md:text-3xl">Nuestra historia</h2>
        <div className="space-y-5 text-text-muted leading-relaxed">
          <p>
            Empezamos en 2026 con una pregunta simple: ¿por qué todavía compramos rines basándonos en fotos de catálogo? Cada vez que alguien invierte en un juego nuevo, está eligiendo entre 3 o 4 acabados que parecen idénticos en la pantalla de un e-commerce.
          </p>
          <p>
            La respuesta obvia era realidad aumentada, pero las apps existentes requerían descargar, registrar y escanear marcadores. Queríamos algo que funcionara en menos de 30 segundos, desde el navegador del teléfono, sin pedirte la tarjeta.
          </p>
          <p>
            Hoy, Rin VR Vision es eso: abrís el sitio, apuntás la cámara a tu rueda, y movés el acabado con el dedo hasta que quede como te gusta. La cámara nunca sale de tu dispositivo.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-10 text-center text-2xl font-bold md:text-3xl">Lo que creemos</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {VALUES.map((v) => (
            <article
              key={v.title}
              className="group rounded-xl border border-white/10 bg-bg-surface p-6 transition-all hover:border-accent-primary/40"
            >
              <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent-primary/10 text-accent-primary transition-colors group-hover:bg-accent-primary/20">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {v.icon}
                </svg>
              </span>
              <h3 className="mb-2 text-lg font-semibold">{v.title}</h3>
              <p className="text-sm leading-relaxed text-text-muted">{v.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-2xl border border-white/10 bg-bg-surface p-8 md:p-12">
          <dl className="grid gap-8 md:grid-cols-3">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <dt className="text-sm uppercase tracking-wider text-text-muted">{s.label}</dt>
                <dd className="mt-2 text-3xl font-bold text-accent-primary md:text-4xl">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h2 className="mb-4 text-3xl font-bold">Listo para probarlo</h2>
        <p className="mb-8 text-text-muted">
          Apuntá tu teléfono a tu rueda y elegí un acabado. Tarda menos que leer este párrafo.
        </p>
        <a
          href="/app"
          className="inline-flex items-center gap-2 rounded-xl bg-accent-primary px-6 py-3 text-base font-semibold text-white shadow-lg shadow-accent-primary/30 transition-all hover:scale-[1.03] hover:bg-blue-500 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
        >
          Probar AR ahora
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </a>
      </section>
    </MarketingLayout>
  );
}