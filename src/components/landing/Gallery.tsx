const PLACEHOLDER_COUNT = 6;

export function Gallery() {
  // Pexels integration: T6
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <h2 className="mb-8 text-3xl font-bold">Galería</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {Array.from({ length: PLACEHOLDER_COUNT }).map((_, i) => (
          <div key={i} className="aspect-square animate-pulse rounded-md bg-bg-surface" />
        ))}
      </div>
    </section>
  );
}
