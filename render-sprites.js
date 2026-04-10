// render-sprites.js - Sprites détaillés (colons, animaux, bâtiments, décor)
import { CONFIG } from './world.js';

const SEASON_LEAF = { Printemps: '#4a8a2a', Été: '#2a6a1a', Automne: '#c47a30', Hiver: '#8a8a8a' };

export function drawColon(ctx, c, sx, sy, selected) {
  const scale = c.isChild ? 0.72 : 1;
  const phase = Math.sin(c.walkPhase) * 3 * scale;
  // Ombre
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.ellipse(sx, sy + 14*scale, 9*scale, 3*scale, 0, 0, Math.PI*2); ctx.fill();
  // Jambes
  ctx.fillStyle = '#3a3a6a';
  ctx.fillRect(sx - 5*scale, sy + 4*scale + phase, 3*scale, 8*scale);
  ctx.fillRect(sx + 2*scale, sy + 4*scale - phase, 3*scale, 8*scale);
  // Corps
  ctx.fillStyle = c.isChild ? '#7aaa4a' : '#5a8a3a';
  ctx.fillRect(sx - 6*scale, sy - 6*scale, 12*scale, 12*scale);
  // Bras
  ctx.fillStyle = '#d4a574';
  ctx.fillRect(sx - 8*scale, sy - 4*scale - phase*0.5, 2*scale, 8*scale);
  ctx.fillRect(sx + 6*scale, sy - 4*scale + phase*0.5, 2*scale, 8*scale);
  // Tête
  ctx.fillStyle = '#e4b594';
  ctx.beginPath(); ctx.arc(sx, sy - 10*scale, 5*scale, 0, Math.PI*2); ctx.fill();
  // Cheveux
  ctx.fillStyle = '#3a2010';
  ctx.fillRect(sx - 5*scale, sy - 14*scale, 10*scale, 3*scale);
  // Sélection
  if (selected) {
    ctx.strokeStyle = '#ffff00'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(sx, sy, 16*scale, 0, Math.PI*2); ctx.stroke();
  }
  // Mini barres HP/hunger au-dessus
  const bw = 18*scale;
  ctx.fillStyle = '#000'; ctx.fillRect(sx - bw/2, sy - 22*scale, bw, 2);
  ctx.fillStyle = '#e04040'; ctx.fillRect(sx - bw/2, sy - 22*scale, bw * (c.hp/c.maxHp), 2);
  ctx.fillStyle = '#000'; ctx.fillRect(sx - bw/2, sy - 19*scale, bw, 2);
  ctx.fillStyle = '#e0a040'; ctx.fillRect(sx - bw/2, sy - 19*scale, bw * (c.hunger/100), 2);
  // Label enfant
  if (c.isChild) {
    ctx.fillStyle = '#fff'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('enfant', sx, sy + 22*scale);
  }
}

