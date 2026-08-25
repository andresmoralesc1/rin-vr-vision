'use client';

import { useState } from 'react';

type FormState = { name: string; email: string; message: string };

// ponytail: client-side mailto submit (no backend wiring). User's mail client
// opens pre-filled. Upgrade path: replace with server action that POSTs to
// Brevo transactional API (key already in ~/.claude/secrets.env).
export function ContactForm() {
  const [form, setForm] = useState<FormState>({ name: '', email: '', message: '' });

  const update = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Consulta desde rin-vr-vision — ${form.name || 'sin nombre'}`);
    const body = encodeURIComponent(
      `Nombre: ${form.name}\nEmail: ${form.email}\n\n${form.message}\n\n— Enviado desde rin.andresmorales.com.co/contacto`,
    );
    window.location.href = `mailto:hola@rin-vr-vision.com?subject=${subject}&body=${body}`;
  };

  const fieldClass =
    'w-full rounded-md border border-white/10 bg-bg-primary px-3 py-2 text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30';

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium">
          Nombre
        </label>
        <input
          id="name"
          type="text"
          required
          value={form.name}
          onChange={update('name')}
          placeholder="Tu nombre"
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={form.email}
          onChange={update('email')}
          placeholder="tu@email.com"
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium">
          Mensaje
        </label>
        <textarea
          id="message"
          required
          rows={5}
          value={form.message}
          onChange={update('message')}
          placeholder="Contanos en qué podemos ayudarte..."
          className={fieldClass}
        />
      </div>

      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded-md bg-accent-primary px-5 py-2.5 font-semibold text-white shadow-sm transition-all hover:bg-blue-500 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
      >
        Enviar mensaje
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </form>
  );
}