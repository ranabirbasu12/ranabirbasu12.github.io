/* How individual buildings look, one at a time.
   Keyed by OpenStreetMap way id ("w123") or by a landmark key from the map (e.g. "main_building").
   Fields:
     floors        storeys
     wall          cream, butter, blush, white, sage, brick, grey, or a #hex
     roof          concrete, warm, grey, solar, tile, tin, or a #hex
     roofAccents   [[x0, y0, x1, y1], ...] map-tile rectangles painted with terracotta tiles
     towerAt       [x, y] map tile where a tower rises from the roof
     roofAccents   entries may end with a style: 'tile' (default) or 'solar'
     fanCenter     [x, y]: an auditorium roof with ribs fanning out from this point
     ring          metres: the building is a band this deep round a courtyard
     shift         [dx, dy] in map tiles, for an outline that sits a little off
     hide          true: drop an outline that doesn't match anything real
     shutters      true / false
   KGP_EXTRA_BUILDINGS adds buildings the map doesn't have, traced from imagery in map tiles, as
   p: [[x, y], ...], rect: [x0, y0, x1, y1], circle: [cx, cy, r] or sector: [cx, cy, r, fromDeg, toDeg].
   KGP_LANDMARKS moves a landmark's spot (where its sign and people stand) to [x, y].
   KGP_AREAS adds ground features: { k: 'track', outer: [x0, y0, x1, y1, rTop, rBottom], inner: [...] }
   or { k: 'plaza', outer: [...] } for open, tree-free ground.
   Anything not listed falls back to a guess from the building's size and name.
   Reference: satellite imagery (Esri World Imagery) checked by eye; nothing from it is stored here. */

window.KGP_BUILDINGS = {
  // Main Building: a north-south spine facing GolC, with three wings running east.
  // Grey roofs under rows of solar panels, terracotta over parts of the spine, the tower by the roundabout.
  main_building: {
    wall: 'brick', roof: 'solar', floors: 3, shutters: false,
    towerAt: [180.0, 85.4],
    roofAccents: [[182.0, 87.2, 184.1, 90.2], [181.8, 92.0, 184.2, 95.8], [183.4, 95.8, 184.5, 97.7], [196.5, 78.3, 199.2, 81.6]]
  },
  // Hijli Shaheed Bhavan (Nehru Museum): the old detention camp, red brick, two storeys
  nehru_museum: { wall: 'brick', roof: 'tile', floors: 2, shutters: false },

  /* ---- Halls of residence ---- */

  // RP: long east-west blocks with solar panels across the roofs
  w1481028447: { roof: 'solar', wall: 'cream', floors: 3 },
  // RK: a comb, four long wings off a north-south spine, solar roofs
  w1481028450: { roof: 'solar', wall: 'cream', floors: 3 },
  // MS: a quadrangle round a big open courtyard; the map only has its outer edge
  w1481028451: { roof: 'solar', wall: 'butter', floors: 3, ring: 15 },
  // LLR: wings off a spine, solar roofs, a darker older block to the south-west
  w1481028452: { roof: 'solar', wall: 'cream', floors: 3 },
  // MMM: the new towers, cream walls, much taller than the old halls going by their shadows
  w1481028455: { roof: 'warm', wall: 'cream', floors: 8 },
  w1481028456: { roof: 'warm', wall: 'cream', floors: 8 },
  w1481028457: { roof: 'warm', wall: 'cream', floors: 8 },
  w1481028458: { roof: 'warm', wall: 'cream', floors: 8 },
  w1481028459: { roof: 'warm', wall: 'cream', floors: 8 },
  // LBS: cream blocks running north-south, terracotta caps, solar on the links
  w1490457166: { roof: 'warm', wall: 'cream', floors: 4 },
  // Patel and Nehru: the 1950s halls, long wings under terracotta tile roofs
  w1481028443: { roof: 'tile', wall: 'butter', floors: 3 },
  w1481028442: { roof: 'tile', wall: 'butter', floors: 3 },
  // An outline drawn loosely round Azad and the woods beside it; Azad is traced below instead
  w1481028441: { hide: true },

  /* ---- Academic area ---- */

  // Mining Engineering: a pale green roof over the main block, solar panels on the block behind
  w1481028070: { roof: '#9fcaa9', wall: 'white', floors: 3, roofAccents: [[195.5, 69.0, 203.6, 71.3, 'solar']] },
  // Architecture and Regional Planning: solar roof; its annex sits under terracotta tiles
  w133655270: { roof: 'solar', wall: 'cream', floors: 3 },
  w133655838: { roof: 'tile', wall: 'cream', floors: 2 },
  // Takshashila: one big flat roof covered in solar panels
  w1481028128: { roof: 'solar', wall: 'white', floors: 4 },
  // Nalanda and Vikramshila are mapped as single blobs; both are traced below instead
  w1481028139: { hide: true },
  w1481028135: { hide: true },
  // the terracotta-roofed building just east of Nalanda
  w1481028140: { roof: 'tile', floors: 2 },

  /* ---- Landmarks ---- */

  // the old hangar from the wartime Hijli airfield, beside the museum: a rust-brown roof
  w133658943: { roof: '#9b6b4b', wall: '#8a8a80', floors: 2, shutters: false },
  // TOAT's stage, at the point of the fan of seats
  w1481028077: { roof: '#6b7a8a', wall: 'cream', floors: 2, shutters: false },
  // Technology Students' Gymkhana, on the north shore of TSG Lake
  w1481028042: { roof: 'grey', wall: 'cream', floors: 2, roofAccents: [[80.3, 103.8, 81.2, 105.0, 'tile']] },
  w1481028040: { roof: 'grey', wall: 'cream', floors: 2 },
  // Tech Market is rows of low sheds; the mapped outline is a stray shape over the trees
  w1481028020: { hide: true }
};

