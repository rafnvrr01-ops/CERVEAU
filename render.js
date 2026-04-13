// render.js - Rendu Canvas2D avec terrain enrichi
import { CONFIG, BIOMES, BIOME_LIST, getTile } from './world.js';
import { BUILDINGS } from './entities.js';

const BIOME_COLORS = BIOME_LIST.map(b => b.color);

// Hash déterministe pour détails par tuile
function th(tx, ty, salt) {
  let h = tx*374761393 + ty*668265263 + salt*1442695040;
  h = (h ^ (h>>>13)) * 1274126177;
  return ((h ^ (h>>>16)) >>> 0) / 4294967295;
}

export function initRenderer(world) {}

function drawTileDetail(ctx, id, x, y, T, tx, ty, timeT) {
  // id = biome id, x/y = screen coords of tile top-left, T = tile size
  switch (id) {
    case 2: { // GRASS
      // Touffes d'herbe + fleurs
      const n = 3 + Math.floor(th(tx, ty, 1) * 3);
      for (let i = 0; i < n; i++) {
        const hx = x + th(tx, ty, 10+i) * T;
        const hy = y + th(tx, ty, 20+i) * T;
        ctx.fillStyle = th(tx, ty, 30+i) > 0.85 ? '#e8d040' : (th(tx, ty, 31+i) > 0.7 ? '#7aba4a' : '#4a7a2a');
        ctx.fillRect(hx, hy, 2, 3);
        ctx.fillRect(hx-1, hy+1, 1, 1);
      }
      break;
    }
    case 3: { // DGRASS
      const n = 4;
      for (let i = 0; i < n; i++) {
        const hx = x + th(tx, ty, 10+i) * T;
        const hy = y + th(tx, ty, 20+i) * T;
        ctx.fillStyle = '#2a5a1a';
        ctx.fillRect(hx, hy, 2, 3);
      }
      // Petits champignons
      if (th(tx, ty, 5) > 0.92) {
        const hx = x + th(tx, ty, 6) * T;
        const hy = y + th(tx, ty, 7) * T;
        ctx.fillStyle = '#a02020'; ctx.beginPath(); ctx.arc(hx, hy, 2, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#f4c4a0'; ctx.fillRect(hx-1, hy, 2, 2);
      }
      break;
    }
    case 4: { // FOREST
      // Taches de sous-bois sombres et lumières filtrées
      ctx.fillStyle = 'rgba(10,30,5,0.4)';
      for (let i = 0; i < 3; i++) {
        const hx = x + th(tx, ty, 10+i) * T;
        const hy = y + th(tx, ty, 20+i) * T;
        const r = 4 + th(tx, ty, 30+i) * 6;
        ctx.beginPath(); ctx.arc(hx, hy, r, 0, Math.PI*2); ctx.fill();
      }
      ctx.fillStyle = 'rgba(180,220,120,0.15)';
      const lx = x + th(tx, ty, 40) * T;
      const ly = y + th(tx, ty, 41) * T;
      ctx.beginPath(); ctx.arc(lx, ly, 5, 0, Math.PI*2); ctx.fill();
      // Aiguilles au sol
      ctx.fillStyle = '#3a2010';
      for (let i = 0; i < 4; i++) {
        const hx = x + th(tx, ty, 50+i) * T;
        const hy = y + th(tx, ty, 60+i) * T;
        ctx.fillRect(hx, hy, 2, 1);
      }
      break;
    }
    case 5: { // DESERT
      // Dunes subtiles
      ctx.fillStyle = 'rgba(180,150,80,0.3)';
      for (let i = 0; i < 2; i++) {
        const hx = x + th(tx, ty, 10+i) * T;
        const hy = y + th(tx, ty, 20+i) * T;
        ctx.fillRect(hx, hy, 8, 1);
      }
      // Cailloux
      for (let i = 0; i < 3; i++) {
        if (th(tx, ty, 30+i) < 0.5) continue;
        const hx = x + th(tx, ty, 40+i) * T;
        const hy = y + th(tx, ty, 50+i) * T;
        ctx.fillStyle = '#8a6030';
        ctx.fillRect(hx, hy, 2, 2);
      }
      // Cactus rare
      if (th(tx, ty, 9) > 0.95) {
        const hx = x + th(tx, ty, 8) * T;
        const hy = y + th(tx, ty, 7) * T;
        ctx.fillStyle = '#3a6a2a'; ctx.fillRect(hx, hy - 6, 3, 8);
        ctx.fillRect(hx - 2, hy - 4, 2, 2); ctx.fillRect(hx + 3, hy - 3, 2, 2);
      }
      break;
    }
    case 1: { // SAND
      // Grains de sable et petits coquillages
      for (let i = 0; i < 5; i++) {
        const hx = x + th(tx, ty, 10+i) * T;
        const hy = y + th(tx, ty, 20+i) * T;
        ctx.fillStyle = th(tx, ty, 30+i) > 0.5 ? '#e8dca0' : '#c4a860';
        ctx.fillRect(hx, hy, 1, 1);
      }
      break;
    }
    case 6: { // TUNDRA
      // Lichen et plaques de neige
      ctx.fillStyle = 'rgba(220,220,230,0.5)';
      for (let i = 0; i < 2; i++) {
        const hx = x + th(tx, ty, 10+i) * T;
        const hy = y + th(tx, ty, 20+i) * T;
        const r = 3 + th(tx, ty, 30+i) * 4;
        ctx.beginPath(); ctx.arc(hx, hy, r, 0, Math.PI*2); ctx.fill();
      }
      // Touffes d'herbe rousses
      ctx.fillStyle = '#7a6040';
      for (let i = 0; i < 3; i++) {
        const hx = x + th(tx, ty, 40+i) * T;
        const hy = y + th(tx, ty, 50+i) * T;
        ctx.fillRect(hx, hy, 2, 2);
      }
      break;
    }
    case 7: { // MOUNTAIN
      // Striures rocheuses
      ctx.strokeStyle = 'rgba(40,40,40,0.6)'; ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        const hx = x + th(tx, ty, 10+i) * T;
        const hy = y + th(tx, ty, 20+i) * T;
        const len = 6 + th(tx, ty, 30+i) * 10;
        ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + len, hy + 2); ctx.stroke();
      }
      // Highlights clairs
      ctx.fillStyle = 'rgba(150,150,150,0.4)';
      for (let i = 0; i < 2; i++) {
        const hx = x + th(tx, ty, 40+i) * T;
        const hy = y + th(tx, ty, 50+i) * T;
        ctx.fillRect(hx, hy, 3, 2);
      }
      break;
    }
    case 8: { // SNOW
      // Cristaux scintillants
      for (let i = 0; i < 4; i++) {
        const hx = x + th(tx, ty, 10+i) * T;
        const hy = y + th(tx, ty, 20+i) * T;
        const sparkle = Math.sin(timeT * 2 + (tx+ty+i)) > 0.7;
        ctx.fillStyle = sparkle ? '#ffffff' : '#c0c8d8';
        ctx.fillRect(hx, hy, sparkle ? 2 : 1, sparkle ? 2 : 1);
      }
      break;
    }
    case 0: { // WATER
      // Vaguelettes animées
      ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1;
      const waveOffset = (timeT * 8) % T;
      for (let i = 0; i < 2; i++) {
        const wy = y + ((th(tx, ty, i) * T + waveOffset) % T);
        ctx.beginPath();
        ctx.moveTo(x, wy);
        ctx.quadraticCurveTo(x + T/2, wy - 2, x + T, wy);
        ctx.stroke();
      }
      // Reflets
      if (th(tx, ty, 5) > 0.7) {
        ctx.fillStyle = 'rgba(180,220,255,0.3)';
        const hx = x + th(tx, ty, 6) * T;
        const hy = y + th(tx, ty, 7) * T;
        ctx.fillRect(hx, hy, 4, 1);
      }
      break;
    }
  }
}

