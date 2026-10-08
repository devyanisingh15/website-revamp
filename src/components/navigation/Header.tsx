import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, Search, ShoppingBag, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { PRIMARY_NAV, SHOP_LINKS, WHEY_LINKS, GOAL_LINKS } from '@/data/navigation';
import { GOALS } from '@/data/goals';
import { getProduct, PRIMARY_PRODUCT_ID } from '@/data/products';
import { useCart } from '@/lib/cart';
import { cx } from '@/lib/format';
import { Logo } from './Logo';
import { MobileMenu } from './MobileMenu';
import { SearchDialog } from './SearchDialog';
import { ProductArt } from '../product/ProductArt';
import { BIOZYME_FLAVOURS } from '@/data/flavours';

type Menu = 'shop' | 'goals' | null;

export function Header() {
  const [menu, setMenu] = useState<Menu>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { totals } = useCart();
  const { pathname } = useLocation();
  const closeTimer = useRef<number>(0);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  useEffect(() => {
    setMenu(null);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(null);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menu]);

  // "/" opens search, like most commerce sites
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const openMenu = (m: Menu) => {
    window.clearTimeout(closeTimer.current);
    setMenu(m);
  };
  const scheduleClose = () => {
    closeTimer.current = window.setTimeout(() => setMenu(null), 140);
  };

  const solid = scrolled || menu !== null;
  const hero = getProduct(PRIMARY_PRODUCT_ID)!;

  return (
    <>
      <header
        className={cx(
          'sticky top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-300',
          solid ? 'border-b hairline bg-ink-950/88 backdrop-blur-md' : 'border-b border-transparent bg-transparent',
        )}
        onMouseLeave={scheduleClose}
      >
        <div className="container-x flex h-[var(--header-h)] items-center gap-1 sm:gap-4">
          <button className="-ml-2 grid size-11 place-items-center rounded-sm lg:hidden" aria-label="Open menu" onClick={() => setMobileOpen(true)}>
            <Menu className="size-5" />
          </button>
          <Logo />
          <nav aria-label="Primary" className="ml-8 hidden h-full items-center lg:flex">
            <ul className="flex h-full items-center">
              {PRIMARY_NAV.map((item) => (
                <li key={item.to} className="relative flex h-full items-center" onMouseEnter={() => (item.menu ? openMenu(item.menu) : scheduleClose())}>
                  {item.menu ? (
                    <button
                      className={cx(
                        'flex h-full items-center gap-1 px-3.5 text-[14px] font-medium transition-colors hover:text-white',
                        menu === item.menu ? 'text-white' : 'text-bone-200',
                      )}
                      aria-expanded={menu === item.menu}
                      aria-controls={`menu-${item.menu}`}
                      onClick={() => setMenu(menu === item.menu ? null : item.menu!)}
                    >
                      {item.label}
                      <ChevronDown className={cx('size-3.5 transition-transform', menu === item.menu && 'rotate-180')} aria-hidden />
                    </button>
                  ) : (
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        cx('flex h-full items-center px-3.5 text-[14px] font-medium transition-colors hover:text-white', isActive ? 'text-white' : 'text-bone-200')
                      }
                    >
                      {item.label}
                    </NavLink>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center sm:gap-1">
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden h-10 items-center gap-3 rounded-sm border hairline px-3 text-sm text-bone-400 transition-colors hover:border-white/30 hover:text-bone-100 md:flex"
              aria-label="Search products"
            >
              <Search className="size-4" aria-hidden />
              <span className="pr-6">Search whey, creatine…</span>
              <kbd className="rounded-xs border hairline px-1.5 font-mono text-[10px]">/</kbd>
            </button>
            <button onClick={() => setSearchOpen(true)} className="grid size-10 place-items-center rounded-sm md:hidden" aria-label="Search products">
              <Search className="size-5" />
            </button>
            <Link to="/account" className="grid size-10 sm:size-11 place-items-center rounded-sm hover:bg-white/5" aria-label="Account">
              <User className="size-5" />
            </Link>
            <Link to="/cart" id="cart-target" className="relative grid size-10 sm:size-11 place-items-center rounded-sm hover:bg-white/5" aria-label={`Cart, ${totals.count} item${totals.count === 1 ? '' : 's'}`}>
              <ShoppingBag className="size-5" />
              {totals.count > 0 && (
                <span className="absolute right-1 top-1 grid min-w-[18px] place-items-center rounded-full bg-blaze-500 px-1 font-mono text-[10px] font-semibold leading-[18px] text-white">
                  {totals.count}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mega menus */}
        <div
          id="menu-shop"
          hidden={menu !== 'shop'}
          onMouseEnter={() => openMenu('shop')}
          className="absolute inset-x-0 top-full border-b hairline bg-ink-950/96 backdrop-blur-md"
        >
          <div className="container-x grid grid-cols-12 gap-10 py-10">
            <div className="col-span-5">
              <p className="eyebrow mb-5 text-bone-400">Shop by category</p>
              <ul className="grid grid-cols-2 gap-x-8">
                {SHOP_LINKS.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="group block border-b hairline py-3">
                      <span className="flex items-center justify-between text-[15px] font-semibold">
                        {l.label}
                        <ArrowRight className="size-4 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" aria-hidden />
                      </span>
                      <span className="mt-0.5 block text-xs text-bone-400">{l.description}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-3">
              <p className="eyebrow mb-5 text-bone-400">Whey protein</p>
              <ul className="space-y-1">
                {WHEY_LINKS.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="block py-2 text-[15px] text-bone-200 hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link to="/shop" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blaze-400 hover:text-blaze-300">
                Shop everything <ArrowRight className="size-4" />
              </Link>
            </div>
            <Link to={`/product/${hero.slug}`} className="group col-span-4 grid grid-cols-[120px_1fr] items-center gap-6 rounded-md border hairline bg-ink-900 p-6 transition-colors hover:border-white/25">
              <ProductArt art={hero.art} band={BIOZYME_FLAVOURS[0].color} protein={25} className="transition-transform duration-500 group-hover:-rotate-3 group-hover:scale-105" />
              <div>
                <p className="eyebrow text-proof-400">India’s first clinically tested whey</p>
                <p className="mt-2 text-xl font-bold leading-tight">{hero.shortName}</p>
                <p className="mt-2 text-sm text-bone-400">{hero.oneLiner}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">
                  Shop Biozyme <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </div>
        </div>

        <div
          id="menu-goals"
          hidden={menu !== 'goals'}
          onMouseEnter={() => openMenu('goals')}
          className="absolute inset-x-0 top-full border-b hairline bg-ink-950/96 backdrop-blur-md"
        >
          <div className="container-x grid grid-cols-5 gap-px py-10">
            {GOAL_LINKS.map((l, i) => (
              <Link key={l.to} to={l.to} className="group relative flex min-h-[180px] flex-col justify-between border-l hairline p-6 transition-colors hover:bg-white/[0.03]">
                <span className="font-mono text-xs text-blaze-500">0{i + 1}</span>
                <span>
                  <span className="block text-lg font-bold">{l.label}</span>
                  <span className="mt-1 block text-sm text-bone-400">{GOALS[i].headline}</span>
                </span>
                <ArrowRight className="absolute right-6 top-6 size-4 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
              </Link>
            ))}
          </div>
          <div className="container-x flex items-center gap-3 border-t hairline py-4 text-sm text-bone-400">
            <ShieldCheck className="size-4 text-proof-400" aria-hidden />
            Not sure? <Link to="/#goal-finder" className="font-semibold text-bone-100 underline-offset-4 hover:underline">Take the 30-second quiz</Link>
          </div>
        </div>
      </header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} onSearch={() => { setMobileOpen(false); setSearchOpen(true); }} />
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
