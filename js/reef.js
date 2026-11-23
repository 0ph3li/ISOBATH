/* ═══════════════════════════════════════════════════════════════
   ISOBATH 等深線 — reef
   concept, design & code by ghostly.grl ♥

   01 the map    how an isobath is drawn: sound, join, read (pinned).
                 the lagoon is a depth field; the lines are marching
                 squares through it. click the water to add a sounding.
   02 sites      six places; hover a row, a glass drop shows the place
   03 transect   fifty metres of tape, a point every fifty centimetres,
                 2008 · 2016 · 2024
   04 spawn      press and hold: the reef lets go (snow falling up)
   05 next       census
   ═══════════════════════════════════════════════════════════════ */
(() => {
  const { $, $$, RM, FINE } = IB;
  if (!window.gsap) return;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const visible = (el) => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; };
  const hash = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
  const vnoise = (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
  const fbm = (x, y) => vnoise(x, y) * .5 + vnoise(x * 2.1, y * 2.1) * .25 + vnoise(x * 4.3, y * 4.3) * .15 + vnoise(x * 8.7, y * 8.7) * .1;
  let hoverText = '';
  IB.curText = () => hoverText;

  /* ═════════ 01 · the map ═════════
     map units: x 0 → 1.6 (iriomote → ishigaki), y 0 → 1 (north → south) */
  const ISL = [
    // x, y, radius, weight, name
    [1.30, .30, .15, 1, 'ishigaki'], [1.38, .11, .08, .9, 'ishigaki'], [1.20, .47, .06, .7, 'ishigaki'],
    [.88, .44, .035, 1, 'taketomi'], [.52, .60, .06, 1, 'kohama'], [.76, .84, .05, 1, 'kuroshima'],
    [.00, .44, .23, 1, 'iriomote'], [.62, .96, .025, .8, 'aragusuku'], [.70, .40, .018, .7, 'kayama'],
  ];
  const SITES = [['SHIRAHO', 1.36, .43], ['KABIRA', 1.18, .14], ['YONARA', .30, .55], ['SEKISEI', .74, .62], ['KUROSHIMA', .86, .78], ['NAGURA', 1.14, .30]];
  const field = (x, y) => {
    // coasts are never round: warp the space a little before measuring
    const wx = x + (fbm(x * 4 + 11, y * 4) - .5) * .09, wy = y + (fbm(x * 4, y * 4 + 5) - .5) * .09;
    let land = 0;
    for (const s of ISL) { const dx = wx - s[0], dy = wy - s[1]; land += s[3] * Math.exp(-(dx * dx + dy * dy) / (s[2] * s[2])); }
    // the lagoon: a wide shallow shelf between the islands, the open sea outside
    const pl = Math.exp(-((x - .82) ** 2 / .5 + (y - .58) ** 2 / .21));
    return 46 - 41 * Math.pow(pl, .55) - 62 * land + (fbm(x * 6 + 3, y * 6) - .5) * 13 * (.35 + pl);
  };
  const islandAt = (x, y) => { let b = ISL[0], bd = 1e9; for (const s of ISL) { const d = ((x - s[0]) ** 2 + (y - s[1]) ** 2) / (s[2] * s[2]); if (d < bd) { bd = d; b = s; } } return b[4]; };
  const zoneOf = (d) => d < 2 ? 'the moat' : d < 5 ? 'the crest' : d < 10 ? 'the reef' : d < 20 ? 'the slope' : d < 30 ? 'the wall' : 'the blue';

  // the depth grid (map units, computed once)
  const GW = 200, CELL = 1.6 / GW, GH = Math.ceil(1 / CELL) + 1;
  const D = new Float32Array((GW + 1) * GH);
  for (let j = 0; j < GH; j++) for (let i = 0; i <= GW; i++) D[j * (GW + 1) + i] = field(i * CELL, j * CELL);
  const g = (i, j) => D[j * (GW + 1) + i];

  // marching squares: every line of equal depth, as little segments
  const LEVELS = [0, 2, 5, 10, 20, 30];
  const SEG = [];
  LEVELS.forEach((L, li) => {
    const part = [];
    for (let j = 0; j < GH - 1; j++) for (let i = 0; i < GW; i++) {
      const a = g(i, j), b = g(i + 1, j), c = g(i + 1, j + 1), d = g(i, j + 1);
      const k = (a > L ? 8 : 0) | (b > L ? 4 : 0) | (c > L ? 2 : 0) | (d > L ? 1 : 0);
      if (k === 0 || k === 15) continue;
      const x0 = i * CELL, y0 = j * CELL, t = (p, q) => (L - p) / (q - p);
      const T = [x0 + t(a, b) * CELL, y0], R = [x0 + CELL, y0 + t(b, c) * CELL], B = [x0 + t(d, c) * CELL, y0 + CELL], Lf = [x0, y0 + t(a, d) * CELL];
      const P = { 1: [[Lf, B]], 2: [[B, R]], 3: [[Lf, R]], 4: [[T, R]], 5: [[Lf, T], [B, R]], 6: [[T, B]], 7: [[Lf, T]], 8: [[Lf, T]], 9: [[T, B]], 10: [[T, R], [Lf, B]], 11: [[T, R]], 12: [[Lf, R]], 13: [[B, R]], 14: [[Lf, B]] }[k];
      for (const [p, q] of P) part.push([p[0], p[1], q[0], q[1], li]);
    }
    // drawn like a hand would: sweep from the west
    part.sort((u, v) => (u[0] + u[2]) - (v[0] + v[2]));
    SEG.push(...part);
  });

  const mapSec = $('.map'), cv = $('.m-cv'), cx = cv.getContext('2d');
  let W = 0, H = 0, S = 1, OX = 0, OY = 0, SND = [], DOTS = [];
  const toMap = (px, py) => [(px - OX) / S, (py - OY) / S];
  const yours = IB.get('soundings', []);
  const msize = () => {
    W = mapSec.offsetWidth; H = mapSec.offsetHeight;
    const dpr = Math.min(2, devicePixelRatio);
    cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // cover: the whole lagoon fits the width, centred a little to the east
    S = Math.max(W / 1.5, H / .95); OX = (W - 1.6 * S) / 2 - S * .02; OY = (H - S) / 2 + S * .02;
    // soundings: a jittered grid over what you can see, water only
    SND = [];
    const step = Math.max(46, W / 26);
    for (let y = 90; y < H - 40; y += step) for (let x = 30; x < W - 30; x += step) {
      const px = x + (hash(x, y) - .5) * step * .8, py = y + (hash(y, x) - .5) * step * .8;
      const [mx, my] = toMap(px, py), d = field(mx, my);
      if (d > .4) SND.push([px, py, d, hash(px, py)]);
    }
    SND.sort((a, b) => a[3] - b[3]);
    // halftone: deeper is darker
    DOTS = [];
    const sp = 9;
    for (let y = sp / 2; y < H; y += sp) for (let x = sp / 2; x < W; x += sp) { const [mx, my] = toMap(x, y); DOTS.push([x, y, field(mx, my)]); }
    $('.m-hint b').textContent = SND.length.toLocaleString('en-US');
    mdraw();
  };

  let s1 = 0, s2 = 0, s3 = 0;
  const mdraw = () => {
    cx.clearRect(0, 0, W, H);
    // 03 · read: land and the dots
    if (s3 > 0) {
      for (const [x, y, d] of DOTS) {
        if (d < 0) { cx.fillStyle = `rgba(214,219,225,${s3})`; cx.fillRect(x - 4.5, y - 4.5, 9, 9); }
      }
      cx.fillStyle = 'rgba(21,52,255,.88)';
      cx.beginPath();
      for (const [x, y, d] of DOTS) {
        if (d < 0) continue;
        const r = s3 * 3.9 * (.1 + .9 * Math.pow(Math.min(d, 40) / 40, 1.5));
        if (r < .35) continue;
        cx.moveTo(x + r, y); cx.arc(x, y, r, 0, 6.2832);
      }
      cx.fill();
    }
    // 02 · join: the isobaths
    if (s2 > 0) {
      const n = Math.floor(s2 * SEG.length);
      const by = [[], [], [], [], [], []];
      for (let k = 0; k < n; k++) by[SEG[k][4]].push(SEG[k]);
      by.forEach((list, li) => {
        if (!list.length) return;
        cx.strokeStyle = li === 0 ? '#0b0d12' : s3 > 0 ? `rgba(${Math.round(21 * (1 - s3) + 11 * s3)},${Math.round(52 * (1 - s3) + 13 * s3)},${Math.round(255 * (1 - s3) + 18 * s3)},${1 - li * .12})` : `rgba(21,52,255,${1 - li * .14})`;
        cx.lineWidth = li === 0 ? 1.5 : 1;
        cx.beginPath();
        for (const s of list) { cx.moveTo(OX + s[0] * S, OY + s[1] * S); cx.lineTo(OX + s[2] * S, OY + s[3] * S); }
        cx.stroke();
      });
    }
    // 01 · sound: the numbers
    if (s1 > 0) {
      const n = Math.floor(s1 * SND.length);
      cx.font = '500 9.5px "JetBrains Mono", monospace';
      cx.textBaseline = 'middle';
      const a = s3 > 0 ? 1 - s3 * .55 : 1;
      for (let k = 0; k < n; k++) {
        const [x, y, d] = SND[k];
        cx.fillStyle = `rgba(11,13,18,${a})`;
        cx.fillRect(x - 1, y - 1, 2, 2);
        cx.fillText(d.toFixed(1), x + 4, y);
      }
    }
    // the site names, once the map can be read
    if (s3 > .6) {
      cx.font = '500 9px "JetBrains Mono", monospace'; cx.textBaseline = 'middle';
      const a = (s3 - .6) / .4;
      for (const [name, mx, my] of SITES) {
        const x = OX + mx * S, y = OY + my * S, w = cx.measureText(name).width + 10;
        cx.fillStyle = `rgba(11,13,18,${a})`; cx.fillRect(x, y - 8, w, 16);
        cx.fillStyle = `rgba(255,255,255,${a})`; cx.fillText(name, x + 5, y);
        cx.fillRect(x - 3, y - 1.5, 3, 3);
      }
    }
    // yours
    cx.font = '700 10px "JetBrains Mono", monospace'; cx.textBaseline = 'middle';
    for (const [mx, my, d] of yours) {
      const x = OX + mx * S, y = OY + my * S;
      cx.strokeStyle = '#ff5a3c'; cx.lineWidth = 1.2; cx.beginPath(); cx.arc(x, y, 7, 0, 6.2832); cx.stroke();
      cx.fillStyle = '#ff5a3c'; cx.fillRect(x - 1.5, y - 1.5, 3, 3);
      const t = d < 0 ? 'land · you' : d.toFixed(1) + ' · you', w = cx.measureText(t).width + 8;
      cx.fillRect(x + 10, y - 8, w, 16); cx.fillStyle = '#fff'; cx.fillText(t, x + 14, y);
    }
  };
  msize();
  let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(msize, 150); });
  document.fonts && document.fonts.ready.then(mdraw);

  // the steps
  const STEPS = [
    ['FIRST', 'a weight on a line, dropped from the boat. when it touches the bottom we write the number down. then we move ten metres and do it again.'],
    ['SECOND', 'then we join every point of the same depth with one line. that line is an isobath. the first one is the coast: zero metres.'],
    ['THIRD', 'lines close together: the reef drops fast. lines far apart: flat sand and sea grass. the bigger the dot, the deeper the blue.'],
  ];
  const mtop = $$('.m-top span'), mord = $('.m-ord'), mtxt = $('.m-txt');
  let step = -1;
  const setStep = (k) => {
    if (k === step) return; step = k;
    mtop.forEach((s, i) => s.classList.toggle('on', i === k));
    if (k > 0) { const z = STEPS[k - 1]; IB.scramble(mord, z[0]); gsap.fromTo(mtxt, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: .5 }); mtxt.textContent = z[1]; }
    gsap.to('.m-left, .m-key, .m-hint', { autoAlpha: k > 0 ? 1 : 0, duration: .4 });
  };
  setStep(0);

  // title: the letters, then the intro after the sounding
  const tw = $('.m-title .w');
  tw.innerHTML = tw.textContent.split('').map(c => `<span class="ch">${c}</span>`).join('');
  gsap.set('.m-title .ch', { yPercent: 105, autoAlpha: 0 });
  gsap.set('.m-sub, .m-facts p, .m-jp', { autoAlpha: 0, y: 14 });
  const intro = { p: 0 };
  IB.ready.then(() => {
    gsap.timeline()
      .to('.m-title .ch', { yPercent: 0, autoAlpha: 1, duration: 1.1, ease: 'expo.out', stagger: .06 }, 0)
      .to('.m-sub, .m-jp', { autoAlpha: 1, y: 0, duration: .9, ease: 'power3.out', stagger: .08 }, .4)
      .to('.m-facts p', { autoAlpha: 1, y: 0, duration: .6, ease: 'power3.out', stagger: .08 }, .5)
      // a first handful of numbers, so the map is never empty
      .to(intro, { p: .12, duration: 1.6, ease: 'power2.out', onUpdate: () => { if (s1 < intro.p) { s1 = intro.p; mdraw(); } } }, .6);
  });

  const titleOut = gsap.timeline({ paused: true })
    // the wrapper leaves, so it never fights the intro (which animates what is inside)
    .to('.m-hero', { yPercent: -30, autoAlpha: 0, ease: 'none' }, 0);
  ScrollTrigger.create({
    trigger: mapSec, start: 'top top', end: '+=330%', pin: true, scrub: .6,
    onUpdate: (st) => {
      const p = st.progress;
      titleOut.progress(clamp(p / .1));
      s1 = Math.max(clamp((p - .06) / .22), intro.p);
      s2 = clamp((p - .32) / .34);
      s3 = clamp((p - .72) / .2);
      setStep(p < .06 ? 0 : p < .32 ? 1 : p < .72 ? 2 : 3);
      mdraw();
    },
  });

  // reading the map: the cursor says how deep, a click leaves your number
  const mll = $('.m-ll');
  const fmtLL = (mx, my) => {
    const lat = 24.47 - my * .33, lon = 123.72 + mx * .34;
    const dm = (v) => `${Math.floor(v)}°${String(Math.floor((v % 1) * 60)).padStart(2, '0')}′`;
    return `${dm(lat)}N ${dm(lon)}E`;
  };
  let overMap = false;
  cv.addEventListener('pointerenter', () => { overMap = true; });
  cv.addEventListener('pointerleave', () => { overMap = false; hoverText = ''; mll.textContent = ''; });
  cv.addEventListener('pointermove', (e) => {
    const r = cv.getBoundingClientRect(), [mx, my] = toMap(e.clientX - r.left, e.clientY - r.top), d = field(mx, my);
    hoverText = d < 0 ? 'land · ' + islandAt(mx, my) : IB.fmt(d) + ' m · ' + zoneOf(d);
    mll.textContent = fmtLL(mx, my);
  });
  const myn = $('.m-yours');
  myn.textContent = yours.length;
  cv.addEventListener('click', (e) => {
    const r = cv.getBoundingClientRect(), [mx, my] = toMap(e.clientX - r.left, e.clientY - r.top), d = field(mx, my);
    yours.push([+mx.toFixed(4), +my.toFixed(4), +d.toFixed(1)]);
    while (yours.length > 40) yours.shift();
    IB.set('soundings', yours); myn.textContent = yours.length;
    mdraw();
    IB.toast(d < 0 ? 'LAND' : IB.fmt(d) + ' M', d < 0 ? `that’s ${islandAt(mx, my)}. the weight landed on a roof.` : `your sounding is on the map. ${zoneOf(d)}.`);
  });

  /* ═════════ 02 · sites: the drop shows the place ═════════ */
  const list = $('.st-list'), sdrop = $('.st-drop'), sph = $('.st-ph');
  const srcOf = (path) => { const sl = $$('.st-slots .slot').find(s => s.dataset.img === path); const im = sl && $('img', sl); return im ? im.src : ''; };
  const sqx = gsap.quickTo(sdrop, 'x', { duration: .7, ease: 'power3' }), sqy = gsap.quickTo(sdrop, 'y', { duration: .7, ease: 'power3' });
  let lastImg = '';
  $$('.st').forEach(row => {
    row.addEventListener('pointerenter', () => {
      const p = row.dataset.img;
      if (p !== lastImg) {
        lastImg = p; const src = srcOf(p);
        sph.style.backgroundImage = src ? `url("${src}")` : '';
        gsap.fromTo(sph, { scale: 1.5 }, { scale: 1.2, duration: .9, ease: 'expo.out' });
      }
      gsap.to(sdrop, { scale: 1, duration: .9, ease: 'elastic.out(1,.55)', overwrite: 'auto' });
    });
    row.addEventListener('click', () => { if (!FINE) { $$('.st').forEach(r => r.classList.toggle('on', r === row && !r.classList.contains('on'))); } });
  });
  list.addEventListener('pointerleave', () => gsap.to(sdrop, { scale: 0, duration: .4, ease: 'power3.in', overwrite: 'auto' }));
  addEventListener('pointermove', () => { const d = sdrop.offsetWidth; sqx(IB.mx - d / 2 + d * .35); sqy(IB.my - d / 2); }, { passive: true });
  const sMorph = () => { const r = () => 42 + Math.random() * 16 + '%'; gsap.to(sdrop, { borderRadius: `${r()} ${r()} ${r()} ${r()} / ${r()} ${r()} ${r()} ${r()}`, duration: 2.4 + Math.random(), ease: 'sine.inOut', onComplete: sMorph }); };
  if (!RM) sMorph();
  gsap.from('.st', { scrollTrigger: { trigger: list, start: 'top 80%' }, autoAlpha: 0, y: 40, duration: .9, ease: 'expo.out', stagger: .07 });
  gsap.from('.st-t', { scrollTrigger: { trigger: '.sites', start: 'top 70%' }, yPercent: 30, autoAlpha: 0, duration: 1.1, ease: 'expo.out' });

  /* ═════════ 03 · transect: one hundred points ═════════ */
  const CAT = [
    ['live coral', '#1534ff', 1, 0],
    ['bleached', '#ffffff', 1, 1],
    ['dead, with algae', '#0b0d12', .72, 0],
    ['sand', '#e3e6e9', .16, 0],
    ['rubble', '#b9bfc6', .36, 0],
  ];
  const YEARS = {
    2008: { w: [46, 2, 18, 24, 10], note: '2008 · before. most of the tape crossed live coral, and the table corals were wider than the boat.' },
    2016: { w: [12, 44, 14, 20, 10], note: '2016 · the water stayed above 30 °C for weeks. the tape crossed more white than colour. white coral is still alive, but starving.' },
    2024: { w: [26, 5, 35, 22, 12], note: '2024 · most of the white turned dark: dead coral, under algae. but the blue is coming back from the edges, one colony at a time.' },
  };
  // the tape: runs of the same thing, like a real reef
  const tapeFor = (y) => {
    const w = YEARS[y].w, tot = w.reduce((a, b) => a + b, 0), out = [];
    // sand and rubble stay put across the years; the rest changes
    const pick = (r) => { let a = 0; for (let k = 0; k < 5; k++) { a += w[k] / tot; if (r < a) return k; } return 4; };
    let cur = pick(hash(1, y));
    for (let i = 0; i < 100; i++) {
      const base = hash(i * .37, 7), shift = hash(i, y);
      if (base < .19) { out.push(3); continue; }
      if (base > .91) { out.push(4); continue; }
      if (shift < .38) cur = pick(hash(i * 1.3, y * .7));
      if (cur > 2) cur = pick(hash(i * 2.1, y)) % 3;
      out.push(cur);
    }
    return out;
  };
  const bar = $('.tr-bar'), tape = $('.tr-tape'), note = $('.tr-note');
  const bars = [];
  for (let i = 0; i < 100; i++) {
    const b = document.createElement('i');
    b.addEventListener('pointerenter', () => { hoverText = (i * .5).toFixed(1) + ' m · ' + CAT[b._k][0]; });
    b.addEventListener('pointerleave', () => { hoverText = ''; });
    bar.appendChild(b); bars.push(b);
  }
  for (let m = 0; m <= 50; m += 5) tape.insertAdjacentHTML('beforeend', `<span style="left:${m * 2}%">${m} m</span>`);
  const diver = document.createElement('span'); diver.className = 'tr-diver'; diver.textContent = 'you · 0.0 m'; tape.appendChild(diver);
  const keyB = $$('.tr-key b');
  $$('.tr-key p').forEach(p => { const c = CAT[+p.dataset.k]; p.querySelector('i').style.setProperty('--c', c[1]); if (c[3]) p.querySelector('i').style.setProperty('--bw', '1px'); });
  let year = 2008;
  const paint = (y, animate) => {
    year = y;
    const t = tapeFor(y), cnt = [0, 0, 0, 0, 0];
    t.forEach((k, i) => {
      cnt[k]++;
      const b = bars[i], c = CAT[k]; b._k = k;
      const apply = () => { b.style.setProperty('--c', c[1]); b.style.setProperty('--bw', c[3] ? '1px' : '0px'); };
      if (animate) gsap.to(b, { scaleY: c[2], duration: .5, delay: i * .008, ease: 'power3.inOut', onStart: apply });
      else { apply(); b._h = c[2]; }
    });
    keyB.forEach((b, k) => { const o = { v: +b.textContent || 0 }; gsap.to(o, { v: cnt[k], duration: animate ? .9 : 0, onUpdate: () => { b.textContent = Math.round(o.v); } }); });
    note.textContent = YEARS[y].note;
    $$('.tr-years button').forEach(b => b.classList.toggle('on', +b.dataset.y === y));
  };
  paint(2008, false);
  gsap.set(bars, { scaleY: 0 });
  // scroll: swim the tape once
  const swim = { p: 0 };
  let swum = false;
  gsap.to(swim, {
    p: 1, ease: 'none',
    scrollTrigger: { trigger: bar, start: 'top 85%', end: 'bottom 35%', scrub: .5 },
    onUpdate: () => {
      const n = swim.p * 100;
      bars.forEach((b, i) => { if (!swum) gsap.set(b, { scaleY: clamp(n - i) * bars[i]._h }); });
      diver.style.left = swim.p * 100 + '%';
      diver.textContent = 'you · ' + (swim.p * 50).toFixed(1) + ' m';
      if (swim.p > .999) swum = true;
    },
  });
  $$('.tr-years button').forEach(b => b.addEventListener('click', () => {
    const y = +b.dataset.y; if (y === year) return;
    swum = true; paint(y, true);
    gsap.fromTo(diver, { left: '0%' }, { left: '100%', duration: 1.3, ease: 'power1.inOut', onUpdate() { diver.textContent = 'you · ' + (this.progress() * 50).toFixed(1) + ' m'; } });
  }));
  gsap.from('.tr-t', { scrollTrigger: { trigger: '.tr', start: 'top 70%' }, yPercent: 30, autoAlpha: 0, duration: 1.1, ease: 'expo.out' });

  /* ═════════ 04 · spawn: snow falling up ═════════ */
  const sw = $('.spawn'), sc = $('.sw-cv'), sx = sc.getContext('2d'), scount = $('.sw-c b');
  let SW = 0, SH = 0, held = false, total = IB.get('spawned', 0);
  scount.textContent = String(total).padStart(4, '0');
  const ssize = () => { SW = sw.offsetWidth; SH = sw.offsetHeight; sc.width = SW; sc.height = SH; };
  ssize(); addEventListener('resize', ssize);
  // the reef along the bottom: a row of colonies, the bundles leave from them
  const COL = Array.from({ length: 34 }, (_, i) => ({ x: (i + .5) / 34 + (hash(i, 3) - .5) * .02, r: 18 + hash(i, 9) * 40 }));
  const P = [];
  const emit = (n, x0) => {
    for (let k = 0; k < n && P.length < 1600; k++) {
      const c = x0 != null ? { x: x0 / SW + (Math.random() - .5) * .08, r: 30 } : COL[(Math.random() * COL.length) | 0];
      P.push({ x: c.x * SW + (Math.random() - .5) * c.r, y: SH - 20 - Math.random() * c.r * .5, vy: -(.35 + Math.random() * 1.1), r: 1 + Math.random() * 2.6, ph: Math.random() * 6.28, pink: Math.random() < .7 });
      total++;
    }
  };
  sw.addEventListener('pointerdown', (e) => { held = true; sw.setPointerCapture(e.pointerId); });
  const release = () => { if (held) { held = false; IB.set('spawned', total); } };
  sw.addEventListener('pointerup', release); sw.addEventListener('pointercancel', release);
  let last = 0;
  gsap.ticker.add(() => {
    if (!visible(sw)) return;
    sx.clearRect(0, 0, SW, SH);
    // the colonies: soft halftone mounds
    sx.fillStyle = 'rgba(255,255,255,.16)';
    sx.beginPath();
    for (const c of COL) for (let a = 0; a < 3.14; a += .5) for (let rr = 6; rr < c.r; rr += 8) {
      const x = c.x * SW + Math.cos(a) * rr * 1.4, y = SH - Math.sin(a) * rr * .8;
      sx.moveTo(x + 1.6, y); sx.arc(x, y, 1.6, 0, 6.2832);
    }
    sx.fill();
    if (!RM) {
      if (held) { const r = sw.getBoundingClientRect(); emit(14, IB.mx - r.left); emit(6); } else if (Math.random() < .5) emit(1);
    }
    for (let i = P.length - 1; i >= 0; i--) {
      const p = P[i];
      p.y += p.vy * (held ? 1.5 : 1); p.ph += .03; p.x += Math.sin(p.ph) * .35;
      const a = clamp((p.y) / (SH * .45));
      if (p.y < -10) { P.splice(i, 1); continue; }
      sx.fillStyle = p.pink ? `rgba(255,200,214,${a})` : `rgba(255,255,255,${a * .85})`;
      sx.beginPath(); sx.arc(p.x, p.y, p.r, 0, 6.2832); sx.fill();
    }
    if (total !== last) { last = total; scount.textContent = String(total).padStart(4, '0'); }
  });
  addEventListener('pagehide', () => IB.set('spawned', total));

  // when: a few nights after the first full moon of may (moon maths from a known new moon)
  const SYN = 29.530588853, NEW0 = Date.UTC(2000, 0, 6, 18, 14) / 864e5;
  const fullMoonAfter = (t) => { const k = Math.ceil((t - NEW0 - SYN / 2) / SYN); return NEW0 + SYN / 2 + k * SYN; };
  const now = Date.now() / 864e5;
  let Y = new Date().getUTCFullYear(), fm = fullMoonAfter(Date.UTC(Y, 4, 1) / 864e5);
  if (fm + 8 < now) { Y++; fm = fullMoonAfter(Date.UTC(Y, 4, 1) / 864e5); }
  const MON = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const day = (t) => { const d = new Date(t * 864e5 + 9 * 36e5); return [d.getUTCDate(), MON[d.getUTCMonth()]]; };
  const [d0, m0] = day(fm + 3), [d1, m1] = day(fm + 7), [fd, fmn] = day(fm), left = Math.ceil(fm + 3 - now);
  $('.sw-date').textContent = m0 === m1 ? `${d0}–${d1} ${m0.toUpperCase()} ${Y}` : `${d0} ${m0.toUpperCase()} – ${d1} ${m1.toUpperCase()} ${Y}`;
  $('.sw-why').textContent = `full moon ${fd} ${fmn} · around 22:00, three to seven nights after · ${left > 0 ? left + ' nights from tonight' : 'it could be tonight'}`;
  gsap.from('.sw-t', { scrollTrigger: { trigger: sw, start: 'top 65%' }, yPercent: 20, autoAlpha: 0, duration: 1.2, ease: 'expo.out' });
  gsap.from('.sw-next, .sw-s', { scrollTrigger: { trigger: sw, start: 'top 40%' }, autoAlpha: 0, y: 20, duration: .9, stagger: .1, ease: 'power3.out' });

  /* ═════════ 05 · next ═════════ */
  gsap.from('.nx-t', { scrollTrigger: { trigger: '.next', start: 'top 65%' }, yPercent: 30, autoAlpha: 0, duration: 1.1, ease: 'expo.out' });
  gsap.from('.nx-strip', { scrollTrigger: { trigger: '.next', start: 'top 45%' }, scaleX: 0, transformOrigin: 'left', duration: 1, ease: 'expo.inOut' });

  IB.help = () => console.log('IB.depthAt(y)  → how deep a point of the page is (m)\nIB.flood()     → go too deep (or konami)\nIB.toast(k, t) → a small note\nlocalStorage ib-soundings → the numbers you added to the map\nlocalStorage ib-spawned   → how many bundles you let go');
  addEventListener('load', () => ScrollTrigger.refresh());
})();
