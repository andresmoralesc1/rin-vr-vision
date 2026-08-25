import { Header } from '@/components/landing/Header';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { Gallery } from '@/components/landing/Gallery';
import { Footer } from '@/components/landing/Footer';
import { searchWheels } from '@/lib/pexels/client';

export const revalidate = 3600;

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