window.KGP_AREAS = [
  // Jnan Ghosh Stadium: the red 400 m track round the field, and the sprint straight on its east side
  { k: 'track', outer: [105.6, 100.5, 119.6, 119.2, 2.5, 7], inner: [109.1, 102.5, 117.0, 115.5, 1, 4] },
  { k: 'track', outer: [119.2, 102.0, 121.7, 114.4, 0, 0] },
  // Tech Market stands in an open clearing of beaten earth and paving
  { k: 'plaza', outer: [46.0, 150.6, 59.5, 159.6, 1.5, 1.5] }
];

window.KGP_LANDMARKS = {
  // the Main Building's entrance faces GolC, beside the tower
  main_building: [177, 86],
  // in the orchestra of TOAT, in front of the stage
  open_air_theatre: [171, 102],
  // in front of Kalidas, south-west of the auditorium
  kalidas: [185, 135]
};

window.KGP_EXTRA_BUILDINGS = [
  // Azad Hall: three terracotta-roofed wings like Patel and Nehru, a newer solar-roofed wing to the
  // south, a corridor joining them, and a solar-roofed block to the north-east
  { name: 'Azad Hall of Residence', roof: 'tile', wall: 'butter', floors: 3, p: [[22.3, 103.7], [33.2, 102.6], [33.3, 103.6], [22.4, 104.6]] },
  { name: 'Azad Hall of Residence', roof: 'tile', wall: 'butter', floors: 3, p: [[23.0, 107.9], [36.9, 106.8], [37.0, 107.9], [23.1, 109.0]] },
  { name: 'Azad Hall of Residence', roof: 'tile', wall: 'butter', floors: 3, p: [[27.7, 112.3], [37.4, 111.3], [37.5, 112.6], [27.8, 113.3]] },
  { name: 'Azad Hall of Residence', roof: 'solar', wall: 'cream', floors: 3, p: [[24.1, 116.4], [39.0, 114.9], [39.1, 116.1], [24.2, 117.5]] },
  { name: 'Azad Hall of Residence', roof: 'grey', wall: 'butter', floors: 1, p: [[32.9, 103.6], [33.7, 103.5], [33.9, 115.0], [33.1, 115.1]] },
  { name: 'Azad Hall of Residence', roof: 'solar', wall: 'cream', floors: 3, p: [[37.3, 104.5], [39.5, 104.3], [39.7, 108.9], [37.5, 109.1]] },

  // Nalanda: two circular blocks round courtyards, a courtyard block to the west, a long corridor
  // through them, a north-south bar, and a solar-roofed block to the south
  { name: 'Nalanda Classroom Complex', wall: 'white', floors: 4, roof: 'concrete', circle: [265.6, 114.7, 2.9], ring: 7 },
  { name: 'Nalanda Classroom Complex', wall: 'white', floors: 4, roof: 'concrete', circle: [270.5, 120.9, 2.9], ring: 7 },
  { name: 'Nalanda Classroom Complex', wall: 'white', floors: 4, roof: 'grey', rect: [255.2, 112.8, 263.0, 119.2], ring: 7 },
  { name: 'Nalanda Classroom Complex', wall: 'white', floors: 4, roof: 'grey', rect: [256.6, 114.4, 267.8, 116.5] },
  { name: 'Nalanda Classroom Complex', wall: 'white', floors: 4, roof: 'concrete', rect: [268.7, 113.8, 272.0, 118.5] },
  { name: 'Nalanda Classroom Complex', wall: 'white', floors: 4, roof: 'grey', rect: [269.4, 118.5, 271.2, 123.6] },
  { name: 'Nalanda Classroom Complex', wall: 'white', floors: 4, roof: 'concrete', rect: [269.4, 112.4, 273.2, 114.2] },
  { name: 'Nalanda Classroom Complex', wall: 'white', floors: 4, roof: 'solar', rect: [266.6, 125.0, 274.4, 130.4], ring: 7 },

  // Kalidas Auditorium: the fan of seating seen from above, and the stage block behind it
  { name: 'Kalidas Auditorium', wall: 'cream', floors: 2, roof: 'warm', sector: [187.74, 131.56, 3.8, 124, 229] },
  { name: 'Kalidas Auditorium', wall: 'cream', floors: 4, roof: '#d9d9d4', rect: [187.6, 129.0, 190.1, 132.2] },
  // Vikramshila: lecture blocks under solar panels round the auditorium, joined by a long corridor
  { name: 'Vikramshila Complex', wall: 'white', floors: 3, roof: 'solar', rect: [190.1, 128.9, 195.8, 133.2] },
  { name: 'Vikramshila Complex', wall: 'white', floors: 2, roof: 'solar', rect: [191.9, 133.1, 193.9, 140.0] },
  { name: 'Vikramshila Complex', wall: 'white', floors: 3, roof: 'solar', rect: [186.2, 136.7, 192.3, 140.2] },
  { name: 'Vikramshila Complex', wall: 'white', floors: 3, roof: 'solar', rect: [186.8, 140.2, 193.2, 144.0] },
  { wall: 'cream', floors: 1, roof: '#8a6a4f', rect: [190.1, 124.9, 192.5, 128.4] },

  // east of the Main Building: an L of terracotta roofs and a large concrete block the map is missing
  { wall: 'cream', floors: 2, roof: 'tile', rect: [224.4, 91.9, 229.4, 93.7] },
  { wall: 'cream', floors: 2, roof: 'tile', rect: [225.0, 90.2, 226.7, 92.0] },
  { wall: 'white', floors: 3, roof: 'concrete', rect: [218.2, 87.8, 223.5, 95.0] },

  // Tagore Open Air Theatre: a half-moon of tiered seats fanning out from the stage
  { name: 'Tagore Open Air Theatre', wall: '#b8a48a', floors: 1, roof: 'warm', shutters: false, sector: [170.4, 99.6, 7.3, 95, 180, 3.4] },
  // the stand on the west side of Jnan Ghosh
  { name: 'Jnan Ghosh Stadium', wall: 'cream', floors: 1, roof: '#5d7d9a', shutters: false, rect: [103.0, 107.1, 104.2, 111.2] },
  // Tech Market: rows of shop sheds either side of a lane
  { name: 'Tech Market', wall: 'cream', floors: 1, roof: '#7d7a72', shutters: false, rect: [46.8, 151.5, 53.0, 152.3] },
  { name: 'Tech Market', wall: 'cream', floors: 1, roof: '#7d7a72', shutters: false, rect: [51.0, 152.8, 53.0, 153.6] },
  { name: 'Tech Market', wall: 'cream', floors: 1, roof: '#7d7a72', shutters: false, rect: [48.0, 154.2, 53.0, 155.0] },
  { name: 'Tech Market', wall: 'cream', floors: 1, roof: '#7d7a72', shutters: false, rect: [50.0, 155.8, 53.0, 156.6] },
  { name: 'Tech Market', wall: 'cream', floors: 1, roof: '#7d7a72', shutters: false, rect: [51.6, 157.8, 53.6, 158.7] },
  { name: 'Tech Market', wall: 'cream', floors: 1, roof: '#7d7a72', shutters: false, rect: [55.0, 155.0, 58.1, 155.9] }
];
