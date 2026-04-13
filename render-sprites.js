// render-sprites.js - Sprites détaillés avec contours et ombres
const SEASON_LEAF = { Printemps:'#5aa838', Été:'#3a8a20', Automne:'#d47830', Hiver:'#a0a0a8' };

function shadow(ctx, sx, sy, w, h) {
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.ellipse(sx, sy, w, h, 0, 0, Math.PI*2); ctx.fill();
}
function outline(ctx, fn, color = '#1a1a1a', width = 1.5) {
  ctx.strokeStyle = color; ctx.lineWidth = width; fn(); ctx.stroke();
}

export function drawColon(ctx, c, sx, sy, selected) {
  const moving = Math.abs(c.targetX - c.x) > 2 || Math.abs(c.targetY - c.y) > 2;
  if (moving) c.walkPhase += 0.22;
  const legOffset = Math.sin(c.walkPhase) * 2;
  const scale = c.isChild ? 0.7 : 1;
  // Ombre
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath(); ctx.ellipse(sx, sy + 2, 9*scale, 3*scale, 0, 0, Math.PI*2); ctx.fill();
  // Jambes
  ctx.fillStyle = '#2a3848';
  ctx.fillRect(sx - 4*scale, sy - 11*scale + legOffset, 3*scale, 11*scale - legOffset);
  ctx.fillRect(sx + 1*scale, sy - 11*scale - legOffset, 3*scale, 11*scale + legOffset);
  // Torse
  ctx.fillStyle = c.isChild ? '#5a8040' : '#a83020';
  ctx.fillRect(sx - 7*scale, sy - 23*scale, 14*scale, 15*scale);
  ctx.fillStyle = c.isChild ? '#6aa050' : '#c04030';
  ctx.fillRect(sx - 7*scale, sy - 23*scale, 14*scale, 3*scale);
  // Bras
  ctx.fillStyle = '#f4c9a0';
  ctx.fillRect(sx - 8*scale, sy - 21*scale, 2*scale, 9*scale);
  ctx.fillRect(sx + 6*scale, sy - 21*scale, 2*scale, 9*scale);
  // Tête
  ctx.beginPath(); ctx.arc(sx, sy - 29*scale, 5*scale, 0, Math.PI*2); ctx.fill();
  // Cheveux
  ctx.fillStyle = '#3a2010';
  ctx.beginPath(); ctx.arc(sx, sy - 31*scale, 5*scale, Math.PI, 0); ctx.fill();
  // Yeux
  ctx.fillStyle = '#000';
  ctx.fillRect(sx - 2*scale, sy - 29*scale, 1, 1);
  ctx.fillRect(sx + 1*scale, sy - 29*scale, 1, 1);
  if (c.sick > 0) {
    ctx.fillStyle = 'rgba(60,180,75,0.4)';
    ctx.beginPath(); ctx.arc(sx, sy - 29*scale, 5*scale, 0, Math.PI*2); ctx.fill();
  }
  if (selected) {
    const t = performance.now() * 0.004;
    ctx.strokeStyle = '#f1c40f'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(sx, sy + 2, 12 + Math.sin(t), 4 + Math.sin(t)*0.5, 0, 0, Math.PI*2); ctx.stroke();
  }
  // Barres stats (4 fines)
  const bx = sx - 14, by = sy - (48*scale), bw = 28;
  const drawBar = (y, val, max, color) => {
    ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(bx, y, bw, 2);
    ctx.fillStyle = color; ctx.fillRect(bx, y, bw * Math.max(0, val/max), 2);
  };
  drawBar(by,     c.hp,     c.maxHp, c.hp > 50 ? '#2ecc71' : c.hp > 25 ? '#f39c12' : '#e74c3c');
  drawBar(by + 3, c.hunger, 100,     '#e67e22');
  drawBar(by + 6, c.thirst, 100,     '#3498db');
  drawBar(by + 9, c.warmth, 100,     '#e84393');
  if (c.isChild) {
    ctx.fillStyle = '#9b59b6'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('enfant', sx, sy - 52);
    ctx.textAlign = 'start';
  }
}

