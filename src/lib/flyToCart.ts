/**
 * "Tub drops into the cart" — clones a small tub from the clicked element
 * and arcs it into the header cart icon with a 3D spin. CSS/WAAPI only, so it
 * costs nothing when the 3D chunk isn't loaded. Skipped for reduced motion.
 */
export function flyToCart(from: Element | null, color = '#e8202a') {
  const target = document.getElementById('cart-target');
  if (!from || !target || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    bump(target);
    return;
  }
  const a = from.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  const el = document.createElement('div');
  el.setAttribute('aria-hidden', 'true');
  el.style.cssText = `position:fixed;left:${a.left + a.width / 2 - 18}px;top:${a.top + a.height / 2 - 22}px;width:36px;height:44px;z-index:100;pointer-events:none;transform-style:preserve-3d;`;
  el.innerHTML = `<svg viewBox="0 0 36 44" width="36" height="44"><rect x="3" y="2" width="30" height="8" rx="2" fill="#2a2a2e"/><path d="M4 10h28l-1.5 32H5.5z" fill="#121214"/><rect x="4.4" y="20" width="27.2" height="10" fill="${color}"/></svg>`;
  document.body.appendChild(el);
  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);
  const anim = el.animate(
    [
      { transform: 'translate(0,0) scale(1) rotateY(0deg)', opacity: 1 },
      { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 120}px) scale(1.25) rotateY(200deg)`, opacity: 1, offset: 0.5 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.3) rotateY(400deg)`, opacity: 0.4 },
    ],
    { duration: 750, easing: 'cubic-bezier(.5,0,.3,1)' },
  );
  anim.onfinish = () => {
    el.remove();
    bump(target);
  };
}

function bump(target: HTMLElement | null) {
  target?.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.3)' }, { transform: 'scale(1)' }], { duration: 380, easing: 'ease-out' });
}
