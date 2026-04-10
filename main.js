// main.js - Entry point
import { CONFIG } from './world.js';
import { createGameState, update, tryBuild, tryResearch } from './game.js';
import { initRenderer, drawTerrain, drawNightOverlay, drawWeather, drawSnow, drawMinimap, drawGhost, clearCanvas } from './render.js';
import { drawColon, drawAnimal, drawBandit, drawBuilding } from './render-sprites.js';
import { initUI, updateUI, setSelectedAction } from './ui.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const minimap = document.getElementById('minimap');
const mctx = minimap.getContext('2d');

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
  state.mouseWorldX = (e.clientX - r.left) + state.camera.x;
  state.mouseWorldY = (e.clientY - r.top) + state.camera.y;
});

// Bug 1: click handler with build short-circuit FIRST
canvas.addEventListener('click', (e) => {
  const r = canvas.getBoundingClientRect();
  const wx = (e.clientX - r.left) + state.camera.x;
  const wy = (e.clientY - r.top) + state.camera.y;

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
  const clicked = state.colons.find(c => Math.hypot(c.x - wx, c.y - wy) < 16);
  if (clicked) { state.selected = clicked; return; }
  if (state.selected && state.selectedAction === 'move') {
    state.selected.targetX = wx; state.selected.targetY = wy; state.selected.task = 'idle';
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
