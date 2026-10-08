import type { KeyboardEvent } from 'react';

/** Arrow-key navigation for custom role="radiogroup" button sets. */
export function radioKeyNav<T extends string>(e: KeyboardEvent<HTMLElement>, ids: T[], value: T | null, onChange: (id: T) => void) {
  const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'];
  if (!keys.includes(e.key)) return;
  e.preventDefault();
  const i = Math.max(0, value ? ids.indexOf(value) : 0);
  const next = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? (i + 1) % ids.length : (i - 1 + ids.length) % ids.length;
  onChange(ids[next]);
  const group = e.currentTarget;
  requestAnimationFrame(() => group.querySelectorAll<HTMLElement>('[role="radio"]')[next]?.focus());
}
