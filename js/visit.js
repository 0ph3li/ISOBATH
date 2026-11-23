/* ═══════════════════════════════════════════════════════════════
   ISOBATH 等深線 — visit
   concept, design & code by ghostly.grl ♥

   01 find us      a compass points from your city to ishigaki
                   (guessed from your time zone; your real position
                   only if you ask, and it never leaves the page)
   02 isochrones   travel times drawn as isobaths
   03 today        the time in shiraho, open or not, today's tide
                   (worked out from the moon)
   04 the house
   05 address      the rules, and back to the surface (0 m)
   ═══════════════════════════════════════════════════════════════ */
(() => {
  const { $, $$, RM, FINE } = IB;
  if (!window.gsap) return;
  let hoverText = '';
  IB.curText = () => hoverText;

  /* ═════════ 01 · find us ═════════ */
  const HOME = [24.3333, 124.15]; // 24°20′N 124°09′E
  const CITIES = {
    'tokyo': [35.68, 139.76], 'osaka': [34.69, 135.5], 'naha': [26.21, 127.68], 'taipei': [25.03, 121.56], 'seoul': [37.57, 126.98],
    'hong kong': [22.32, 114.17], 'singapore': [1.35, 103.82], 'sydney': [-33.87, 151.21], 'milano': [45.46, 9.19], 'roma': [41.9, 12.5],
    'paris': [48.86, 2.35], 'london': [51.51, -.13], 'berlin': [52.52, 13.4], 'new york': [40.71, -74.0], 'los angeles': [34.05, -118.24],
  };
  const TZ = { 'Asia/Tokyo': 'tokyo', 'Asia/Taipei': 'taipei', 'Asia/Seoul': 'seoul', 'Asia/Hong_Kong': 'hong kong', 'Asia/Singapore': 'singapore', 'Australia/Sydney': 'sydney',
    'Europe/Rome': 'milano', 'Europe/Paris': 'paris', 'Europe/London': 'london', 'Europe/Berlin': 'berlin', 'America/New_York': 'new york', 'America/Los_Angeles': 'los angeles' };
  const rad = (d) => d * Math.PI / 180;
  const dist = (a, b) => { const R = 6371, dl = rad(b[0] - a[0]), dn = rad(b[1] - a[1]), x = Math.sin(dl / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dn / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); };
  const bearing = (a, b) => { const y = Math.sin(rad(b[1] - a[1])) * Math.cos(rad(b[0])), x = Math.cos(rad(a[0])) * Math.sin(rad(b[0])) - Math.sin(rad(a[0])) * Math.cos(rad(b[0])) * Math.cos(rad(b[1] - a[1])); return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360; };

  // background: isobaths around the island
  $('.fu-iso').innerHTML = Array.from({ length: 10 }, (_, i) => `<path d="${IB.contour(3, 40 + i * 52, 1 + i * .1)}"/>`).join('');
  // the compass
  let tk = '<circle r="140"/><circle r="104" style="opacity:.3"/>';
  for (let a = 0; a < 360; a += 5) {
    const l = a % 30 === 0, r1 = l ? 124 : a % 10 ? 134 : 130, s = Math.sin(rad(a)), c = -Math.cos(rad(a));
    tk += `<line class="${l ? 'l' : ''}" x1="${(s * r1).toFixed(1)}" y1="${(c * r1).toFixed(1)}" x2="${(s * 140).toFixed(1)}" y2="${(c * 140).toFixed(1)}"/>`;
  }
  [['N', 0], ['E', 90], ['S', 180], ['W', 270]].forEach(([t, a]) => { tk += `<text x="${(Math.sin(rad(a)) * 154).toFixed(1)}" y="${(-Math.cos(rad(a)) * 154).toFixed(1)}">${t}</text>`; });
  $('.fu-ticks').innerHTML = tk;
  const needle = $('.fu-needle'), sel = $('.fu-sel');
  sel.innerHTML = Object.keys(CITIES).map(c => `<option value="${c}">${c}</option>`).join('');
  let tz = ''; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) {}
  sel.value = TZ[tz] || 'tokyo';
  const fmtT = (h) => h < 1 ? Math.round(h * 60) + ' min' : h < 48 ? '≈ ' + Math.round(h) + ' h' : '≈ ' + Math.round(h / 24) + ' days';
  const go = (from, anim = true) => {
    const d = dist(from, HOME), b = bearing(from, HOME), km = $('.fu-km b');
    const o = { v: +km.textContent.replace(/,/g, '') || 0 };
    gsap.to(o, { v: d, duration: anim ? 1.4 : 0, ease: 'power3.out', onUpdate: () => { km.textContent = Math.round(o.v).toLocaleString('en-US'); } });
    gsap.to(needle, { rotation: b, svgOrigin: '0 0', duration: anim ? 2 : 0, ease: 'elastic.out(1,.35)' });
    $('.fu-deg b').textContent = String(Math.round(b)).padStart(3, '0') + '°';
    const here = d < 15;
    $('.w-plane').textContent = here ? 'you’re here' : d < 120 ? 'no, take the boat' : fmtT(d / 780 + (d > 600 ? 1.5 : .5));
    $('.w-swim').textContent = here ? 'cross the road' : fmtT(d / 3);
    $('.w-drift').textContent = here ? '—' : fmtT(d / 130 * 24) + (d > 3000 ? ', if it went your way' : '');
  };
  go(CITIES[sel.value], false);
  sel.addEventListener('change', () => go(CITIES[sel.value]));
  $('.fu-geo').addEventListener('click', () => {
    if (!navigator.geolocation) { IB.toast('NO COMPASS', 'this browser can’t tell where you are.'); return; }
    navigator.geolocation.getCurrentPosition((p) => {
      const me = [p.coords.latitude, p.coords.longitude];
      CITIES['where you are'] = me;
      if (![...sel.options].some(o => o.value === 'where you are')) sel.insertAdjacentHTML('afterbegin', '<option value="where you are">where you are</option>');
      sel.value = 'where you are'; go(me);
    }, () => IB.toast('FAIR ENOUGH', 'we’ll keep guessing from your time zone.'), { timeout: 8000, maximumAge: 6e5 });
  });
  // intro
  gsap.set('.fu-t span', { yPercent: 50, autoAlpha: 0 });
  gsap.set('.fu-comp, .fu-data', { autoAlpha: 0 });
  const isoP = $$('.fu-iso path');
  isoP.forEach(p => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
  IB.ready.then(() => {
    gsap.timeline()
      .to(isoP, { strokeDashoffset: 0, duration: 2, ease: 'power2.inOut', stagger: .08 }, 0)
      .to('.fu-t span', { yPercent: 0, autoAlpha: 1, duration: 1.2, ease: 'expo.out', stagger: .12 }, .2)
      .fromTo('.fu-comp', { autoAlpha: 0, rotate: -40, scale: .8 }, { autoAlpha: 1, rotate: 0, scale: 1, duration: 1.6, ease: 'expo.out' }, .4)
      .to('.fu-data', { autoAlpha: 1, duration: .8 }, .8)
      .add(() => { needle._gsap && gsap.fromTo(needle, { rotation: 0 }, { rotation: bearing(CITIES[sel.value], HOME), svgOrigin: '0 0', duration: 2.4, ease: 'elastic.out(1,.3)' }); }, .9);
  });
  // the compass drifts with the mouse a little
  if (FINE && !RM) addEventListener('pointermove', () => { if (scrollY < innerHeight) gsap.to('.fu-comp svg', { x: (IB.mx / innerWidth - .5) * 18, y: (IB.my / innerHeight - .5) * 14, duration: 1.2, ease: 'power3' }); });

  /* ═════════ 02 · isochrones ═════════ */
  const TRIPS = [
    [10, 'new ishigaki airport (ISG), by car'],
    [30, 'ishigaki town and the port'],
    [50, 'taketomi island, by boat from the port'],
    [60, 'kabira bay, the north'],
    [95, 'naha, okinawa, by plane'],
    [180, 'osaka, by plane'],
    [215, 'tokyo, by plane'],
  ];
  const isvg = $('.ic-svg'), list = $('.ic-list');
  const R = (m) => 40 + 80 * Math.log2(1 + m / 10);
  let s = '';
  // one seed for all of them, so the lines never cross (isobaths never do)
  TRIPS.forEach((t, i) => { const d = IB.contour(11, R(t[0]), .9 + i * .1); s += `<path class="ring" data-i="${i}" d="${d}"/><path class="hit" data-i="${i}" d="${d}"/>`; });
  s += `<circle class="home" r="5"/><text class="home-t" x="12" y="4">ISOBATH · 白保</text>`;
  isvg.innerHTML = s;
  const rings = $$('.ring', isvg);
  // a label on each ring, at its own angle
  rings.forEach((r, i) => {
    const L = r.getTotalLength(), p = r.getPointAtLength(L * ((.62 + i * .053) % 1)), txt = TRIPS[i][0] < 60 ? TRIPS[i][0] + ' min' : (TRIPS[i][0] / 60).toFixed(1).replace('.0', '') + ' h';
    isvg.insertAdjacentHTML('beforeend', `<g class="lg" data-i="${i}" transform="translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})"><rect x="-4" y="-10" width="${txt.length * 7 + 8}" height="16" fill="#fff"/><text class="lab lab-b" x="0" y="2">${txt}</text></g>`);
  });
  list.innerHTML = TRIPS.map((t, i) => `<li data-i="${i}"><b>${t[0] < 60 ? t[0] + ' min' : (t[0] / 60).toFixed(1).replace('.0', '') + ' h'}</b><span>${t[1]}</span></li>`).join('');
  const lis = $$('li', list);
  const lightOn = (i) => { rings.forEach((r, k) => r.classList.toggle('on', k === i)); lis.forEach((l, k) => l.classList.toggle('on', k === i)); hoverText = i >= 0 ? TRIPS[i][1] : ''; };
  $$('.hit, .lg', isvg).forEach(h => { h.addEventListener('pointerenter', () => lightOn(+h.dataset.i)); h.addEventListener('pointerleave', () => lightOn(-1)); });
  lis.forEach(l => { l.addEventListener('pointerenter', () => lightOn(+l.dataset.i)); l.addEventListener('pointerleave', () => lightOn(-1)); });
  rings.forEach(r => { const L = r.getTotalLength(); r.style.strokeDasharray = L; r.style.strokeDashoffset = L; });
  ScrollTrigger.create({ trigger: '.ic', start: 'top 55%', once: true, onEnter: () => {
    gsap.to(rings, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut', stagger: .15 });
    gsap.from('.lg', { scale: 0, transformOrigin: 'left center', duration: .6, ease: 'back.out(2)', stagger: .15, delay: .8 });
    gsap.from(lis, { autoAlpha: 0, x: -20, duration: .6, stagger: .08, delay: .4 });
  } });
  gsap.from('.ic-t', { scrollTrigger: { trigger: '.ic', start: 'top 70%' }, yPercent: 20, autoAlpha: 0, duration: 1.1, ease: 'expo.out' });

  /* ═════════ 03 · today: the time, the door, the tide ═════════ */
  const jst = () => { const d = new Date(Date.now() + 9 * 36e5); return { h: d.getUTCHours(), m: d.getUTCMinutes(), dow: d.getUTCDay(), t: d.getUTCHours() + d.getUTCMinutes() / 60 }; };
  const clockEl = $('.td-clock b'), openEl = $('.td-open');
  const tick = () => {
    const n = jst();
    clockEl.textContent = `${String(n.h).padStart(2, '0')}:${String(n.m).padStart(2, '0')}`;
    const open = n.dow !== 1 && n.t >= 9 && n.t < 17;
    openEl.classList.toggle('is-open', open);
    $('span', openEl).textContent = open ? `open now · closes at 17:00` : n.dow === 1 ? 'closed · monday, we rest' : n.t < 9 ? `closed · opens at 09:00` : 'closed · see you tomorrow at 09:00';
  };
  tick(); setInterval(tick, 20000);
  // the moon decides the tide: age → when the moon crosses, how strong
  const SYN = 29.530588853, NEW0 = Date.UTC(2000, 0, 6, 18, 14);
  const age = ((Date.now() - NEW0) / 864e5 % SYN + SYN) % SYN;
  const transit = (12 + age / SYN * 24.84) % 24.84, high = (transit + 7.3) % 12.42;
  const amp = .55 + .45 * Math.abs(Math.cos(2 * Math.PI * age / SYN));
  const tide = (t) => 1.05 + amp * Math.cos(2 * Math.PI * (t - high) / 12.42) + .14 * Math.cos(2 * Math.PI * (t - high - 3) / 24.84);
  const tsvg = $('.td-svg'), X = (t) => t / 24 * 1000, Y = (h) => 280 - h / 2.4 * 260, MOAT = .4;
  let g = '';
  for (let h = 0; h <= 2; h += .5) g += `<line class="gr" x1="0" x2="1000" y1="${Y(h)}" y2="${Y(h)}"/><text x="1006" y="${Y(h) + 3}">${h.toFixed(1)} m</text>`;
  let pts = '';
  for (let i = 0; i <= 240; i++) { const t = i / 10; pts += `${i ? 'L' : 'M'}${X(t).toFixed(1)} ${Y(tide(t)).toFixed(1)}`; }
  g += `<path class="wa" d="${pts} L1000 300 L0 300 Z"/><path class="ln" d="${pts}"/>`;
  g += `<line class="mo" x1="0" x2="1000" y1="${Y(MOAT)}" y2="${Y(MOAT)}"/><text class="mot" x="6" y="${Y(MOAT) - 6}">below this you can walk to the reef</text>`;
  const now = jst().t;
  g += `<line class="now" x1="${X(now)}" x2="${X(now)}" y1="0" y2="300"/><text class="nowt" x="${X(now) + 6}" y="14">now · ${tide(now).toFixed(2)} m</text>`;
  tsvg.innerHTML = g;
  // lows and highs of today
  const ext = [];
  for (let i = 1; i < 240; i++) { const a = tide((i - 1) / 10), b = tide(i / 10), c = tide((i + 1) / 10); if (b < a && b < c) ext.push(['low', i / 10, b]); if (b > a && b > c) ext.push(['high', i / 10, b]); }
  const mm = (v) => (Math.abs(v) < .05 ? 0 : v).toFixed(1);
  const hm = (t) => `${String(Math.floor(t)).padStart(2, '0')}:${String(Math.round((t % 1) * 60) % 60).padStart(2, '0')}`;
  const lows = ext.filter(e => e[0] === 'low'), highs = ext.filter(e => e[0] === 'high');
  const walk = lows.filter(l => l[2] < MOAT);
  const kind = amp > .85 ? 'a spring tide: the moon is ' + (age < 4 || age > 25.5 ? 'new' : 'full') + ', the sea goes far out.' : amp < .7 ? 'a neap tide: half moon, the sea barely moves.' : 'an ordinary tide.';
  $('.td-say').innerHTML = `today the sea goes out at ${lows.map(l => `<b>${hm(l[1])}</b> (${mm(l[2])} m)`).join(' and ')}, and comes back in at ${highs.map(h => `<b>${hm(h[1])}</b>`).join(' and ')}. ` +
    (walk.length ? `around ${hm(walk[0][1])} the moat is shallow enough to walk to the reef. ` : 'not low enough today to walk to the reef. ') + kind;
  const tl = $('.ln', tsvg), TL = tl.getTotalLength();
  gsap.fromTo(tl, { strokeDasharray: TL, strokeDashoffset: TL }, { strokeDashoffset: 0, duration: 2, ease: 'power2.inOut', scrollTrigger: { trigger: '.td', start: 'top 55%' } });
  gsap.from('.wa', { opacity: 0, duration: 1.4, delay: .8, scrollTrigger: { trigger: '.td', start: 'top 55%' } });
  tsvg.addEventListener('pointermove', (e) => { const r = tsvg.getBoundingClientRect(), t = Math.max(0, Math.min(24, (e.clientX - r.left) / r.width * 24)); hoverText = `${hm(t)} · ${tide(t).toFixed(2)} m`; });
  tsvg.addEventListener('pointerleave', () => { hoverText = ''; });

  /* ═════════ 04 · the house ═════════ */
  $$('.hs-f').forEach((f, i) => {
    gsap.fromTo($('.hs-ph', f), { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: f, start: 'top 80%' } });
    gsap.to(f, { yPercent: -6 * (i + 1), ease: 'none', scrollTrigger: { trigger: '.hs', start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  gsap.from('.hs-t', { scrollTrigger: { trigger: '.hs', start: 'top 70%' }, yPercent: 20, autoAlpha: 0, duration: 1.1, ease: 'expo.out' });

  /* ═════════ 05 · address, and back up ═════════ */
  gsap.from('.ad-card', { scrollTrigger: { trigger: '.ad', start: 'top 65%' }, y: 50, rotate: 2, autoAlpha: 0, duration: 1.1, ease: 'expo.out' });
  gsap.from('.ad-please li', { scrollTrigger: { trigger: '.ad-please', start: 'top 75%' }, autoAlpha: 0, x: 24, duration: .6, stagger: .08, ease: 'power3.out' });
  const upN = $('.up-n');
  gsap.ticker.add(() => { upN.textContent = IB.fmt(IB.depthAt(scrollY + innerHeight * .5)); });
  $('.up').addEventListener('click', () => {
    // come up slowly: never faster than your bubbles
    const done = () => IB.toast('0 M', 'welcome back to the air. come again.');
    if (IB.lenis) IB.lenis.scrollTo(0, { duration: RM ? .1 : 5, easing: (t) => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2, onComplete: done });
    else { scrollTo({ top: 0, behavior: 'smooth' }); setTimeout(done, 1200); }
  });

  IB.help = () => console.log('IB.depthAt(y)  → how deep a point of the page is (m)\nIB.flood()     → go too deep (or konami)\nthe tide and the moon are worked out live; your position is only used if you press the button');
  addEventListener('load', () => ScrollTrigger.refresh());
})();
