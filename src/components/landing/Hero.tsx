export function Hero() {
  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-gradient-to-b from-bg-surface to-bg-primary">
      <div className="px-4 text-center">
        <h1 className="mb-4 text-5xl font-bold md:text-7xl">Visualizá tus rines en AR</h1>
        <p className="mb-8 text-lg text-text-muted">Probá acabados sobre tu auto antes de comprar.</p>
        <a href="/app" className="inline-block rounded-md bg-accent-primary px-6 py-3 font-semibold">
          Empezar
        </a>
      </div>
    </section>
  );
}
