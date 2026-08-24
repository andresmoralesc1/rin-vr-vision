const FEATURES = [
  { title: 'Cámara en vivo', body: 'Apuntá a tu rueda y mirá el resultado al instante.' },
  { title: '3 acabados', body: 'Chrome, negro mate y plata. Compará en segundos.' },
  { title: 'Sin instalar nada', body: 'WebAR puro, funciona en tu navegador.' },
];

export function Features() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <div className="grid gap-8 md:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-lg border border-white/10 bg-bg-surface p-6">
            <h3 className="mb-2 text-xl font-semibold">{f.title}</h3>
            <p className="text-text-muted">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
