import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';

const NAV = [
  { href: '/', label: 'Inicio' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/contacto', label: 'Contacto' },
  { href: '/app', label: 'Probar AR' },
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-bg-primary">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 text-text-primary">
              <Logo size={24} className="text-accent-primary" />
              <span className="font-bold">Rin VR Vision</span>
            </Link>
            <p className="mt-3 max-w-sm text-sm text-text-muted">
              Probá acabados de rines en realidad aumentada desde tu navegador. Sin descargas, sin registros.
            </p>
          </div>

          {/* Nav */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Sitio
            </h3>
            <ul className="space-y-2">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-text-primary/80 transition-colors hover:text-text-primary"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Contacto
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="mailto:hola@rin-vr-vision.com"
                  className="text-text-primary/80 transition-colors hover:text-text-primary"
                >
                  hola@rin-vr-vision.com
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/573000000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-primary/80 transition-colors hover:text-text-primary"
                >
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/rin.vr.vision"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-primary/80 transition-colors hover:text-text-primary"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 text-xs text-text-muted sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Rin VR Vision. Todos los derechos reservados.</p>
          <p>
            Imágenes provistas por{' '}
            <a
              href="https://www.pexels.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-text-primary"
            >
              Pexels
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}