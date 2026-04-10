// entities.js - Colons, animaux, bandits, villages, bâtiments
import { canWalk, findWalkableSpawn } from './world.js';

let _id = 0;
const nextId = () => ++_id;

export class Colon {
  constructor(x, y, name = 'Colon', isChild = false) {
    this.id = nextId(); this.kind = 'colon';
    this.x = x; this.y = y; this.name = name;
    this.targetX = x; this.targetY = y;
    this.task = 'idle'; this.buildType = null; this.targetEntity = null;
    this.hp = 100; this.maxHp = 100;
    this.hunger = 90; this.thirst = 90; this.energy = 100;
    this.warmth = 70; this.mood = 70;
    this.xp = 0; this.level = 1;
    this.age = isChild ? 0 : 18; this.isChild = isChild;
    this.sick = 0; this.attackCd = 0; this.walkPhase = 0; this.dog = null;
  }
  speed() {
    if (this.energy < 15 || this.isChild) return 50;
    if (this.mood > 70) return 100;
    return 90;
  }
  update(dt, world) {
    const dx = this.targetX - this.x, dy = this.targetY - this.y;
    const d = Math.hypot(dx, dy);
    if (d > 2) {
      const sp = this.speed() * dt;
      const nx = this.x + (dx/d)*sp, ny = this.y + (dy/d)*sp;
      if (canWalk(world, nx, ny)) { this.x = nx; this.y = ny; }
      else if (canWalk(world, nx, this.y)) this.x = nx;
      else if (canWalk(world, this.x, ny)) this.y = ny;
      this.walkPhase += dt * 8;
    }
    this.hunger = Math.max(0, this.hunger - dt*0.5);
    this.thirst = Math.max(0, this.thirst - dt*0.7);
    this.energy = Math.max(0, this.energy - dt*0.3);
    if (this.hunger < 20) this.hp -= dt*1.2;
    if (this.thirst < 20) this.hp -= dt*1.5;
    if (this.warmth < 25) this.hp -= dt*0.8;
    if (this.hunger > 60 && this.thirst > 60 && this.warmth > 50 && this.sick === 0)
      this.hp = Math.min(this.maxHp, this.hp + dt*0.5);
    if (this.attackCd > 0) this.attackCd -= dt;
  }
}

export class Animal {
  constructor(x, y, species) {
    this.id = nextId(); this.kind = 'animal'; this.species = species;
    this.x = x; this.y = y;
    this.hp = species === 'wolf' ? 30 : 50; this.maxHp = this.hp;
    this.tame = 0; this.tamed = false;
    this.hostile = species === 'wolf-black';
    this.targetX = x; this.targetY = y; this.wanderCd = 0;
    this.attackCd = 0; this.owner = null;
  }
  update(dt, world) {
    this.wanderCd -= dt;
    if (this.wanderCd <= 0) {
      this.wanderCd = 2 + Math.random()*3;
      this.targetX = this.x + (Math.random()-0.5)*200;
      this.targetY = this.y + (Math.random()-0.5)*200;
    }
    const dx = this.targetX - this.x, dy = this.targetY - this.y;
    const d = Math.hypot(dx, dy);
    if (d > 2) {
      const sp = 60*dt;
      const nx = this.x + (dx/d)*sp, ny = this.y + (dy/d)*sp;
      if (canWalk(world, nx, ny)) { this.x = nx; this.y = ny; }
    }
    if (this.attackCd > 0) this.attackCd -= dt;
  }
}

export class Bandit {
  constructor(x, y) {
    this.id = nextId(); this.kind = 'bandit';
    this.x = x; this.y = y; this.hp = 40; this.maxHp = 40;
    this.targetX = x; this.targetY = y; this.attackCd = 0;
  }
  update(dt, world, target) {
    if (target) { this.targetX = target.x; this.targetY = target.y; }
    const dx = this.targetX - this.x, dy = this.targetY - this.y;
    const d = Math.hypot(dx, dy);
    if (d > 2) {
      const sp = 70*dt;
      const nx = this.x + (dx/d)*sp, ny = this.y + (dy/d)*sp;
      if (canWalk(world, nx, ny)) { this.x = nx; this.y = ny; }
      else if (canWalk(world, nx, this.y)) this.x = nx;
      else if (canWalk(world, this.x, ny)) this.y = ny;
    }
    if (this.attackCd > 0) this.attackCd -= dt;
  }
}

