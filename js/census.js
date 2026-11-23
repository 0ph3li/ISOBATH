/* ═══════════════════════════════════════════════════════════════
   ISOBATH 等深線 — census
   concept, design & code by ghostly.grl ♥

   01 how many   a school (boids) swims; guess, then every fish gets a number
   02 the belt   pinned: swim 50 m of tape, only the 5 m belt counts,
                 tally marks fill the slate (big schools in tens)
   03 who        eight indicator species, halftone dots that become the fish
   04 next       logbook
   ═══════════════════════════════════════════════════════════════ */
(() => {
  const { $, $$, RM, FINE } = IB;
  if (!window.gsap) return;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const visible = (el) => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; };
  const rng = (seed) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  let hoverText = '';
  IB.curText = () => hoverText;

  /* ═════════ 01 · how many: a school you can guess ═════════ */
  const hm = $('.hm'), hc = $('.hm-cv'), hx = hc.getContext('2d');
  let HW = 0, HH = 0, F = [], mode = 'swim', shown = 0, round = IB.get('rounds', 0);
  const hsize = () => { HW = hm.offsetWidth; HH = hm.offsetHeight; const d = Math.min(2, devicePixelRatio); hc.width = HW * d; hc.height = HH * d; hx.setTransform(d, 0, 0, d, 0, 0); };
  hsize(); addEventListener('resize', hsize);
  const school = () => {
    const r = rng(1000 + round * 77), n = Math.round((innerWidth < 860 ? 70 : 120) + r() * (innerWidth < 860 ? 80 : 160));
    F = Array.from({ length: n }, () => ({ x: HW * (.3 + r() * .4), y: HH * (.3 + r() * .4), vx: r() * 2 - 1, vy: r() * 2 - 1, n: 0 }));
    shown = 0; mode = 'swim';
  };
  school();
  let ht = 0;
  const boids = () => {
    ht += .004;
    // the school follows a slow wandering point; the cursor is a diver, they keep away
    const tx = HW * (.5 + Math.sin(ht * 1.3) * .22), ty = HH * (.48 + Math.sin(ht * 2.1 + 1) * .2);
    const sp = mode === 'swim' ? 1 : 0;
    for (const f of F) {
      let sx = 0, sy = 0, ax = 0, ay = 0, cx = 0, cy = 0, na = 0;
      for (const o of F) {
        if (o === f) continue;
        const dx = o.x - f.x, dy = o.y - f.y, d2 = dx * dx + dy * dy;
        if (d2 < 196) { sx -= dx / (d2 + 1); sy -= dy / (d2 + 1); }
        if (d2 < 2500) { ax += o.vx; ay += o.vy; cx += o.x; cy += o.y; na++; }
      }
      if (na) { f.vx += (ax / na - f.vx) * .08 + (cx / na - f.x) * .0012; f.vy += (ay / na - f.vy) * .08 + (cy / na - f.y) * .0012; }
      f.vx += sx * .9 + (tx - f.x) * .00025; f.vy += sy * .9 + (ty - f.y) * .00025;
      const mdx = f.x - IB.mx, mdy = f.y - (IB.my - hm.getBoundingClientRect().top), md = Math.hypot(mdx, mdy);
      if (md < 110 && FINE) { f.vx += mdx / md * .35; f.vy += mdy / md * .35; }
      const v = Math.hypot(f.vx, f.vy) || 1, max = 1.9, min = .8;
      if (v > max) { f.vx *= max / v; f.vy *= max / v; } else if (v < min) { f.vx *= min / v; f.vy *= min / v; }
      f.x += f.vx * sp; f.y += f.vy * sp;
    }
  };
  const hdraw = () => {
    hx.clearRect(0, 0, HW, HH);
    // each fish: a slim body and a tail, turned the way it swims
    hx.fillStyle = '#0b0d12';
    hx.beginPath();
    for (const f of F) {
      const v = Math.hypot(f.vx, f.vy) || 1, ux = f.vx / v, uy = f.vy / v, px = -uy, py = ux;
      const w = Math.sin(ht * 40 + f.x * .05) * .8; // the tail beats
      const P = (a, b) => [f.x + ux * a + px * b, f.y + uy * a + py * b];
      const pts = [P(7, 0), P(3, 2), P(-3, 1.6), P(-6, 0), P(-10, 3 + w), P(-9, 0), P(-10, -3 + w), P(-6, 0), P(-3, -1.6), P(3, -2)];
      hx.moveTo(pts[0][0], pts[0][1]);
      for (let k = 1; k < pts.length; k++) hx.lineTo(pts[k][0], pts[k][1]);
      hx.closePath();
    }
    hx.fill();
    if (shown > 0) {
      hx.strokeStyle = '#1534ff'; hx.lineWidth = 1; hx.font = '500 7px "JetBrains Mono", monospace'; hx.fillStyle = '#1534ff';
      for (let i = 0; i < shown && i < F.length; i++) {
        const f = F[i];
        hx.strokeRect(f.x - 9, f.y - 7, 18, 14);
        if (i % 3 === 0 || F.length < 120) hx.fillText('№' + String(i + 1).padStart(3, '0'), f.x + 10, f.y - 7);
      }
    }
  };
  gsap.ticker.add(() => { if (!visible(hm)) return; if (!RM || mode !== 'swim') boids(); hdraw(); });
  if (RM) { for (let k = 0; k < 120; k++) boids(); }

  const gIn = $('.hm-g'), go = $('.hm-go'), res = $('.hm-r'), avg = $('.hm-avg');
  const guesses = IB.get('guesses', []);
  const showAvg = () => {
    if (!guesses.length) { avg.textContent = 'most people guess about a third too few.'; return; }
    const off = guesses.reduce((a, g) => a + (g[0] - g[1]) / g[1], 0) / guesses.length;
    avg.textContent = `your ${guesses.length} guess${guesses.length > 1 ? 'es' : ''} so far: ${off < 0 ? '' : '+'}${Math.round(off * 100)}% on average`;
  };
  showAvg();
  $('.hm-m').addEventListener('click', () => { gIn.value = Math.max(0, (+gIn.value || 0) - 10); });
  $('.hm-p').addEventListener('click', () => { gIn.value = Math.min(999, (+gIn.value || 0) + 10); });
  go.addEventListener('click', () => {
    if (mode === 'counted') { round++; IB.set('rounds', round); school(); go.querySelector('span').textContent = 'count them'; res.textContent = 'a new school. look for three seconds. then guess.'; return; }
    if (mode !== 'swim') return;
    mode = 'count';
    const g = Math.max(0, Math.round(+gIn.value || 0)), n = F.length;
    // count like a person: left to right
    F.sort((a, b) => a.x - b.x);
    const o = { v: 0 };
    res.innerHTML = 'counting… <b>0</b>';
    gsap.to(o, { v: n, duration: RM ? 0 : 2.4, ease: 'power1.inOut', onUpdate: () => { shown = Math.round(o.v); res.querySelector('b').textContent = shown; }, onComplete: () => {
      mode = 'counted';
      const diff = Math.round((g - n) / n * 100);
      guesses.push([g, n]); while (guesses.length > 30) guesses.shift(); IB.set('guesses', guesses); showAvg();
      res.innerHTML = `you said <b>${g}</b>. there were <b>${n}</b>. ` + (Math.abs(diff) <= 10 ? 'that’s a good eye. come count with us.' : diff < 0 ? `${-diff}% too few. that’s why we count one by one.` : `${diff}% too many. the sea looks fuller than it is.`);
      go.querySelector('span').textContent = 'another school';
    } });
  });

  // intro
  const tw = $('.hm-title .w');
  tw.innerHTML = tw.textContent.split('').map(c => `<span class="ch">${c}</span>`).join('');
  gsap.set('.hm-title .ch', { yPercent: 105, autoAlpha: 0 });
  gsap.set('.hm-note, .hm-box, .hm-jp, .hm-avg', { autoAlpha: 0, y: 14 });
  IB.ready.then(() => {
    gsap.timeline()
      .to('.hm-title .ch', { yPercent: 0, autoAlpha: 1, duration: 1.1, ease: 'expo.out', stagger: .06 }, 0)
      .to('.hm-note, .hm-jp, .hm-avg', { autoAlpha: 1, y: 0, duration: .9, ease: 'power3.out', stagger: .08 }, .4)
      .to('.hm-box', { autoAlpha: 1, y: 0, duration: 1, ease: 'expo.out' }, .7)
      .add(() => IB.scramble($('.hm-note .kick')), .5);
  });
  gsap.to('.hm-title', { yPercent: 40, ease: 'none', scrollTrigger: { trigger: hm, start: 'top top', end: 'bottom top', scrub: .6 } });

  /* ═════════ 02 · the belt ═════════ */
  const belt = $('.belt'), bc = $('.bt-cv'), bx = bc.getContext('2d');
  const SPECIES = [
    // name, length (px at 1 m = 40px scale), unit for tally marks
    ['blue-green chromis', 4, 10],
    ['butterflyfish', 8, 1],
    ['parrotfish', 14, 1],
    ['yellow snapper', 10, 1],
  ];
  const BF = [];
  {
    const r = rng(42);
    // chromis live in clouds over coral heads
    for (let k = 0; k < 16; k++) { const hx_ = 1 + r() * 48, hy = (r() - .5) * 11, m = 14 + (r() * 26 | 0); for (let i = 0; i < m; i++) BF.push({ s: 0, x: hx_ + (r() - .5) * 1.2, y: hy + (r() - .5) * .9 }); }
    // butterflyfish in pairs
    for (let k = 0; k < 18; k++) { const x = r() * 52 - 1, y = (r() - .5) * 12; BF.push({ s: 1, x, y }, { s: 1, x: x + .3, y: y + .2 }); }
    // parrotfish alone
    for (let k = 0; k < 22; k++) BF.push({ s: 2, x: r() * 52 - 1, y: (r() - .5) * 12 });
    // two schools of snapper
    for (const [cx, cy] of [[14, 1.2], [37, -3.4]]) for (let i = 0; i < 34; i++) BF.push({ s: 3, x: cx + (r() - .5) * 3.4, y: cy + (r() - .5) * 2.2 });
    BF.forEach(f => { f.ph = r() * 6.28; f.a = .15 + r() * .35; f.inside = Math.abs(f.y) <= 2.5; });
  }
  let BW = 0, BH = 0, prog = 0, bt = 0;
  const bsize = () => { BW = belt.offsetWidth; BH = belt.offsetHeight; const d = Math.min(2, devicePixelRatio); bc.width = BW * d; bc.height = BH * d; bx.setTransform(d, 0, 0, d, 0, 0); };
  bsize(); addEventListener('resize', bsize);
  const bdraw = () => {
    bt += RM ? 0 : .01;
    const ppm = Math.max(26, Math.min(BH / 15, BW / 18)), dX = prog * 50, cy = BH * .56, ox = BW * .42;
    const sx = (x) => ox + (x - dX) * ppm, sy = (y) => cy + y * ppm;
    bx.clearRect(0, 0, BW, BH);
    // the belt: 2.5 m each side
    bx.fillStyle = 'rgba(255,255,255,.07)';
    bx.fillRect(sx(0), sy(-2.5), 50 * ppm, 5 * ppm);
    // what you already swam over
    bx.fillStyle = 'rgba(255,255,255,.08)';
    bx.fillRect(sx(0), sy(-2.5), Math.max(0, dX * ppm), 5 * ppm);
    bx.strokeStyle = 'rgba(255,255,255,.7)'; bx.lineWidth = 1; bx.setLineDash([5, 5]);
    bx.beginPath(); bx.moveTo(sx(0), sy(-2.5)); bx.lineTo(sx(50), sy(-2.5)); bx.moveTo(sx(0), sy(2.5)); bx.lineTo(sx(50), sy(2.5)); bx.stroke();
    bx.setLineDash([]);
    // the tape
    bx.strokeStyle = '#fff'; bx.lineWidth = 1.2; bx.beginPath(); bx.moveTo(sx(0), cy); bx.lineTo(sx(50), cy);
    for (let m = 0; m <= 50; m++) { const t = m % 5 ? 4 : 9; bx.moveTo(sx(m), cy - t); bx.lineTo(sx(m), cy + t); }
    bx.stroke();
    bx.fillStyle = '#fff'; bx.font = '500 9px "JetBrains Mono", monospace'; bx.textBaseline = 'top';
    for (let m = 0; m <= 50; m += 5) bx.fillText(m + ' m', sx(m) + 3, cy + 11);
    bx.fillText('2.5 m', sx(-1.6), sy(-2.5) - 5); bx.fillText('2.5 m', sx(-1.6), sy(2.5) - 5);
    // the fish
    bx.lineCap = 'round';
    for (const f of BF) {
      const x = f.x + Math.sin(bt + f.ph) * f.a, y = f.y + Math.cos(bt * .7 + f.ph) * f.a * .5;
      const px = sx(x), py = sy(y);
      if (px < -30 || px > BW + 30) continue;
      const dir = Math.cos(bt + f.ph) >= 0 ? 1 : -1, L = SPECIES[f.s][1] * ppm / 40 + 2;
      const counted = f.inside && f.x <= dX;
      bx.strokeStyle = f.inside ? '#fff' : 'rgba(255,255,255,.3)'; bx.lineWidth = f.s === 0 ? 1.4 : 1.8;
      bx.beginPath(); bx.moveTo(px - L * dir, py); bx.lineTo(px + L * dir, py);
      bx.moveTo(px - L * dir, py); bx.lineTo(px - (L + 3) * dir, py - 2.4); bx.moveTo(px - L * dir, py); bx.lineTo(px - (L + 3) * dir, py + 2.4);
      bx.stroke();
      if (counted && f.s !== 0) { bx.strokeStyle = 'rgba(255,255,255,.85)'; bx.lineWidth = .8; bx.strokeRect(px - L - 5, py - 6, L * 2 + 10, 12); }
    }
    // you: what you can see
    const g = bx.createLinearGradient(ox - 40, 0, ox + 120, 0);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.3, 'rgba(255,255,255,.1)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    bx.fillStyle = g; bx.fillRect(ox - 40, sy(-2.5), 160, 5 * ppm);
    bx.strokeStyle = '#fff'; bx.lineWidth = 2; bx.beginPath(); bx.moveTo(ox, sy(-2.9)); bx.lineTo(ox, sy(2.9)); bx.stroke();
  };
  gsap.ticker.add(() => { if (visible(belt)) bdraw(); });

  // the slate: tally marks, groups of five
  const rowsEl = $('.sl-rows'), totEl = $('.sl-tot b');
  rowsEl.innerHTML = SPECIES.map(s => `<li><span>${s[0]}${s[2] > 1 ? ` <i style="opacity:.55;font-style:normal">(one mark = ${s[2]})</i>` : ''}</span><b>0</b><svg viewBox="0 0 240 18" preserveAspectRatio="xMinYMid meet"><path/></svg></li>`).join('');
  const rowEls = $$('li', rowsEl);
  const tally = (n) => {
    let d = '';
    for (let i = 0; i < n; i++) {
      const g = (i / 5) | 0, k = i % 5, x0 = g * 22 + 2;
      if (k < 4) d += `M${x0 + k * 4} 2 L${x0 + k * 4 + .6} 16 `;
      else d += `M${x0 - 2} 13 L${x0 + 15} 4 `;
    }
    return d;
  };
  let lastC = '';
  const slate = () => {
    const dX = prog * 50, c = [0, 0, 0, 0];
    for (const f of BF) if (f.inside && f.x <= dX) c[f.s]++;
    const key = c.join();
    if (key === lastC) return; lastC = key;
    rowEls.forEach((li, i) => { $('b', li).textContent = c[i]; $('path', li).setAttribute('d', tally(Math.round(c[i] / SPECIES[i][2]))); });
    totEl.textContent = c.reduce((a, b) => a + b, 0);
  };
  slate();
  const tape = $('.bt-tape'), you = $('.bt-you');
  for (let m = 0; m <= 50; m += 10) tape.insertAdjacentHTML('beforeend', `<span style="left:${m * 2}%">${m} m</span>`);
  ScrollTrigger.create({
    trigger: belt, start: 'top top', end: '+=300%', pin: true, scrub: .6,
    onToggle: (s) => document.body.classList.toggle('on-blue', s.isActive),
    onUpdate: (s) => { prog = s.progress; you.style.left = prog * 100 + '%'; you.textContent = 'you · ' + (prog * 50).toFixed(1) + ' m'; slate(); },
  });
  belt.addEventListener('pointermove', () => {
    const r = belt.getBoundingClientRect(), ppm = Math.max(26, Math.min(BH / 15, BW / 18)), y = (IB.my - r.top - BH * .56) / ppm;
    hoverText = Math.abs(y) <= 2.5 ? 'inside the belt · it counts' : 'outside · somebody else’s';
  });
  belt.addEventListener('pointerleave', () => { hoverText = ''; });
  gsap.from('.slate', { scrollTrigger: { trigger: belt, start: 'top 60%' }, y: 60, rotate: 6, autoAlpha: 0, duration: 1.2, ease: 'expo.out' });

  /* ═════════ 03 · who we count ═════════ */
  const WHO = [
    ['butterflyfish', 'chaetodon lunulatus', 'ミスジチョウチョウウオ', 'eats only coral polyps. where the coral dies, it leaves first.', 38, 96, 'butterfly'],
    ['parrotfish', 'scarus spp.', 'ブダイ', 'scrapes the algae off dead coral, so new coral can settle. most of the white sand is its poop.', 61, 70, 'parrot'],
    ['humphead wrasse', 'cheilinus undulatus', 'メガネモチノウオ', 'the big one, two metres. one per reef, if the reef is lucky.', 0, 3, 'napoleon'],
    ['coral grouper', 'plectropomus leopardus', 'アカジンミーバイ', 'the one everybody wants on the plate. it tells us how hard the reef is fished.', 9, 22, 'grouper'],
    ['blue-green chromis', 'chromis viridis', 'デバスズメダイ', 'a whole family inside one coral head. no branches, no home.', 412, 980, 'chromis'],
    ['giant clam', 'tridacna maxima', 'シャコガイ', 'doesn’t move, doesn’t hide. we count it anyway, it lives a hundred years.', 14, 31, 'clam'],
    ['crown-of-thorns', 'acanthaster planci', 'オニヒトデ', 'eats coral, one table a night. this is the number we want to go down.', 3, 27, 'cots', 1],
    ['green turtle', 'chelonia mydas', 'アオウミガメ', 'eats the sea grass on the way back to the beach where it was born.', 7, 2, 'turtle'],
  ];
  const grid = $('.wh-grid');
  grid.innerHTML = WHO.map((w, i) => {
    const ch = w[5] ? Math.round((w[4] - w[5]) / w[5] * 100) : 0, cls = w[7] ? 'good' : ch > 0 ? 'up' : '';
    return `<article class="card" data-cur="${w[0]}">
      <div class="cd-ph"><div class="slot" data-tone="sea" data-img="CENSUS/${w[6]}.jpg" data-note="${w[0]}"></div><canvas class="cd-ht" aria-hidden="true"></canvas><span class="cd-n">№${String(i + 1).padStart(2, '0')}</span></div>
      <div class="cd-b">
        <h3 class="cd-name">${w[0]}</h3><p class="cd-lat">${w[1]}</p><p class="cd-jp">${w[2]}</p>
        <p class="cd-role">${w[3]}</p>
        <p class="cd-num"><span>2026 <b data-n="${w[4]}">0</b></span><em class="${cls}" title="since 2008">${ch > 0 ? '+' : ''}${ch}% since 2008${w[7] ? ' · good' : ''}</em></p>
      </div></article>`;
  }).join('');
  // halftone: the photo as blue dots, until you look closer
  const halftone = (card, img) => {
    const cv = $('.cd-ht', card), box = $('.cd-ph', card), W = box.offsetWidth, H = box.offsetHeight;
    if (!W || !H) return;
    cv.width = W; cv.height = H;
    const c = cv.getContext('2d');
    const o = document.createElement('canvas'), sp = 6, cw = Math.ceil(W / sp), chh = Math.ceil(H / sp);
    o.width = cw; o.height = chh;
    const ox = o.getContext('2d'), k = Math.max(cw / img.naturalWidth, chh / img.naturalHeight);
    ox.drawImage(img, (cw - img.naturalWidth * k) / 2, (chh - img.naturalHeight * k) / 2, img.naturalWidth * k, img.naturalHeight * k);
    let px;
    try { px = ox.getImageData(0, 0, cw, chh).data; } catch (e) { card.classList.add('no-ht'); cv.remove(); return; } // opened as a file: no pixels to read
    // stretch the light: underwater photos are dark, so map their own darkest → lightest to the full range
    const L = new Float32Array(cw * chh); let lo = 1, hi = 0;
    for (let k = 0; k < L.length; k++) { const q = k * 4; L[k] = (px[q] * .3 + px[q + 1] * .59 + px[q + 2] * .11) / 255; }
    const sorted = Array.from(L).sort((a, b) => a - b); lo = sorted[(L.length * .04) | 0]; hi = sorted[(L.length * .96) | 0];
    c.fillStyle = '#f3f4f5'; c.fillRect(0, 0, W, H);
    c.fillStyle = '#1534ff'; c.beginPath();
    for (let j = 0; j < chh; j++) for (let i = 0; i < cw; i++) {
      const l = clamp((L[j * cw + i] - lo) / Math.max(.05, hi - lo)), r = Math.pow(1 - l, 1.6) * sp * .56;
      if (r < .3) continue;
      const x = i * sp + sp / 2, y = j * sp + sp / 2; c.moveTo(x + r, y); c.arc(x, y, r, 0, 6.2832);
    }
    c.fill();
  };
  $$('.card').forEach(card => {
    const sl = $('.slot', card);
    IB.fillSlot(sl);
    sl.addEventListener('ib:img', e => halftone(card, e.detail));
    card.addEventListener('click', () => { if (!FINE) card.classList.toggle('on'); });
  });
  let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => $$('.card').forEach(c => { const im = $('.slot>img', c); if (im) halftone(c, im); }), 200); });
  $$('.cd-num b').forEach(b => {
    const n = +b.dataset.n, o = { v: 0 };
    ScrollTrigger.create({ trigger: b, start: 'top 90%', once: true, onEnter: () => gsap.to(o, { v: n, duration: 1.6, ease: 'power2.out', onUpdate: () => { b.textContent = Math.round(o.v); } }) });
  });
  gsap.from('.card', { scrollTrigger: { trigger: grid, start: 'top 80%' }, autoAlpha: 0, y: 50, duration: 1, ease: 'expo.out', stagger: .06 });
  gsap.from('.wh-t', { scrollTrigger: { trigger: '.who', start: 'top 70%' }, yPercent: 20, autoAlpha: 0, duration: 1.1, ease: 'expo.out' });

  /* ═════════ 04 · next ═════════ */
  gsap.from('.nx-t', { scrollTrigger: { trigger: '.next', start: 'top 65%' }, yPercent: 30, autoAlpha: 0, duration: 1.1, ease: 'expo.out' });
  gsap.from('.nx-strip', { scrollTrigger: { trigger: '.next', start: 'top 45%' }, scaleX: 0, transformOrigin: 'left', duration: 1, ease: 'expo.inOut' });

  IB.help = () => console.log('IB.depthAt(y)  → how deep a point of the page is (m)\nIB.flood()     → go too deep (or konami)\nIB.toast(k, t) → a small note\nlocalStorage ib-guesses → your guesses [said, there were]');
  addEventListener('load', () => ScrollTrigger.refresh());
})();
