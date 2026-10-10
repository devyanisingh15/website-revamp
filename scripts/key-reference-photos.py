"""
Builds the photo-derived animation assets from the supplied reference photos.

  python3 scripts/key-reference-photos.py     (then `npm run assets` to encode WebP)

1. Hands (assets-src/reference/hands-opening-tub.jpg → public/assets/hand-top.png,
   hand-bottom.png): keys the black ground and green-screen spill, cuts away the
   cream jar and black lid, keeps the two hands as separate layers and fades their
   cut edges. Region constants are specific to this photo; a new photo needs them
   re-measured (and HAND_PHOTO in src/components/ProductAnimation/config/assets.ts).
2. Powder (assets-src/reference/powder-scoop.jpg → powder-albedo.png,
   powder-height.png): crops fine powder, flattens the photo's lighting, makes it
   tileable and derives a height map.
"""
import json, os
import numpy as np
from PIL import Image, ImageFilter, ImageDraw
ROOT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')+'/'

# ---------------------------------------------------------------- hands
SRC=ROOT+'assets-src/reference/hands-opening-tub.jpg'
OUT=ROOT+'public/assets/'
im=np.asarray(Image.open(SRC)).astype(np.float32)
r,g,b=im[...,0],im[...,1],im[...,2]
mx=im.max(-1); mn=im.min(-1); sat=(mx-mn)/(mx+1e-6)
ss=lambda x,a,b_: np.clip((x-a)/(b_-a),0,1)**2*(3-2*np.clip((x-a)/(b_-a),0,1))
skin=ss(sat,0.15,0.26)*ss(mx,55,105)
# skin is red-dominant: r > g > b
skin*=ss(r-g,8,22)
green=ss(g-np.maximum(r,b),2,14)   # keyer spill
skin*=1-green
H,W=mx.shape; yy,xx=np.mgrid[0:H,0:W]
mouth=((xx-648)/212.0)**2+((yy-440)/62.0)**2<1
skin[mouth]=0
# Inside the jar silhouette only clearly-skin pixels survive (shaded beige plastic is weakly red)
jar=(xx>340)&(xx<975)&(yy>320)&(yy<1165)
skin[jar]*=ss((r-g)[jar],34,48)
# Lid: dark warm plastic; keep only lit skin there
lid=((xx-590)/250.0)**2+((yy-300)/150.0)**2<1
skin[lid]*=ss(mx[lid],120,160)
a=Image.fromarray((skin*255).astype(np.uint8))
# close small holes, drop specks, soft edge
a=a.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.MinFilter(9))
a=a.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(3))
a=a.filter(ImageFilter.GaussianBlur(1.1))
A=np.asarray(a).astype(np.float32)/255
# despill + slight edge darkening removal
g2=np.minimum(g,r*0.98)
rgb=np.stack([r,g2,b],-1)
out=np.dstack([rgb,A*255]).clip(0,255).astype(np.uint8)

