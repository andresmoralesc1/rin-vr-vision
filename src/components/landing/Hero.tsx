import Image from 'next/image';
import Link from 'next/link';
import type { PexelsPhoto } from '@/lib/pexels/types';

export function Hero({ backdrop }: { backdrop?: PexelsPhoto }) {
  return (
    <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden">
      {backdrop ? (
        <>
          <Image
            src={backdrop.src.large2x}
            alt={backdrop.alt || 'Car wheel backdrop'}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-40"
          />
          {/* Gradient overlay: darkens edges so the CTA reads on any photo */}
          <div className="absolute inset-0 bg-gradient-to-b from-bg-primary/40 via-bg-primary/20 to-bg-primary" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-bg-surface to-bg-primary" />
      )}

      <div className="relative z-10 mx-auto max-w-3xl px-4 py-20 text-center">
        <span className="mb-4 inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-wider text-text-muted backdrop-blur">
          WebAR · Sin instalar nada
        </span>
        <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight md:text-7xl">
          Visualizá tus rines en AR
        </h1>
        <p className="mx-auto mb-10 max-w-xl text-lg text-text-muted md:text-xl">
          Probá acabados sobre tu auto antes de comprar. Chrome, negro mate y plata — directamente desde el navegador.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/app"
            className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-accent-primary px-7 py-4 text-base font-semibold text-white shadow-lg shadow-accent-primary/30 transition-all duration-200 hover:scale-[1.03] hover:bg-accent-primary hover:shadow-xl hover:shadow-accent-primary/40 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
          >
            <span className="relative">Probar AR ahora</span>
            <svg
              className="relative transition-transform duration-200 group-hover:translate-x-1"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
            {/* Subtle shine sweep on hover */}
            <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-white/15 opacity-0 transition-all duration-700 group-hover:left-[150%] group-hover:opacity-100" />
          </Link>

          <Link
            href="/nosotros"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-base font-semibold text-text-primary backdrop-blur transition-all hover:border-white/20 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-primary"
          >
            Cómo funciona
          </Link>
        </div>

        {/* Trust line */}
        <p className="mt-10 text-sm text-text-muted">
          Funciona en iPhone y Android · No requiere descarga
        </p>
      </div>
    </section>
  );
}