export class Village {
  constructor(x, y, name, color) {
    this.id = nextId(); this.kind = 'village';
    this.x = x; this.y = y; this.name = name; this.color = color;
    this.relation = 0; this.allied = false; this.atWar = false;
  }
}

export class Building {
  constructor(x, y, type, def) {
    this.id = nextId(); this.kind = 'building';
    this.x = x; this.y = y; this.type = type; this.def = def;
    this.hp = 100; this.maxHp = 100; this.anim = 0;
  }
}

export const BUILDINGS = {
  campfire:   { name: 'Feu',        cost: { wood: 3 },                       tech: null },
  house:      { name: 'Maison',     cost: { wood: 10, stone: 5 },            tech: null },
  farm:       { name: 'Ferme',      cost: { wood: 5 },                       tech: 'agriculture' },
  wall:       { name: 'Mur',        cost: { stone: 2 },                      tech: null },
  workshop:   { name: 'Atelier',    cost: { wood: 15, stone: 10 },           tech: null },
  infirmary:  { name: 'Infirmerie', cost: { wood: 12, stone: 8 },            tech: null },
  watchtower: { name: 'Tour',       cost: { wood: 8, stone: 12 },            tech: 'bow' },
  well:       { name: 'Puits',      cost: { stone: 5, wood: 2 },             tech: null },
  stable:     { name: 'Étable',     cost: { wood: 15, stone: 3 },            tech: 'animal_husbandry' },
  irrigation: { name: 'Irrigation', cost: { wood: 10, stone: 8 },            tech: 'irrigation' },
  granary:    { name: 'Grenier',    cost: { wood: 12, stone: 6 },            tech: 'agriculture' },
  forge:      { name: 'Forge',      cost: { wood: 10, stone: 15, iron: 3 },  tech: 'metallurgy' },
};

export const TECHS = {
  agriculture:      { name: 'Agriculture', cost: { gold: 10 },           prereq: [] },
  animal_husbandry: { name: 'Élevage',     cost: { gold: 15 },           prereq: ['agriculture'] },
  irrigation:       { name: 'Irrigation',  cost: { gold: 20 },           prereq: ['agriculture'] },
  metallurgy:       { name: 'Métallurgie', cost: { gold: 25, iron: 5 },  prereq: [] },
  bow:              { name: 'Arc',         cost: { gold: 15, wood: 10 }, prereq: [] },
  sword:            { name: 'Épée',        cost: { gold: 30, iron: 10 }, prereq: ['metallurgy'] },
  armor:            { name: 'Armure',      cost: { gold: 40, iron: 15 }, prereq: ['metallurgy'] },
  plow:             { name: 'Charrue',     cost: { gold: 20, wood: 15 }, prereq: ['animal_husbandry'] },
  writing:          { name: 'Écriture',    cost: { gold: 50 },           prereq: ['agriculture'] },
};

export function spawnColon(world, name) {
  const p = findWalkableSpawn(world);
  return new Colon(p.x, p.y, name);
}
export function spawnAnimal(world, species, nx, ny) {
  for (let i = 0; i < 50; i++) {
    const a = (Math.random()-0.5)*600, b = (Math.random()-0.5)*600;
    const x = nx+a, y = ny+b;
    if (canWalk(world, x, y)) return new Animal(x, y, species);
  }
  return null;
}
export function spawnBandit(world, nx, ny) {
  for (let i = 0; i < 50; i++) {
    const a = (Math.random()-0.5)*800, b = (Math.random()-0.5)*800;
    const x = nx+a, y = ny+b;
    if (Math.hypot(a,b) > 250 && canWalk(world, x, y)) return new Bandit(x, y);
  }
  return null;
}

export function tryBirth(state) {
  const adults = state.colons.filter(c => !c.isChild && c.hp > 0);
  if (adults.length < 2) return null;
  const houses = state.buildings.filter(b => b.type === 'house').length;
  if (houses <= state.colons.length) return null;
  if (state.resources.food < 15) return null;
  const avg = adults.reduce((s,c) => s + c.mood, 0) / adults.length;
  if (avg < 60) return null;
  const p = adults[0];
  return new Colon(p.x + 15, p.y + 15, 'Enfant', true);
}
