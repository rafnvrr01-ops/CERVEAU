// main.js - Entry point
import { CONFIG, updateCanvasSize } from './world.js';
import { createGameState, update, tryBuild, tryResearch } from './game.js';
import { initRenderer, drawTerrain, drawNightOverlay, drawWeather, drawSnow, drawMinimap, drawGhost, clearCanvas } from './render.js';
import { drawColon, drawAnimal, drawBandit, drawBuilding, drawTree, drawRock } from './render-sprites.js';
import { initUI, updateUI, setSelectedAction } from './ui.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const minimap = document.getElementById('minimap');
const mctx = minimap.getContext('2d');

function resizeCanvas() {
  updateCanvasSize();
  canvas.width = CONFIG.CANVAS_W;
  canvas.height = CONFIG.CANVAS_H;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const state = createGameState();
initRenderer(state.world);

// UI callbacks
initUI(state, {
  onAction: (key) => { state.selectedAction = key; },
  onBuild: (key) => { state.selectedBuildType = key; state.selectedAction = 'build-' + key; },
  onResearch: (key) => { tryResearch(state, key); updateUI(state); },
});

// Bug 6: mousemove updates world coords for ghost
canvas.addEventListener('mousemove', (e) => {
  const r = canvas.getBoundingClientRect();
  const sx = canvas.width / r.width, sy = canvas.height / r.height;
  state.mouseWorldX = (e.clientX - r.left) * sx + state.camera.x;
  state.mouseWorldY = (e.clientY - r.top) * sy + state.camera.y;
});

// Bug 1: click handler with build short-circuit FIRST
canvas.addEventListener('click', (e) => {
  const r = canvas.getBoundingClientRect();
  const sx = canvas.width / r.width, sy = canvas.height / r.height;
  const wx = (e.clientX - r.left) * sx + state.camera.x;
  const wy = (e.clientY - r.top) * sy + state.camera.y;

  // SHORT-CIRCUIT: if build mode, only handle build
  if (state.selectedAction && state.selectedAction.startsWith('build-')) {
    const type = state.selectedAction.slice(6);
    if (tryBuild(state, type, wx, wy)) {
      state.selectedAction = 'move';
      setSelectedAction('move');
      updateUI(state);
    }
    return;
  }

  // Otherwise: select colon under cursor or move selected colon
  const clicked = state.colons.find(c => Math.hypot(c.x - wx, c.y - wy) < 20);
  if (clicked) { state.selected = clicked; return; }

  const c = state.selected;
  if (!c) return;
  const act = state.selectedAction;

  // Resource gathering: find nearest target of correct type
  if (act === 'chop') {
    const t = state.trees.reduce((best, t) => {
      const d = Math.hypot(t.x - wx, t.y - wy);
      return (!best || d < best.d) ? { t, d } : best;
    }, null);
    if (t && t.d < 80) { c.targetX = t.t.x; c.targetY = t.t.y; c.task = 'chop'; c.targetEntity = t.t; }
  } else if (act === 'mine') {
    const r = state.rocks.reduce((best, r) => {
      const d = Math.hypot(r.x - wx, r.y - wy);
      return (!best || d < best.d) ? { r, d } : best;
    }, null);
    if (r && r.d < 80) { c.targetX = r.r.x; c.targetY = r.r.y; c.task = 'mine'; c.targetEntity = r.r; }
  } else if (act === 'hunt') {
    const a = state.animals.reduce((best, a) => {
      const d = Math.hypot(a.x - wx, a.y - wy);
      return (!best || d < best.d) ? { a, d } : best;
    }, null);
    if (a && a.d < 100) { c.targetX = a.a.x; c.targetY = a.a.y; c.task = 'hunt'; c.targetEntity = a.a; }
  } else if (act === 'tame') {
    const a = state.animals.reduce((best, a) => {
      if (a.hostile || a.tamed) return best;
      const d = Math.hypot(a.x - wx, a.y - wy);
      return (!best || d < best.d) ? { a, d } : best;
    }, null);
    if (a && a.d < 100) { c.targetX = a.a.x; c.targetY = a.a.y; c.task = 'tame'; c.targetEntity = a.a; }
  } else if (act === 'fish') {
    c.targetX = wx; c.targetY = wy; c.task = 'fish';
  } else { // move default
    c.targetX = wx; c.targetY = wy; c.task = 'idle';
  }
});

// Minimap click teleports camera
minimap.addEventListener('click', (e) => {
  const r = minimap.getBoundingClientRect();
  const mx = (e.clientX - r.left) / 130;
  const my = (e.clientY - r.top) / 130;
  state.camera.x = mx * CONFIG.WORLD_W - CONFIG.CANVAS_W/2;
  state.camera.y = my * CONFIG.WORLD_H - CONFIG.CANVAS_H/2;
});

// Pause and speed buttons
document.getElementById('btn-pause').addEventListener('click', () => {
  state.paused = !state.paused;
  document.getElementById('btn-pause').textContent = state.paused ? 'Play' : 'Pause';
});
document.getElementById('btn-speed').addEventListener('click', () => {
  const speeds = [1, 2, 4, 8, 16];
  const i = speeds.indexOf(state.speed);
  state.speed = speeds[(i + 1) % speeds.length];
  document.getElementById('btn-speed').textContent = 'x' + state.speed;
});

// Render loop
let lastT = performance.now();
let uiTimer = 0;
function frame(now) {
  const dt = (now - lastT) / 1000;
  lastT = now;
  update(state, dt);
  // Draw
  clearCanvas(ctx);
  drawTerrain(ctx, state.camera);
  // Sort entities by Y for fake 3D
  const drawables = [];
  for (const t of state.trees) drawables.push({ y: t.y, fn: () => drawTree(ctx, t.x - state.camera.x, t.y - state.camera.y, t.variant, state.season) });
  for (const r of state.rocks) drawables.push({ y: r.y, fn: () => drawRock(ctx, r.x - state.camera.x, r.y - state.camera.y, r.level) });
  for (const b of state.buildings) drawables.push({ y: b.y, fn: () => drawBuilding(ctx, b, b.x - state.camera.x, b.y - state.camera.y, b.anim) });
  for (const a of state.animals) drawables.push({ y: a.y, fn: () => drawAnimal(ctx, a, a.x - state.camera.x, a.y - state.camera.y) });
  for (const b of state.bandits) drawables.push({ y: b.y, fn: () => drawBandit(ctx, b, b.x - state.camera.x, b.y - state.camera.y) });
  for (const c of state.colons) drawables.push({ y: c.y, fn: () => drawColon(ctx, c, c.x - state.camera.x, c.y - state.camera.y, c === state.selected) });
  drawables.sort((a, b) => a.y - b.y);
  for (const d of drawables) d.fn();
  // Overlays
  drawNightOverlay(ctx, state.timeOfDay);
  drawWeather(ctx, state.weather, now / 1000);
  if (state.season === 'Hiver') drawSnow(ctx, now / 1000);
  // Ghost (Bug 6)
  if (state.selectedAction && state.selectedAction.startsWith('build-')) {
    drawGhost(ctx, state.mouseWorldX, state.mouseWorldY, state.selectedAction.slice(6), state.world, state.camera, state.resources, state.techs);
  }
  // Minimap (Bug 4: cached terrain)
  drawMinimap(mctx, state);
  // UI refresh throttled to 4Hz
  uiTimer += dt;
  if (uiTimer > 0.25) { uiTimer = 0; updateUI(state); }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
