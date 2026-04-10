// ui.js - HUD, onglets, panels, boutons
import { BUILDINGS, TECHS } from './entities.js';

const ACTIONS = [
  { key: 'move',  label: 'Déplacer' },
  { key: 'chop',  label: 'Couper bois' },
  { key: 'mine',  label: 'Miner' },
  { key: 'hunt',  label: 'Chasser' },
  { key: 'fish',  label: 'Pêcher' },
  { key: 'tame',  label: 'Apprivoiser' },
  { key: 'attack',label: 'Attaquer' },
  { key: 'gift',  label: 'Cadeau' },
  { key: 'trade', label: 'Commerce' },
];

let _state = null;
let _onAction = null;
let _onBuild = null;
let _onResearch = null;
let _onDiplo = null;
let _currentTab = 'actions';

export function initUI(state, callbacks) {
  _state = state;
  _onAction = callbacks.onAction;
  _onBuild = callbacks.onBuild;
  _onResearch = callbacks.onResearch;
  _onDiplo = callbacks.onDiplo;
  // Top menu tabs
  document.querySelectorAll('.menu-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      _currentTab = btn.dataset.menu;
      document.querySelectorAll('.menu-btn').forEach(b => b.classList.toggle('active', b === btn));
      renderPanel();
    });
  });
  renderPanel();
  updateUI(state);
}

export function setSelectedAction(action) {
  if (_state) _state.selectedAction = action;
  document.querySelectorAll('.act-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.act === action);
  });
  const status = document.getElementById('status-line');
  if (status && action && action.startsWith('build-')) {
    status.textContent = 'Mode: ' + BUILDINGS[action.slice(6)].name + ' - clique sur la carte';
  } else if (status) {
    status.textContent = 'Mode: ' + (action || 'aucun');
  }
}

function renderPanel() {
  // Hide all panels first
  ['actions','resources','buildings','tech','colony'].forEach(p => {
    const el = document.getElementById('panel-' + p);
    if (el) el.style.display = 'none';
  });
  const active = document.getElementById('panel-' + _currentTab);
  if (!active) return;
  active.style.display = 'flex';
  active.innerHTML = '';
  if (_currentTab === 'actions') renderActions(active);
  else if (_currentTab === 'resources') renderResources(active);
  else if (_currentTab === 'buildings') renderBuildings(active);
  else if (_currentTab === 'tech') renderTech(active);
  else if (_currentTab === 'colony') renderColony(active);
}

function makeBtn(label, onClick, active = false) {
  const b = document.createElement('button');
  b.textContent = label;
  b.className = 'act-btn' + (active ? ' active' : '');
  b.style.cssText = 'background:transparent;border:0.5px solid var(--color-border-secondary);padding:5px 9px;border-radius:5px;font-size:11px;cursor:pointer;margin:2px;';
  b.addEventListener('click', onClick);
  return b;
}

function renderActions(panel) {
  ACTIONS.forEach(a => {
    const btn = makeBtn(a.label, () => { setSelectedAction(a.key); _onAction && _onAction(a.key); });
    btn.dataset.act = a.key;
    if (_state.selectedAction === a.key) btn.classList.add('active');
    panel.appendChild(btn);
  });
}

function renderResources(panel) {
  const r = _state.resources;
  const items = [
    ['Bois', r.wood], ['Pierre', r.stone], ['Fer', r.iron],
    ['Or', r.gold], ['Nourriture', r.food], ['Eau', r.water],
    ['Herbes', r.herbs], ['Graines', r.seeds],
  ];
  items.forEach(([n, v]) => {
    const d = document.createElement('div');
    d.style.cssText = 'background:var(--color-background-secondary);padding:4px 8px;border-radius:4px;margin:2px;font-size:11px;';
    d.textContent = `${n}: ${Math.floor(v)}`;
    panel.appendChild(d);
  });
}

function renderBuildings(panel) {
  Object.entries(BUILDINGS).forEach(([key, def]) => {
    const cost = Object.entries(def.cost).map(([k,v]) => `${v} ${k}`).join(', ');
    const locked = def.tech && !_state.techs[def.tech];
    const btn = makeBtn(`${def.name} (${cost})`, () => {
      if (locked) return;
      // Bug 3: build button -> set selectedAction
      setSelectedAction('build-' + key);
      _onBuild && _onBuild(key);
    });
    if (locked) btn.style.opacity = '0.4';
    if (_state.selectedAction === 'build-' + key) btn.classList.add('active');
    panel.appendChild(btn);
  });
}

function renderTech(panel) {
  Object.entries(TECHS).forEach(([key, def]) => {
    const owned = _state.techs[key];
    const locked = def.prereq.some(p => !_state.techs[p]);
    const cost = Object.entries(def.cost).map(([k,v]) => `${v} ${k}`).join(', ');
    const btn = makeBtn(`${def.name} (${cost})${owned ? ' OK' : ''}`, () => {
      if (owned || locked) return;
      _onResearch && _onResearch(key);
    });
    if (owned) btn.style.background = 'var(--color-background-success)';
    else if (locked) btn.style.opacity = '0.4';
    panel.appendChild(btn);
  });
}

function renderColony(panel) {
  // Colons list
  _state.colons.forEach(c => {
    const d = document.createElement('div');
    d.style.cssText = 'background:var(--color-background-secondary);padding:4px 8px;border-radius:4px;margin:2px;font-size:11px;width:100%;';
    d.innerHTML = `<b>${c.name}</b> ${c.isChild ? '(enfant)' : ''} HP:${Math.floor(c.hp)} F:${Math.floor(c.hunger)} S:${Math.floor(c.thirst)} M:${Math.floor(c.mood)}`;
    panel.appendChild(d);
  });
  // Villages diplomacy
  _state.villages.forEach(v => {
    const d = document.createElement('div');
    d.style.cssText = 'background:var(--color-background-secondary);padding:4px 8px;border-radius:4px;margin:2px;font-size:11px;width:100%;';
    d.innerHTML = `<b style="color:${v.color}">${v.name}</b> rel:${v.relation} ${v.allied?'allié':v.atWar?'guerre':''}`;
    panel.appendChild(d);
  });
}

export function updateUI(state) {
  _state = state;
  // Top bar counters
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('day-count', state.day);
  set('time-count', formatTime(state.timeOfDay));
  set('season-label', state.season);
  set('weather-label', state.weather);
  set('pop-count', state.colons.length);
  set('score-count', state.score);
  // Refresh active panel content (for live data)
  if (_currentTab === 'resources' || _currentTab === 'colony') renderPanel();
}

function formatTime(t) {
  const h = Math.floor(t * 24);
  const m = Math.floor((t * 24 - h) * 60);
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}
