import type { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

/**
 * Wraps the public-facing pages (landing, nosotros, contacto) with
 * the site chrome. The `/app` AR view deliberately does not use this
 * wrapper so its immersive camera view fills the entire viewport.
 */
export function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
