import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { cx } from '@/lib/format';

type Variant = 'primary' | 'secondary' | 'ghost' | 'proof' | 'inverse' | 'link';
type Size = 'sm' | 'md' | 'lg';

const base =
  'group/btn relative inline-flex items-center justify-center gap-2 select-none whitespace-nowrap font-semibold tracking-tight transition-[background-color,color,border-color,box-shadow,transform] duration-200 ease-[var(--ease-out-expo)] active:scale-[0.98] disabled:opacity-45 disabled:active:scale-100';

const variants: Record<Variant, string> = {
  primary: 'bg-blaze-500 text-white hover:bg-blaze-600 hover:shadow-[var(--shadow-glow-blaze)]',
  secondary: 'border border-current/30 text-current hover:border-current hover:bg-current/5',
  ghost: 'text-current hover:bg-current/8',
  proof: 'bg-proof-400 text-ink-950 hover:bg-proof-300 hover:shadow-[var(--shadow-glow-proof)]',
  inverse: 'bg-bone-100 text-ink-950 hover:bg-white',
  link: 'px-0! h-auto! underline-offset-4 hover:underline text-current',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm rounded-sm',
  md: 'h-12 px-5 text-[15px] rounded-sm',
  lg: 'h-14 px-7 text-base rounded-sm',
};

interface Common {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  block?: boolean;
}

export const buttonClass = ({ variant = 'primary', size = 'md', block }: Common = {}) =>
  cx(base, variants[variant], sizes[size], block && 'w-full');

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & Common>(function Button(
  { variant, size, loading, icon, iconRight, block, className, children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cx(buttonClass({ variant, size, block }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : icon}
      <span>{children}</span>
      {iconRight && <span className="transition-transform duration-200 group-hover/btn:translate-x-0.5">{iconRight}</span>}
    </button>
  );
});

export function ButtonLink({ variant, size, icon, iconRight, block, className, children, ...rest }: LinkProps & Common) {
  return (
    <Link className={cx(buttonClass({ variant, size, block }), className)} {...rest}>
      {icon}
      <span>{children}</span>
      {iconRight && <span className="transition-transform duration-200 group-hover/btn:translate-x-0.5">{iconRight}</span>}
    </Link>
  );
}
