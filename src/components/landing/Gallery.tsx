import Image from 'next/image';
import type { PexelsPhoto } from '@/lib/pexels/types';

export function Gallery({ photos }: { photos?: PexelsPhoto[] }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <h2 className="mb-8 text-3xl font-bold">Galería</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {photos?.length
          ? photos.slice(0, 6).map((p) => (
              <div key={p.id} className="relative aspect-square overflow-hidden rounded-md">
                <Image
                  src={p.src.medium}
                  alt={p.alt || `Photo by ${p.photographer}`}
                  fill
                  sizes="33vw"
                  className="object-cover"
                />
                <span className="absolute bottom-1 right-1 rounded-md bg-black/60 px-1 text-xs">
                  {p.photographer}
                </span>
              </div>
            ))
          : Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-md bg-bg-surface" />
            ))}
      </div>
    </section>
  );
}