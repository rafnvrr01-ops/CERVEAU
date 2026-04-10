// world.js - Génération procédurale du monde
export const CONFIG = {
  TILE: 40, MAP_W: 180, MAP_H: 135,
  WORLD_W: 7200, WORLD_H: 5400,
  CANVAS_W: 680, CANVAS_H: 480,
};

export const BIOMES = {
  WATER:    { id: 0, name: 'eau',            walkable: false, color: '#2a5a8a' },
  SAND:     { id: 1, name: 'sable',          walkable: true,  color: '#d4c47a' },
  GRASS:    { id: 2, name: 'prairie',        walkable: true,  color: '#5a8a3a' },
  DGRASS:   { id: 3, name: 'prairie sombre', walkable: true,  color: '#3a6a2a' },
  FOREST:   { id: 4, name: 'forêt',          walkable: true,  color: '#2a5a1a' },
  DESERT:   { id: 5, name: 'désert',         walkable: true,  color: '#c4a55a' },
  TUNDRA:   { id: 6, name: 'toundra',        walkable: true,  color: '#9aaa9a' },
  MOUNTAIN: { id: 7, name: 'montagne',       walkable: false, color: '#6a6a6a' },
  SNOW:     { id: 8, name: 'sommet',         walkable: false, color: '#e8e8f0' },
};
const BIOME_LIST = Object.values(BIOMES);

function hash2(x, y, s) {
  let h = x * 374761393 + y * 668265263 + s * 1442695040;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
const smooth = t => t * t * (3 - 2 * t);

function noise2D(x, y, s) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const a = hash2(xi, yi, s),     b = hash2(xi+1, yi, s);
  const c = hash2(xi, yi+1, s),   d = hash2(xi+1, yi+1, s);
  const u = smooth(xf), v = smooth(yf);
  return (a*(1-u) + b*u) * (1-v) + (c*(1-u) + d*u) * v;
}

function octave(x, y, s, oct, pers, scale) {
  let total = 0, amp = 1, freq = scale, max = 0;
  for (let i = 0; i < oct; i++) {
    total += noise2D(x*freq, y*freq, s + i*17) * amp;
    max += amp; amp *= pers; freq *= 2;
  }
  return total / max;
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

export function generateWorld(seed = Date.now() & 0xffff) {
  const W = CONFIG.MAP_W, H = CONFIG.MAP_H;
  const tiles = new Uint8Array(W * H);
  const heightMap = new Float32Array(W * H);
  const humidMap = new Float32Array(W * H);
  const tempMap = new Float32Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const h = octave(x, y, seed, 5, 0.55, 0.018);
      const hum = octave(x, y, seed+500, 4, 0.60, 0.022);
      const t = octave(x, y, seed+1000, 3, 0.50, 0.014);
      const i = y*W + x;
      heightMap[i] = h; humidMap[i] = hum; tempMap[i] = t;
      tiles[i] = pickBiome(h, hum, t).id;
    }
  }
  return { tiles, heightMap, humidMap, tempMap, seed, W, H };
}

export function getTile(world, tx, ty) {
  if (tx < 0 || ty < 0 || tx >= world.W || ty >= world.H) return BIOMES.MOUNTAIN.id;
  return world.tiles[ty * world.W + tx];
}
export function getBiomeAt(world, wx, wy) {
  return BIOME_LIST[getTile(world, Math.floor(wx/CONFIG.TILE), Math.floor(wy/CONFIG.TILE))] || BIOMES.MOUNTAIN;
}
export function canWalk(world, wx, wy) {
  return getBiomeAt(world, wx, wy).walkable;
}
export function findWalkableSpawn(world) {
  for (let i = 0; i < 5000; i++) {
    const x = (0.3 + Math.random()*0.4) * CONFIG.WORLD_W;
    const y = (0.3 + Math.random()*0.4) * CONFIG.WORLD_H;
    if (canWalk(world, x, y)) return { x, y };
  }
  return { x: CONFIG.WORLD_W/2, y: CONFIG.WORLD_H/2 };
}
