"""Reference crop of satellite imagery with a map-tile grid and the OSM outlines drawn on top,
for matching buildings one at a time in js/buildings.js.

Usage (run it from a scratch folder; tiles are cached there and nothing is saved in the repo):
  python3 -I sat_grid.py <path/to/js/kgp-map.js> <name> <centre x> <centre y> <half-size in tiles>
Writes grid_<name>.jpg. Imagery: Esri World Imagery, for viewing only.
"""
import json, math, os, subprocess, sys
from PIL import Image, ImageDraw
MAPJS, name, cx, cy, half = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4]), float(sys.argv[5])
s = open(MAPJS).read(); d = json.loads(s[s.index('=') + 1:].rstrip().rstrip(';'))
minlat, minlon, maxlat, maxlon = d['bounds']
kx = math.cos(math.radians(22.3175)) * 111320 / 8; ky = 110540 / 8
Z = 18; N = 2 ** Z * 256
def t2px(x, y):
    lat, lon = maxlat - y / ky, minlon + x / kx
    return (lon + 180) / 360 * N, (1 - math.log(math.tan(math.radians(lat)) + 1 / math.cos(math.radians(lat))) / math.pi) / 2 * N
X0, Y0 = t2px(cx - half, cy - half); X1, Y1 = t2px(cx + half, cy + half)
tx0, tx1, ty0, ty1 = int(X0 // 256), int(X1 // 256), int(Y0 // 256), int(Y1 // 256)
im = Image.new('RGB', ((tx1 - tx0 + 1) * 256, (ty1 - ty0 + 1) * 256))
for ty in range(ty0, ty1 + 1):
    for tx in range(tx0, tx1 + 1):
        f = f't_{tx}_{ty}.jpg'
        if not os.path.exists(f) or os.path.getsize(f) < 1000:
            subprocess.run(['curl', '-sS', '--max-time', '20', '-o', f, f'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{Z}/{ty}/{tx}'])
        im.paste(Image.open(f), ((tx - tx0) * 256, (ty - ty0) * 256))
crop = im.crop((int(X0 - tx0 * 256), int(Y0 - ty0 * 256), int(X1 - tx0 * 256), int(Y1 - ty0 * 256)))
sc = 900 / max(crop.size); crop = crop.resize((int(crop.size[0] * sc), int(crop.size[1] * sc)))
dr = ImageDraw.Draw(crop)
def to_img(x, y):
    X, Y = t2px(x, y); return (X - X0) * sc, (Y - Y0) * sc
for g in range(int(cx - half), int(cx + half) + 1):
    a, b = to_img(g, cy - half), to_img(g, cy + half)
    dr.line([a, b], fill=(255, 255, 255) if g % 5 == 0 else (120, 120, 120), width=1)
    if g % 5 == 0: dr.text((a[0] + 2, 2), str(g), fill=(255, 255, 0))
for g in range(int(cy - half), int(cy + half) + 1):
    a, b = to_img(cx - half, g), to_img(cx + half, g)
    dr.line([a, b], fill=(255, 255, 255) if g % 5 == 0 else (120, 120, 120), width=1)
    if g % 5 == 0: dr.text((2, a[1] + 2), str(g), fill=(255, 255, 0))
for bl in d['buildings']:
    poly = [to_img(x, y) for x, y in bl['p']]
    if all(0 <= p[0] <= crop.size[0] and 0 <= p[1] <= crop.size[1] for p in poly):
        dr.line(poly + [poly[0]], fill=(255, 40, 40), width=2)
crop.save(f'grid_{name}.jpg', quality=88)
print(crop.size)
