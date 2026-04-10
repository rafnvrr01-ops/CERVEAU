// game.js - État, boucle, saisons, météo, spawns, score
import { CONFIG, generateWorld, canWalk } from './world.js';
import { Village, Building, BUILDINGS, TECHS, spawnColon, spawnAnimal, spawnBandit, tryBirth } from './entities.js';

const SEASONS = ['Printemps','Été','Automne','Hiver'];
const SEASON_DAYS = 10;
const WEATHERS = ['Clair','Clair','Clair','Pluie','Tempête'];
const VILLAGE_COLORS = ['#e04040','#40c0e0','#c040e0','#e0c040','#40e080','#e08040'];
const VILLAGE_NAMES = ['Ferrac','Bornholm','Vael','Oxia','Drakk','Sylvane'];

export function createGameState(seed) {
  const world = generateWorld(seed);
  const colon = spawnColon(world, 'Aldred');
  const state = {
    world,
    colons: [colon],
    animals: [],
    bandits: [],
    villages: [],
    buildings: [],
    resources: { wood: 0, stone: 0, iron: 0, gold: 5, food: 10, water: 8, herbs: 2, seeds: 3 },
    techs: {},
    day: 1,
    timeOfDay: 0.25,
    season: 'Printemps',
    seasonDay: 0,
    weather: 'Clair',
    weatherCd: 30,
    speed: 1,
    paused: false,
    selected: colon,
    selectedAction: 'move',
    selectedBuildType: null,
    camera: { x: colon.x - CONFIG.CANVAS_W/2, y: colon.y - CONFIG.CANVAS_H/2 },
    mouseWorldX: 0, mouseWorldY: 0,
    score: 0,
    spawnCd: 5,
    objectives: {
      pop5: false, allBuildings: false, ally: false,
      gold100: false, allTechs: false, age20: false,
    },
  };
  // Spawn 6 villages
  for (let i = 0; i < 6; i++) {
    let v = null;
    for (let t = 0; t < 100; t++) {
      const x = Math.random() * CONFIG.WORLD_W;
      const y = Math.random() * CONFIG.WORLD_H;
      if (canWalk(world, x, y)) { v = new Village(x, y, VILLAGE_NAMES[i], VILLAGE_COLORS[i]); break; }
    }
    if (v) state.villages.push(v);
  }
  // Initial wildlife
  for (let i = 0; i < 8; i++) {
    const a = spawnAnimal(world, ['cow','deer','wolf'][i%3], colon.x, colon.y);
    if (a) state.animals.push(a);
  }
  // Resource nodes: trees and rocks
  state.trees = []; state.rocks = [];
  for (let i = 0; i < 300; i++) {
    const x = Math.random() * CONFIG.WORLD_W, y = Math.random() * CONFIG.WORLD_H;
    if (canWalk(world, x, y)) {
      const v = ['feuillu','pin','feuillu'][i%3];
      state.trees.push({ x, y, variant: v, hp: 30 });
    }
  }
  for (let i = 0; i < 150; i++) {
    const x = Math.random() * CONFIG.WORLD_W, y = Math.random() * CONFIG.WORLD_H;
    if (canWalk(world, x, y)) state.rocks.push({ x, y, level: Math.floor(Math.random()*5), hp: 40 });
  }
  return state;
}

