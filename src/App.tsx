import { lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { CartProvider } from '@/lib/cart';
import { CompareProvider } from '@/lib/compare';
import { ToastProvider } from '@/lib/toast';
import { Toaster } from '@/components/ui/Toaster';
import { CanvasBudgetProvider } from '@/components/3d/Stage3D';
import { SiteLayout, CheckoutLayout } from '@/layouts/SiteLayout';
import HomePage from '@/pages/HomePage';

// Home is in the entry chunk for LCP; every other route is code-split.
const ShopPage = lazy(() => import('@/pages/ShopPage'));
const ProductPage = lazy(() => import('@/pages/ProductPage'));
const GoalsIndexPage = lazy(() => import('@/pages/GoalsIndexPage'));
const GoalPage = lazy(() => import('@/pages/GoalPage'));
const SciencePage = lazy(() => import('@/pages/SciencePage'));
const AuthenticityPage = lazy(() => import('@/pages/AuthenticityPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const FitHubPage = lazy(() => import('@/pages/FitHubPage'));
const ArticlePage = lazy(() => import('@/pages/ArticlePage'));
const CartPage = lazy(() => import('@/pages/CartPage'));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'));
const AccountPage = lazy(() => import('@/pages/AccountPage'));
const TrackOrderPage = lazy(() => import('@/pages/TrackOrderPage'));
const HelpPage = lazy(() => import('@/pages/HelpPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const PolicyPage = lazy(() => import('@/pages/PolicyPage'));
const InfoPage = lazy(() => import('@/pages/InfoPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

const router = createBrowserRouter([
  {
    element: <SiteLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/shop', element: <ShopPage /> },
      { path: '/shop/:category', element: <ShopPage /> },
      { path: '/product/:slug', element: <ProductPage /> },
      { path: '/goals', element: <GoalsIndexPage /> },
      { path: '/goals/:goal', element: <GoalPage /> },
      { path: '/science', element: <SciencePage /> },
      { path: '/authenticity', element: <AuthenticityPage /> },
      { path: '/about', element: <AboutPage /> },
      { path: '/fit-hub', element: <FitHubPage /> },
      { path: '/fit-hub/:slug', element: <ArticlePage /> },
      { path: '/cart', element: <CartPage /> },
      { path: '/account', element: <AccountPage /> },
      { path: '/track-order', element: <TrackOrderPage /> },
      { path: '/help', element: <HelpPage /> },
      { path: '/contact', element: <ContactPage /> },
      { path: '/policies/:policy', element: <PolicyPage /> },
      { path: '/careers', element: <InfoPage page="careers" /> },
      { path: '/press', element: <InfoPage page="press" /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    element: <CheckoutLayout />,
    children: [{ path: '/checkout', element: <CheckoutPage /> }],
  },
]);

export function App() {
  return (
    <ToastProvider>
      <CartProvider>
        <CompareProvider>
          <CanvasBudgetProvider>
            <RouterProvider router={router} />
            <Toaster />
          </CanvasBudgetProvider>
        </CompareProvider>
      </CartProvider>
    </ToastProvider>
  );
}
