"""Bake an OpenStreetMap extract of IIT Kharagpur into the game's tile map.

Usage: python3 -I build_map.py <extract.osm> <out.js>

The extract comes from the OSM API, e.g.
  https://api.openstreetmap.org/api/0.6/map?bbox=87.296,22.309,87.322,22.326

Output is a JS file that sets window.KGP_MAP = {w, h, metresPerTile, tiles, bids, landmarks, ...}.
Map data (c) OpenStreetMap contributors, ODbL.
"""

import json
import math
import random
import sys
import xml.etree.ElementTree as ET

M_PER_TILE = 8.0
LAT0 = 22.3175

# Tile ids, shared with game/js/art.js
GRASS, TREE, ROAD, PATH, BUILDING, WATER, PITCH, PARK, RAIL, PLAZA, FARM, SAND = range(12)
CHARS = "gTr.BwpkR=fs"

# Landmarks the story and signs refer to: key -> (OSM name, kind)
LANDMARKS = {
    "puri_gate": "IIT Puri Gate Security Office",
    "main_building": "IIT Kharagpur - Main Building",
    "mining": "Department of Mining Engineering",
    "nehru_museum": "Nehru Museum of Science & Technology",
    "hijli_jail": "Hijli Jail",
    "tech_market": "Tech Market",
    "central_library": "Central Library",
    "netaji": "Netaji Auditorium",
    "kalidas": "Kalidas Auditorium",
    "vgsom": "Vinod Gupta School of Management",
    "post_office": "Indian Post Kharagpur Technology",
    "gymkhana": "Technology Student Gymkhana",
    "clock_tower": "Clock Tower",
    "tikka": "Tikka",
    "jnan_ghosh": "Jnan Ghosh Stadium",
    "tata_sports": "TATA Sports Complex",
    "rk_hall": "Radhakrishnan Hall of Residence",
    "rp_hall": "Rajendra Prasad Hall of Residence",
    "ms_hall": "Meghnad Saha Hall of Residence",
    "llr_hall": "Lala Lajpat Rai Hall of Residence",
    "mmm_hall": "MMM Hall of Residence",
    "lbs_hall": "LBS Hall of Residence",
    "nehru_hall": "Nehru Hall of Residence",
    "patel_hall": "Patel Hall of Residence",
    "azad_hall": "Azad Hall of Residence",
    "hjb_hall": "HJB Hall of Residence",
    "mt_hall": "Mother Terese Hall of Residence",
    "ig_hall": "Indira Gandhi Hall of Residence",
    "takshashila": "Takshashila Complex",
    "nalanda": "Nalanda Classroom Complex",
    "cse": "DEPT OF COMPUTER SCIENCE AND ENGINEERING",
    "tsg_lake": "TSG Lake",
    "swimming_pool": "Gymkhana Swimming pool",
    "open_air_theatre": "Tagore Open Air Theatre",
    "bc_roy_hospital": "Bidhan Chandra Roy Technology Hospital",
    "cafe_coffee_day": "Cafe Coffee Day",
    "heritage": "Heritage",
    "billoos": "Billoo's",
    "sahara": "Sahara",
    "vs_canteen": "VS Canteen",
    "kalidas_canteen": "Kalida's Canteen",
    "jubilee_park": "Jubilee Park",
    "biodiversity_park": "Plant Biodiversity Park",
    "sbi": "State Bank of India",
    "railway_counter": "Railway Reservation Counter",
}