export function drawTerrain(ctx, camera, world, timeT = 0) {
  ctx.imageSmoothingEnabled = false;
  const T = CONFIG.TILE;
  const tx0 = Math.max(0, Math.floor(camera.x / T));
  const ty0 = Math.max(0, Math.floor(camera.y / T));
  const tx1 = Math.min(world.W, Math.ceil((camera.x + CONFIG.CANVAS_W) / T));
  const ty1 = Math.min(world.H, Math.ceil((camera.y + CONFIG.CANVAS_H) / T));
  // Couche 1: couleur de base avec variation subtile
  for (let ty = ty0; ty < ty1; ty++) {
    for (let tx = tx0; tx < tx1; tx++) {
      const id = getTile(world, tx, ty);
      const base = BIOME_COLORS[id];
      const sx = tx * T - camera.x;
      const sy = ty * T - camera.y;
      // Variation de teinte par tuile (dithering naturel)
      ctx.fillStyle = base;
      ctx.fillRect(sx, sy, T + 1, T + 1);
      // Overlay de variation
      const v = th(tx, ty, 0);
      if (v < 0.3) {
        ctx.fillStyle = 'rgba(0,0,0,0.08)';
        ctx.fillRect(sx, sy, T + 1, T + 1);
      } else if (v > 0.7) {
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.fillRect(sx, sy, T + 1, T + 1);
      }
    }
  }
  // Couche 2: détails par biome
  for (let ty = ty0; ty < ty1; ty++) {
    for (let tx = tx0; tx < tx1; tx++) {
      const id = getTile(world, tx, ty);
      drawTileDetail(ctx, id, tx * T - camera.x, ty * T - camera.y, T, tx, ty, timeT);
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
  const MM_W = 240, MM_H = 160;
  mctx.fillStyle = '#0a0d14'; mctx.fillRect(0, 0, MM_W, MM_H);
  const centerX = state.selected ? state.selected.x : CONFIG.WORLD_W/2;
  const centerY = state.selected ? state.selected.y : CONFIG.WORLD_H/2;
  const viewW = 4500, viewH = 3000;
  const mx0 = centerX - viewW/2;
  const my0 = centerY - viewH/2;
  const tileStep = 3;
  const tx0 = Math.floor(mx0 / CONFIG.TILE);
  const ty0 = Math.floor(my0 / CONFIG.TILE);
  const tilesW = Math.floor(viewW / CONFIG.TILE);
  const tilesH = Math.floor(viewH / CONFIG.TILE);
  const pxW = MM_W / tilesW;
  const pxH = MM_H / tilesH;
  for (let dy = 0; dy < tilesH; dy += tileStep) {
    for (let dx = 0; dx < tilesW; dx += tileStep) {
      const tx = tx0 + dx, ty = ty0 + dy;
      if (tx < 0 || ty < 0 || tx >= state.world.W || ty >= state.world.H) continue;
      mctx.fillStyle = BIOME_COLORS[getTile(state.world, tx, ty)];
      mctx.fillRect(dx * pxW, dy * pxH, pxW * tileStep + 1, pxH * tileStep + 1);
    }
  }
  const toMM = (x, y) => [(x - mx0) / viewW * MM_W, (y - my0) / viewH * MM_H];
  mctx.fillStyle = '#8b4513';
  for (const b of state.buildings) { const [x,y] = toMM(b.x, b.y); mctx.fillRect(x-1, y-1, 3, 3); }
  for (const v of state.villages) {
    const [x,y] = toMM(v.x, v.y); mctx.fillStyle = v.color; mctx.fillRect(x-2, y-2, 4, 4);
  }
  mctx.fillStyle = '#ffffff';
  for (const c of state.colons) { const [x,y] = toMM(c.x, c.y); mctx.fillRect(x-2, y-2, 4, 4); }
  mctx.fillStyle = '#ff3030';
  for (const b of state.bandits) { const [x,y] = toMM(b.x, b.y); mctx.fillRect(x-1, y-1, 3, 3); }
  mctx.strokeStyle = '#fbbf24'; mctx.lineWidth = 1.5;
  const [cx, cy] = toMM(state.camera.x, state.camera.y);
  mctx.strokeRect(cx, cy, CONFIG.CANVAS_W / viewW * MM_W, CONFIG.CANVAS_H / viewH * MM_H);
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
