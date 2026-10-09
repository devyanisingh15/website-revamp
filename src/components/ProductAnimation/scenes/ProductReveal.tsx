import { useFrame } from '@react-three/fiber';
import { useRig } from '../rig';
import { ease } from '../config/timeline';
import { ProductModel } from '../components/ProductModel';

/**
 * SCENE 2 — PRODUCT REVEAL (10–25%)
 * The jar rises out of the dark on the stone counter (lighting ramps in
 * ProductLighting) and turns its label to camera while the camera dollies in.
 * Owns: jar rotation.
 */
export function ProductReveal() {
  const { progress, jar } = useRig();
  useFrame(() => {
    const p = progress.current ?? 0;
    if (!jar.current) return;
    // Starts turned away, settles label-forward by the end of the reveal
    jar.current.rotation.y = -0.75 * (1 - ease(p, 0.08, 0.25));
  });
  return <ProductModel />;
}
