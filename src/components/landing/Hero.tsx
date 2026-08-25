import Image from 'next/image';
import type { PexelsPhoto } from '@/lib/pexels/types';

export function Hero({ backdrop }: { backdrop?: PexelsPhoto }) {
  return (
    <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden">
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
      <div className="relative z-10 px-4 text-center">
        <h1 className="mb-4 text-5xl font-bold md:text-7xl">Visualizá tus rines en AR</h1>
        <p className="mb-8 text-lg text-text-muted">Probá acabados sobre tu auto antes de comprar.</p>
        <a href="/app" className="inline-block rounded-md bg-accent-primary px-6 py-3 font-semibold">
          Empezar
        </a>
      </div>
    </section>
  );
}