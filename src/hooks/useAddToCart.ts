import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/lib/cart';
import { useToast, TOAST_COPY } from '@/lib/toast';
import { isOutOfStock } from '@/mocks/merchandising';
import { flyToCart } from '@/lib/flyToCart';
import { getProduct } from '@/data/products';

/** Add-to-cart with stock check, fly-to-cart and the document's toast copy. */
export function useAddToCart() {
  const { add } = useCart();
  const { push } = useToast();
  const navigate = useNavigate();
  return useCallback(
    (opts: { productId: string; flavourId: string | null; sizeId: string; qty?: number; from?: Element | null; goToCheckout?: boolean }) => {
      const product = getProduct(opts.productId);
      if (!product) return false;
      if (opts.flavourId && isOutOfStock(opts.productId, opts.flavourId)) {
        push({
          tone: 'warning',
          title: TOAST_COPY.outOfStock,
          action: { label: 'Notify me', onClick: () => push({ tone: 'info', title: 'We’ll let you know when it’s back.', body: 'Back-in-stock alerts are mocked in this build.' }) },
        });
        return false;
      }
      add({ productId: opts.productId, flavourId: opts.flavourId, sizeId: opts.sizeId }, opts.qty ?? 1);
      const flavour = product.flavours.find((f) => f.id === opts.flavourId);
      if (opts.goToCheckout) {
        navigate('/checkout');
        return true;
      }
      flyToCart(opts.from ?? null, flavour?.color);
      push({ tone: 'success', title: TOAST_COPY.added, body: product.shortName + (flavour && flavour.family !== 'tbc' ? ` · ${flavour.name}` : ''), action: { label: 'View cart', onClick: () => navigate('/cart') } });
      return true;
    },
    [add, push, navigate],
  );
}