export function update(state, rawDt) {
  if (state.paused) return;
  const dt = Math.min(rawDt, 0.1) * state.speed;
  // Time
  state.timeOfDay += dt / 120; // 120s = 1 jour
  if (state.timeOfDay >= 1) {
    state.timeOfDay -= 1;
    onNewDay(state);
  }
  // Camera follow selected
  if (state.selected) {
    const tx = state.selected.x - CONFIG.CANVAS_W/2;
    const ty = state.selected.y - CONFIG.CANVAS_H/2;
    state.camera.x += (tx - state.camera.x) * 0.05;
    state.camera.y += (ty - state.camera.y) * 0.05;
    state.camera.x = Math.max(0, Math.min(CONFIG.WORLD_W - CONFIG.CANVAS_W, state.camera.x));
    state.camera.y = Math.max(0, Math.min(CONFIG.WORLD_H - CONFIG.CANVAS_H, state.camera.y));
  }
  // Update entities
  for (const c of state.colons) {
    c.update(dt, state.world);
    const arrived = Math.hypot(c.targetX - c.x, c.targetY - c.y) < 5;
    if (c.task === 'build' && arrived) {
      const def = BUILDINGS[c.buildType];
      if (def) state.buildings.push(new Building(c.targetX, c.targetY, c.buildType, def));
      c.task = 'idle'; c.buildType = null;
    } else if (c.task === 'chop' && c.targetEntity && Math.hypot(c.targetEntity.x - c.x, c.targetEntity.y - c.y) < 25) {
      c.targetEntity.hp -= dt * 15;
      if (c.targetEntity.hp <= 0) {
        state.resources.wood += 5;
        state.trees = state.trees.filter(t => t !== c.targetEntity);
        c.task = 'idle'; c.targetEntity = null;
      }
    } else if (c.task === 'mine' && c.targetEntity && Math.hypot(c.targetEntity.x - c.x, c.targetEntity.y - c.y) < 25) {
      c.targetEntity.hp -= dt * 12;
      if (c.targetEntity.hp <= 0) {
        state.resources.stone += 4;
        if (c.targetEntity.level >= 3) state.resources.iron += 2;
        state.rocks = state.rocks.filter(r => r !== c.targetEntity);
        c.task = 'idle'; c.targetEntity = null;
      }
    } else if (c.task === 'hunt' && c.targetEntity && Math.hypot(c.targetEntity.x - c.x, c.targetEntity.y - c.y) < 25) {
      c.targetEntity.hp -= dt * 20;
      if (c.targetEntity.hp <= 0) {
        state.resources.food += 6;
        state.animals = state.animals.filter(a => a !== c.targetEntity);
        c.task = 'idle'; c.targetEntity = null;
      }
    } else if (c.task === 'tame' && c.targetEntity && Math.hypot(c.targetEntity.x - c.x, c.targetEntity.y - c.y) < 25) {
      c.targetEntity.tame = (c.targetEntity.tame || 0) + dt * 20;
      if (c.targetEntity.tame >= 100) { c.targetEntity.tamed = true; c.task = 'idle'; c.targetEntity = null; }
    } else if (c.task === 'fish' && arrived) {
      state.resources.food += 2; c.task = 'idle';
    }
    if (state.season === 'Hiver') c.warmth = Math.max(0, c.warmth - dt * 0.4);
    else c.warmth = Math.min(100, c.warmth + dt * 0.2);
  }
  state.colons = state.colons.filter(c => c.hp > 0);
  for (const a of state.animals) a.update(dt, state.world);
  for (const b of state.bandits) {
    const target = state.colons[0];
    b.update(dt, state.world, target);
    if (target && Math.hypot(b.x - target.x, b.y - target.y) < 20 && b.attackCd <= 0) {
      target.hp -= 5; b.attackCd = 1.5;
    }
  }
  state.bandits = state.bandits.filter(b => b.hp > 0);
  // Building animations
  for (const b of state.buildings) b.anim += dt;
  // Watchtower auto-fire
  for (const tower of state.buildings.filter(b => b.type === 'watchtower')) {
    for (const enemy of state.bandits.concat(state.animals.filter(a => a.hostile))) {
      if (Math.hypot(tower.x - enemy.x, tower.y - enemy.y) < 150) {
        enemy.hp -= dt * 8; break;
      }
    }
  }
  // Weather
  state.weatherCd -= dt;
  if (state.weatherCd <= 0) {
    state.weather = WEATHERS[Math.floor(Math.random() * WEATHERS.length)];
    state.weatherCd = 30 + Math.random() * 60;
  }
  // Enemy spawns
  state.spawnCd -= dt;
  if (state.spawnCd <= 0) {
    state.spawnCd = 15;
    const isNight = state.timeOfDay < 0.25 || state.timeOfDay > 0.80;
    const target = state.colons[0];
    if (target) {
      if (isNight && state.day >= 4) {
        const n = 1 + Math.floor(state.day / 4);
        for (let i = 0; i < n; i++) {
          const w = spawnAnimal(state.world, 'wolf-black', target.x, target.y);
          if (w) state.animals.push(w);
        }
      }
      if (!isNight && state.day >= 6) {
        const n = 1 + Math.floor(state.day / 6);
        for (let i = 0; i < n; i++) {
          const b = spawnBandit(state.world, target.x, target.y);
          if (b) state.bandits.push(b);
        }
      }
    }
  }
  // Score
  computeScore(state);
}