export function drawAnimal(ctx, a, sx, sy) {
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.ellipse(sx, sy + 8, 12, 3, 0, 0, Math.PI*2); ctx.fill();
  if (a.species === 'cow') {
    ctx.fillStyle = '#fff'; ctx.fillRect(sx - 10, sy - 6, 20, 12);
    ctx.fillStyle = '#000'; ctx.fillRect(sx - 6, sy - 4, 5, 4); ctx.fillRect(sx + 2, sy + 1, 4, 3);
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(sx + 11, sy - 2, 4, 0, Math.PI*2); ctx.fill();
  } else if (a.species === 'deer') {
    ctx.fillStyle = '#a47030'; ctx.fillRect(sx - 9, sy - 5, 18, 10);
    ctx.beginPath(); ctx.arc(sx + 10, sy - 3, 3, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#5a3010'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(sx+10, sy-6); ctx.lineTo(sx+12, sy-12); ctx.moveTo(sx+10, sy-6); ctx.lineTo(sx+8, sy-12); ctx.stroke();
  } else { // wolf gris ou noir
    ctx.fillStyle = a.species === 'wolf-black' ? '#202020' : '#707070';
    ctx.fillRect(sx - 9, sy - 5, 18, 10);
    ctx.beginPath(); ctx.arc(sx + 10, sy - 2, 4, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#ff3030'; ctx.fillRect(sx + 12, sy - 3, 1, 1);
  }
  if (a.tame > 0 && !a.tamed) {
    ctx.fillStyle = '#000'; ctx.fillRect(sx - 10, sy - 14, 20, 3);
    ctx.fillStyle = '#a040c0'; ctx.fillRect(sx - 10, sy - 14, 20 * (a.tame/100), 3);
  }
}

export function drawBandit(ctx, b, sx, sy) {
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.ellipse(sx, sy + 12, 8, 3, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#3a1a4a'; // capuche
  ctx.fillRect(sx - 6, sy - 12, 12, 16);
  ctx.fillStyle = '#1a0a2a';
  ctx.beginPath(); ctx.arc(sx, sy - 10, 5, 0, Math.PI); ctx.fill();
  ctx.fillStyle = '#c0c0c0'; // poignard
  ctx.fillRect(sx + 6, sy - 2, 6, 1);
  ctx.fillStyle = '#000'; ctx.fillRect(sx - 8, sy - 18, 16, 2);
  ctx.fillStyle = '#e04040'; ctx.fillRect(sx - 8, sy - 18, 16 * (b.hp/b.maxHp), 2);
}

export function drawTree(ctx, sx, sy, variant, season) {
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.ellipse(sx, sy + 14, 10, 3, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#5a3a1a';
  ctx.fillRect(sx - 2, sy - 4, 4, 18);
  if (season === 'Hiver' || variant === 'nu') {
    if (variant === 'pin') {
      ctx.fillStyle = '#e8e8f0';
      ctx.beginPath(); ctx.moveTo(sx, sy - 24); ctx.lineTo(sx - 10, sy - 4); ctx.lineTo(sx + 10, sy - 4); ctx.fill();
    }
    return;
  }
  const leaf = SEASON_LEAF[season] || '#4a8a2a';
  if (variant === 'pin') {
    ctx.fillStyle = leaf;
    ctx.beginPath(); ctx.moveTo(sx, sy - 26); ctx.lineTo(sx - 11, sy - 2); ctx.lineTo(sx + 11, sy - 2); ctx.fill();
  } else {
    ctx.fillStyle = leaf;
    ctx.beginPath(); ctx.arc(sx, sy - 12, 12, 0, Math.PI*2); ctx.fill();
  }
}

export function drawRock(ctx, sx, sy, level) {
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.ellipse(sx, sy + 8, 10, 3, 0, 0, Math.PI*2); ctx.fill();
  const shades = ['#9a9a9a','#7a7a7a','#5a5a5a','#4a4a5a','#3a3a4a'];
  ctx.fillStyle = shades[Math.min(level, 4)];
  ctx.beginPath();
  ctx.moveTo(sx - 10, sy + 5); ctx.lineTo(sx - 8, sy - 6);
  ctx.lineTo(sx + 2, sy - 9); ctx.lineTo(sx + 10, sy - 4);
  ctx.lineTo(sx + 8, sy + 6); ctx.closePath(); ctx.fill();
  if (level >= 3) {
    ctx.strokeStyle = '#c47030'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(sx - 6, sy - 2); ctx.lineTo(sx + 4, sy + 3); ctx.stroke();
  }
}

export function drawBuilding(ctx, b, sx, sy, t) {
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(sx - 14, sy + 12, 28, 4);
  switch (b.type) {
    case 'campfire':
      ctx.fillStyle = '#3a2010'; ctx.fillRect(sx - 8, sy + 4, 16, 3);
      ctx.fillStyle = '#ff8030'; ctx.beginPath();
      ctx.moveTo(sx, sy - 8 + Math.sin(t*8)*2); ctx.lineTo(sx - 6, sy + 4); ctx.lineTo(sx + 6, sy + 4); ctx.fill();
      ctx.fillStyle = '#ffd040'; ctx.beginPath();
      ctx.moveTo(sx, sy - 4); ctx.lineTo(sx - 3, sy + 2); ctx.lineTo(sx + 3, sy + 2); ctx.fill();
      break;
    case 'house':
      ctx.fillStyle = '#a47040'; ctx.fillRect(sx - 14, sy - 4, 28, 18);
      ctx.fillStyle = '#7a3020'; ctx.beginPath();
      ctx.moveTo(sx - 16, sy - 4); ctx.lineTo(sx, sy - 18); ctx.lineTo(sx + 16, sy - 4); ctx.fill();
      ctx.fillStyle = '#3a1a0a'; ctx.fillRect(sx - 4, sy + 2, 8, 12);
      ctx.fillStyle = 'rgba(180,180,180,0.6)';
      for (let i = 0; i < 3; i++) ctx.fillRect(sx - 12 + i*8, sy - 24 - i*3, 3, 6);
      break;
    case 'farm':
      ctx.fillStyle = '#7a4a20'; ctx.fillRect(sx - 14, sy - 6, 28, 20);
      ctx.fillStyle = '#5aa030';
      for (let i = 0; i < 4; i++) ctx.fillRect(sx - 12 + i*7, sy - 4, 4, 16);
      break;
    case 'wall':
      ctx.fillStyle = '#7a7a7a'; ctx.fillRect(sx - 14, sy - 8, 28, 22);
      ctx.fillStyle = '#5a5a5a';
      for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++)
        ctx.strokeRect(sx - 14 + i*9, sy - 8 + j*11, 9, 11);
      break;
    case 'workshop':
      ctx.fillStyle = '#9a6a30'; ctx.fillRect(sx - 14, sy - 6, 28, 20);
      ctx.fillStyle = '#5a3010'; ctx.fillRect(sx - 14, sy - 6, 28, 4);
      ctx.fillStyle = '#3a2010'; ctx.fillRect(sx - 4, sy + 4, 8, 10);
      break;
    case 'infirmary':
      ctx.fillStyle = '#e4e4e4'; ctx.fillRect(sx - 14, sy - 6, 28, 20);
      ctx.fillStyle = '#e04040'; ctx.fillRect(sx - 2, sy - 2, 4, 12); ctx.fillRect(sx - 6, sy + 2, 12, 4);
      break;
    case 'watchtower':
      ctx.fillStyle = '#7a5a30'; ctx.fillRect(sx - 8, sy - 14, 16, 28);
      ctx.fillStyle = '#5a3010'; ctx.fillRect(sx - 12, sy - 18, 24, 4);
      ctx.fillStyle = '#c04040'; // drapeau
      ctx.fillRect(sx, sy - 28 + Math.sin(t*4)*1, 8, 5);
      ctx.fillStyle = '#3a2010'; ctx.fillRect(sx - 1, sy - 28, 2, 14);
      break;
    case 'well':
      ctx.fillStyle = '#7a7a7a'; ctx.beginPath(); ctx.arc(sx, sy + 4, 10, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#3a6a9a'; ctx.beginPath();
      ctx.arc(sx, sy + 4 + Math.sin(t*3)*0.5, 7, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#5a3a1a'; ctx.fillRect(sx - 1, sy - 14, 2, 18);
      break;
    case 'stable':
      ctx.fillStyle = '#8a5a30'; ctx.fillRect(sx - 14, sy - 4, 28, 18);
      ctx.fillStyle = '#5a3010'; ctx.fillRect(sx - 16, sy - 6, 32, 4);
      break;
    case 'irrigation':
      ctx.fillStyle = '#3a6a9a'; ctx.fillRect(sx - 14, sy + 2, 28, 8);
      ctx.fillStyle = '#5aa030'; ctx.fillRect(sx - 14, sy - 6, 28, 6);
      break;
    case 'granary':
      ctx.fillStyle = '#c4a060'; ctx.fillRect(sx - 12, sy - 8, 24, 22);
      ctx.fillStyle = '#7a5a20'; ctx.beginPath();
      ctx.moveTo(sx - 14, sy - 8); ctx.lineTo(sx, sy - 16); ctx.lineTo(sx + 14, sy - 8); ctx.fill();
      break;
    case 'forge':
      ctx.fillStyle = '#4a4a4a'; ctx.fillRect(sx - 14, sy - 6, 28, 20);
      const glow = 0.5 + Math.sin(t*6)*0.3;
      ctx.fillStyle = `rgba(255,${Math.floor(80*glow+40)},20,${glow})`;
      ctx.fillRect(sx - 6, sy + 2, 12, 10);
      // Fumée
      ctx.fillStyle = `rgba(120,120,120,${0.4 - (t*2)%0.4})`;
      ctx.beginPath(); ctx.arc(sx + 8, sy - 14 - (t*10)%20, 3, 0, Math.PI*2); ctx.fill();
      break;
  }
}
