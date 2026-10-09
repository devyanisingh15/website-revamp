"""
Splits each flavour artwork (assets-src/reference/flavours/<id>.webp, transparent
cut-outs) into its separate elements — splashes, nuts, chunks, leaves, drops — so
the home page's flavour scene can place each one at its own depth.

  python3 scripts/split-flavour-elements.py

Writes public/assets/flavours/<id>.webp (the artwork, used as a texture atlas),
<id>-ids.png (half-resolution element-id map), plus src/data/flavour-elements.json
(per flavour: one rect per element in atlas pixels, its area, id, and whether it
is a large "splash" or a small "piece").
"""
import json, os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SRC = os.path.join(ROOT, 'assets-src/reference/flavours')
OUT = os.path.join(ROOT, 'public/assets/flavours')
os.makedirs(OUT, exist_ok=True)
MAX_PIECES = 46
MANIFEST = os.path.join(ROOT, 'src/data/flavour-elements.json')
manifest = {}


def label_runs(mask):
    """8-connected components via row runs + union-find; returns [ymin, ymax, xmin, xmax, pixels] each."""
    parent = []

    def find(i):
        while parent[i] != i:
            parent[i] = parent[parent[i]]
            i = parent[i]
        return i

    runs = []
    prev = []
    for y in range(mask.shape[0]):
        d = np.diff(np.concatenate(([0], mask[y].astype(np.int8), [0])))
        starts = np.nonzero(d == 1)[0].tolist()
        ends = np.nonzero(d == -1)[0].tolist()  # exclusive
        cur = []
        j = 0
        for x0, x1 in zip(starts, ends):
            rid = len(parent)
            parent.append(rid)
            while j < len(prev) and prev[j][1] < x0:  # prev run ends (exclusive) before x0-1
                j += 1
            k = j
            while k < len(prev) and prev[k][0] <= x1:
                ra, rb = find(rid), find(prev[k][2])
                if ra != rb:
                    parent[ra] = rb
                k += 1
            cur.append((x0, x1, rid))
            runs.append((y, x0, x1, rid))
        prev = cur
    comps = {}
    lab = np.zeros(mask.shape, np.int32)
    for y, x0, x1, rid in runs:
        r = find(rid)
        lab[y, x0:x1] = r + 1
        c = comps.get(r)
        if c is None:
            comps[r] = [y, y, x0, x1 - 1, x1 - x0]
        else:
            c[0] = min(c[0], y); c[1] = max(c[1], y); c[2] = min(c[2], x0); c[3] = max(c[3], x1 - 1); c[4] += x1 - x0
    return [(r + 1, *c) for r, c in comps.items()], lab

for name in sorted(os.listdir(SRC)):
    if not name.endswith(('.webp', '.png')):
        continue
    fid = os.path.splitext(name)[0]
    im = Image.open(os.path.join(SRC, name)).convert('RGBA')
    W, H = im.size
    # label at half resolution; a 1px dilation keeps drips attached to their splash
    s = 2
    a = im.getchannel('A').resize((W // s, H // s), Image.BILINEAR).filter(ImageFilter.MaxFilter(3))
    mask = (np.asarray(a) > 40)
    elements = []
    comps, lab = label_runs(mask)
    for (root, ymin, ymax, xmin, xmax, px) in comps:
        area = px * s * s
        if area < 260:  # dust
            continue
        pad = 3
        x0, x1 = max(0, xmin * s - pad), min(W, (xmax + 1) * s + pad)
        y0, y1 = max(0, ymin * s - pad), min(H, (ymax + 1) * s + pad)
        elements.append({'x': int(x0), 'y': int(y0), 'w': int(x1 - x0), 'h': int(y1 - y0), 'area': int(area), 'root': root})
    elements.sort(key=lambda e: -e['area'])
    total = W * H
    splash = [e for e in elements if e['area'] > total * 0.035]
    pieces = [e for e in elements if e['area'] <= total * 0.035][:MAX_PIECES]
    for e in splash:
        e['kind'] = 'splash'
    for e in pieces:
        e['kind'] = 'piece'
    kept = splash + pieces
    # ID map: each pixel holds its element's id (1..n, 0 = none). The scene discards
    # any texel whose id isn't the card's own, so a piece never shows twice.
    remap = np.zeros(lab.max() + 1, np.uint8)
    for i, e in enumerate(kept):
        e['id'] = i + 1
        remap[e.pop('root')] = i + 1
    for e in elements:
        e.pop('root', None)
    Image.fromarray(remap[lab], 'L').save(os.path.join(OUT, fid + '-ids.png'), optimize=True)
    manifest[fid] = {'width': W, 'height': H, 'elements': kept}
    im.save(os.path.join(OUT, fid + '.webp'), quality=84, alpha_quality=90, method=6)
    print(f'{fid:24s} splash={len(splash)} pieces={len(pieces)} (of {len(elements)})  {os.path.getsize(os.path.join(OUT, fid + ".webp"))//1024} KB')

with open(MANIFEST, 'w') as fh:
    json.dump(manifest, fh, separators=(',', ':'))
print('manifest →', os.path.relpath(MANIFEST, ROOT))
