export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-bg-primary/80 backdrop-blur">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <span className="font-bold">Rin VR</span>
        <a href="/app" className="text-accent-primary hover:underline">Probar AR</a>
      </nav>
    </header>
  );
}