# Keep only the two hands: flood-fill from a seed inside each, discard everything else
bin_=Image.fromarray(((A>0.35)*255).astype(np.uint8))
layers={}
for name,seed in [('top',(250,200)),('bottom',(900,860))]:
  m=bin_.copy(); ImageDraw.floodfill(m,seed,128)
  M=np.asarray(m)==128
  # closing bridges nail-tip notches; then fill interior holes (anything the outside flood can't reach)
  C=Image.fromarray((M*255).astype(np.uint8)).filter(ImageFilter.MaxFilter(13)).filter(ImageFilter.MinFilter(13))
  inv=Image.fromarray(((np.asarray(C)<128)*255).astype(np.uint8)).copy(); ImageDraw.floodfill(inv,(0,0),100)
  holes=np.asarray(inv)==255
  closed=np.asarray(C)>127
  # closing may only add pixels at the fingertips (nail notches), never bridge finger gaps
  tips = (xx<540) if name=='bottom' else np.ones_like(M)
  solid = M | (closed & tips)
  # fill only small holes (keyer drop-outs inside a finger); finger gaps stay open
  hm=Image.fromarray((holes*255).astype(np.uint8)).copy()
  while True:
    ys_,xs_=np.where(np.asarray(hm)==255)
    if len(ys_)==0: break
    ImageDraw.floodfill(hm,(int(xs_[0]),int(ys_[0])),77)
    reg=np.asarray(hm)==77
    if reg.sum()<2500 or (name=='bottom' and xs_[0]<560 and reg.sum()<6000): solid|=reg
    hm=Image.fromarray(np.where(reg,10,np.asarray(hm)).astype(np.uint8)).copy()
  Mi=Image.fromarray((solid*255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.3))
  Am=np.asarray(Mi).astype(np.float32)/255
  if name=='top': Am*=ss(r-g,10,20)
  else:
    # jar plastic visible in the finger gaps near the tips (low red excess = plastic, not skin)
    gaps=np.zeros_like(M)
    for x0_,x1_,y0_,y1_ in [(575,665,800,826),(555,610,905,930),(580,650,1020,1042),(720,760,700,720)]: gaps[y0_:y1_,x0_:x1_]=True
    Am[gaps]*=ss((r-g)[gaps],30,42)
    Am*=np.where(xx>590, 1-ss(-sat,-0.23,-0.16)*ss(mx,105,140), 1)   # stray cream jar plastic   # yellow-green keyer specks on the outer edge
  ys,xs=np.where(Am>0.02); x0,x1,y0,y1=xs.min()-4,xs.max()+5,ys.min()-4,ys.max()+5
  x0,y0=max(x0,0),max(y0,0); x1,y1=min(x1,W),min(y1,H)
  crop=np.dstack([rgb,Am*255]).clip(0,255).astype(np.uint8)[y0:y1,x0:x1]
  Image.fromarray(crop,'RGBA').save(OUT+f'hand-{name}.png')
  layers[name]=dict(x=int(x0),y=int(y0),w=int(x1-x0),h=int(y1-y0))
layers['source']=dict(w=W,h=H)
print('hand cut-outs (update HAND_PHOTO in config/assets.ts if these move):', layers)
# Extend the forearms so they leave the frame instead of ending mid-air. A band of
# the wrist is carried outward (lower hand: from its right cut edge, to the right;
# upper hand: from the back of the hand, where it is wrist-width, upward), with
# rounded shading across the arm, a slight blur along it, and a fall-off into the
# dark like an arm leaving the key light. HAND_PHOTO's rects include the extension.
ARMS = {
  # name: (axis the arm runs along, index where the arm starts in the cut-out, length px)
  'bottom': ('x+', None, 640),   # None = the cut-out's right edge (the photo border)
  'top': ('y-', 44, 950),        # row 44: back of the hand is ~300 px wide here; long enough to leave a phone screen
}
BAND = 8
def boxblur(x, r, ax):
  k = np.ones(2 * r + 1) / (2 * r + 1)
  return np.apply_along_axis(lambda v: np.convolve(np.pad(v, r, mode='edge'), k, mode='valid'), ax, x)
