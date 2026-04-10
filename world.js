// world.js - Monde procédural lazy borné 50000x50000
export const CONFIG = {
  TILE: 60,
  WORLD_W: 50000, WORLD_H: 50000,
  MAP_W: Math.ceil(50000/60), MAP_H: Math.ceil(50000/60),
  CHUNK: 16,
  CANVAS_W: typeof window !== 'undefined' ? window.innerWidth : 1280,
  CANVAS_H: typeof window !== 'undefined' ? window.innerHeight - 120 : 720,
};

export function updateCanvasSize() {
  if (typeof window !== 'undefined') {
    CONFIG.CANVAS_W = window.innerWidth;
    CONFIG.CANVAS_H = window.innerHeight - 120;
  }
}

export const BIOMES = {
  WATER:    { id: 0, name: 'eau',            walkable: false, color: '#2a5a8a', speedMult: 0,    warmthDelta: 0 },
  SAND:     { id: 1, name: 'sable',          walkable: true,  color: '#d4c47a', speedMult: 0.85, warmthDelta: 0.1 },
  GRASS:    { id: 2, name: 'prairie',        walkable: true,  color: '#5a8a3a', speedMult: 1,    warmthDelta: 0 },
  DGRASS:   { id: 3, name: 'prairie sombre', walkable: true,  color: '#3a6a2a', speedMult: 1,    warmthDelta: 0 },
  FOREST:   { id: 4, name: 'forêt',          walkable: true,  color: '#2a5a1a', speedMult: 0.85, warmthDelta: 0 },
  DESERT:   { id: 5, name: 'désert',         walkable: true,  color: '#c4a55a', speedMult: 0.85, warmthDelta: 0.2 },
  TUNDRA:   { id: 6, name: 'toundra',        walkable: true,  color: '#9aaa9a', speedMult: 0.85, warmthDelta: -0.3 },
  MOUNTAIN: { id: 7, name: 'montagne',       walkable: true,  color: '#6a6a6a', speedMult: 0.5,  warmthDelta: -0.4 },
  SNOW:     { id: 8, name: 'sommet',         walkable: true,  color: '#e8e8f0', speedMult: 0.4,  warmthDelta: -0.6 },
};
export const BIOME_LIST = Object.values(BIOMES);

function hash2(x, y, s) {
  let h = x*374761393 + y*668265263 + s*1442695040;
  h = (h ^ (h>>>13)) * 1274126177;
  return ((h ^ (h>>>16)) >>> 0) / 4294967295;
}
const smooth = t => t*t*(3 - 2*t);
function noise2D(x, y, s) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const a = hash2(xi,yi,s), b = hash2(xi+1,yi,s);
  const c = hash2(xi,yi+1,s), d = hash2(xi+1,yi+1,s);
  const u = smooth(xf), v = smooth(yf);
  return (a*(1-u)+b*u)*(1-v) + (c*(1-u)+d*u)*v;
}
function octave(x, y, s, oct, pers, scale) {
  let total=0, amp=1, freq=scale, max=0;
  for (let i=0; i<oct; i++) {
    total += noise2D(x*freq, y*freq, s+i*17) * amp;
    max += amp; amp *= pers; freq *= 2;
  }
  return total/max;
}
function pickBiome(h, hum, t) {
  if (h < 0.30) return BIOMES.WATER;
  if (h > 0.85) return BIOMES.SNOW;
  if (h > 0.72) return BIOMES.MOUNTAIN;
  if (h < 0.36) return BIOMES.SAND;
  if (t < 0.30) return BIOMES.TUNDRA;
  if (t > 0.70 && hum < 0.35) return BIOMES.DESERT;
  if (hum > 0.65) return BIOMES.FOREST;
  if (hum > 0.45) return BIOMES.DGRASS;
  return BIOMES.GRASS;
}

const tileCache = new Map(); // key "tx,ty" -> biome id
const CACHE_MAX = 50000;

export function createWorld(seed = Date.now() & 0xffff) {
  return { seed, W: CONFIG.MAP_W, H: CONFIG.MAP_H };
}

