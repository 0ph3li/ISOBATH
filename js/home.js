/* ═══════════════════════════════════════════════════════════════
   ISOBATH 等深線 — home
   concept, design & code by ghostly.grl ♥

   01 surface   the strip of codes and a drop that magnifies it
   02 depth     six zones from 0 to −40 m, the colours leave one by one
   03 archive   the reef as a halftone map: your hand bleaches it
   04 census    every fish gets a box, the boxes become a network
   05 one litre glass drops you can drag over the text
   06 species   a { } of { }, and the white boxes of the missing
   07 logbook   what we brought back this year
   08 come down sign up for a survey dive
   ═══════════════════════════════════════════════════════════════ */
(() => {
  const { $, $$, RM, FINE } = IB;
  if (!window.gsap) return;
  const lerp = (a, b, t) => a + (b - a) * t;
  const visible = (el) => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; };

  /* ═════════ 01 · surface ═════════ */
  const hero = $('.hero'), strip = $('.h-strip'), drop = $('.h-drop');
  const w = $('.h-title .w');
  w.innerHTML = w.textContent.split('').map(c => `<span class="ch">${c}</span>`).join('');
  const lenses = [IB.lens(hero, strip, drop, 1.55), IB.lens(hero, strip, $('.h-drop2'), 1.3), IB.lens(hero, strip, $('.h-drop3'), 1.2)];

  const placeDrop = () => {
    const sr = strip.getBoundingClientRect(), hr = hero.getBoundingClientRect(), d = drop.offsetWidth;
    drop.style.left = (hr.width / 2 - d / 2) + 'px';
    drop.style.top = (sr.top - hr.top + sr.height / 2 - d / 2) + 'px';
  };
  placeDrop(); addEventListener('resize', placeDrop);

  // the drop is never quite round
  const morph = () => {
    const r = () => 42 + Math.random() * 16 + '%';
    gsap.to(drop, { borderRadius: `${r()} ${r()} ${r()} ${r()} / ${r()} ${r()} ${r()} ${r()}`, duration: 2.6 + Math.random(), ease: 'sine.inOut', onComplete: morph });
  };
  if (!RM) morph();
  const dqx = gsap.quickTo(drop, 'x', { duration: 1.6, ease: 'power3' }), dqy = gsap.quickTo(drop, 'y', { duration: 1.6, ease: 'power3' });
  if (FINE && !RM) addEventListener('pointermove', () => { if (scrollY < innerHeight) { dqx((IB.mx / innerWidth - .5) * 120); dqy((IB.my / innerHeight - .5) * 50); } });
  gsap.to('.h-drop2', { y: -18, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  gsap.to('.h-drop3', { y: 14, x: 6, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  gsap.ticker.add(() => { if (visible(hero)) lenses.forEach(l => l.update()); });

  // intro, after the sounding
  gsap.set('.h-title .ch', { yPercent: 105, autoAlpha: 0 });
  gsap.set(strip, { scaleX: 0, transformOrigin: 'left center' });
  gsap.set('.hero .drop', { scale: 0 });
  gsap.set('.h-note, .h-coord, .h-sub, .marks span, .h-jp', { autoAlpha: 0, y: 14 });
  IB.ready.then(() => {
    gsap.timeline()
      .to(strip, { scaleX: 1, duration: 1.1, ease: 'expo.inOut' }, 0)
      .to('.h-title .ch', { yPercent: 0, autoAlpha: 1, duration: 1.1, ease: 'expo.out', stagger: .05 }, .35)
      .to('.hero .drop', { scale: 1, duration: 1.6, ease: 'elastic.out(1,.55)', stagger: .12 }, .8)
      .to('.h-note, .h-coord, .h-sub, .h-jp', { autoAlpha: 1, y: 0, duration: .9, ease: 'power3.out', stagger: .08 }, .9)
      .to('.marks span', { autoAlpha: 1, y: 0, duration: .6, ease: 'power3.out', stagger: .06 }, 1.1)
      .add(() => IB.scramble($('.h-note .kick')), 1);
  });
  // scroll: the drop slides along the strip, the name sinks
  gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: .8 } })
    .to('.h-drop', { xPercent: 120, scale: .7, ease: 'none' }, 0)
    .to('.h-title .ch', { yPercent: (i) => 30 + i * 12, ease: 'none' }, 0)
    .to(strip, { rotate: -4, y: 60, ease: 'none' }, 0);

  /* ═════════ 02 · depth: six zones, the colours leave one by one ═════════ */
  const Z = [0, 1, 3, 8, 20, 40];
  const ZONES = [
    ['SURFACE', 'FIRST', 'the light is all here. you can stand up and still be in the sea.', 'ZONE OF LIGHT', 'EVERY COLOUR IS STILL HERE'],
    ['REEF FLAT', 'SECOND', 'at low tide it is almost dry. sea grass, sea cucumbers, children with buckets. here it is called the inō.', 'MOAT · イノー', 'RED IS ALREADY GOING'],
    ['CREST', 'THIRD', 'the reef crest breaks the waves before they reach the island. most of the colour lives here.', 'BREAKER ZONE', 'ORANGE FADES BY 5 M'],
    ['SLOPE', 'FOURTH', 'the reef leans down. table corals, parrotfish, and the cleaning stations where mantas wait their turn.', 'FORE-REEF SLOPE', 'YELLOW GOES NEXT'],
    ['WALL', 'FIFTH', 'the bottom drops away. you stop looking down and start looking out.', 'DROP-OFF', 'ONLY GREEN AND BLUE ARE LEFT'],
    ['BLUE', 'LAST', 'no bottom, no reef, no up. this is where our lines stop.', 'OPEN WATER', 'EVEN BLUE GETS TIRED'],
  ];
  const BG = ['#f3f4f5', '#eaeef2', '#dce3ee', '#c3cef2', '#7d92f7', '#1534ff'];
  const dst = $('.d-stage'), dnum = $('.d-num b'), dword = $('.d-word'), dord = $('.d-ord'), dtxt = $('.d-txt'), dzone = $('.d-zone'), dsub = $('.d-sub');
  const tops = $$('.d-top span'), bots = $$('.d-bot span');
  let zi = -1;
  const setZone = (i) => {
    if (i === zi) return; zi = i;
    const z = ZONES[i];
    tops.forEach((s, k) => s.classList.toggle('on', k === i));
    bots.forEach((s, k) => s.classList.toggle('on', k === i));
    IB.scramble(dword, z[0]); dord.textContent = z[1]; IB.scramble(dzone, z[3]); dsub.textContent = z[4];
    gsap.fromTo(dtxt, { autoAlpha: 0, y: 8 }, { autoAlpha: .7, y: 0, duration: .5 }); dtxt.textContent = z[2];
    const blue = i >= 4;
    dst.style.setProperty('--fg', blue ? '#fff' : 'var(--ink)');
    dst.style.setProperty('--cl', blue ? 'rgba(255,255,255,.18)' : 'var(--line)');
  };
  setZone(0);
  let depthNow = 0;
  ScrollTrigger.create({
    trigger: '.depth', start: 'top top', end: '+=320%', pin: true, scrub: .6,
    onUpdate: (s) => {
      const d = s.progress * IB.MAX; depthNow = s.progress;
      dnum.textContent = Math.floor(d);
      let i = 0; for (let k = 0; k < Z.length; k++) if (d >= Z[k]) i = k;
      if (s.progress >= .999) i = 5;
      setZone(Math.min(i, 5));
      // background: continuous through the zone colours
      const f = Math.min(4.999, Math.max(0, i + (Z[i + 1] ? (d - Z[i]) / (Z[i + 1] - Z[i]) : 0) - (i ? 0 : 0)));
      const a = Math.floor(f), t = f - a;
      dst.style.setProperty('--bg', gsap.utils.interpolate(BG[a], BG[Math.min(5, a + 1)], t));
      document.body.classList.toggle('on-blue', s.isActive && i >= 4);
    },
    onLeave: () => document.body.classList.remove('on-blue'),
    onLeaveBack: () => document.body.classList.remove('on-blue'),
  });

  // the wireframe coral (ref: the mesh head)
  const mc = $('.d-mesh'), mx = mc.getContext('2d');
  let mw = 0, mh = 0;
  const msize = () => { const r = mc.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio); mw = r.width; mh = r.height; mc.width = mw * dpr; mc.height = mh * dpr; mx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  msize(); addEventListener('resize', msize);
  const NL = 30, NM = 40;
  let mt = 0;
  const mesh = () => {
    if (!visible(mc)) return;
    mt += RM ? 0 : .008;
    const g = depthNow, amp = .22 + g * .35, rot = mt * .6 + g * 4, tilt = .5 + Math.sin(mt * .7) * .12;
    const cr = Math.cos(rot), sr = Math.sin(rot), ct = Math.cos(tilt), st = Math.sin(tilt), S = Math.min(mw, mh) * .3;
    const P = [];
    for (let i = 0; i <= NL; i++) {
      const th = i / NL * Math.PI, row = [];
      for (let j = 0; j <= NM; j++) {
        const ph = j / NM * Math.PI * 2;
        const r = 1 + amp * (Math.sin(3 * th + mt) * Math.cos(2 * ph + mt * .5) * .6 + Math.sin(5 * ph + th * 2 - mt * .8) * .25 * g + Math.cos(4 * th - ph) * .2);
        let x = r * Math.sin(th) * Math.cos(ph), y = r * Math.cos(th) * 1.08, z = r * Math.sin(th) * Math.sin(ph);
        const x1 = x * cr - z * sr, z1 = x * sr + z * cr;
        const y2 = y * ct - z1 * st, z2 = y * st + z1 * ct;
        const k = 3.4 / (3.4 + z2);
        row.push([mw / 2 + x1 * S * k, mh / 2 + y2 * S * k]);
      }
      P.push(row);
    }
    mx.clearRect(0, 0, mw, mh);
    mx.strokeStyle = zi >= 4 ? 'rgba(255,255,255,.75)' : 'rgba(11,13,18,.7)'; mx.lineWidth = .6;
    mx.beginPath();
    for (let i = 0; i <= NL; i++) for (let j = 0; j <= NM; j++) { const p = P[i][j]; j ? mx.lineTo(p[0], p[1]) : mx.moveTo(p[0], p[1]); }
    for (let j = 0; j <= NM; j++) for (let i = 0; i <= NL; i++) { const p = P[i][j]; i ? mx.lineTo(p[0], p[1]) : mx.moveTo(p[0], p[1]); }
    mx.stroke();
  };
  gsap.ticker.add(mesh);

  /* ═════════ 03 · archive: the halftone reef, your hand bleaches it ═════════ */
  const arch = $('.arch'), ac = $('.a-ht'), ax = ac.getContext('2d'), aread = $('.a-read b');
  const hash = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
  const vnoise = (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    return lerp(lerp(hash(xi, yi), hash(xi + 1, yi), u), lerp(hash(xi, yi + 1), hash(xi + 1, yi + 1), u), v);
  };
  const fbm = (x, y) => vnoise(x, y) * .5 + vnoise(x * 2.1, y * 2.1) * .25 + vnoise(x * 4.3, y * 4.3) * .15 + vnoise(x * 8.7, y * 8.7) * .1;
  const SP = 8;
  let AW = 0, AH = 0, cols = 0, rws = 0, V, H, hot = 0, grow = { p: 0 }, bleached = 0;
  // where the reef is: three soft islands, like the blue map in the poster
  const BLOBS = [[.62, .16, .34], [.42, .52, .3], [.78, .78, .26], [.12, .88, .2]];
  const asize = () => {
    const r = arch.getBoundingClientRect(); AW = r.width; AH = r.height;
    ac.width = AW; ac.height = AH;
    cols = Math.ceil(AW / SP); rws = Math.ceil(AH / SP);
    V = new Float32Array(cols * rws); H = new Float32Array(cols * rws);
    for (let j = 0; j < rws; j++) for (let i = 0; i < cols; i++) {
      const x = i * SP / AW, y = j * SP / AH;
      let m = 0;
      for (const b of BLOBS) { const dx = (x - b[0]) * AW / AH, dy = y - b[1]; m = Math.max(m, 1 - Math.sqrt(dx * dx + dy * dy) / b[2]); }
      const n = fbm(i * SP * .006, j * SP * .006);
      V[j * cols + i] = Math.max(0, Math.min(1, (m * 1.3 + n - .95) * 2.4));
    }
    adraw();
  };
  const adraw = () => {
    ax.clearRect(0, 0, AW, AH);
    const lv = [[], [], [], []];
    for (let k = 0; k < V.length; k++) {
      const v = V[k]; if (v < .03) continue;
      const h = H[k], l = h > .66 ? 3 : h > .33 ? 2 : h > .05 ? 1 : 0;
      lv[l].push(k);
    }
    const COL = ['#1534ff', '#7186ff', '#bcc7ff', '#ffffff'];
    lv.forEach((ks, l) => {
      if (!ks.length) return;
      ax.fillStyle = COL[l]; ax.beginPath();
      for (const k of ks) {
        const i = k % cols, j = (k / cols) | 0, r = SP * .56 * Math.sqrt(V[k]) * grow.p;
        if (r < .3) continue;
        const x = i * SP + SP / 2, y = j * SP + SP / 2;
        ax.moveTo(x + r, y); ax.arc(x, y, r, 0, 6.2832);
      }
      ax.fill();
      if (l === 3) { ax.strokeStyle = '#bcc7ff'; ax.lineWidth = .6; ax.stroke(); }
    });
  };
  asize(); addEventListener('resize', asize);
  ScrollTrigger.create({ trigger: arch, start: 'top 75%', once: true, onEnter: () => gsap.to(grow, { p: 1, duration: 2.2, ease: 'power2.out', onUpdate: adraw }) });
  gsap.from('.arch .a-box, .arch .a-tag, .a-frame', { scrollTrigger: { trigger: arch, start: 'top 50%' }, autoAlpha: 0, y: 20, stagger: .08, duration: .8, ease: 'power3.out' });
  gsap.from('.a-t1, .a-jp1, .a-t2, .a-jp2', { scrollTrigger: { trigger: arch, start: 'top 70%' }, autoAlpha: 0, x: -30, stagger: .1, duration: 1, ease: 'expo.out' });
  let inArch = false, lx = -1e3, ly = -1e3;
  arch.addEventListener('pointerenter', () => { inArch = true; });
  arch.addEventListener('pointerleave', () => { inArch = false; });
  IB.bleach = () => bleached;
  gsap.ticker.add(() => {
    if (!visible(arch) || grow.p < 1) return;
    let changed = false;
    if (inArch) {
      const r = arch.getBoundingClientRect(), x = IB.mx - r.left, y = IB.my - r.top;
      if (Math.hypot(x - lx, y - ly) > 1) {
        lx = x; ly = y;
        const R = 70, i0 = Math.max(0, ((x - R) / SP) | 0), i1 = Math.min(cols - 1, ((x + R) / SP) | 0), j0 = Math.max(0, ((y - R) / SP) | 0), j1 = Math.min(rws - 1, ((y + R) / SP) | 0);
        for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
          const k = j * cols + i; if (V[k] < .03) continue;
          const d = Math.hypot(i * SP - x, j * SP - y); if (d > R) continue;
          H[k] = Math.min(1, H[k] + .22 * (1 - d / R)); changed = true;
        }
      }
    }
    // they come back, slowly
    let n = 0, any = false;
    for (let k = 0; k < H.length; k++) if (H[k] > 0) { H[k] = Math.max(0, H[k] - .0016); any = true; if (H[k] > .5) n++; }
    if (any || changed) { adraw(); if (n !== bleached) { bleached = n; aread.textContent = String(n).padStart(4, '0'); } }
  });

  /* ═════════ 04 · census: every fish gets a box ═════════ */
  const cen = $('.census'), cbx = $('.c-boxes'), cph = $('.c-ph'), net = $('.c-net');
  const N = innerWidth < 860 ? 40 : 66;
  const R = (s) => { const x = Math.sin(s * 99.13) * 7919.7; return x - Math.floor(x); };
  // where the fish are: a few schools; where they go: a long band, like a current
  const SCH = [[.22, .42], [.48, .58], [.72, .4], [.86, .7]];
  const BX = [];
  for (let i = 0; i < N; i++) {
    const s = SCH[i % SCH.length], ang = R(i + 1) * 6.28, rad = Math.sqrt(R(i + 7)) * .17;
    const ax_ = Math.min(.97, Math.max(.03, s[0] + Math.cos(ang) * rad * 1.2)), ay_ = Math.min(.9, Math.max(.16, s[1] + Math.sin(ang) * rad));
    const bx_ = .04 + (i / (N - 1)) * .92 + (R(i + 3) - .5) * .05;
    const by_ = .5 + Math.sin(bx_ * 7 + 1) * .14 + (R(i + 5) - .5) * .36;
    const el = document.createElement('i'); el.className = 'bx' + (i === 9 || i === 41 ? ' r' : '');
    if (i % 6 === 0) el.innerHTML = `<em>№${String(i * 7 + 12).padStart(3, '0')}</em>`;
    cbx.appendChild(el);
    BX.push({ el, ax: ax_, ay: ay_, bx: Math.min(.97, Math.max(.03, bx_)), by: Math.min(.8, Math.max(.22, by_)), w: 12 + R(i + 11) * 18, h: 10 + R(i + 13) * 10 });
  }
  let CH = 0, CW = 0, cimg = null;
  const crop = () => {
    if (!cimg) return;
    const W = CW, Hh = CH, k = Math.max(W / cimg.naturalWidth, Hh / cimg.naturalHeight), dw = cimg.naturalWidth * k, dh = cimg.naturalHeight * k, ox = (W - dw) / 2, oy = (Hh - dh) / 2;
    BX.forEach(b => { const x = b.ax * W, y = b.ay * Hh; b.el.style.backgroundImage = `url("${cimg.src}")`; b.el.style.backgroundSize = `${dw}px ${dh}px`; b.el.style.backgroundPosition = `${ox - x}px ${oy - y}px`; });
  };
  const clay = () => {
    CW = cen.offsetWidth; CH = $('.c-top').offsetHeight;
    BX.forEach(b => { b.el.style.width = b.w + 'px'; b.el.style.height = b.h + 'px'; b.el.style.left = (b.ax * CW) + 'px'; b.el.style.top = (b.ay * CH) + 'px'; b.dx = (b.bx - b.ax) * CW; b.dy = CH + b.by * CH - b.ay * CH; });
    // the network: each box to its two nearest neighbours (in the band)
    const pts = BX.map(b => [b.bx * CW + b.w / 2, b.by * CH + b.h / 2]);
    let s = '';
    pts.forEach((p, i) => {
      const nn = pts.map((q, j) => [j, (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2]).filter(a => a[0] > i).sort((a, b) => a[1] - b[1]).slice(0, 2);
      nn.forEach(([j]) => { s += `<line x1="${p[0].toFixed(1)}" y1="${p[1].toFixed(1)}" x2="${pts[j][0].toFixed(1)}" y2="${pts[j][1].toFixed(1)}"/>`; });
    });
    net.innerHTML = s;
    $$('line', net).forEach(l => { const L = Math.hypot(l.x2.baseVal.value - l.x1.baseVal.value, l.y2.baseVal.value - l.y1.baseVal.value); l.style.strokeDasharray = L; l.style.strokeDashoffset = netOn ? 0 : L; });
    crop();
    ScrollTrigger.refresh();
  };
  let netOn = false;
  cph.addEventListener('ib:img', e => { cimg = e.detail; crop(); });
  if (cph.classList.contains('has-img')) { cimg = $('img', cph); }
  clay(); addEventListener('resize', () => { clay(); });
  gsap.from(BX.map(b => b.el), { scrollTrigger: { trigger: '.c-top', start: 'top 60%' }, scale: 0, autoAlpha: 0, duration: .5, ease: 'back.out(3)', stagger: { each: .02, from: 'random' } });
  gsap.from('.c-top .cw', { scrollTrigger: { trigger: '.c-top', start: 'top 50%' }, autoAlpha: 0, y: 12, stagger: .15, duration: .6, ease: 'power3.out' });
  // the boxes fall from the photo into the current
  BX.forEach((b, i) => {
    gsap.to(b.el, { x: () => b.dx, y: () => b.dy, ease: 'power2.inOut', scrollTrigger: { trigger: '.c-top', start: () => `top+=${10 + R(i + 17) * 30}% top`, end: () => `bottom+=${-5 + R(i + 19) * 20}% top`, scrub: .6 + R(i) * .8, invalidateOnRefresh: true },
      onUpdate() { b.el.classList.toggle('lit', this.progress() > .98); } });
  });
  ScrollTrigger.create({ trigger: '.c-bot', start: 'top 30%', onEnter: () => {
    netOn = true;
    gsap.to($$('line', net), { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut', stagger: .01 });
    gsap.fromTo('.c-bot .cw', { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, stagger: .12, duration: .6 });
  } });

  /* ═════════ 05 · one litre: drag the drops ═════════ */
  const dsec = $('.dropsec'), dsrc = $('.ds-txt');
  const dl = $$('.ds-d').map(d => {
    const L = IB.lens(dsec, dsrc, d, 1.25 + d.offsetWidth / innerWidth * 2.2);
    let sx = 0, sy = 0, ox = 0, oy = 0, drag = false;
    d.addEventListener('pointerdown', e => { drag = true; d.setPointerCapture(e.pointerId); sx = e.clientX; sy = e.clientY; ox = gsap.getProperty(d, 'x'); oy = gsap.getProperty(d, 'y'); gsap.to(d, { scale: 1.08, duration: .4 }); d.style.zIndex = 9; });
    d.addEventListener('pointermove', e => { if (drag) gsap.set(d, { x: ox + e.clientX - sx, y: oy + e.clientY - sy }); });
    const up = () => { if (!drag) return; drag = false; gsap.to(d, { scale: 1, duration: .9, ease: 'elastic.out(1,.4)' }); d.style.zIndex = ''; };
    d.addEventListener('pointerup', up); d.addEventListener('pointercancel', up);
    return L;
  });
  $$('.ds-d').forEach((d, i) => { gsap.to(d, { yPercent: i % 2 ? 6 : -6, duration: 2.4 + i * .3, ease: 'sine.inOut', yoyo: true, repeat: -1 }); });
  gsap.from('.ds-d', { scrollTrigger: { trigger: dsec, start: 'top 60%' }, scale: 0, duration: 1.4, ease: 'elastic.out(1,.5)', stagger: .1 });
  gsap.ticker.add(() => { if (visible(dsec)) dl.forEach(l => l.update()); });

  /* ═════════ 06 · species: the missing are white boxes ═════════ */
  gsap.from('.sp-s', { scrollTrigger: { trigger: '.sp-top', start: 'top 55%' }, scaleX: 0, duration: .8, ease: 'expo.out', stagger: .12 });
  const MISSING = [
    ['humphead wrasse', 'last seen 2015 · shiraho wall', .1, .2, 9, 9],
    ['bumphead parrotfish', 'last seen 2016 · kabira', .35, .12, 7, 7],
    ['giant clam, tridacna gigas', 'last seen 2014', .64, .3, 10, 8],
    ['dugong', 'last seen 2016 · off the north cape', .82, .6, 8, 11],
    ['staghorn coral, acropora', 'last seen alive 2016 · sekisei', .3, .52, 8, 8],
    ['hawksbill turtle', 'last seen 2016 · night dive', .54, .72, 6, 6],
    ['spotted eagle ray', 'last seen 2016 · channel', .12, .7, 7, 6],
  ];
  const holes = $('.sp-holes'), spn = $('.sp-name');
  MISSING.forEach(m => {
    const h = document.createElement('i'); h.className = 'hole'; h.dataset.cur = 'missing';
    Object.assign(h.style, { left: m[2] * 100 + '%', top: m[3] * 100 + '%', width: m[4] + 'vw', height: m[5] + 'vh' });
    h.addEventListener('pointerenter', () => { spn.innerHTML = `${m[0]} <span style="opacity:.6">· ${m[1]}</span>`; gsap.to(spn, { opacity: 1, duration: .2 }); });
    h.addEventListener('pointerleave', () => gsap.to(spn, { opacity: 0, duration: .2 }));
    holes.appendChild(h);
  });
  const sbot = $('.sp-bot');
  sbot.addEventListener('pointermove', () => { const r = sbot.getBoundingClientRect(); gsap.set(spn, { x: IB.mx - r.left + 16, y: IB.my - r.top + 16 }); });
  gsap.from('.hole', { scrollTrigger: { trigger: sbot, start: 'top 55%' }, scale: 0, duration: .6, ease: 'expo.out', stagger: .1 });

  /* ═════════ 07 · logbook: the numbers count up ═════════ */
  $$('.lg-n b').forEach(b => {
    const n = +b.dataset.n, u = b.dataset.u || '', o = { v: 0 };
    ScrollTrigger.create({ trigger: b, start: 'top 85%', once: true, onEnter: () => gsap.to(o, { v: n, duration: 1.8, ease: 'power2.out', onUpdate: () => { b.textContent = Math.round(o.v).toLocaleString('en-US') + u; } }) });
  });
  gsap.from('.vf > i', { scrollTrigger: { trigger: '.log', start: 'top 60%' }, scale: 2, autoAlpha: 0, duration: .8, ease: 'expo.out', stagger: .06 });
  gsap.from('.lg-n li', { scrollTrigger: { trigger: '.log', start: 'top 55%' }, autoAlpha: 0, x: 30, duration: .8, stagger: .12, ease: 'power3.out' });

  /* ═════════ 08 · come down · footer ═════════ */
  gsap.from('.dn-t', { scrollTrigger: { trigger: '.down', start: 'top 60%' }, yPercent: 30, autoAlpha: 0, duration: 1.1, ease: 'expo.out' });
  gsap.from('.dn-strip', { scrollTrigger: { trigger: '.down', start: 'top 40%' }, scaleX: 0, transformOrigin: 'left', duration: 1, ease: 'expo.inOut' });
  // footer: see main.js (shared by every page)

  addEventListener('load', () => ScrollTrigger.refresh());
})();