export function drawAnimal(ctx, a, sx, sy) {
  shadow(ctx, sx, sy + 10, 14, 4);
  if (a.species === 'cow') {
    // Corps blanc avec taches noires
    ctx.fillStyle = '#f5f5f0';
    ctx.beginPath(); ctx.ellipse(sx, sy, 13, 8, 0, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#000'; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath(); ctx.ellipse(sx - 5, sy - 2, 4, 3, 0.3, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(sx + 3, sy + 2, 3, 2, -0.2, 0, Math.PI*2); ctx.fill();
    // Tête
    ctx.fillStyle = '#f5f5f0';
    ctx.beginPath(); ctx.arc(sx + 12, sy - 1, 5, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#000'; ctx.stroke();
    // Cornes
    ctx.fillStyle = '#d4c47a';
    ctx.fillRect(sx + 13, sy - 7, 1, 3); ctx.fillRect(sx + 16, sy - 7, 1, 3);
    // Yeux et naseaux
    ctx.fillStyle = '#000';
    ctx.fillRect(sx + 13, sy - 2, 1, 1); ctx.fillRect(sx + 15, sy - 2, 1, 1);
    ctx.fillStyle = '#a04050';
    ctx.fillRect(sx + 14, sy + 1, 2, 1);
    // Pattes
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(sx - 8, sy + 6, 2, 5); ctx.fillRect(sx - 3, sy + 6, 2, 5);
    ctx.fillRect(sx + 3, sy + 6, 2, 5); ctx.fillRect(sx + 7, sy + 6, 2, 5);
  } else if (a.species === 'deer') {
    ctx.fillStyle = '#a47030';
    ctx.beginPath(); ctx.ellipse(sx, sy, 11, 7, 0, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#000'; ctx.lineWidth = 1.2; ctx.stroke();
    // Tête
    ctx.fillStyle = '#a47030';
    ctx.beginPath(); ctx.arc(sx + 10, sy - 3, 4, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    // Bois ramifiés
    ctx.strokeStyle = '#5a3010'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(sx + 9, sy - 6); ctx.lineTo(sx + 7, sy - 13); ctx.lineTo(sx + 5, sy - 11);
    ctx.moveTo(sx + 7, sy - 13); ctx.lineTo(sx + 9, sy - 15);
    ctx.moveTo(sx + 11, sy - 6); ctx.lineTo(sx + 13, sy - 13); ctx.lineTo(sx + 15, sy - 11);
    ctx.stroke();
    // Pattes fines
    ctx.fillStyle = '#5a3010';
    ctx.fillRect(sx - 7, sy + 5, 1.5, 6); ctx.fillRect(sx - 2, sy + 5, 1.5, 6);
    ctx.fillRect(sx + 3, sy + 5, 1.5, 6); ctx.fillRect(sx + 7, sy + 5, 1.5, 6);
  } else {
    // Loup gris ou noir
    const dark = a.species === 'wolf-black';
    ctx.fillStyle = dark ? '#1a1a1a' : '#5a5a5a';
    ctx.beginPath(); ctx.ellipse(sx, sy, 11, 6, 0, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#000'; ctx.lineWidth = 1; ctx.stroke();
    // Tête anguleuse
    ctx.beginPath();
    ctx.moveTo(sx + 5, sy - 6); ctx.lineTo(sx + 14, sy - 4); ctx.lineTo(sx + 16, sy);
    ctx.lineTo(sx + 14, sy + 3); ctx.lineTo(sx + 5, sy + 2); ctx.closePath();
    ctx.fill(); ctx.stroke();
    // Oreilles pointues
    ctx.beginPath();
    ctx.moveTo(sx + 7, sy - 6); ctx.lineTo(sx + 6, sy - 10); ctx.lineTo(sx + 9, sy - 7); ctx.closePath();
    ctx.moveTo(sx + 11, sy - 6); ctx.lineTo(sx + 12, sy - 10); ctx.lineTo(sx + 13, sy - 7); ctx.closePath();
    ctx.fill();
    // Yeux rouges
    ctx.fillStyle = '#ff2020';
    ctx.fillRect(sx + 11, sy - 2, 1.5, 1.5); ctx.fillRect(sx + 13, sy - 2, 1.5, 1.5);
    // Pattes
    ctx.fillStyle = dark ? '#0a0a0a' : '#3a3a3a';
    ctx.fillRect(sx - 7, sy + 4, 2, 5); ctx.fillRect(sx - 2, sy + 4, 2, 5);
    ctx.fillRect(sx + 3, sy + 4, 2, 5); ctx.fillRect(sx + 7, sy + 4, 2, 5);
  }
  if (a.tame > 0 && !a.tamed) {
    ctx.fillStyle = '#000'; ctx.fillRect(sx - 12, sy - 16, 24, 3);
    ctx.fillStyle = '#a040c0'; ctx.fillRect(sx - 12, sy - 16, 24 * (a.tame/100), 3);
  }
}

export function drawBandit(ctx, b, sx, sy) {
  shadow(ctx, sx, sy + 14, 9, 3);
  // Jambes
  ctx.fillStyle = '#2a1a3a'; ctx.fillRect(sx - 5, sy + 4, 4, 10); ctx.fillRect(sx + 1, sy + 4, 4, 10);
  // Cape avec dégradé
  const g = ctx.createLinearGradient(sx, sy - 14, sx, sy + 6);
  g.addColorStop(0, '#4a2a5a'); g.addColorStop(1, '#1a0a2a');
  ctx.fillStyle = g; ctx.fillRect(sx - 8, sy - 14, 16, 18);
  ctx.strokeStyle = '#000'; ctx.lineWidth = 1; ctx.strokeRect(sx - 8, sy - 14, 16, 18);
  // Capuche pointue
  ctx.fillStyle = '#1a0a2a';
  ctx.beginPath(); ctx.moveTo(sx - 7, sy - 12); ctx.lineTo(sx, sy - 22); ctx.lineTo(sx + 7, sy - 12); ctx.closePath(); ctx.fill(); ctx.stroke();
  // Visage sombre dans la capuche
  ctx.fillStyle = '#0a0a0a'; ctx.beginPath(); ctx.arc(sx, sy - 11, 4, 0, Math.PI); ctx.fill();
  // Yeux rouges
  ctx.fillStyle = '#ff3030'; ctx.fillRect(sx - 2, sy - 11, 1, 1); ctx.fillRect(sx + 1, sy - 11, 1, 1);
  // Poignard avec lame brillante
  ctx.fillStyle = '#3a2010'; ctx.fillRect(sx + 7, sy - 1, 2, 4);
  ctx.fillStyle = '#e0e0e8'; ctx.fillRect(sx + 9, sy - 4, 8, 1.5);
  ctx.strokeStyle = '#000'; ctx.strokeRect(sx + 9, sy - 4, 8, 1.5);
  // Barre HP
  ctx.fillStyle = '#000'; ctx.fillRect(sx - 10, sy - 26, 20, 3);
  ctx.fillStyle = '#e04040'; ctx.fillRect(sx - 10, sy - 26, 20 * (b.hp/b.maxHp), 3);
}

export function drawBuilding(ctx, b, sx, sy, t) {
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath(); ctx.ellipse(sx, sy + 16, 18, 4, 0, 0, Math.PI*2); ctx.fill();
  switch (b.type) {
    case 'campfire': {
      // Pierres
      ctx.fillStyle = '#5a5a5a';
      for (let i = 0; i < 5; i++) {
        const a = (i/5) * Math.PI*2;
        ctx.beginPath(); ctx.arc(sx + Math.cos(a)*9, sy + 6 + Math.sin(a)*4, 3, 0, Math.PI*2); ctx.fill();
      }
      // Bûches
      ctx.fillStyle = '#5a3010'; ctx.fillRect(sx - 7, sy + 2, 14, 3);
      // Flammes animées multi-couches
      const f = Math.sin(t*8)*2;
      ctx.fillStyle = '#ff4010';
      ctx.beginPath(); ctx.moveTo(sx, sy - 12 + f); ctx.lineTo(sx - 7, sy + 4); ctx.lineTo(sx + 7, sy + 4); ctx.fill();
      ctx.fillStyle = '#ffa030';
      ctx.beginPath(); ctx.moveTo(sx, sy - 8 + f); ctx.lineTo(sx - 4, sy + 3); ctx.lineTo(sx + 4, sy + 3); ctx.fill();
      ctx.fillStyle = '#ffe060';
      ctx.beginPath(); ctx.moveTo(sx, sy - 4); ctx.lineTo(sx - 2, sy + 2); ctx.lineTo(sx + 2, sy + 2); ctx.fill();
      break;
    }
    case 'house': {
      // Mur avec planches
      const g = ctx.createLinearGradient(sx, sy - 6, sx, sy + 16);
      g.addColorStop(0, '#c4925a'); g.addColorStop(1, '#7a5530');
      ctx.fillStyle = g; ctx.fillRect(sx - 18, sy - 6, 36, 22);
      ctx.strokeStyle = '#3a2010'; ctx.lineWidth = 1;
      for (let i = 1; i < 5; i++) { ctx.beginPath(); ctx.moveTo(sx - 18 + i*7, sy - 6); ctx.lineTo(sx - 18 + i*7, sy + 16); ctx.stroke(); }
      ctx.strokeRect(sx - 18, sy - 6, 36, 22);
      // Toit
      const rg = ctx.createLinearGradient(sx, sy - 22, sx, sy - 6);
      rg.addColorStop(0, '#9a2010'); rg.addColorStop(1, '#5a1808');
      ctx.fillStyle = rg;
      ctx.beginPath(); ctx.moveTo(sx - 22, sy - 4); ctx.lineTo(sx, sy - 22); ctx.lineTo(sx + 22, sy - 4); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5; ctx.stroke();
      // Cheminée + fumée
      ctx.fillStyle = '#5a5a5a'; ctx.fillRect(sx + 8, sy - 18, 4, 8);
      ctx.fillStyle = `rgba(180,180,180,${0.6 - ((t*2)%1.2)*0.5})`;
      ctx.beginPath(); ctx.arc(sx + 10, sy - 22 - ((t*8)%14), 3, 0, Math.PI*2); ctx.fill();
      // Porte
      ctx.fillStyle = '#3a1a0a'; ctx.fillRect(sx - 4, sy + 4, 8, 12);
      ctx.fillStyle = '#d4a040'; ctx.beginPath(); ctx.arc(sx + 2, sy + 10, 0.8, 0, Math.PI*2); ctx.fill();
      // Fenêtres
      ctx.fillStyle = '#a0c0e0';
      ctx.fillRect(sx - 14, sy + 2, 6, 6); ctx.fillRect(sx + 8, sy + 2, 6, 6);
      ctx.strokeStyle = '#3a2010'; ctx.strokeRect(sx - 14, sy + 2, 6, 6); ctx.strokeRect(sx + 8, sy + 2, 6, 6);
      break;
    }
    case 'farm': {
      ctx.fillStyle = '#6a4020'; ctx.fillRect(sx - 18, sy - 8, 36, 24);
      ctx.fillStyle = '#5aa030';
      for (let i = 0; i < 5; i++) {
        const x = sx - 16 + i*8;
        ctx.fillRect(x, sy - 6, 4, 20);
        ctx.fillStyle = '#7ac040'; ctx.fillRect(x, sy - 6, 4, 4);
        ctx.fillStyle = '#5aa030';
      }
      ctx.strokeStyle = '#000'; ctx.strokeRect(sx - 18, sy - 8, 36, 24);
      break;
    }
    case 'wall': {
      const g = ctx.createLinearGradient(sx, sy - 10, sx, sy + 16);
      g.addColorStop(0, '#9a9a9a'); g.addColorStop(1, '#5a5a5a');
      ctx.fillStyle = g; ctx.fillRect(sx - 18, sy - 10, 36, 26);
      ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++)
        ctx.strokeRect(sx - 18 + i*12 + (j%2)*6, sy - 10 + j*9, 12, 9);
      break;
    }
    case 'workshop': {
      ctx.fillStyle = '#9a6a30'; ctx.fillRect(sx - 18, sy - 8, 36, 24);
      ctx.fillStyle = '#5a3010'; ctx.fillRect(sx - 18, sy - 8, 36, 5);
      ctx.fillStyle = '#3a2010'; ctx.fillRect(sx - 5, sy + 4, 10, 12);
      ctx.fillStyle = '#c0a060'; ctx.fillRect(sx - 12, sy, 6, 5); ctx.fillRect(sx + 6, sy, 6, 5);
      ctx.strokeStyle = '#000'; ctx.strokeRect(sx - 18, sy - 8, 36, 24);
      break;
    }
    case 'infirmary': {
      ctx.fillStyle = '#f0f0f0'; ctx.fillRect(sx - 18, sy - 8, 36, 24);
      ctx.fillStyle = '#e02020'; ctx.fillRect(sx - 3, sy - 4, 6, 16); ctx.fillRect(sx - 9, sy + 2, 18, 6);
      ctx.strokeStyle = '#000'; ctx.strokeRect(sx - 18, sy - 8, 36, 24);
      break;
    }
    case 'watchtower': {
      ctx.fillStyle = '#7a5a30'; ctx.fillRect(sx - 10, sy - 18, 20, 34);
      ctx.fillStyle = '#5a3010'; ctx.fillRect(sx - 14, sy - 22, 28, 5);
      ctx.fillStyle = '#c04040';
      ctx.beginPath(); ctx.moveTo(sx + 1, sy - 36 + Math.sin(t*4)*1); ctx.lineTo(sx + 12, sy - 32); ctx.lineTo(sx + 1, sy - 28); ctx.fill();
      ctx.fillStyle = '#3a2010'; ctx.fillRect(sx, sy - 36, 1.5, 18);
      ctx.strokeStyle = '#000'; ctx.strokeRect(sx - 10, sy - 18, 20, 34);
      break;
    }
    case 'well': {
      ctx.fillStyle = '#7a7a7a'; ctx.beginPath(); ctx.arc(sx, sy + 6, 12, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#000'; ctx.stroke();
      ctx.fillStyle = '#3a6a9a'; ctx.beginPath(); ctx.arc(sx, sy + 6 + Math.sin(t*3), 9, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#5a3a1a'; ctx.fillRect(sx - 1, sy - 18, 2, 22); ctx.fillRect(sx - 8, sy - 18, 16, 2);
      break;
    }
    case 'stable': {
      ctx.fillStyle = '#8a5a30'; ctx.fillRect(sx - 18, sy - 4, 36, 20);
      ctx.fillStyle = '#5a3010'; ctx.fillRect(sx - 20, sy - 8, 40, 5);
      ctx.fillStyle = '#3a2010'; ctx.fillRect(sx - 4, sy + 4, 8, 12);
      ctx.strokeStyle = '#000'; ctx.strokeRect(sx - 18, sy - 4, 36, 20);
      break;
    }
    case 'irrigation': {
      ctx.fillStyle = '#3a6a9a'; ctx.fillRect(sx - 18, sy + 2, 36, 10);
      ctx.fillStyle = '#5aa030'; ctx.fillRect(sx - 18, sy - 8, 36, 8);
      for (let i = 0; i < 4; i++) ctx.fillRect(sx - 16 + i*10, sy - 8, 3, 6);
      break;
    }
    case 'granary': {
      ctx.fillStyle = '#c4a060'; ctx.fillRect(sx - 14, sy - 10, 28, 26);
      ctx.fillStyle = '#7a5a20';
      ctx.beginPath(); ctx.moveTo(sx - 16, sy - 10); ctx.lineTo(sx, sy - 20); ctx.lineTo(sx + 16, sy - 10); ctx.fill();
      ctx.strokeStyle = '#000'; ctx.strokeRect(sx - 14, sy - 10, 28, 26);
      break;
    }
    case 'forge': {
      ctx.fillStyle = '#3a3a3a'; ctx.fillRect(sx - 18, sy - 8, 36, 24);
      const glow = 0.6 + Math.sin(t*6)*0.3;
      ctx.fillStyle = `rgba(255,${Math.floor(80*glow+40)},20,${glow})`;
      ctx.fillRect(sx - 8, sy + 2, 16, 12);
      ctx.fillStyle = `rgba(120,120,120,${0.5 - ((t*2)%1)*0.4})`;
      ctx.beginPath(); ctx.arc(sx + 10, sy - 18 - ((t*10)%24), 4, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#000'; ctx.strokeRect(sx - 18, sy - 8, 36, 24);
      break;
    }
  }
}

// drawTree et drawRock conservés mais agrandis
export function drawTree(ctx, sx, sy, variant, season) {
  shadow(ctx, sx, sy + 18, 12, 4);
  ctx.fillStyle = '#5a3a1a'; ctx.fillRect(sx - 3, sy - 4, 6, 22);
  ctx.strokeStyle = '#000'; ctx.lineWidth = 1; ctx.strokeRect(sx - 3, sy - 4, 6, 22);
  if (season === 'Hiver' || variant === 'nu') return;
  const leaf = SEASON_LEAF[season] || '#4a8a2a';
  if (variant === 'pin') {
    ctx.fillStyle = leaf;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(sx, sy - 32 + i*8); ctx.lineTo(sx - 12 + i*2, sy - 8 + i*8); ctx.lineTo(sx + 12 - i*2, sy - 8 + i*8); ctx.fill();
    }
  } else {
    ctx.fillStyle = leaf;
    ctx.beginPath(); ctx.arc(sx - 5, sy - 14, 10, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(sx + 5, sy - 14, 10, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(sx, sy - 22, 9, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#000'; ctx.lineWidth = 1; ctx.stroke();
  }
}

export function drawRock(ctx, sx, sy, level) {
  shadow(ctx, sx, sy + 10, 12, 4);
  const shades = ['#a0a0a0','#808080','#606060','#4a4a5a','#3a3a4a'];
  ctx.fillStyle = shades[Math.min(level, 4)];
  ctx.beginPath();
  ctx.moveTo(sx - 12, sy + 6); ctx.lineTo(sx - 10, sy - 8);
  ctx.lineTo(sx + 2, sy - 11); ctx.lineTo(sx + 12, sy - 5);
  ctx.lineTo(sx + 10, sy + 7); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#000'; ctx.lineWidth = 1.2; ctx.stroke();
  if (level >= 3) {
    ctx.strokeStyle = '#d48030'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(sx - 7, sy - 3); ctx.lineTo(sx + 5, sy + 4); ctx.stroke();
  }
}
