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
  const scale = c.isChild ? 0.75 : 1;

  // COUCHE 1: Ombre oblique au sol (lumière venant du NE)
  const shadowGrd = ctx.createRadialGradient(sx + 2, sy + 3, 0, sx + 2, sy + 3, 14*scale);
  shadowGrd.addColorStop(0, 'rgba(0,0,0,0.55)');
  shadowGrd.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = shadowGrd;
  ctx.beginPath(); ctx.ellipse(sx + 3, sy + 3, 11*scale, 4*scale, 0, 0, Math.PI*2); ctx.fill();

  // COUCHE 2: Corps avec éclairage asymétrique
  // Jambes
  ctx.fillStyle = '#1e2838';
  ctx.fillRect(sx - 4*scale, sy - 11*scale + legOffset, 3*scale, 11*scale - legOffset);
  ctx.fillRect(sx + 1*scale, sy - 11*scale - legOffset, 3*scale, 11*scale + legOffset);
  // Highlight jambes côté droit (lumière)
  ctx.fillStyle = '#3a4858';
  ctx.fillRect(sx + 3*scale, sy - 11*scale - legOffset, 1*scale, 11*scale + legOffset);

  // Torse rouge avec dégradé vertical
  const torsoGrd = ctx.createLinearGradient(sx, sy - 23*scale, sx, sy - 8*scale);
  torsoGrd.addColorStop(0, c.isChild ? '#7aa055' : '#c84538');
  torsoGrd.addColorStop(1, c.isChild ? '#4a7030' : '#7a2015');
  ctx.fillStyle = torsoGrd;
  ctx.fillRect(sx - 7*scale, sy - 23*scale, 14*scale, 15*scale);
  // Highlight torse côté droit
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillRect(sx + 5*scale, sy - 23*scale, 2*scale, 15*scale);
  // Col plus clair
  ctx.fillStyle = c.isChild ? '#8ab060' : '#d45545';
  ctx.fillRect(sx - 7*scale, sy - 23*scale, 14*scale, 2*scale);
  // Ceinture
  ctx.fillStyle = '#3a2010'; ctx.fillRect(sx - 7*scale, sy - 11*scale, 14*scale, 2*scale);
  ctx.fillStyle = '#c49030'; ctx.fillRect(sx - 1*scale, sy - 11*scale, 2*scale, 2*scale);

  // Bras
  ctx.fillStyle = '#d4a474';
  ctx.fillRect(sx - 8*scale, sy - 21*scale, 2*scale, 9*scale);
  ctx.fillRect(sx + 6*scale, sy - 21*scale, 2*scale, 9*scale);
  // Highlight bras droit
  ctx.fillStyle = '#e4b484';
  ctx.fillRect(sx + 7*scale, sy - 21*scale, 1*scale, 9*scale);

  // Tête avec volume
  ctx.fillStyle = '#e8b894';
  ctx.beginPath(); ctx.arc(sx, sy - 29*scale, 5*scale, 0, Math.PI*2); ctx.fill();
  // Ombre gauche de la tête
  ctx.fillStyle = 'rgba(100,60,40,0.35)';
  ctx.beginPath(); ctx.arc(sx - 1*scale, sy - 29*scale, 5*scale, Math.PI*0.5, Math.PI*1.5); ctx.fill();
  // Highlight droit
  ctx.fillStyle = 'rgba(255,230,200,0.4)';
  ctx.beginPath(); ctx.arc(sx + 1*scale, sy - 30*scale, 3*scale, -Math.PI*0.5, Math.PI*0.5); ctx.fill();

  // COUCHE 3: Détails
  // Cheveux
  ctx.fillStyle = '#2a1808';
  ctx.beginPath(); ctx.arc(sx, sy - 31*scale, 5*scale, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#3a2010';
  ctx.beginPath(); ctx.arc(sx + 2*scale, sy - 32*scale, 4*scale, Math.PI*1.2, Math.PI*1.8); ctx.fill();
  // Yeux
  ctx.fillStyle = '#000';
  ctx.fillRect(sx - 2*scale, sy - 29*scale, 1.2*scale, 1.2*scale);
  ctx.fillRect(sx + 1*scale, sy - 29*scale, 1.2*scale, 1.2*scale);
  // Bouche
  ctx.fillStyle = '#8a4030';
  ctx.fillRect(sx - 1*scale, sy - 26*scale, 2*scale, 0.8*scale);

  if (c.sick > 0) {
    ctx.fillStyle = 'rgba(60,180,75,0.4)';
    ctx.beginPath(); ctx.arc(sx, sy - 29*scale, 5*scale, 0, Math.PI*2); ctx.fill();
  }
  if (selected) {
    const t = performance.now() * 0.004;
    ctx.strokeStyle = '#f1c40f'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(sx, sy + 2, 14 + Math.sin(t), 5 + Math.sin(t)*0.5, 0, 0, Math.PI*2); ctx.stroke();
  }
  // Barres stats
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
    ctx.fillStyle = '#9b59b6'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
    ctx.strokeText('enfant', sx, sy - 52); ctx.fillText('enfant', sx, sy - 52);
    ctx.textAlign = 'start';
  }
}

