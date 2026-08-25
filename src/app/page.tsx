import { Header } from '@/components/landing/Header';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { Gallery } from '@/components/landing/Gallery';
import { Footer } from '@/components/landing/Footer';
import { searchWheels } from '@/lib/pexels/client';

// PEXELS_API_KEY is runtime-only (injected via docker env_file, not baked
// into the image), so the page must render at request time — ISR would
// cache the build-time prerender (which lacks the key) for an hour.
export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  let photos = undefined;
  try {
    photos = await searchWheels('car wheel rim', 12);
  } catch (err) {
    console.warn('Pexels fetch failed:', err);
  }
  return (
    <>
      <Header />
      <main>
        <Hero backdrop={photos?.[0]} />
        <Features />
        <Gallery photos={photos?.slice(1)} />
      </main>
      <Footer />
    </>
  );
}