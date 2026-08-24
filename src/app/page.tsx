import { Header } from '@/components/landing/Header';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { Gallery } from '@/components/landing/Gallery';
import { Footer } from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Features />
        <Gallery />
      </main>
      <Footer />
    </>
  );
}
