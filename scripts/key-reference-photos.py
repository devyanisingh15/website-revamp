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
# Arms dissolve into the dark at the photo's cut edges (top hand: top, lower hand: right)
for name,edge in [('top','top'),('bottom','right')]:
  im=np.asarray(Image.open(OUT+f'hand-{name}.png')).astype(np.float32)
  H_,W_=im.shape[:2]; yy_,xx_=np.mgrid[0:H_,0:W_]
  d = yy_ if edge=='top' else (W_-1-xx_)
  im[...,3]*=ss(d,6,95); im[...,:3]*=(0.35+0.65*ss(d,10,230))[...,None]
  Image.fromarray(im.clip(0,255).astype(np.uint8),'RGBA').save(OUT+f'hand-{name}.png')

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