def main(src, out):
    root = ET.parse(src).getroot()
    b = root.find("bounds")
    minlat, minlon = float(b.get("minlat")), float(b.get("minlon"))
    maxlat, maxlon = float(b.get("maxlat")), float(b.get("maxlon"))
    kx = math.cos(math.radians(LAT0)) * 111320 / M_PER_TILE
    ky = 110540 / M_PER_TILE
    W = int((maxlon - minlon) * kx)
    H = int((maxlat - minlat) * ky)

    def proj(lat, lon):
        return ((lon - minlon) * kx, (maxlat - lat) * ky)

    nodes = {}
    node_tags = []
    for n in root.iter("node"):
        p = proj(float(n.get("lat")), float(n.get("lon")))
        nodes[n.get("id")] = p
        tags = {t.get("k"): t.get("v") for t in n.iter("tag")}
        if "name" in tags:
            node_tags.append((tags, p))

    ways = {}
    for w in root.iter("way"):
        tags = {t.get("k"): t.get("v") for t in w.iter("tag")}
        pts = [nodes[nd.get("ref")] for nd in w.iter("nd") if nd.get("ref") in nodes]
        ways[w.get("id")] = (tags, pts)

    # Multipolygon outers (TSG Lake, the stadium) become plain areas.
    areas = []
    for wid, (tags, pts) in ways.items():
        if len(pts) > 2 and pts[0] == pts[-1]:
            areas.append((tags, pts, "w" + wid))
    for r in root.iter("relation"):
        tags = {t.get("k"): t.get("v") for t in r.iter("tag")}
        if tags.get("type") != "multipolygon":
            continue
        for m in r.iter("member"):
            if m.get("type") == "way" and m.get("role") == "outer" and m.get("ref") in ways:
                pts = ways[m.get("ref")][1]
                if len(pts) > 2:
                    areas.append((tags, pts, "r" + r.get("id")))

    grid = [[GRASS] * W for _ in range(H)]
    bid = [[0] * W for _ in range(H)]
    bnames = {}

    def fill_poly(pts, fn):
        xs = [p[0] for p in pts]
        ys = [p[1] for p in pts]
        x0, x1 = max(0, int(min(xs))), min(W - 1, int(max(xs)) + 1)
        y0, y1 = max(0, int(min(ys))), min(H - 1, int(max(ys)) + 1)
        n = len(pts)
        for ty in range(y0, y1 + 1):
            cy = ty + 0.5
            # scanline crossings
            xsx = []
            for i in range(n):
                ax, ay = pts[i]
                bx, by = pts[(i + 1) % n]
                if (ay <= cy < by) or (by <= cy < ay):
                    xsx.append(ax + (cy - ay) * (bx - ax) / (by - ay))
            xsx.sort()
            for k in range(0, len(xsx) - 1, 2):
                for tx in range(max(x0, int(math.ceil(xsx[k] - 0.5))), min(x1, int(xsx[k + 1] - 0.5)) + 1):
                    fn(tx, ty)

    def area_kind(tags):
        if tags.get("natural") == "water" or "water" in tags or tags.get("leisure") == "swimming_pool":
            return WATER
        if tags.get("leisure") in ("pitch", "stadium") or tags.get("landuse") == "recreation_ground":
            return PITCH
        if tags.get("leisure") in ("park", "garden") or tags.get("natural") == "grassland":
            return PARK
        if tags.get("landuse") in ("farmyard", "farmland"):
            return FARM
        if tags.get("landuse") == "forest":
            return TREE
        return None

    # Land cover, largest first so small features win.
    cover = [(a, area_kind(a[0])) for a in areas]
    cover = [(a, k) for a, k in cover if k is not None]
    cover.sort(key=lambda c: -poly_area(c[0][1]))
    for (tags, pts, _), k in cover:
        def put(x, y, k=k):
            grid[y][x] = k
        fill_poly(pts, put)

    # Rail first, so road bridges can cross it.
    def stamp_line(pts, kind, radius, guard=None):
        for i in range(len(pts) - 1):
            (ax, ay), (bx, by) = pts[i], pts[i + 1]
            steps = int(max(abs(bx - ax), abs(by - ay)) * 2) + 1
            for s in range(steps + 1):
                x = ax + (bx - ax) * s / steps
                y = ay + (by - ay) * s / steps
                for dy in range(-radius, radius + 1):
                    for dx in range(-radius, radius + 1):
                        if dx * dx + dy * dy > radius * radius + radius:
                            continue
                        tx, ty = int(x) + dx, int(y) + dy
                        if 0 <= tx < W and 0 <= ty < H and (guard is None or guard(grid[ty][tx])):
                            grid[ty][tx] = kind

    for tags, pts in ways.values():
        if tags.get("railway") == "rail":
            stamp_line(pts, RAIL, 0)

    widths = {"primary": 1, "primary_link": 1, "secondary": 1, "tertiary": 1, "unclassified": 1,
              "residential": 1, "service": 0, "living_street": 0}
    for tags, pts in ways.values():
        hw = tags.get("highway")
        if not hw or len(pts) < 2:
            continue
        if hw in ("footway", "path", "track", "cycleway", "pedestrian", "steps"):
            stamp_line(pts, PATH, 0, guard=lambda t: t not in (ROAD, WATER))
        elif hw in widths:
            stamp_line(pts, ROAD, widths[hw], guard=(None if tags.get("bridge") == "yes" else lambda t: t != RAIL))

    # Buildings on top. Each gets an id so it can have its own roof and a door.
    next_id = 1
    for tags, pts, key in areas:
        if "building" not in tags or tags.get("building") == "no" and "name" not in tags:
            continue
        this = next_id
        next_id += 1
        name = tags.get("name")
        if name:
            bnames[this] = name
        cells = []

        def put(x, y):
            grid[y][x] = BUILDING
            bid[y][x] = this
            cells.append((x, y))
        fill_poly(pts, put)
        if not cells:
            # Too small to show at this scale: keep named ones as a single tile.
            if name:
                cx = int(sum(p[0] for p in pts) / len(pts))
                cy = int(sum(p[1] for p in pts) / len(pts))
                if 0 <= cx < W and 0 <= cy < H:
                    put(cx, cy)

    # Trees: KGP is green. Scatter them on open grass away from roads and doors.
    rng = random.Random(1951)
    def near(x, y, kinds, r):
        for dy in range(-r, r + 1):
            for dx in range(-r, r + 1):
                tx, ty = x + dx, y + dy
                if 0 <= tx < W and 0 <= ty < H and grid[ty][tx] in kinds:
                    return True
        return False
    for y in range(H):
        for x in range(W):
            g = grid[y][x]
            if g == GRASS and not near(x, y, (ROAD, PATH, BUILDING, RAIL, WATER, PITCH), 1):
                if rng.random() < 0.16:
                    grid[y][x] = TREE
            elif g == PARK and rng.random() < 0.05 and not near(x, y, (ROAD, PATH, BUILDING), 1):
                grid[y][x] = TREE
    # A wall of trees around the edge of the world.
    for x in range(W):
        for y in (0, H - 1):
            if grid[y][x] == GRASS:
                grid[y][x] = TREE
    for y in range(H):
        for x in (0, W - 1):
            if grid[y][x] == GRASS:
                grid[y][x] = TREE

    walkable = lambda t: t not in (TREE, BUILDING, WATER, RAIL)

    def road_dist_field():
        # BFS distance from road over walkable tiles, to pick sensible doors.
        INF = 1 << 30
        dist = [[INF] * W for _ in range(H)]
        q = []
        for y in range(H):
            for x in range(W):
                if grid[y][x] in (ROAD, PATH):
                    dist[y][x] = 0
                    q.append((x, y))
        i = 0
        while i < len(q):
            x, y = q[i]
            i += 1
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                tx, ty = x + dx, y + dy
                if 0 <= tx < W and 0 <= ty < H and dist[ty][tx] == INF and walkable(grid[ty][tx]):
                    dist[ty][tx] = dist[y][x] + 1
                    q.append((tx, ty))
        return dist
    dist = road_dist_field()

    def door_for(b):
        """The walkable tile in front of building b, preferring a south face near a road."""
        best = None
        for y in range(H):
            for x in range(W):
                if bid[y][x] != b:
                    continue
                for dx, dy, pref in ((0, 1, 0), (1, 0, 2), (-1, 0, 2), (0, -1, 3)):
                    tx, ty = x + dx, y + dy
                    if 0 <= tx < W and 0 <= ty < H and walkable(grid[ty][tx]):
                        score = dist[ty][tx] * 2 + pref
                        if best is None or score < best[0]:
                            best = (score, tx, ty, x, y)
        return best

    def nearest_walkable(px, py):
        x0, y0 = int(px), int(py)
        for r in range(0, 40):
            best = None
            for dy in range(-r, r + 1):
                for dx in range(-r, r + 1):
                    if max(abs(dx), abs(dy)) != r:
                        continue
                    tx, ty = x0 + dx, y0 + dy
                    if 0 <= tx < W and 0 <= ty < H and walkable(grid[ty][tx]) and dist[ty][tx] < 1 << 29:
                        d = dx * dx + dy * dy
                        if best is None or d < best[0]:
                            best = (d, tx, ty)
            if best:
                return best[1], best[2]
        return x0, y0

    by_name = {}
    for b_id, name in bnames.items():
        by_name.setdefault(name, []).append(b_id)

    landmarks = {}
    for key, name in LANDMARKS.items():
        hit = None
        if name in by_name:
            # the largest building with that name
            ids = by_name[name]
            sizes = {i: sum(row.count(i) for row in bid) for i in ids}
            b_id = max(ids, key=lambda i: sizes[i])
            d = door_for(b_id)
            if d:
                hit = {"x": d[1], "y": d[2], "bx": d[3], "by": d[4], "bid": b_id}
        if not hit:
            pos = [p for tags, p in node_tags if tags.get("name") == name]
            if not pos:
                pos = [centroid(pts) for tags, pts, _ in areas if tags.get("name") == name]
            if not pos:
                pos = [centroid(pts) for tags, pts in ways.values() if tags.get("name") == name]
            if pos:
                px, py = pos[0]
                tx, ty = int(px), int(py)
                inside = bid[ty][tx] if 0 <= tx < W and 0 <= ty < H else 0
                # A point inside a big complex (an auditorium inside the Main Building) gets
                # its own spot nearby rather than the complex's front door.
                if inside and sum(row.count(inside) for row in bid) < 120:
                    d = door_for(inside)
                    if d:
                        hit = {"x": d[1], "y": d[2], "bx": d[3], "by": d[4], "bid": inside}
                if not hit:
                    wx, wy = nearest_walkable(px, py)
                    hit = {"x": wx, "y": wy}
        if hit:
            hit["name"] = name
            landmarks[key] = hit
        else:
            print("landmark not found:", key, name, file=sys.stderr)

    tiles = ["".join(CHARS[t] for t in row) for row in grid]
    flat = [v for row in bid for v in row]
    rle = []
    i = 0
    while i < len(flat):
        j = i
        while j < len(flat) and flat[j] == flat[i]:
            j += 1
        rle += [flat[i], j - i]
        i = j

    data = {
        "w": W, "h": H, "metresPerTile": M_PER_TILE,
        "bounds": [minlat, minlon, maxlat, maxlon],
        "tiles": tiles, "bids": rle,
        "buildingNames": {str(k): v for k, v in bnames.items()},
        "landmarks": landmarks,
        "attribution": "Map data © OpenStreetMap contributors (ODbL)",
    }
    with open(out, "w") as f:
        f.write("/* Generated by tools/build_map.py from OpenStreetMap. Map data (c) OpenStreetMap contributors, ODbL. */\n")
        f.write("window.KGP_MAP = ")
        json.dump(data, f, separators=(",", ":"))
        f.write(";\n")
    print("map %dx%d, %d buildings, %d landmarks" % (W, H, next_id - 1, len(landmarks)))


def poly_area(pts):
    a = 0
    for i in range(len(pts)):
        x1, y1 = pts[i]
        x2, y2 = pts[(i + 1) % len(pts)]
        a += x1 * y2 - x2 * y1
    return abs(a) / 2


def centroid(pts):
    return (sum(p[0] for p in pts) / len(pts), sum(p[1] for p in pts) / len(pts))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
