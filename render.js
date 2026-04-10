// render.js - Rendu Canvas2D (partie 1: terrain, minimap, ghost)
import { CONFIG, BIOMES } from './world.js';
import { BUILDINGS } from './entities.js';

const BIOME_COLORS = Object.values(BIOMES).map(b => b.color);

let terrainCache = null; // offscreen full-world canvas
let minimapTerrainCache = null;

export function initRenderer(world) {
  // Terrain cache: 1px par tuile pour économie mémoire, scaled au draw
  const W = world.W, H = world.H;
  terrainCache = document.createElement('canvas');
  terrainCache.width = W * CONFIG.TILE;
  terrainCache.height = H * CONFIG.TILE;
  const tctx = terrainCache.getContext('2d');
  // Draw chaque tuile
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      tctx.fillStyle = BIOME_COLORS[world.tiles[y*W + x]];
      tctx.fillRect(x*CONFIG.TILE, y*CONFIG.TILE, CONFIG.TILE, CONFIG.TILE);
    }
  }
  // Minimap cache (Bug 4: pre-render terrain en 130x130)
  minimapTerrainCache = document.createElement('canvas');
  minimapTerrainCache.width = 130; minimapTerrainCache.height = 130;
  const mctx = minimapTerrainCache.getContext('2d');
  const sx = 130 / W, sy = 130 / H;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      mctx.fillStyle = BIOME_COLORS[world.tiles[y*W + x]];
      mctx.fillRect(x*sx, y*sy, sx + 1, sy + 1);
    }
  }
}

export function drawTerrain(ctx, camera) {
  // Blit la portion visible du cache offscreen
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    terrainCache,
    camera.x, camera.y, CONFIG.CANVAS_W, CONFIG.CANVAS_H,
    0, 0, CONFIG.CANVAS_W, CONFIG.CANVAS_H
  );
}

export function drawNightOverlay(ctx, timeOfDay) {
  // timeOfDay 0..1 (0.25 = 6h, 0.75 = 18h)
  let alpha = 0;
  if (timeOfDay < 0.20 || timeOfDay > 0.85) alpha = 0.5;
  else if (timeOfDay < 0.30) alpha = (0.30 - timeOfDay) * 5;
  else if (timeOfDay > 0.75) alpha = (timeOfDay - 0.75) * 5;
  if (alpha > 0) {
    // Teinte orangée à l'aube/crépuscule
    const orange = (timeOfDay < 0.30 || timeOfDay > 0.75) && alpha < 0.4;
    ctx.fillStyle = orange ? `rgba(80, 40, 20, ${alpha})` : `rgba(10, 10, 40, ${alpha})`;
    ctx.fillRect(0, 0, CONFIG.CANVAS_W, CONFIG.CANVAS_H);
  }
}

export function drawWeather(ctx, weather, t) {
  if (weather === 'Pluie' || weather === 'Tempête') {
    const n = weather === 'Tempête' ? 80 : 40;
    ctx.strokeStyle = 'rgba(180,200,255,0.6)'; ctx.lineWidth = 1;
    for (let i = 0; i < n; i++) {
      const x = ((i * 73 + t * 200) % CONFIG.CANVAS_W);
      const y = ((i * 131 + t * 400) % CONFIG.CANVAS_H);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 2, y + 8); ctx.stroke();
    }
  }
}

export function drawSnow(ctx, t) {
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  for (let i = 0; i < 50; i++) {
    const x = (i * 97 + t * 30) % CONFIG.CANVAS_W;
    const y = (i * 53 + t * 60) % CONFIG.CANVAS_H;
    ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI*2); ctx.fill();
  }
}

export function drawMinimap(mctx, state) {
  // Re-blit cache + entités dynamiques (Bug 4)
  mctx.drawImage(minimapTerrainCache, 0, 0);
  const sx = 130 / state.world.W / CONFIG.TILE;
  const sy = 130 / state.world.H / CONFIG.TILE;
  // Bâtiments
  mctx.fillStyle = '#8b4513';
  for (const b of state.buildings) mctx.fillRect(b.x*sx - 1, b.y*sy - 1, 2, 2);
  // Villages
  for (const v of state.villages) {
    mctx.fillStyle = v.color;
    mctx.fillRect(v.x*sx - 2, v.y*sy - 2, 4, 4);
  }
  // Colons
  mctx.fillStyle = '#ffffff';
  for (const c of state.colons) mctx.fillRect(c.x*sx - 1, c.y*sy - 1, 2, 2);
  // Ennemis
  mctx.fillStyle = '#ff3030';
  for (const b of state.bandits) mctx.fillRect(b.x*sx - 1, b.y*sy - 1, 2, 2);
  // Cadre caméra
  mctx.strokeStyle = '#ffff00'; mctx.lineWidth = 1;
  mctx.strokeRect(
    state.camera.x * sx, state.camera.y * sy,
    CONFIG.CANVAS_W * sx, CONFIG.CANVAS_H * sy
  );
}

export function drawGhost(ctx, mouseWorldX, mouseWorldY, buildType, world, camera, resources, techs) {
  if (!buildType) return;
  const def = BUILDINGS[buildType]; if (!def) return;
  const sx = mouseWorldX - camera.x;
  const sy = mouseWorldY - camera.y;
  // Validité: tech, ressources, tuile praticable
  let valid = true;
  if (def.tech && !techs[def.tech]) valid = false;
  for (const [k, v] of Object.entries(def.cost)) {
    if ((resources[k] || 0) < v) { valid = false; break; }
  }
  // Vérifie tuile
  const tx = Math.floor(mouseWorldX / CONFIG.TILE);
  const ty = Math.floor(mouseWorldY / CONFIG.TILE);
  const tileId = world.tiles[ty * world.W + tx];
  const biome = Object.values(BIOMES).find(b => b.id === tileId);
  if (!biome || !biome.walkable) valid = false;
  // Rectangle 32x32 centré
  ctx.fillStyle = valid ? 'rgba(80,220,80,0.35)' : 'rgba(220,60,60,0.35)';
  ctx.strokeStyle = valid ? '#40c040' : '#c04040';
  ctx.lineWidth = 2;
  ctx.fillRect(sx - 16, sy - 16, 32, 32);
  ctx.strokeRect(sx - 16, sy - 16, 32, 32);
  // Label
  ctx.fillStyle = '#000'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(def.name, sx, sy + 30);
}

export function clearCanvas(ctx) {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, CONFIG.CANVAS_W, CONFIG.CANVAS_H);
}