function onNewDay(state) {
  state.day++;
  state.seasonDay++;
  if (state.seasonDay >= SEASON_DAYS) {
    state.seasonDay = 0;
    const i = SEASONS.indexOf(state.season);
    state.season = SEASONS[(i + 1) % 4];
  }
  // Daily food/water consumption
  const n = state.colons.length;
  state.resources.food = Math.max(0, state.resources.food - n * 0.5);
  state.resources.water = Math.max(0, state.resources.water - n * 0.5);
  // Refill colons from stocks
  for (const c of state.colons) {
    if (state.resources.food >= 1) { state.resources.food--; c.hunger = Math.min(100, c.hunger + 40); }
    if (state.resources.water >= 1) { state.resources.water--; c.thirst = Math.min(100, c.thirst + 40); }
    if (!c.isChild) c.age++;
    else { c.age++; if (c.age >= 10) c.isChild = false; }
  }
  // Cow milk -> food
  const cows = state.animals.filter(a => a.tamed && a.species === 'cow').length;
  state.resources.food += cows;
  // Farms produce food
  state.resources.food += state.buildings.filter(b => b.type === 'farm').length * 2;
  // Birth
  const child = tryBirth(state);
  if (child) state.colons.push(child);
}

function computeScore(state) {
  let s = 0;
  s += Math.min(20, state.colons.length * 4);
  s += Math.min(20, state.buildings.length);
  s += state.villages.filter(v => v.allied).length * 5;
  s += Math.min(15, Math.floor(state.resources.gold / 10));
  s += Object.keys(state.techs).length * 2;
  s += Math.min(10, state.day / 5);
  state.score = Math.min(100, Math.floor(s));
  state.objectives.pop5 = state.colons.length >= 5;
  state.objectives.allBuildings = state.buildings.length >= 12;
  state.objectives.ally = state.villages.some(v => v.allied);
  state.objectives.gold100 = state.resources.gold >= 100;
  state.objectives.allTechs = Object.keys(state.techs).length >= 9;
  state.objectives.age20 = state.day >= 20;
}

export function tryResearch(state, techKey) {
  const def = TECHS[techKey];
  if (!def || state.techs[techKey]) return false;
  if (def.prereq.some(p => !state.techs[p])) return false;
  for (const [k, v] of Object.entries(def.cost)) {
    if ((state.resources[k] || 0) < v) return false;
  }
  for (const [k, v] of Object.entries(def.cost)) state.resources[k] -= v;
  state.techs[techKey] = true;
  return true;
}

export function tryBuild(state, buildType, x, y) {
  const def = BUILDINGS[buildType];
  if (!def) return false;
  if (def.tech && !state.techs[def.tech]) return false;
  for (const [k, v] of Object.entries(def.cost)) {
    if ((state.resources[k] || 0) < v) return false;
  }
  if (!canWalk(state.world, x, y)) return false;
  for (const [k, v] of Object.entries(def.cost)) state.resources[k] -= v;
  // Send selected colon to build
  const c = state.selected;
  if (c) { c.targetX = x; c.targetY = y; c.task = 'build'; c.buildType = buildType; }
  return true;
}
