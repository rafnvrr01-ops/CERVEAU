// render.js - Rendu Canvas2D sans cache offscreen (dessin tuile par tuile visible)
import { CONFIG, BIOMES, BIOME_LIST, getTile } from './world.js';
import { BUILDINGS } from './entities.js';

const BIOME_COLORS = BIOME_LIST.map(b => b.color);

export function initRenderer(world) {
  // No offscreen cache: tiles read via getTile on the fly.
  // world.js internal LRU (50000 entries) guarantees perf.
}

export function drawTerrain(ctx, camera, world) {
  ctx.imageSmoothingEnabled = false;
  const T = CONFIG.TILE;
  const tx0 = Math.max(0, Math.floor(camera.x / T));
  const ty0 = Math.max(0, Math.floor(camera.y / T));
  const tx1 = Math.min(world.W, Math.ceil((camera.x + CONFIG.CANVAS_W) / T));
  const ty1 = Math.min(world.H, Math.ceil((camera.y + CONFIG.CANVAS_H) / T));
  for (let ty = ty0; ty < ty1; ty++) {
    for (let tx = tx0; tx < tx1; tx++) {
      ctx.fillStyle = BIOME_COLORS[getTile(world, tx, ty)];
      ctx.fillRect(tx * T - camera.x, ty * T - camera.y, T + 1, T + 1);
    }
  }
}

export function drawNightOverlay(ctx, timeOfDay) {
  let alpha = 0;
  if (timeOfDay < 0.20 || timeOfDay > 0.85) alpha = 0.5;
  else if (timeOfDay < 0.30) alpha = (0.30 - timeOfDay) * 5;
  else if (timeOfDay > 0.75) alpha = (timeOfDay - 0.75) * 5;
  if (alpha > 0) {
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
  const MM = 130;
  mctx.fillStyle = '#1a1a2a'; mctx.fillRect(0, 0, MM, MM);
  const centerX = state.selected ? state.selected.x : CONFIG.WORLD_W/2;
  const centerY = state.selected ? state.selected.y : CONFIG.WORLD_H/2;
  const viewW = 3000, viewH = 3000;
  const mx0 = centerX - viewW/2;
  const my0 = centerY - viewH/2;
  const tileStep = 3;
  const tx0 = Math.floor(mx0 / CONFIG.TILE);
  const ty0 = Math.floor(my0 / CONFIG.TILE);
  const tilesVisible = Math.floor(viewW / CONFIG.TILE);
  const pxPerTile = MM / tilesVisible;
  for (let dy = 0; dy < tilesVisible; dy += tileStep) {
    for (let dx = 0; dx < tilesVisible; dx += tileStep) {
      const tx = tx0 + dx, ty = ty0 + dy;
      if (tx < 0 || ty < 0 || tx >= state.world.W || ty >= state.world.H) continue;
      mctx.fillStyle = BIOME_COLORS[getTile(state.world, tx, ty)];
      mctx.fillRect(dx * pxPerTile, dy * pxPerTile, pxPerTile * tileStep + 1, pxPerTile * tileStep + 1);
    }
  }
  const toMM = (x, y) => [(x - mx0) / viewW * MM, (y - my0) / viewH * MM];
  mctx.fillStyle = '#8b4513';
  for (const b of state.buildings) { const [x,y] = toMM(b.x, b.y); mctx.fillRect(x-1, y-1, 3, 3); }
  for (const v of state.villages) {
    const [x,y] = toMM(v.x, v.y); mctx.fillStyle = v.color; mctx.fillRect(x-2, y-2, 4, 4);
  }
  mctx.fillStyle = '#ffffff';
  for (const c of state.colons) { const [x,y] = toMM(c.x, c.y); mctx.fillRect(x-1, y-1, 3, 3); }
  mctx.fillStyle = '#ff3030';
  for (const b of state.bandits) { const [x,y] = toMM(b.x, b.y); mctx.fillRect(x-1, y-1, 3, 3); }
  mctx.strokeStyle = '#ffff00'; mctx.lineWidth = 1;
  const [cx, cy] = toMM(state.camera.x, state.camera.y);
  mctx.strokeRect(cx, cy, CONFIG.CANVAS_W / viewW * MM, CONFIG.CANVAS_H / viewH * MM);
}

export function drawGhost(ctx, mouseWorldX, mouseWorldY, buildType, world, camera, resources, techs) {
  if (!buildType) return;
  const def = BUILDINGS[buildType]; if (!def) return;
  const sx = mouseWorldX - camera.x;
  const sy = mouseWorldY - camera.y;
  let valid = true;
  if (def.tech && !techs[def.tech]) valid = false;
  for (const [k, v] of Object.entries(def.cost)) {
    if ((resources[k] || 0) < v) { valid = false; break; }
  }
  const tx = Math.floor(mouseWorldX / CONFIG.TILE);
  const ty = Math.floor(mouseWorldY / CONFIG.TILE);
  const biome = BIOME_LIST[getTile(world, tx, ty)];
  if (!biome || !biome.walkable) valid = false;
  ctx.fillStyle = valid ? 'rgba(80,220,80,0.35)' : 'rgba(220,60,60,0.35)';
  ctx.strokeStyle = valid ? '#40c040' : '#c04040';
  ctx.lineWidth = 2;
  ctx.fillRect(sx - 20, sy - 20, 40, 40);
  ctx.strokeRect(sx - 20, sy - 20, 40, 40);
  ctx.fillStyle = '#fff'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
  ctx.strokeStyle = '#000'; ctx.lineWidth = 3;
  ctx.strokeText(def.name, sx, sy + 36);
  ctx.fillText(def.name, sx, sy + 36);
}

export function clearCanvas(ctx) {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, CONFIG.CANVAS_W, CONFIG.CANVAS_H);
}
