import type { Metadata } from 'next';
import { MarketingLayout } from '@/components/landing/MarketingLayout';
import { ContactForm } from './ContactForm';

export const metadata: Metadata = {
  title: 'Contacto · Rin VR Vision',
  description: 'Escribinos para consultas comerciales, partnerships o soporte.',
};

const CHANNELS = [
  {
    label: 'Email',
    value: 'hola@rin-vr-vision.com',
    href: 'mailto:hola@rin-vr-vision.com',
    icon: (
      <path
        d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6"
        strokeLinejoin="round"
      />
    ),
  },
  {
    label: 'WhatsApp',
    value: '+57 300 000 0000',
    href: 'https://wa.me/573000000000',
    icon: (
      <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z" />
    ),
  },
  {
    label: 'Instagram',
    value: '@rin.vr.vision',
    href: 'https://instagram.com/rin.vr.vision',
    icon: (
      <>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.4a4 4 0 1 1-7.9 1A4 4 0 0 1 16 11.4z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </>
    ),
  },
];

export default function ContactoPage() {
  return (
    <MarketingLayout>
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-b from-bg-surface to-bg-primary" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-center">
          <span className="mb-3 inline-block text-sm font-medium uppercase tracking-widest text-accent-primary">
            Contacto
          </span>
          <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
            Hablemos de tus rines
          </h1>
          <p className="mx-auto max-w-xl text-text-muted">
            Consultas comerciales, soporte técnico o partnerships — respondemos en menos de 24 h.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-10 md:grid-cols-5">
          {/* Form */}
          <div className="md:col-span-3">
            <h2 className="mb-2 text-2xl font-bold">Envianos un mensaje</h2>
            <p className="mb-6 text-sm text-text-muted">
              Completá el formulario y se abrirá tu cliente de correo para enviarlo.
            </p>
            <ContactForm />
          </div>

          {/* Direct channels */}
          <aside className="md:col-span-2">
            <h2 className="mb-2 text-2xl font-bold">Canales directos</h2>
            <p className="mb-6 text-sm text-text-muted">
              Si preferís hablar ahora, estos canales están activos.
            </p>
            <ul className="space-y-4">
              {CHANNELS.map((c) => (
                <li key={c.label}>
                  <a
                    href={c.href}
                    target={c.href.startsWith('http') ? '_blank' : undefined}
                    rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="group flex items-center gap-4 rounded-lg border border-white/10 bg-bg-surface p-4 transition-all hover:border-accent-primary/40 hover:bg-bg-surface/80"
                  >
                    <span className="flex h-10 w-10 flex-none items-center justify-center rounded-md bg-accent-primary/10 text-accent-primary transition-colors group-hover:bg-accent-primary/20">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        {c.icon}
                      </svg>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-medium uppercase tracking-wider text-text-muted">
                        {c.label}
                      </span>
                      <span className="block truncate font-semibold">{c.value}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>
    </MarketingLayout>
  );
}