export function getTile(world, tx, ty) {
  if (tx < 0 || ty < 0 || tx >= world.W || ty >= world.H) return BIOMES.MOUNTAIN.id;
  const k = tx + ',' + ty;
  if (tileCache.has(k)) return tileCache.get(k);
  const h = octave(tx, ty, world.seed, 5, 0.55, 0.018);
  const hum = octave(tx, ty, world.seed+500, 4, 0.60, 0.022);
  const t = octave(tx, ty, world.seed+1000, 3, 0.50, 0.014);
  const id = pickBiome(h, hum, t).id;
  if (tileCache.size >= CACHE_MAX) tileCache.clear();
  tileCache.set(k, id);
  return id;
}
export function getBiomeAt(world, wx, wy) {
  return BIOME_LIST[getTile(world, Math.floor(wx/CONFIG.TILE), Math.floor(wy/CONFIG.TILE))];
}
export function canWalk(world, wx, wy) {
  return getBiomeAt(world, wx, wy).walkable;
}
export function findWalkableSpawn(world) {
  for (let i = 0; i < 5000; i++) {
    const x = (0.4 + Math.random()*0.2) * CONFIG.WORLD_W;
    const y = (0.4 + Math.random()*0.2) * CONFIG.WORLD_H;
    const b = getBiomeAt(world, x, y);
    if (b.walkable && b.id !== BIOMES.MOUNTAIN.id && b.id !== BIOMES.SNOW.id) return { x, y };
  }
  return { x: CONFIG.WORLD_W/2, y: CONFIG.WORLD_H/2 };
}

// Density per biome id: { tree, rock, cow, deer, wolf }
const DENSITY = {
  0: null, // water
  1: null, // sand
  2: { tree: 0.03, cow: 0.01, deer: 0 }, // grass
  3: { tree: 0.08 }, // dgrass
  4: { tree: 0.25, deer: 0.01, wolf: 0.005 }, // forest
  5: { rock: 0.01 }, // desert
  6: { rock: 0.05, wolf: 0.005 }, // tundra
  7: { rock: 0.30 }, // mountain
  8: null, // snow
};

// Generate entities for one chunk deterministically
export function generateChunkEntities(world, cx, cy) {
  const out = { trees: [], rocks: [], animals: [] };
  for (let dy = 0; dy < CONFIG.CHUNK; dy++) {
    for (let dx = 0; dx < CONFIG.CHUNK; dx++) {
      const tx = cx*CONFIG.CHUNK + dx, ty = cy*CONFIG.CHUNK + dy;
      const id = getTile(world, tx, ty);
      const d = DENSITY[id]; if (!d) continue;
      const r = hash2(tx, ty, world.seed + 9999);
      const wx = tx*CONFIG.TILE + CONFIG.TILE/2 + (hash2(tx,ty,world.seed+1)-0.5)*CONFIG.TILE*0.6;
      const wy = ty*CONFIG.TILE + CONFIG.TILE/2 + (hash2(tx,ty,world.seed+2)-0.5)*CONFIG.TILE*0.6;
      const eid = `${tx}_${ty}`;
      let cum = 0;
      if (d.tree && r < (cum += d.tree)) {
        out.trees.push({ id: eid, x: wx, y: wy, variant: id === 4 ? 'pin' : 'feuillu', hp: 30 });
      } else if (d.rock && r < (cum += d.rock)) {
        const lvl = id === 7 ? Math.floor(hash2(tx,ty,world.seed+3)*5) : (id === 6 ? 1 : 0);
        out.rocks.push({ id: eid, x: wx, y: wy, level: lvl, hp: 40 });
      } else if (d.cow && r < (cum += d.cow)) {
        out.animals.push({ id: eid, x: wx, y: wy, species: 'cow', hp: 50, maxHp: 50, tame: 0, tamed: false, hostile: false, targetX: wx, targetY: wy, wanderCd: 0, attackCd: 0 });
      } else if (d.deer && r < (cum += d.deer)) {
        out.animals.push({ id: eid, x: wx, y: wy, species: 'deer', hp: 40, maxHp: 40, tame: 0, tamed: false, hostile: false, targetX: wx, targetY: wy, wanderCd: 0, attackCd: 0 });
      } else if (d.wolf && r < (cum += d.wolf)) {
        out.animals.push({ id: eid, x: wx, y: wy, species: 'wolf', hp: 30, maxHp: 30, tame: 0, tamed: false, hostile: false, targetX: wx, targetY: wy, wanderCd: 0, attackCd: 0 });
      }
    }
  }
  return out;
}