for name, (dirn, start, E_) in ARMS.items():
  im = np.asarray(Image.open(OUT + f'hand-{name}.png')).astype(np.float32)
  H_, W_ = im.shape[:2]
  if dirn == 'x+':
    c0 = (W_ - 4) if start is None else start
    band = im[:, c0 - BAND:c0].mean(axis=1)                     # (H,4) profile across the arm
    prof = band[:, 3] > 128
    idx = np.nonzero(prof)[0]; cen, hw = (idx.min() + idx.max()) / 2, (idx.max() - idx.min()) / 2
    u = (np.arange(H_) - cen) / max(hw, 1)
    ext = np.repeat(band[:, None, :], E_, axis=1)
    t = np.linspace(0, 1, E_)[None, :]                           # 0 at the wrist → 1 at the arm's end
    U = np.repeat(u[:, None], E_, axis=1)
    keep = im[:, :c0]
  else:
    r0 = start
    band = im[r0:r0 + BAND].mean(axis=0)                         # (W,4)
    prof = band[:, 3] > 128
    idx = np.nonzero(prof)[0]; cen, hw = (idx.min() + idx.max()) / 2, (idx.max() - idx.min()) / 2
    u = (np.arange(W_) - cen) / max(hw, 1)
    ext = np.repeat(band[None, :, :], E_, axis=0)[::-1]          # row 0 = far end
    t = np.linspace(1, 0, E_)[:, None]
    U = np.repeat(u[None, :], E_, axis=0)
    keep = im[r0:]
  # Skin: smooth the band across the arm (alpha-weighted) so knuckle/vein detail doesn't
  # smear into streaks; blend from the exact wrist pixels to the smooth version.
  ax_across = 0 if dirn == 'x+' else 1
  ax_band = 0  # band is 1-D (across) × 4
  wgt = band[:, 3:4] / 255.0
  sm_rgb = np.stack([boxblur(band[:, c] * wgt[:, 0], 22, 0) for c in range(3)], -1)
  sm_w = boxblur(wgt[:, 0], 22, 0)[:, None]
  smooth = np.concatenate([sm_rgb / np.maximum(sm_w, 1e-3), band[:, 3:4]], -1)
  smooth_ext = np.repeat(smooth[:, None, :], E_, axis=1) if dirn == 'x+' else np.repeat(smooth[None, :, :], E_, axis=0)[::-1]
  mix = ss(t, 0.0, 0.1)[..., None]
  ext = ext * (1 - mix) + smooth_ext * mix
  # Silhouette: gently tapered with soft edges, eased in from the real wrist outline
  taper = 1 - 0.12 * t
  prof_a = 255 * (1 - ss(np.abs(U), taper - 0.07, taper + 0.03))
  ext[..., 3] = ext[..., 3] * (1 - mix[..., 0]) + prof_a * mix[..., 0]
  # rounded (cylindrical) shading across the arm, eased in from the wrist so there's no seam
  cyl = 0.7 + 0.3 * np.sqrt(np.clip(1 - U * U, 0, 1))
  cyl = 1 + (cyl - 1) * ss(t, 0.0, 0.12)
  # falls out of the light toward the frame edge; only the very end fades out
  shade = cyl * (1 - 0.6 * ss(t, 0.05, 0.85))
  fade = 1 - ss(t, 0.8, 1.0)
  rgb = ext[..., :3] * shade[..., None]
  a = ext[..., 3] * fade
  # soften pixel streaks along the arm
  ax_along = 1 if dirn == 'x+' else 0
  rgb = np.stack([boxblur(rgb[..., c], 4, ax_along) for c in range(3)], -1)
  arm = np.dstack([rgb, a[..., None]])
  out = np.concatenate([keep, arm], axis=1) if dirn == 'x+' else np.concatenate([arm, keep], axis=0)
  Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), 'RGBA').save(OUT + f'hand-{name}.png')
  r = layers[name]
  if dirn == 'x+':
    r['w'] = c0 + E_
  else:
    r['y'] = r['y'] + r0 - E_; r['h'] = H_ - r0 + E_
print('with forearm extension (HAND_PHOTO rects):', {k: layers[k] for k in ('top', 'bottom')})

# ---------------------------------------------------------------- powder
SRC=ROOT+'assets-src/reference/powder-scoop.jpg'
OUT=ROOT+'public/assets/'
im=Image.open(SRC).crop((545,170,775,400)).resize((512,512),Image.LANCZOS)
a=np.asarray(im).astype(np.float32)
# flatten the photo's lighting (mound shading) so the tile can be lit by the scene
low=np.asarray(im.filter(ImageFilter.GaussianBlur(48))).astype(np.float32)
mean=a.reshape(-1,3).mean(0)
flat=a/np.maximum(low,1)*mean
# seamless: cross-fade with a half-offset copy, weighted towards the tile centre
N=512; t=np.linspace(0,1,N); w1=np.minimum(t,1-t)*2
w=np.clip(w1*1.5,0,1)
# separable passes: each hides its own seam where the other copy is weighted fully
th=flat*w[None,:,None]+np.roll(flat,N//2,1)*(1-w[None,:,None])
tile=th*w[:,None,None]+np.roll(th,N//2,0)*(1-w[:,None,None])
# albedo should be mostly flat colour: keep 40% of the photo's local contrast (the rest is baked light)
tile=mean+(tile-mean)*0.4
tile=np.clip(tile*0.92,0,255).astype(np.uint8)
Image.fromarray(tile).save(OUT+'powder-albedo.png')
# bump: high-passed luminance
L=tile.astype(np.float32).mean(-1)
Lb=np.asarray(Image.fromarray(L.astype(np.uint8)).filter(ImageFilter.GaussianBlur(10))).astype(np.float32)
h=np.clip(128+(L-Lb)*4.5,0,255).astype(np.uint8)
Image.fromarray(h).save(OUT+'powder-height.png')
print('mean colour',mean.astype(int))
