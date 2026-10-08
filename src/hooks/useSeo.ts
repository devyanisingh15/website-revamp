import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SITE } from '@/data/site';

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

/**
 * Client-side head management. For crawlers that don't execute JS the site
 * should be prerendered/SSR'd at deploy time (see README); this keeps titles,
 * descriptions, OG and canonical correct for every route in the SPA.
 */
export function useSeo({ title, description, noindex }: { title: string; description: string; noindex?: boolean }) {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = title;
    const url = `${SITE.origin}${pathname === '/' ? '/' : pathname.replace(/\/$/, '')}`;
    setMeta('name', 'description', description);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', url);
    setMeta('name', 'robots', noindex ? 'noindex,follow' : 'index,follow');
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = url;
  }, [title, description, noindex, pathname]);
}