export function drawAnimal(ctx, a, sx, sy) {
  // COUCHE 1: Ombre oblique
  const shGrd = ctx.createRadialGradient(sx + 2, sy + 10, 0, sx + 2, sy + 10, 16);
  shGrd.addColorStop(0, 'rgba(0,0,0,0.5)');
  shGrd.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = shGrd;
  ctx.beginPath(); ctx.ellipse(sx + 2, sy + 10, 14, 4, 0, 0, Math.PI*2); ctx.fill();

  if (a.species === 'cow') {
    // COUCHE 2: Corps avec dégradé
    const bodyGrd = ctx.createLinearGradient(sx, sy - 6, sx, sy + 8);
    bodyGrd.addColorStop(0, '#ffffff');
    bodyGrd.addColorStop(1, '#c4c0b8');
    ctx.fillStyle = bodyGrd;
    ctx.beginPath(); ctx.ellipse(sx, sy, 14, 9, 0, 0, Math.PI*2); ctx.fill();
    // Taches noires avec variation
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath(); ctx.ellipse(sx - 6, sy - 2, 5, 3.5, 0.3, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(sx + 3, sy + 3, 3.5, 2, -0.2, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(sx - 2, sy + 5, 2, 1.5, 0.5, 0, Math.PI*2); ctx.fill();
    // Highlight sur le dos
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath(); ctx.ellipse(sx, sy - 5, 10, 2, 0, 0, Math.PI*2); ctx.fill();
    // Tête
    ctx.fillStyle = '#f5f5f0';
    ctx.beginPath(); ctx.arc(sx + 13, sy - 1, 5.5, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath(); ctx.arc(sx + 12, sy - 1, 5.5, Math.PI*0.5, Math.PI*1.5); ctx.fill();
    // Museau rose
    ctx.fillStyle = '#e49090';
    ctx.beginPath(); ctx.ellipse(sx + 16, sy + 1, 2.5, 2, 0, 0, Math.PI*2); ctx.fill();
    // Naseaux
    ctx.fillStyle = '#000';
    ctx.fillRect(sx + 15, sy + 1, 1, 1); ctx.fillRect(sx + 17, sy + 1, 1, 1);
    // Cornes courbées
    ctx.strokeStyle = '#c4a860'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(sx + 11, sy - 5); ctx.quadraticCurveTo(sx + 10, sy - 9, sx + 12, sy - 10); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sx + 16, sy - 5); ctx.quadraticCurveTo(sx + 17, sy - 9, sx + 15, sy - 10); ctx.stroke();
    // Oreilles
    ctx.fillStyle = '#f5f5f0';
    ctx.beginPath(); ctx.ellipse(sx + 9, sy - 5, 2, 3, -0.5, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(sx + 18, sy - 5, 2, 3, 0.5, 0, Math.PI*2); ctx.fill();
    // Yeux
    ctx.fillStyle = '#000';
    ctx.fillRect(sx + 11, sy - 2, 1.2, 1.2); ctx.fillRect(sx + 14, sy - 2, 1.2, 1.2);
    ctx.fillStyle = '#fff';
    ctx.fillRect(sx + 11.5, sy - 2, 0.5, 0.5); ctx.fillRect(sx + 14.5, sy - 2, 0.5, 0.5);
    // Pattes avec sabots
    ctx.fillStyle = '#f0f0e8';
    ctx.fillRect(sx - 9, sy + 6, 2.5, 6); ctx.fillRect(sx - 3, sy + 6, 2.5, 6);
    ctx.fillRect(sx + 3, sy + 6, 2.5, 6); ctx.fillRect(sx + 7, sy + 6, 2.5, 6);
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(sx - 9, sy + 11, 2.5, 1.5); ctx.fillRect(sx - 3, sy + 11, 2.5, 1.5);
    ctx.fillRect(sx + 3, sy + 11, 2.5, 1.5); ctx.fillRect(sx + 7, sy + 11, 2.5, 1.5);
    // Queue
    ctx.strokeStyle = '#f5f5f0'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(sx - 13, sy - 2); ctx.quadraticCurveTo(sx - 17, sy + 2, sx - 15, sy + 6); ctx.stroke();
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath(); ctx.arc(sx - 15, sy + 6, 1.5, 0, Math.PI*2); ctx.fill();
  } else if (a.species === 'deer') {
    // Corps marron avec dégradé
    const bodyGrd = ctx.createLinearGradient(sx, sy - 6, sx, sy + 6);
    bodyGrd.addColorStop(0, '#c48540');
    bodyGrd.addColorStop(1, '#7a4820');
    ctx.fillStyle = bodyGrd;
    ctx.beginPath(); ctx.ellipse(sx, sy, 12, 7, 0, 0, Math.PI*2); ctx.fill();
    // Taches blanches sur le dos
    ctx.fillStyle = 'rgba(255,240,220,0.7)';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath(); ctx.arc(sx - 6 + i*4, sy - 3, 1.2, 0, Math.PI*2); ctx.fill();
    }
    // Ventre clair
    ctx.fillStyle = '#e8c090';
    ctx.beginPath(); ctx.ellipse(sx, sy + 4, 8, 2.5, 0, 0, Math.PI*2); ctx.fill();
    // Tête et cou
    ctx.fillStyle = '#a47030';
    ctx.beginPath(); ctx.ellipse(sx + 10, sy - 4, 4.5, 5, -0.3, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#7a4820';
    ctx.fillRect(sx + 8, sy - 6, 3, 4);
    // Museau
    ctx.fillStyle = '#3a2010';
    ctx.beginPath(); ctx.arc(sx + 14, sy - 4, 1.5, 0, Math.PI*2); ctx.fill();
    // Yeux brillants
    ctx.fillStyle = '#000';
    ctx.fillRect(sx + 11, sy - 5, 1.2, 1.2);
    ctx.fillStyle = '#fff'; ctx.fillRect(sx + 11.3, sy - 4.8, 0.4, 0.4);
    // Bois ramifiés détaillés
    ctx.strokeStyle = '#4a2808'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(sx + 8, sy - 8); ctx.lineTo(sx + 5, sy - 16); ctx.lineTo(sx + 2, sy - 14);
    ctx.moveTo(sx + 5, sy - 16); ctx.lineTo(sx + 7, sy - 19);
    ctx.moveTo(sx + 5, sy - 16); ctx.lineTo(sx + 3, sy - 18);
    ctx.moveTo(sx + 11, sy - 8); ctx.lineTo(sx + 14, sy - 16); ctx.lineTo(sx + 17, sy - 14);
    ctx.moveTo(sx + 14, sy - 16); ctx.lineTo(sx + 12, sy - 19);
    ctx.moveTo(sx + 14, sy - 16); ctx.lineTo(sx + 16, sy - 18);
    ctx.stroke();
    // Oreilles
    ctx.fillStyle = '#a47030';
    ctx.beginPath(); ctx.ellipse(sx + 6, sy - 8, 1.5, 2.5, -0.3, 0, Math.PI*2); ctx.fill();
    // Pattes fines
    ctx.fillStyle = '#5a3010';
    ctx.fillRect(sx - 8, sy + 5, 1.5, 7); ctx.fillRect(sx - 2, sy + 5, 1.5, 7);
    ctx.fillRect(sx + 3, sy + 5, 1.5, 7); ctx.fillRect(sx + 8, sy + 5, 1.5, 7);
    // Sabots
    ctx.fillStyle = '#2a1808';
    ctx.fillRect(sx - 8, sy + 11, 1.5, 1.5); ctx.fillRect(sx - 2, sy + 11, 1.5, 1.5);
    ctx.fillRect(sx + 3, sy + 11, 1.5, 1.5); ctx.fillRect(sx + 8, sy + 11, 1.5, 1.5);
    // Queue courte
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(sx - 11, sy - 3, 2, 0, Math.PI*2); ctx.fill();
  } else {
    // Loup gris ou noir
    const dark = a.species === 'wolf-black';
    const baseCol = dark ? '#1a1a1a' : '#6a6a6a';
    const lightCol = dark ? '#3a3a3a' : '#9a9a9a';
    const darkCol = dark ? '#0a0a0a' : '#3a3a3a';
    // Corps avec dégradé
    const bodyGrd = ctx.createLinearGradient(sx, sy - 5, sx, sy + 5);
    bodyGrd.addColorStop(0, lightCol);
    bodyGrd.addColorStop(1, darkCol);
    ctx.fillStyle = bodyGrd;
    ctx.beginPath(); ctx.ellipse(sx - 2, sy, 11, 6, 0, 0, Math.PI*2); ctx.fill();
    // Poil texture
    ctx.strokeStyle = darkCol; ctx.lineWidth = 0.5;
    for (let i = 0; i < 8; i++) {
      const px = sx - 10 + i*2.5;
      ctx.beginPath(); ctx.moveTo(px, sy - 3); ctx.lineTo(px + 1, sy - 5); ctx.stroke();
    }
    // Tête anguleuse
    ctx.fillStyle = baseCol;
    ctx.beginPath();
    ctx.moveTo(sx + 5, sy - 7); ctx.lineTo(sx + 15, sy - 5); ctx.lineTo(sx + 18, sy);
    ctx.lineTo(sx + 15, sy + 4); ctx.lineTo(sx + 5, sy + 2); ctx.closePath();
    ctx.fill();
    // Museau clair
    ctx.fillStyle = lightCol;
    ctx.beginPath();
    ctx.moveTo(sx + 13, sy - 2); ctx.lineTo(sx + 18, sy); ctx.lineTo(sx + 15, sy + 3); ctx.closePath();
    ctx.fill();
    // Oreilles pointues
    ctx.fillStyle = baseCol;
    ctx.beginPath();
    ctx.moveTo(sx + 7, sy - 7); ctx.lineTo(sx + 5, sy - 12); ctx.lineTo(sx + 10, sy - 8); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(sx + 12, sy - 7); ctx.lineTo(sx + 13, sy - 12); ctx.lineTo(sx + 15, sy - 8); ctx.closePath(); ctx.fill();
    // Intérieur oreille rose
    ctx.fillStyle = '#a04050';
    ctx.beginPath(); ctx.moveTo(sx + 7, sy - 8); ctx.lineTo(sx + 7, sy - 11); ctx.lineTo(sx + 9, sy - 8); ctx.fill();
    // Yeux rouges perçants
    ctx.fillStyle = '#ff2020';
    ctx.fillRect(sx + 11, sy - 2, 1.5, 1.5); ctx.fillRect(sx + 13.5, sy - 2, 1.5, 1.5);
    ctx.fillStyle = '#fff';
    ctx.fillRect(sx + 11.3, sy - 1.8, 0.4, 0.4);
    // Dents blanches
    if (!a.tamed) {
      ctx.fillStyle = '#fff';
      ctx.fillRect(sx + 16, sy + 1, 0.5, 1); ctx.fillRect(sx + 17, sy + 1, 0.5, 1);
    }
    // Pattes
    ctx.fillStyle = darkCol;
    ctx.fillRect(sx - 8, sy + 4, 2.5, 6); ctx.fillRect(sx - 3, sy + 4, 2.5, 6);
    ctx.fillRect(sx + 2, sy + 4, 2.5, 6); ctx.fillRect(sx + 7, sy + 4, 2.5, 6);
    // Griffes
    ctx.fillStyle = '#c0c0c0';
    for (const px of [-8, -3, 2, 7]) {
      ctx.fillRect(sx + px, sy + 10, 0.8, 1); ctx.fillRect(sx + px + 1.5, sy + 10, 0.8, 1);
    }
    // Queue touffue
    ctx.strokeStyle = baseCol; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(sx - 12, sy - 1); ctx.quadraticCurveTo(sx - 18, sy - 4, sx - 16, sy + 3); ctx.stroke();
    // Pointe queue claire
    ctx.fillStyle = lightCol;
    ctx.beginPath(); ctx.arc(sx - 16, sy + 3, 2, 0, Math.PI*2); ctx.fill();
  }
  // Barre d'apprivoisement
  if (a.tame > 0 && !a.tamed) {
    ctx.fillStyle = '#000'; ctx.fillRect(sx - 12, sy - 18, 24, 4);
    ctx.fillStyle = '#a040c0'; ctx.fillRect(sx - 12, sy - 18, 24 * (a.tame/100), 4);
  }
}

export function drawBandit(ctx, b, sx, sy) {
  // COUCHE 1: Ombre
  const shGrd = ctx.createRadialGradient(sx + 2, sy + 14, 0, sx + 2, sy + 14, 14);
  shGrd.addColorStop(0, 'rgba(0,0,0,0.55)');
  shGrd.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = shGrd;
  ctx.beginPath(); ctx.ellipse(sx + 2, sy + 14, 10, 4, 0, 0, Math.PI*2); ctx.fill();

  // COUCHE 2: Corps
  // Jambes
  ctx.fillStyle = '#1a0f2a'; ctx.fillRect(sx - 5, sy + 2, 4, 12); ctx.fillRect(sx + 1, sy + 2, 4, 12);
  ctx.fillStyle = '#2a1a3a'; ctx.fillRect(sx + 3, sy + 2, 2, 12);
  // Bottes
  ctx.fillStyle = '#0a0508'; ctx.fillRect(sx - 6, sy + 13, 5, 3); ctx.fillRect(sx + 1, sy + 13, 5, 3);
  // Cape avec gradient riche
  const capeGrd = ctx.createLinearGradient(sx - 10, sy - 14, sx + 10, sy + 6);
  capeGrd.addColorStop(0, '#5a2a6a');
  capeGrd.addColorStop(0.5, '#3a1a4a');
  capeGrd.addColorStop(1, '#0a0515');
  ctx.fillStyle = capeGrd;
  ctx.beginPath();
  ctx.moveTo(sx - 10, sy - 14); ctx.lineTo(sx + 10, sy - 14);
  ctx.lineTo(sx + 12, sy + 4); ctx.lineTo(sx - 12, sy + 4);
  ctx.closePath(); ctx.fill();
  // Plis de cape
  ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(sx - 5, sy - 10); ctx.lineTo(sx - 7, sy + 4); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(sx + 5, sy - 10); ctx.lineTo(sx + 7, sy + 4); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(sx, sy - 12); ctx.lineTo(sx, sy + 4); ctx.stroke();

  // Capuche pointue avec volume
  ctx.fillStyle = '#0a0515';
  ctx.beginPath();
  ctx.moveTo(sx - 9, sy - 12); ctx.lineTo(sx - 1, sy - 24);
  ctx.lineTo(sx + 1, sy - 24); ctx.lineTo(sx + 9, sy - 12);
  ctx.closePath(); ctx.fill();
  // Highlight capuche
  ctx.fillStyle = '#2a1535';
  ctx.beginPath();
  ctx.moveTo(sx + 2, sy - 22); ctx.lineTo(sx + 9, sy - 12); ctx.lineTo(sx + 4, sy - 12);
  ctx.closePath(); ctx.fill();

  // Visage dans l'ombre
  ctx.fillStyle = '#1a0f0a';
  ctx.beginPath(); ctx.arc(sx, sy - 11, 5, 0, Math.PI); ctx.fill();
  // Yeux rouges luisants
  ctx.fillStyle = '#ff1010';
  ctx.fillRect(sx - 2.5, sy - 11, 1.8, 1.3); ctx.fillRect(sx + 0.8, sy - 11, 1.8, 1.3);
  // Lueur autour des yeux
  ctx.fillStyle = 'rgba(255,40,40,0.3)';
  ctx.beginPath(); ctx.arc(sx - 1.5, sy - 10.5, 2, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(sx + 1.5, sy - 10.5, 2, 0, Math.PI*2); ctx.fill();

  // COUCHE 3: Poignard détaillé
  // Manche
  ctx.fillStyle = '#3a2010'; ctx.fillRect(sx + 8, sy - 1, 2, 6);
  ctx.fillStyle = '#c49030'; ctx.fillRect(sx + 7, sy - 2, 4, 1);
  // Lame brillante avec dégradé
  const bladeGrd = ctx.createLinearGradient(sx + 10, sy - 5, sx + 18, sy - 5);
  bladeGrd.addColorStop(0, '#f0f0f8');
  bladeGrd.addColorStop(0.5, '#c0c0c8');
  bladeGrd.addColorStop(1, '#8a8a90');
  ctx.fillStyle = bladeGrd;
  ctx.beginPath();
  ctx.moveTo(sx + 10, sy - 4); ctx.lineTo(sx + 18, sy - 5); ctx.lineTo(sx + 19, sy - 4); ctx.lineTo(sx + 10, sy - 3);
  ctx.closePath(); ctx.fill();
  // Sang sur la lame
  ctx.fillStyle = '#8a1010';
  ctx.fillRect(sx + 16, sy - 4.5, 2, 0.5);

  // Barre HP
  ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(sx - 11, sy - 28, 22, 4);
  const hpGrd = ctx.createLinearGradient(sx - 11, sy - 28, sx + 11, sy - 28);
  hpGrd.addColorStop(0, '#e04040'); hpGrd.addColorStop(1, '#a02020');
  ctx.fillStyle = hpGrd;
  ctx.fillRect(sx - 11, sy - 28, 22 * (b.hp/b.maxHp), 4);
}

export function drawBuilding(ctx, b, sx, sy, t) {
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath(); ctx.ellipse(sx, sy + 16, 18, 4, 0, 0, Math.PI*2); ctx.fill();
  switch (b.type) {
    case 'campfire': {
      // COUCHE 2: Pierres en cercle avec variations
      for (let i = 0; i < 6; i++) {
        const a = (i/6) * Math.PI*2;
        const rx = sx + Math.cos(a)*11, ry = sy + 7 + Math.sin(a)*5;
        const stoneGrd = ctx.createRadialGradient(rx - 1, ry - 1, 0, rx, ry, 4);
        stoneGrd.addColorStop(0, '#8a8a8a'); stoneGrd.addColorStop(1, '#3a3a3a');
        ctx.fillStyle = stoneGrd;
        ctx.beginPath(); ctx.arc(rx, ry, 3.5, 0, Math.PI*2); ctx.fill();
        // Highlight pierre
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath(); ctx.arc(rx - 1, ry - 1, 1.2, 0, Math.PI*2); ctx.fill();
      }
      // Bûches croisées
      ctx.fillStyle = '#4a2810';
      ctx.save();
      ctx.translate(sx, sy + 3); ctx.rotate(0.3);
      ctx.fillRect(-9, -1.5, 18, 3);
      ctx.restore();
      ctx.save();
      ctx.translate(sx, sy + 3); ctx.rotate(-0.3);
      ctx.fillRect(-9, -1.5, 18, 3);
      ctx.restore();
      // Détails écorce bûches
      ctx.strokeStyle = '#2a1408'; ctx.lineWidth = 0.5;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath(); ctx.moveTo(sx - 6 + i*3, sy + 1); ctx.lineTo(sx - 6 + i*3, sy + 5); ctx.stroke();
      }
      // COUCHE 3: Flammes animées multi-couches
      const f1 = Math.sin(t*8)*2, f2 = Math.sin(t*11 + 1)*1.5, f3 = Math.sin(t*13 + 2)*1;
      // Lueur ambiante
      const glowGrd = ctx.createRadialGradient(sx, sy - 2, 0, sx, sy - 2, 20);
      glowGrd.addColorStop(0, 'rgba(255,140,40,0.4)');
      glowGrd.addColorStop(1, 'rgba(255,140,40,0)');
      ctx.fillStyle = glowGrd;
      ctx.fillRect(sx - 20, sy - 22, 40, 40);
      // Flamme rouge externe
      ctx.fillStyle = '#d82810';
      ctx.beginPath();
      ctx.moveTo(sx - 8, sy + 2);
      ctx.quadraticCurveTo(sx - 6, sy - 10 + f1, sx + f2, sy - 16 + f1);
      ctx.quadraticCurveTo(sx + 6, sy - 10 + f1, sx + 8, sy + 2);
      ctx.closePath(); ctx.fill();
      // Flamme orange
      ctx.fillStyle = '#ffa020';
      ctx.beginPath();
      ctx.moveTo(sx - 5, sy + 1);
      ctx.quadraticCurveTo(sx - 3, sy - 6 + f2, sx + f3, sy - 11 + f1);
      ctx.quadraticCurveTo(sx + 3, sy - 6 + f2, sx + 5, sy + 1);
      ctx.closePath(); ctx.fill();
      // Cœur jaune
      ctx.fillStyle = '#ffe840';
      ctx.beginPath();
      ctx.moveTo(sx - 2, sy);
      ctx.quadraticCurveTo(sx - 1, sy - 4, sx + f3*0.5, sy - 6);
      ctx.quadraticCurveTo(sx + 1, sy - 4, sx + 2, sy);
      ctx.closePath(); ctx.fill();
      // Étincelles
      for (let i = 0; i < 3; i++) {
        const phase = t*3 + i*2;
        const sparkY = sy - 10 - ((phase * 8) % 20);
        const sparkX = sx + Math.sin(phase) * 4;
        if (sparkY > sy - 25) {
          ctx.fillStyle = `rgba(255,220,80,${1 - (sy - sparkY)/15})`;
          ctx.fillRect(sparkX, sparkY, 1.5, 1.5);
        }
      }
      break;
    }
    case 'house': {
      // Mur planches avec gradient complexe
      const wallGrd = ctx.createLinearGradient(sx - 20, sy - 4, sx + 20, sy - 4);
      wallGrd.addColorStop(0, '#6a4020');
      wallGrd.addColorStop(0.3, '#c49254');
      wallGrd.addColorStop(0.7, '#a47240');
      wallGrd.addColorStop(1, '#5a3010');
      ctx.fillStyle = wallGrd; ctx.fillRect(sx - 20, sy - 4, 40, 24);
      // Planches horizontales avec ombres
      ctx.strokeStyle = 'rgba(40,20,5,0.7)'; ctx.lineWidth = 0.8;
      for (let i = 1; i < 4; i++) {
        ctx.beginPath(); ctx.moveTo(sx - 20, sy - 4 + i*6); ctx.lineTo(sx + 20, sy - 4 + i*6); ctx.stroke();
      }
      // Planches verticales
      for (let i = 1; i < 6; i++) {
        ctx.beginPath(); ctx.moveTo(sx - 20 + i*7, sy - 4); ctx.lineTo(sx - 20 + i*7, sy + 20); ctx.stroke();
      }
      // Fondations pierre
      ctx.fillStyle = '#5a5a5a'; ctx.fillRect(sx - 21, sy + 18, 42, 3);
      // Toit avec dégradé
      const roofGrd = ctx.createLinearGradient(sx, sy - 24, sx, sy - 4);
      roofGrd.addColorStop(0, '#c42010'); roofGrd.addColorStop(1, '#5a1008');
      ctx.fillStyle = roofGrd;
      ctx.beginPath();
      ctx.moveTo(sx - 24, sy - 2); ctx.lineTo(sx, sy - 24); ctx.lineTo(sx + 24, sy - 2);
      ctx.lineTo(sx + 22, sy - 1); ctx.lineTo(sx, sy - 22); ctx.lineTo(sx - 22, sy - 1);
      ctx.closePath(); ctx.fill();
      // Tuiles
      ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 0.5;
      for (let i = 1; i < 6; i++) {
        const y = sy - 24 + i*4;
        ctx.beginPath(); ctx.moveTo(sx - 24 + i*2, y); ctx.lineTo(sx + 24 - i*2, y); ctx.stroke();
      }
      // Cheminée brique
      ctx.fillStyle = '#7a3020'; ctx.fillRect(sx + 10, sy - 22, 5, 10);
      ctx.strokeStyle = '#3a1408'; ctx.lineWidth = 0.5;
      for (let i = 0; i < 3; i++) ctx.strokeRect(sx + 10, sy - 22 + i*3, 5, 3);
      // Fumée animée
      for (let i = 0; i < 3; i++) {
        const ph = (t*1.5 + i*0.6) % 2;
        ctx.fillStyle = `rgba(200,200,200,${0.6 - ph*0.3})`;
        ctx.beginPath(); ctx.arc(sx + 12 + ph*3, sy - 26 - ph*8, 2.5 + ph, 0, Math.PI*2); ctx.fill();
      }
      // Porte bois avec plis
      const doorGrd = ctx.createLinearGradient(sx - 5, sy, sx + 5, sy);
      doorGrd.addColorStop(0, '#2a1408'); doorGrd.addColorStop(0.5, '#5a3018'); doorGrd.addColorStop(1, '#2a1408');
      ctx.fillStyle = doorGrd; ctx.fillRect(sx - 5, sy + 4, 10, 16);
      ctx.strokeStyle = '#1a0a04'; ctx.strokeRect(sx - 5, sy + 4, 10, 16);
      ctx.fillStyle = '#c49030'; ctx.beginPath(); ctx.arc(sx + 3, sy + 12, 1, 0, Math.PI*2); ctx.fill();
      // Fenêtres
      ctx.fillStyle = '#6a8aa0';
      ctx.fillRect(sx - 16, sy + 2, 7, 7); ctx.fillRect(sx + 9, sy + 2, 7, 7);
      // Croisillons
      ctx.strokeStyle = '#3a2010'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(sx - 12.5, sy + 2); ctx.lineTo(sx - 12.5, sy + 9); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(sx - 16, sy + 5.5); ctx.lineTo(sx - 9, sy + 5.5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(sx + 12.5, sy + 2); ctx.lineTo(sx + 12.5, sy + 9); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(sx + 9, sy + 5.5); ctx.lineTo(sx + 16, sy + 5.5); ctx.stroke();
      // Lumière chaude fenêtre la nuit (pulse subtil)
      const glow = 0.3 + Math.sin(t*2)*0.1;
      ctx.fillStyle = `rgba(255,220,100,${glow})`;
      ctx.fillRect(sx - 16, sy + 2, 7, 7); ctx.fillRect(sx + 9, sy + 2, 7, 7);
      ctx.strokeRect(sx - 16, sy + 2, 7, 7); ctx.strokeRect(sx + 9, sy + 2, 7, 7);
      break;
    }
    case 'farm': {
      // Terre labourée avec sillons
      const earthGrd = ctx.createLinearGradient(sx, sy - 10, sx, sy + 16);
      earthGrd.addColorStop(0, '#8a5a30'); earthGrd.addColorStop(1, '#4a2810');
      ctx.fillStyle = earthGrd; ctx.fillRect(sx - 20, sy - 10, 40, 28);
      // Sillons ombres
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      for (let i = 0; i < 5; i++) ctx.fillRect(sx - 18 + i*8, sy - 10, 2, 28);
      // Plants (blé stylisé)
      for (let i = 0; i < 5; i++) {
        const px = sx - 16 + i*8;
        // Tige
        ctx.fillStyle = '#7aa040'; ctx.fillRect(px, sy - 8, 3, 20);
        // Feuilles
        ctx.fillStyle = '#5a8a30';
        ctx.beginPath(); ctx.moveTo(px, sy - 4); ctx.lineTo(px - 3, sy - 6); ctx.lineTo(px, sy - 2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(px + 3, sy - 4); ctx.lineTo(px + 6, sy - 6); ctx.lineTo(px + 3, sy - 2); ctx.fill();
        // Épi doré en haut
        ctx.fillStyle = '#e8c848';
        ctx.beginPath(); ctx.ellipse(px + 1.5, sy - 8, 2, 4, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#c49030';
        for (let j = 0; j < 3; j++) ctx.fillRect(px, sy - 10 + j*2, 3, 0.5);
      }
      // Bordure bois
      ctx.strokeStyle = '#3a2010'; ctx.lineWidth = 1.5;
      ctx.strokeRect(sx - 20, sy - 10, 40, 28);
      break;
    }
    case 'workshop': {
      // Mur bois
      const wallGrd = ctx.createLinearGradient(sx, sy - 8, sx, sy + 16);
      wallGrd.addColorStop(0, '#a47240'); wallGrd.addColorStop(1, '#5a3018');
      ctx.fillStyle = wallGrd; ctx.fillRect(sx - 20, sy - 8, 40, 24);
      // Toit planches
      ctx.fillStyle = '#3a2010'; ctx.fillRect(sx - 22, sy - 12, 44, 6);
      ctx.strokeStyle = '#1a0a04';
      for (let i = 0; i < 5; i++) {
        ctx.beginPath(); ctx.moveTo(sx - 22 + i*9, sy - 12); ctx.lineTo(sx - 22 + i*9, sy - 6); ctx.stroke();
      }
      // Porte double
      ctx.fillStyle = '#2a1408'; ctx.fillRect(sx - 6, sy + 2, 12, 14);
      ctx.strokeStyle = '#c49030';
      ctx.beginPath(); ctx.moveTo(sx, sy + 2); ctx.lineTo(sx, sy + 16); ctx.stroke();
      // Établi visible par fenêtre
      ctx.fillStyle = '#5a3a1a'; ctx.fillRect(sx - 17, sy, 7, 8);
      ctx.fillStyle = '#9a6a40'; ctx.fillRect(sx - 17, sy, 7, 2);
      // Outils suspendus
      ctx.fillStyle = '#8a8a8a'; ctx.fillRect(sx + 11, sy + 2, 1, 4); ctx.fillRect(sx + 14, sy + 2, 1, 5);
      ctx.fillStyle = '#5a3010'; ctx.fillRect(sx + 10, sy + 1, 3, 1); ctx.fillRect(sx + 13, sy + 1, 3, 1);
      // Copeaux de bois au sol
      ctx.fillStyle = '#c49254';
      for (let i = 0; i < 5; i++) {
        ctx.fillRect(sx - 18 + i*7, sy + 17, 2, 1);
      }
      ctx.strokeStyle = '#1a0a04'; ctx.strokeRect(sx - 20, sy - 8, 40, 24);
      break;
    }
    case 'wall': {
      const wallGrd = ctx.createLinearGradient(sx, sy - 12, sx, sy + 16);
      wallGrd.addColorStop(0, '#a0a0a0');
      wallGrd.addColorStop(0.5, '#7a7a7a');
      wallGrd.addColorStop(1, '#4a4a4a');
      ctx.fillStyle = wallGrd; ctx.fillRect(sx - 20, sy - 12, 40, 28);
      ctx.fillStyle = '#6a6a6a';
      for (let i = 0; i < 5; i++) ctx.fillRect(sx - 20 + i*9, sy - 14, 5, 4);
      ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 1;
      for (let row = 0; row < 4; row++) {
        const offset = (row % 2) * 6;
        for (let col = 0; col < 4; col++) {
          ctx.strokeRect(sx - 20 + offset + col*12, sy - 10 + row*7, 12, 7);
        }
      }
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      for (let row = 0; row < 4; row++) {
        const offset = (row % 2) * 6;
        for (let col = 0; col < 4; col++) {
          ctx.fillRect(sx - 20 + offset + col*12, sy - 10 + row*7, 12, 1);
        }
      }
      ctx.fillStyle = 'rgba(80,120,50,0.4)';
      ctx.beginPath(); ctx.arc(sx - 8, sy + 4, 3, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(sx + 10, sy - 4, 2, 0, Math.PI*2); ctx.fill();
      break;
    }
    case 'infirmary': {
      const wallGrd = ctx.createLinearGradient(sx, sy - 10, sx, sy + 16);
      wallGrd.addColorStop(0, '#ffffff'); wallGrd.addColorStop(1, '#c0c0c8');
      ctx.fillStyle = wallGrd; ctx.fillRect(sx - 20, sy - 10, 40, 26);
      ctx.fillStyle = '#a0a0a8';
      ctx.beginPath();
      ctx.moveTo(sx - 22, sy - 8); ctx.lineTo(sx, sy - 18); ctx.lineTo(sx + 22, sy - 8);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#8a1008';
      ctx.fillRect(sx - 5, sy - 4, 10, 18); ctx.fillRect(sx - 11, sy + 2, 22, 6);
      ctx.fillStyle = '#e02020';
      ctx.fillRect(sx - 4, sy - 4, 8, 18); ctx.fillRect(sx - 11, sy + 3, 22, 4);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fillRect(sx - 4, sy - 4, 2, 18); ctx.fillRect(sx - 11, sy + 3, 22, 1);
      ctx.fillStyle = '#3a3a48'; ctx.fillRect(sx - 17, sy + 6, 8, 10);
      ctx.fillStyle = '#c0c0c8'; ctx.fillRect(sx - 16, sy + 8, 6, 3);
      ctx.fillStyle = '#6a9ac0'; ctx.fillRect(sx + 10, sy + 2, 7, 7);
      ctx.strokeStyle = '#3a3a48'; ctx.lineWidth = 1;
      ctx.strokeRect(sx + 10, sy + 2, 7, 7);
      ctx.beginPath(); ctx.moveTo(sx + 13.5, sy + 2); ctx.lineTo(sx + 13.5, sy + 9); ctx.stroke();
      ctx.strokeRect(sx - 20, sy - 10, 40, 26);
      break;
    }
    case 'watchtower': {
      ctx.fillStyle = '#5a5a5a'; ctx.fillRect(sx - 10, sy + 10, 20, 8);
      const towerGrd = ctx.createLinearGradient(sx - 10, sy, sx + 10, sy);
      towerGrd.addColorStop(0, '#5a3818');
      towerGrd.addColorStop(0.5, '#9a6838');
      towerGrd.addColorStop(1, '#3a2010');
      ctx.fillStyle = towerGrd; ctx.fillRect(sx - 10, sy - 22, 20, 32);
      ctx.strokeStyle = '#2a1408'; ctx.lineWidth = 0.5;
      for (let i = 1; i < 4; i++) {
        ctx.beginPath(); ctx.moveTo(sx - 10 + i*5, sy - 22); ctx.lineTo(sx - 10 + i*5, sy + 10); ctx.stroke();
      }
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(sx - 6, sy - 10, 3, 5); ctx.fillRect(sx + 3, sy - 10, 3, 5);
      ctx.fillStyle = '#4a2810'; ctx.fillRect(sx - 14, sy - 26, 28, 5);
      ctx.fillStyle = '#6a3818'; ctx.fillRect(sx - 14, sy - 26, 28, 1);
      ctx.fillStyle = '#3a2010';
      for (let i = 0; i < 5; i++) ctx.fillRect(sx - 14 + i*6, sy - 30, 3, 5);
      ctx.strokeStyle = '#2a1408'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(sx + 1, sy - 30); ctx.lineTo(sx + 1, sy - 44); ctx.stroke();
      const wave = Math.sin(t*4)*2;
      const flagGrd = ctx.createLinearGradient(sx + 1, sy - 44, sx + 14, sy - 44);
      flagGrd.addColorStop(0, '#c42020'); flagGrd.addColorStop(1, '#8a1010');
      ctx.fillStyle = flagGrd;
      ctx.beginPath();
      ctx.moveTo(sx + 1, sy - 44);
      ctx.quadraticCurveTo(sx + 7, sy - 46 + wave, sx + 14, sy - 42 + wave);
      ctx.lineTo(sx + 12 + wave*0.3, sy - 38);
      ctx.quadraticCurveTo(sx + 6, sy - 40, sx + 1, sy - 36);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#2a3848'; ctx.fillRect(sx - 2, sy - 34, 4, 6);
      ctx.fillStyle = '#e8b894';
      ctx.beginPath(); ctx.arc(sx, sy - 35, 1.5, 0, Math.PI*2); ctx.fill();
      break;
    }
    case 'well': {
      const baseGrd = ctx.createRadialGradient(sx - 3, sy, 0, sx, sy + 4, 14);
      baseGrd.addColorStop(0, '#a0a0a0'); baseGrd.addColorStop(1, '#4a4a4a');
      ctx.fillStyle = baseGrd;
      ctx.beginPath(); ctx.ellipse(sx, sy + 6, 14, 10, 0, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 0.8;
      for (let i = 0; i < 8; i++) {
        const a = (i/8) * Math.PI*2;
        ctx.beginPath();
        ctx.moveTo(sx + Math.cos(a)*14, sy + 6 + Math.sin(a)*10);
        ctx.lineTo(sx + Math.cos(a)*11, sy + 6 + Math.sin(a)*7);
        ctx.stroke();
      }
      ctx.fillStyle = '#0a0a15';
      ctx.beginPath(); ctx.ellipse(sx, sy + 4, 10, 7, 0, 0, Math.PI*2); ctx.fill();
      const ripple = Math.sin(t*3)*1;
      ctx.fillStyle = '#2a5a8a';
      ctx.beginPath(); ctx.ellipse(sx, sy + 4 + ripple*0.3, 8, 5, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = 'rgba(180,220,255,0.4)';
      ctx.beginPath(); ctx.ellipse(sx - 2, sy + 3, 4, 1.5, 0, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.ellipse(sx, sy + 4, 5 + ripple, 3 + ripple*0.5, 0, 0, Math.PI*2); ctx.stroke();
      ctx.fillStyle = '#4a2810';
      ctx.fillRect(sx - 13, sy - 14, 2, 20); ctx.fillRect(sx + 11, sy - 14, 2, 20);
      ctx.fillStyle = '#7a3020';
      ctx.beginPath();
      ctx.moveTo(sx - 16, sy - 14); ctx.lineTo(sx, sy - 22); ctx.lineTo(sx + 16, sy - 14);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.4)';
      for (let i = 1; i < 4; i++) {
        const y = sy - 22 + i*2;
        ctx.beginPath(); ctx.moveTo(sx - 16 + i*1.5, y); ctx.lineTo(sx + 16 - i*1.5, y); ctx.stroke();
      }
      ctx.fillStyle = '#3a2010';
      ctx.fillRect(sx - 12, sy - 6, 24, 1.5);
      const bucketY = sy - 6 + Math.sin(t*2)*1.5;
      ctx.strokeStyle = '#4a4a4a'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(sx, sy - 6); ctx.lineTo(sx, bucketY); ctx.stroke();
      const bucketGrd = ctx.createLinearGradient(sx - 3, bucketY, sx + 3, bucketY);
      bucketGrd.addColorStop(0, '#3a2010'); bucketGrd.addColorStop(0.5, '#6a3818'); bucketGrd.addColorStop(1, '#3a2010');
      ctx.fillStyle = bucketGrd;
      ctx.fillRect(sx - 3, bucketY, 6, 5);
      ctx.strokeStyle = '#2a1408';
      ctx.strokeRect(sx - 3, bucketY, 6, 5);
      break;
    }
    case 'stable': {
      // Base fondation pierre
      ctx.fillStyle = '#5a5a5a'; ctx.fillRect(sx - 20, sy + 14, 40, 3);
      // Mur bois avec dégradé
      const wallGrd = ctx.createLinearGradient(sx, sy - 4, sx, sy + 14);
      wallGrd.addColorStop(0, '#9a6838'); wallGrd.addColorStop(1, '#5a3818');
      ctx.fillStyle = wallGrd; ctx.fillRect(sx - 20, sy - 4, 40, 20);
      // Planches verticales
      ctx.strokeStyle = '#3a2010'; ctx.lineWidth = 0.8;
      for (let i = 1; i < 8; i++) {
        ctx.beginPath(); ctx.moveTo(sx - 20 + i*5, sy - 4); ctx.lineTo(sx - 20 + i*5, sy + 14); ctx.stroke();
      }
      // Toit de chaume avec volume
      const roofGrd = ctx.createLinearGradient(sx, sy - 14, sx, sy - 4);
      roofGrd.addColorStop(0, '#c49254'); roofGrd.addColorStop(1, '#7a5020');
      ctx.fillStyle = roofGrd;
      ctx.beginPath();
      ctx.moveTo(sx - 24, sy - 4); ctx.lineTo(sx, sy - 14); ctx.lineTo(sx + 24, sy - 4);
      ctx.closePath(); ctx.fill();
      // Brins de chaume
      ctx.strokeStyle = '#5a3818'; ctx.lineWidth = 0.4;
      for (let i = 0; i < 12; i++) {
        const x1 = sx - 22 + i*4;
        const y1 = sy - 4;
        const x2 = x1 + (Math.sin(i) * 1);
        const y2 = y1 - 3 - (i % 3);
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      }
      // 2 portes en arche
      for (const doorX of [sx - 10, sx + 4]) {
        ctx.fillStyle = '#1a0a04';
        ctx.beginPath();
        ctx.moveTo(doorX, sy + 14);
        ctx.lineTo(doorX, sy + 2);
        ctx.quadraticCurveTo(doorX + 3, sy - 2, doorX + 6, sy + 2);
        ctx.lineTo(doorX + 6, sy + 14);
        ctx.closePath(); ctx.fill();
        // Ferrures
        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(doorX + 1, sy + 5, 4, 0.8);
        ctx.fillRect(doorX + 1, sy + 10, 4, 0.8);
      }
      // Botte de foin devant
      ctx.fillStyle = '#e8c848';
      ctx.beginPath(); ctx.ellipse(sx - 18, sy + 16, 4, 2, 0, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#a48020'; ctx.lineWidth = 0.3;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath(); ctx.moveTo(sx - 21 + i*1.5, sy + 15); ctx.lineTo(sx - 20 + i*1.5, sy + 17); ctx.stroke();
      }
      break;
    }
    case 'irrigation': {
      // Sol terre humide
      const soilGrd = ctx.createLinearGradient(sx, sy - 10, sx, sy + 16);
      soilGrd.addColorStop(0, '#6a4a20'); soilGrd.addColorStop(1, '#3a2810');
      ctx.fillStyle = soilGrd; ctx.fillRect(sx - 20, sy - 10, 40, 28);
      // Canaux d'irrigation en croix
      // Canal horizontal
      const waterGrd = ctx.createLinearGradient(sx, sy + 2, sx, sy + 8);
      waterGrd.addColorStop(0, '#5a9ac8'); waterGrd.addColorStop(0.5, '#2a6a9a'); waterGrd.addColorStop(1, '#1a4a7a');
      ctx.fillStyle = waterGrd;
      ctx.fillRect(sx - 20, sy + 2, 40, 6);
      // Canal vertical
      ctx.fillRect(sx - 3, sy - 10, 6, 28);
      // Reflets eau animés
      ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 0.6;
      const flow = (t * 20) % 8;
      for (let i = 0; i < 5; i++) {
        const x = sx - 20 + (i*8 + flow) % 40;
        ctx.beginPath(); ctx.moveTo(x, sy + 4); ctx.lineTo(x + 3, sy + 4); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, sy + 6); ctx.lineTo(x + 2, sy + 6); ctx.stroke();
      }
      // Vanne en bois au centre
      ctx.fillStyle = '#5a3818';
      ctx.fillRect(sx - 4, sy - 2, 8, 2);
      ctx.fillStyle = '#3a2010';
      ctx.fillRect(sx - 1, sy - 5, 2, 3);
      ctx.fillStyle = '#c49030';
      ctx.fillRect(sx - 1.5, sy - 6, 3, 1);
      // Parcelles cultivées aux coins
      ctx.fillStyle = '#5aa030';
      for (const [cx, cy] of [[sx - 14, sy - 5], [sx + 10, sy - 5], [sx - 14, sy + 11], [sx + 10, sy + 11]]) {
        for (let i = 0; i < 3; i++) {
          ctx.fillRect(cx + i*1.5, cy, 1, 3);
        }
        ctx.fillStyle = '#7ac040';
        ctx.fillRect(cx, cy - 1, 4, 1);
        ctx.fillStyle = '#5aa030';
      }
      ctx.strokeStyle = '#1a0a04'; ctx.lineWidth = 1;
      ctx.strokeRect(sx - 20, sy - 10, 40, 28);
      break;
    }
    case 'granary': {
      // Base pierre
      ctx.fillStyle = '#5a5a5a'; ctx.fillRect(sx - 16, sy + 14, 32, 3);
      // Silo cylindrique avec dégradé
      const siloGrd = ctx.createLinearGradient(sx - 14, sy, sx + 14, sy);
      siloGrd.addColorStop(0, '#7a5a30');
      siloGrd.addColorStop(0.5, '#e8c060');
      siloGrd.addColorStop(1, '#7a5a30');
      ctx.fillStyle = siloGrd;
      ctx.fillRect(sx - 14, sy - 8, 28, 22);
      // Lignes horizontales d'assemblage
      ctx.strokeStyle = '#5a3818'; ctx.lineWidth = 0.8;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath(); ctx.moveTo(sx - 14, sy - 5 + i*5); ctx.lineTo(sx + 14, sy - 5 + i*5); ctx.stroke();
      }
      // Texture planches verticales
      ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 0.5;
      for (let i = 1; i < 6; i++) {
        ctx.beginPath(); ctx.moveTo(sx - 14 + i*5, sy - 8); ctx.lineTo(sx - 14 + i*5, sy + 14); ctx.stroke();
      }
      // Toit conique en chaume
      const roofGrd = ctx.createLinearGradient(sx, sy - 22, sx, sy - 8);
      roofGrd.addColorStop(0, '#d4a060'); roofGrd.addColorStop(1, '#7a5020');
      ctx.fillStyle = roofGrd;
      ctx.beginPath();
      ctx.moveTo(sx - 17, sy - 8); ctx.lineTo(sx, sy - 22); ctx.lineTo(sx + 17, sy - 8);
      ctx.closePath(); ctx.fill();
      // Stries sur le toit
      ctx.strokeStyle = '#5a3818'; ctx.lineWidth = 0.4;
      for (let i = 0; i < 8; i++) {
        const f = i / 8;
        ctx.beginPath();
        ctx.moveTo(sx - 17 * (1 - f), sy - 8 - 14 * f);
        ctx.lineTo(sx + 17 * (1 - f), sy - 8 - 14 * f);
        ctx.stroke();
      }
      // Épi au sommet
      ctx.fillStyle = '#c49030';
      ctx.fillRect(sx - 1, sy - 26, 2, 5);
      ctx.fillStyle = '#e8c060';
      ctx.beginPath(); ctx.arc(sx, sy - 26, 2, 0, Math.PI*2); ctx.fill();
      // Petite porte étroite
      ctx.fillStyle = '#2a1408';
      ctx.fillRect(sx - 3, sy + 5, 6, 9);
      ctx.fillStyle = '#c49030';
      ctx.beginPath(); ctx.arc(sx + 2, sy + 10, 0.6, 0, Math.PI*2); ctx.fill();
      // Fenêtre circulaire en haut
      ctx.fillStyle = '#1a0a04';
      ctx.beginPath(); ctx.arc(sx, sy - 3, 2.5, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#c49030';
      ctx.beginPath(); ctx.arc(sx, sy - 3, 2.5, 0, Math.PI*2); ctx.stroke();
      // Grain qui déborde
      ctx.fillStyle = '#e8c060';
      for (let i = 0; i < 6; i++) {
        const gx = sx - 8 + i*3;
        ctx.fillRect(gx, sy + 14, 2, 1);
      }
      break;
    }
    case 'forge': {
      // Base pierre sombre
      const baseGrd = ctx.createLinearGradient(sx, sy - 8, sx, sy + 16);
      baseGrd.addColorStop(0, '#5a5a5a'); baseGrd.addColorStop(1, '#2a2a2a');
      ctx.fillStyle = baseGrd;
      ctx.fillRect(sx - 20, sy - 8, 40, 24);
      // Blocs de pierre
      ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 0.8;
      for (let row = 0; row < 3; row++) {
        const offset = (row % 2) * 5;
        for (let col = 0; col < 5; col++) {
          ctx.strokeRect(sx - 20 + offset + col*9, sy - 8 + row*8, 9, 8);
        }
      }
      // Toit planches
      ctx.fillStyle = '#3a2010';
      ctx.beginPath();
      ctx.moveTo(sx - 22, sy - 6); ctx.lineTo(sx, sy - 14); ctx.lineTo(sx + 22, sy - 6);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#1a0a04';
      for (let i = 0; i < 3; i++) {
        const y = sy - 14 + i*3;
        ctx.beginPath(); ctx.moveTo(sx - 22 + i*2, y); ctx.lineTo(sx + 22 - i*2, y); ctx.stroke();
      }
      // Four central avec ouverture
      ctx.fillStyle = '#1a0a04';
      ctx.beginPath();
      ctx.moveTo(sx - 9, sy + 14);
      ctx.lineTo(sx - 9, sy + 2);
      ctx.quadraticCurveTo(sx, sy - 4, sx + 9, sy + 2);
      ctx.lineTo(sx + 9, sy + 14);
      ctx.closePath(); ctx.fill();
      // Feu rougeoyant pulsant
      const glow = 0.7 + Math.sin(t*7)*0.3;
      const fireGrd = ctx.createRadialGradient(sx, sy + 8, 0, sx, sy + 8, 10);
      fireGrd.addColorStop(0, `rgba(255,${Math.floor(240*glow)},100,${glow})`);
      fireGrd.addColorStop(0.5, `rgba(255,${Math.floor(120*glow)},20,${glow*0.8})`);
      fireGrd.addColorStop(1, `rgba(180,40,0,${glow*0.3})`);
      ctx.fillStyle = fireGrd;
      ctx.fillRect(sx - 10, sy, 20, 16);
      // Flammes qui dansent
      const fh = 4 + Math.sin(t*9)*2;
      ctx.fillStyle = `rgba(255,200,60,${glow})`;
      ctx.beginPath();
      ctx.moveTo(sx - 6, sy + 10);
      ctx.quadraticCurveTo(sx - 4, sy + 4 - fh, sx, sy + 2 - fh);
      ctx.quadraticCurveTo(sx + 4, sy + 4 - fh, sx + 6, sy + 10);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = `rgba(255,255,180,${glow*0.8})`;
      ctx.beginPath();
      ctx.moveTo(sx - 3, sy + 9);
      ctx.quadraticCurveTo(sx - 2, sy + 6 - fh*0.7, sx, sy + 5 - fh*0.7);
      ctx.quadraticCurveTo(sx + 2, sy + 6 - fh*0.7, sx + 3, sy + 9);
      ctx.closePath(); ctx.fill();
      // Cheminée latérale avec fumée
      ctx.fillStyle = '#3a3a3a';
      ctx.fillRect(sx + 10, sy - 18, 5, 14);
      ctx.strokeStyle = '#1a1a1a';
      for (let i = 0; i < 3; i++) ctx.strokeRect(sx + 10, sy - 18 + i*4, 5, 4);
      // Fumée noire épaisse
      for (let i = 0; i < 4; i++) {
        const ph = (t*1.5 + i*0.5) % 2;
        ctx.fillStyle = `rgba(60,60,60,${0.7 - ph*0.4})`;
        ctx.beginPath(); ctx.arc(sx + 12 + ph*2, sy - 22 - ph*10, 3 + ph*1.5, 0, Math.PI*2); ctx.fill();
      }
      // Enclume visible à gauche
      ctx.fillStyle = '#2a2a2a';
      ctx.fillRect(sx - 17, sy + 8, 5, 2);
      ctx.fillRect(sx - 16, sy + 10, 3, 4);
      // Marteau posé
      ctx.fillStyle = '#5a3818';
      ctx.fillRect(sx - 18, sy + 4, 3, 1);
      ctx.fillStyle = '#8a8a8a';
      ctx.fillRect(sx - 19, sy + 3, 2, 3);
      // Étincelles qui jaillissent
      for (let i = 0; i < 5; i++) {
        const sparkPhase = (t*5 + i*1.3) % 1.5;
        if (sparkPhase < 1) {
          const sx1 = sx + Math.sin(i*2)*8;
          const sy1 = sy + 5 - sparkPhase * 14;
          ctx.fillStyle = `rgba(255,${220 - sparkPhase*120},80,${1 - sparkPhase})`;
          ctx.fillRect(sx1, sy1, 1.5, 1.5);
        }
      }
      break;
    }
  }
}

export function drawTree(ctx, sx, sy, variant, season) {
  // COUCHE 1: Ombre oblique
  const shadowGrd = ctx.createRadialGradient(sx + 4, sy + 20, 0, sx + 4, sy + 20, 18);
  shadowGrd.addColorStop(0, 'rgba(0,0,0,0.5)');
  shadowGrd.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = shadowGrd;
  ctx.beginPath(); ctx.ellipse(sx + 5, sy + 20, 14, 5, 0, 0, Math.PI*2); ctx.fill();

  // COUCHE 2: Tronc avec texture
  const trunkGrd = ctx.createLinearGradient(sx - 4, sy, sx + 4, sy);
  trunkGrd.addColorStop(0, '#3a2010');
  trunkGrd.addColorStop(0.5, '#6a4020');
  trunkGrd.addColorStop(1, '#4a2810');
  ctx.fillStyle = trunkGrd;
  ctx.fillRect(sx - 4, sy - 8, 8, 28);
  // Écorce texture
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  for (let i = 0; i < 5; i++) {
    ctx.fillRect(sx - 3 + (i%2)*3, sy - 6 + i*5, 1, 3);
  }

  if (season === 'Hiver' && variant !== 'pin') return;

  // COUCHE 3: Feuillage
  if (variant === 'pin') {
    // Pin en couches de triangles superposés
    const leafBase = season === 'Hiver' ? '#3a5a3a' : '#2a5a2a';
    const leafLight = season === 'Hiver' ? '#4a6a4a' : '#3a7a3a';
    for (let i = 0; i < 3; i++) {
      const yOff = -i * 10;
      ctx.fillStyle = leafBase;
      ctx.beginPath();
      ctx.moveTo(sx, sy - 32 + yOff);
      ctx.lineTo(sx - 14 + i*2, sy - 4 + yOff);
      ctx.lineTo(sx + 14 - i*2, sy - 4 + yOff);
      ctx.closePath(); ctx.fill();
      // Highlight côté droit
      ctx.fillStyle = leafLight;
      ctx.beginPath();
      ctx.moveTo(sx, sy - 32 + yOff);
      ctx.lineTo(sx + 14 - i*2, sy - 4 + yOff);
      ctx.lineTo(sx + 6 - i*2, sy - 4 + yOff);
      ctx.closePath(); ctx.fill();
    }
    // Neige sur les branches en hiver
    if (season === 'Hiver') {
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      for (let i = 0; i < 3; i++) {
        const yOff = -i * 10;
        ctx.beginPath();
        ctx.moveTo(sx - 12 + i*2, sy - 4 + yOff);
        ctx.lineTo(sx + 12 - i*2, sy - 4 + yOff);
        ctx.lineTo(sx + 10 - i*2, sy - 6 + yOff);
        ctx.lineTo(sx - 10 + i*2, sy - 6 + yOff);
        ctx.closePath(); ctx.fill();
      }
    }
  } else {
    // Feuillu en clusters de boules
    const palette = {
      Printemps: { base: '#3a7a2a', light: '#5aa840', dark: '#2a5a1a' },
      Été:       { base: '#2a6a1a', light: '#4a9a30', dark: '#1a4a0a' },
      Automne:   { base: '#c46020', light: '#e49040', dark: '#8a3810' },
      Hiver:     { base: '#8a8a90', light: '#a0a0a8', dark: '#5a5a60' },
    };
    const col = palette[season] || palette.Été;

    // 4 boules de feuillage superposées
    const balls = [
      { x: -6, y: -14, r: 10 },
      { x: 6,  y: -14, r: 10 },
      { x: 0,  y: -22, r: 11 },
      { x: -2, y: -10, r: 8 },
    ];
    // Base sombre
    ctx.fillStyle = col.dark;
    for (const b of balls) {
      ctx.beginPath(); ctx.arc(sx + b.x, sy + b.y, b.r, 0, Math.PI*2); ctx.fill();
    }
    // Couleur principale décalée (laisse voir le sombre en bas)
    ctx.fillStyle = col.base;
    for (const b of balls) {
      ctx.beginPath(); ctx.arc(sx + b.x, sy + b.y - 1, b.r - 1, 0, Math.PI*2); ctx.fill();
    }
    // Highlights côté soleil (NE)
    ctx.fillStyle = col.light;
    for (const b of balls) {
      ctx.beginPath(); ctx.arc(sx + b.x + 2, sy + b.y - 3, b.r * 0.5, 0, Math.PI*2); ctx.fill();
    }
    // Reflets brillants
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    for (const b of balls) {
      ctx.beginPath(); ctx.arc(sx + b.x + 3, sy + b.y - 4, 2, 0, Math.PI*2); ctx.fill();
    }
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
