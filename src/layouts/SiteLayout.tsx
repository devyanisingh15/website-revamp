import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnnouncementBar } from '@/components/navigation/AnnouncementBar';
import { Header } from '@/components/navigation/Header';
import { Footer } from '@/components/navigation/Footer';
import { CompareTray } from '@/components/ecommerce/CompareTray';
import { PageLoader } from '@/components/ui/PageLoader';

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      // wait for lazy route content
      const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
      return () => clearTimeout(t);
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname, hash]);
  return null;
}

export function SiteLayout() {
  return (
    <>
      <a href="#main" className="sr-only z-[100] rounded-sm bg-proof-400 px-4 py-2 font-semibold text-ink-950 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>
      <ScrollManager />
      <AnnouncementBar />
      <Header />
      <main id="main" tabIndex={-1} className="outline-none">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <CompareTray />
    </>
  );
}

/** Distraction-free layout for checkout: logo + trust line only. */
export function CheckoutLayout() {
  return (
    <>
      <ScrollManager />
      <main id="main" className="min-h-screen bg-ink-950">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
    </>
  );
}
