/* ═══════════════════════════════════════════════════════════════
   ISOBATH 等深線 — logbook
   concept, design & code by ghostly.grl ♥

   01 the year    365 squares; hover reads a day, click opens its page
   02 one page    the entry, signed, with its dive profile drawn in
   03 water       the temperature at −5 m, and the days above thirty
   04 lines       the last page is for you (kept in this browser)
   05 next        dive

   the year is made up the same way every time (seeded), so a day
   always says the same thing.
   ═══════════════════════════════════════════════════════════════ */
(() => {
  const { $, $$, RM, FINE } = IB;
  if (!window.gsap) return;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const H = (a, b = 0) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
  const pick = (arr, h) => arr[Math.floor(h * arr.length) % arr.length];
  let hoverText = '';
  IB.curText = () => hoverText;

  /* ═════════ the year, made up once ═════════ */
  const Y = 2026, DAY = 864e5, JAN1 = Date.UTC(Y, 0, 1);
  const MON = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const dateOf = (d) => new Date(JAN1 + d * DAY);
  const doy = (m, dd) => Math.round((Date.UTC(Y, m, dd) - JAN1) / DAY);
  const fmtD = (d, long) => { const t = dateOf(d); return long ? `${String(t.getUTCDate()).padStart(2, '0')}.${String(t.getUTCMonth() + 1).padStart(2, '0')}.${Y}` : `${t.getUTCDate()} ${MON[t.getUTCMonth()]}`; };
  const now = new Date(), todayIdx = now.getUTCFullYear() > Y ? 400 : now.getUTCFullYear() < Y ? -1 : Math.floor((Date.UTC(Y, now.getUTCMonth(), now.getUTCDate()) - JAN1) / DAY);

  // water at −5 m: cold in february, warm in august, and the heat of mid august
  const temp = (d) => 25.2 - 3.4 * Math.cos(2 * Math.PI * (d - 22) / 365) + 2.5 * Math.exp(-(((d - 226) / 7.5) ** 2)) + (H(d, 3) - .5) * .5;
  const CLOSED = [[0, 12, 13], [1, 3, 3], [1, 17, 18], [2, 9, 9], [6, 9, 12], [7, 1, 4], [7, 27, 31], [8, 14, 17], [9, 6, 8]];
  const closed = new Set();
  CLOSED.forEach(([m, a, b]) => { for (let k = a; k <= b; k++) closed.add(doy(m, k)); });
  const AFTER = new Set([...closed].map(d => d + 1).filter(d => !closed.has(d)));
  const SPAWN = [doy(4, 4), doy(4, 5), doy(4, 6)], DEEP = doy(8, 22);

  const SITES = [
    ['SHIRAHO', '白保', [5, 12], 'fish census, belt T07'],
    ['SHIRAHO WALL', '白保 外礁', [18, 32], 'soundings on the wall, 40 points'],
    ['KABIRA ISHIZAKI', '川平石崎', [10, 18], 'manta id photos'],
    ['YONARA CHANNEL', 'ヨナラ水道', [8, 20], 'drift census, the current'],
    ['SEKISEI CENTRE', '石西礁湖', [3, 6], 'coral transect, point intercept'],
    ['KUROSHIMA ROAD', '黒島', [5, 15], 'turtle count, sea grass quadrats'],
    ['NAGURA AMPARU', '名蔵アンパル', [1, 2], 'juvenile fish in the mangrove'],
  ];
  const TEAM = ['aki', 'mio', 'kenta', 'yui', 'sora', 'haru', 'nao', 'rin', 'taro', 'emi', 'captain oshiro'];
  const NOTES = [
    'the water was flat enough to read. we read it.',
    'two mantas at the station, waiting their turn like at the post office.',
    'a turtle followed the tape for ten metres, then lost interest.',
    'counted 412 chromis in one coral head. counted again: 409.',
    'the pencil broke at 14 m. we counted in our heads.',
    'visibility like air. you could see the boat from the bottom.',
    'a parrotfish kept eating the reef right next to the tape. good.',
    'three crown-of-thorns on the table coral. removed, bagged, counted.',
    'the current took us past the end of the tape. we swam back.',
    'the sea grass is longer than last month. the turtles disagree.',
    'the captain sang on the way back. nobody asked.',
    'a white patch on the crest, two metres wide. we marked it on the map.',
    'a giant clam closed when our shadow passed over. fair.',
    'rain on the surface, silence below.',
    'a school of snapper went round us twice, then left.',
    'five new coral recruits on the old table, each the size of a coin.',
    'two visitors today. one cried at the first manta. so did we, the first time.',
    'a cuttlefish changed colour three times while we wrote its number.',
    'the tide turned early. we finished the line anyway, slowly.',
    'nothing special. that’s the best kind of day.',
  ];

  // which days we dived: every open day that has passed, ranked, the first 214
  const open = [];
  for (let d = 0; d < 365; d++) {
    const dow = dateOf(d).getUTCDay();
    if (dow === 1 || closed.has(d) || d > todayIdx) continue;
    open.push(d);
  }
  const must = new Set([...SPAWN, DEEP, ...AFTER].filter(d => open.includes(d)));
  const ranked = open.filter(d => !must.has(d)).sort((a, b) => H(a, 9) - H(b, 9));
  const dived = new Set([...must, ...ranked.slice(0, Math.max(0, 214 - must.size))]);

  const LOG = [];
  [...dived].sort((a, b) => a - b).forEach((d, i) => {
    const h = (k) => H(d, k);
    const spawn = SPAWN.includes(d), deep = d === DEEP, night = spawn || h(1) < .035;
    let s = deep ? SITES[1] : spawn ? SITES[0] : SITES[Math.floor(h(2) * (h(3) < .12 ? 7 : 7)) % 7];
    if (s === SITES[1] && !deep && h(4) < .6) s = SITES[0];
    const depth = deep ? 37 : +(s[2][0] + h(5) * (s[2][1] - s[2][0])).toFixed(1);
    const time = s === SITES[6] ? 30 + (h(6) * 15 | 0) : 40 + (h(6) * 23 | 0);
    const t = temp(d);
    const team = [...new Set([pick(TEAM.slice(0, 10), h(7)), pick(TEAM.slice(0, 10), h(8)), h(9) < .4 ? pick(TEAM.slice(0, 10), h(10)) : null].filter(Boolean))];
    let note = pick(NOTES, h(11)), task = s[3];
    if (spawn) { note = d === SPAWN[1] ? 'the reef let go at 21:52. snow, falling up. nobody spoke on the boat.' : d === SPAWN[0] ? 'spawning watch. a few colonies setting, pink at the mouths. not tonight.' : 'the last of it. bundles still on the surface at midnight, a pink skin on the sea.'; task = 'spawning watch'; }
    else if (deep) { note = 'the deepest line of the year: 37 m on the outer wall. below it, only blue.'; task = 'the 37 m isobath'; }
    else if (t > 30) { note = `water at ${t.toFixed(1)} °C. the acropora is pale at the tips. we photographed every colony on the line.`; task = 'bleaching watch'; }
    else if (AFTER.has(d)) note = 'first dive after the storm. rubble everywhere. the reef is still there.';
    const hh = night ? 20 + (h(12) * 2 | 0) : 7 + (h(12) * 3 | 0), mm = (h(13) * 6 | 0) * 10;
    LOG.push({
      d, i, site: s, depth, time, temp: t, night, spawn, deep,
      vis: s === SITES[6] ? 2 + (h(14) * 4 | 0) : 12 + (h(14) * 24 | 0),
      cur: +(s === SITES[3] ? .8 + h(15) * 1.4 : h(15) * .9).toFixed(1),
      in: `${String(hh).padStart(2, '0')}:${String(night ? 30 + mm % 30 : mm).padStart(2, '0')}`,
      team, task, note, sign: team[0], img: 'LOGBOOK/l' + (night ? 5 : [1, 2, 3, 4, 6][Math.floor(h(16) * 5)]) + '.jpg', // night dives get the night photo
    });
  });
  const byDay = new Map(LOG.map(e => [e.d, e]));
  const lineOf = (e) => `${e.site[0].toLowerCase()} · −${e.depth} m · ${e.time} min · ${e.temp.toFixed(1)} °C — ${e.note}`;

  /* ═════════ 01 · the year ═════════ */
  const grid = $('.yr-g'), yline = $('.yr-line');
  const lead = (dateOf(0).getUTCDay() + 5) % 7; // rows start on tuesday
  let html = '';
  for (let k = 0; k < lead; k++) html += '<i class="blank"></i>';
  for (let d = 0; d < 365; d++) {
    const e = byDay.get(d), dow = dateOf(d).getUTCDay();
    let c = d > todayIdx ? 'future' : closed.has(d) ? 'closed' : dow === 1 ? 'off' : e ? (e.night ? 'dive night' : 'dive ' + (e.depth > 20 ? 'd3' : e.depth > 10 ? 'd2' : '')) : 'off';
    if (e && (e.spawn || e.deep || e.temp > 30)) c += ' special';
    html += `<i class="${c}" data-d="${d}"></i>`;
  }
  grid.innerHTML = html;
  // month labels over the weeks they start in
  const ym = $('.yr-m');
  for (let m = 0; m < 12; m++) { const col = Math.floor((doy(m, 1) + lead) / 7); ym.insertAdjacentHTML('beforeend', `<span style="left:${col / 53 * 100}%">${MON[m]}</span>`); }
  const cells = $$('i[data-d]', grid);
  const say = (d) => {
    const e = byDay.get(d), dow = dateOf(d).getUTCDay();
    const t = d > todayIdx ? 'not yet. the sea will tell.' : closed.has(d) ? 'sea closed. typhoon or north wind. we stayed on land and cleaned the slates.' : dow === 1 ? 'monday. the boat rests, so do we.' : e ? lineOf(e) : 'no dive. paperwork, and the coffee machine.';
    yline.innerHTML = `<b>${fmtD(d, true)}</b><span></span>`; $('span', yline).textContent = t;
    hoverText = e ? 'open ' + fmtD(d) : fmtD(d);
  };
  grid.addEventListener('pointerover', (ev) => { const c = ev.target.closest('i[data-d]'); if (c) say(+c.dataset.d); });
  grid.addEventListener('pointerleave', () => { hoverText = ''; });
  grid.addEventListener('click', (ev) => {
    const c = ev.target.closest('i[data-d]'); if (!c) return;
    const e = byDay.get(+c.dataset.d);
    if (!e) { IB.toast('NO PAGE', 'we didn’t dive that day.'); return; }
    show(e.i, true);
    const target = $('#page');
    if (IB.lenis) IB.lenis.scrollTo(target, { duration: 1.6 }); else target.scrollIntoView({ behavior: 'smooth' });
  });

  // the numbers
  const hours = Math.round(LOG.reduce((a, e) => a + e.time, 0) / 60), nClosed = [...closed].filter(d => d <= todayIdx).length;
  const NUM = { dives: LOG.length, hours, closed: nClosed };
  // intro
  const tw = $('.yr-t .w');
  tw.innerHTML = tw.textContent.split('').map(c => `<span class="ch">${c}</span>`).join('');
  gsap.set('.yr-t .ch', { yPercent: 100, autoAlpha: 0 });
  gsap.set(cells, { scale: 0 });
  gsap.set('.yr-s, .yr-n p, .yr-key, .yr-line, .yr-t em', { autoAlpha: 0, y: 12 });
  IB.ready.then(() => {
    const tl = gsap.timeline();
    tl.to('.yr-t .ch', { yPercent: 0, autoAlpha: 1, duration: .9, ease: 'steps(4)', stagger: .07 }, 0)
      .to('.yr-t em, .yr-s, .yr-n p', { autoAlpha: 1, y: 0, duration: .8, ease: 'power3.out', stagger: .07 }, .3)
      // the year fills in, week by week
      .to(cells, { scale: 1, duration: .35, ease: 'back.out(3)', stagger: { each: RM ? 0 : .0035 } }, .4)
      .to('.yr-key, .yr-line', { autoAlpha: 1, y: 0, duration: .7, ease: 'power3.out' }, 1.2);
    $$('.yr-n b').forEach(b => { const o = { v: 0 }, n = NUM[b.dataset.k]; tl.to(o, { v: n, duration: 1.6, ease: 'power2.out', onUpdate: () => { b.textContent = Math.round(o.v); } }, .5); });
  });

  /* ═════════ 02 · one page ═════════ */
  const sheet = $('.sheet'), svg = $('.prof-svg'), ph = $('.pg-ph');
  const F = (k) => $(`[data-f="${k}"]`, sheet);
  let cur = LOG.length - 1;
  const profile = (e) => {
    const D = e.depth, T = e.time, axis = Math.max(10, Math.ceil((D + 2) / 5) * 5);
    const x = (t) => 40 + t / T * 545, y = (d) => 16 + d / axis * 220;
    let g = '';
    for (let d = 0; d <= axis; d += 5) g += `<line class="gr" x1="40" x2="585" y1="${y(d)}" y2="${y(d)}"/><text x="2" y="${y(d) + 3}">${d ? '−' + d : 0} m</text>`;
    for (let t = 0; t <= T; t += 10) g += `<text x="${x(t) - 6}" y="254">${t}′</text>`;
    const h = (k) => H(e.d, 40 + k);
    const pts = [[0, 0], [2.5 + h(1) * 2, D], [T * .3, D * (.85 + h(2) * .15)], [T * .45, D * (.7 + h(3) * .1)], [T * .62, D * (.5 + h(4) * .12)], [T * .78, Math.max(3.5, D * .32)], [T - 5, 3], [T - 2, 3], [T, 0]];
    const p = pts.map(([t, d], i) => `${i ? 'L' : 'M'}${x(t).toFixed(1)} ${y(d).toFixed(1)}`).join(' ');
    svg.innerHTML = g + `<path class="ar" d="${p} L${x(T)} ${y(0)} Z"/><path class="ln" d="${p}"/>` +
      `<rect class="stop" x="${x(T - 5)}" y="${y(3) - 2}" width="${x(T - 2) - x(T - 5)}" height="4"/><text x="${x(T - 5) - 30}" y="${y(3) + 16}" style="fill:#ff5a3c">safety stop 3′</text>` +
      `<text x="${x(pts[1][0]) + 6}" y="${y(D) + 14}" style="fill:#1534ff">−${D} m</text>`;
    const ln = $('.ln', svg), L = ln.getTotalLength();
    gsap.fromTo(ln, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: RM ? 0 : 1.6, ease: 'power2.inOut' });
    gsap.fromTo($('.ar', svg), { opacity: 0 }, { opacity: 1, duration: 1.2, delay: .6 });
  };
  const show = (i, anim) => {
    cur = (i + LOG.length) % LOG.length;
    const e = LOG[cur];
    $('.pg-no b').textContent = String(e.i + 1).padStart(3, '0');
    $('.sh-date').textContent = fmtD(e.d, true);
    $('.sh-site').innerHTML = ''; $('.sh-site').append(e.site[0], document.createElement('br'), e.site[1]);
    F('in').textContent = e.in + (e.night ? ' · night' : '');
    F('depth').textContent = '−' + e.depth + ' m';
    F('time').textContent = e.time + ' min';
    F('vis').textContent = e.vis + ' m';
    F('temp').textContent = e.temp.toFixed(1) + ' °C';
    F('cur').textContent = e.cur + ' kn';
    F('team').textContent = e.team.join(', ');
    F('task').textContent = e.task;
    $('.sh-note').textContent = e.note;
    $('.sh-sig span').textContent = e.sign;
    if (ph.dataset.img !== e.img) { ph.dataset.img = e.img; IB.fillSlot(ph); }
    cells.forEach(c => c.classList.toggle('on', +c.dataset.d === e.d));
    if (anim !== false) gsap.fromTo('.sheet .sh-f dd, .sh-note, .sh-date', { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: .5, stagger: .03, ease: 'power3.out' });
    profile(e);
  };
  show(cur, false);
  $('.pg-prev').addEventListener('click', () => show(cur - 1));
  $('.pg-next').addEventListener('click', () => show(cur + 1));
  addEventListener('keydown', (ev) => {
    const r = $('.pg').getBoundingClientRect(); if (r.top > innerHeight * .5 || r.bottom < innerHeight * .5) return;
    if (ev.key === 'ArrowLeft') show(cur - 1); if (ev.key === 'ArrowRight') show(cur + 1);
  });
  gsap.from('.sheet', { scrollTrigger: { trigger: '.pg', start: 'top 70%' }, y: 60, rotate: -2, autoAlpha: 0, duration: 1.1, ease: 'expo.out' });
  gsap.from('.pg-right', { scrollTrigger: { trigger: '.pg', start: 'top 60%' }, y: 40, autoAlpha: 0, duration: 1.1, ease: 'expo.out' });
  ScrollTrigger.create({ trigger: '.pg', start: 'top 55%', once: true, onEnter: () => profile(LOG[cur]) });

  /* ═════════ 03 · water ═════════ */
  const ws = $('.wt-svg'), wread = $('.wt-read');
  const wx = (d) => d / 364 * 1000, wy = (t) => 330 - (t - 20) / 12 * 300;
  let g = '', hot = 0, run = null;
  for (let t = 20; t <= 32; t += 2) g += `<line class="gr" x1="0" x2="1000" y1="${wy(t)}" y2="${wy(t)}"/><text class="yl" x="1004" y="${wy(t) + 3}">${t}°</text>`;
  for (let d = 0; d <= 365; d++) {
    const over = d < 365 && temp(d) > 30;
    if (over) { hot++; if (run === null) run = d; }
    else if (run !== null) { g += `<rect class="hot" x="${wx(run)}" y="0" width="${wx(d) - wx(run)}" height="330"/>`; run = null; }
  }
  const path = Array.from({ length: 365 }, (_, d) => `${d ? 'L' : 'M'}${wx(d).toFixed(1)} ${wy(temp(d)).toFixed(1)}`).join(' ');
  g += `<line class="th" x1="0" x2="1000" y1="${wy(30)}" y2="${wy(30)}"/><text class="tht" x="6" y="${wy(30) - 6}">30 °C · the coral starts to bleach</text>`;
  g += `<path class="tl" d="${path}"/><line class="mk" x1="0" x2="0" y1="0" y2="330" style="opacity:0"/>`;
  ws.innerHTML = g;
  $('.wt-days').textContent = hot;
  $('.wt-x').innerHTML = MON.map(m => `<span>${m}</span>`).join('');
  const tl_ = $('.tl', ws), TL = tl_.getTotalLength();
  gsap.set(tl_, { strokeDasharray: TL, strokeDashoffset: TL });
  gsap.to(tl_, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '.wt-chart', start: 'top 80%', end: 'bottom 45%', scrub: .6 } });
  gsap.from('.hot', { scrollTrigger: { trigger: '.wt-chart', start: 'top 40%' }, opacity: 0, duration: 1 });
  const chart = $('.wt-chart'), mk = $('.mk', ws);
  chart.addEventListener('pointermove', (ev) => {
    const r = ws.getBoundingClientRect(), d = Math.round(clamp((ev.clientX - r.left) / r.width) * 364), t = temp(d);
    mk.setAttribute('x1', wx(d)); mk.setAttribute('x2', wx(d)); mk.style.opacity = 1;
    wread.textContent = `${fmtD(d)} · ${t.toFixed(1)} °C${t > 30 ? ' · too warm' : ''}`;
    gsap.set(wread, { x: ev.clientX - chart.getBoundingClientRect().left + 12, y: (wy(t) / 360) * r.height - 28, opacity: 1 });
    hoverText = `${fmtD(d)} · ${t.toFixed(1)} °C`;
  });
  chart.addEventListener('pointerleave', () => { mk.style.opacity = 0; wread.style.opacity = 0; hoverText = ''; });
  gsap.from('.wt-t', { scrollTrigger: { trigger: '.wt', start: 'top 70%' }, yPercent: 20, autoAlpha: 0, duration: 1.1, ease: 'expo.out' });

  /* ═════════ 04 · lines ═════════ */
  const SEED = [
    ['14.03.2026', 'a visitor from osaka', 'i didn’t know fish could look at you like that.'],
    ['02.05.2026', 'mio', 'first night dive. the torch went off and the sea was full of stars.'],
    ['06.05.2026', 'captain oshiro', 'forty years on this boat. it still surprises me every may.'],
    ['21.06.2026', 'lena, berlin', 'counted eleven butterflyfish. they counted me too, i think.'],
    ['15.08.2026', 'kenta', 'the water was a bath. the coral looked tired. we wrote it all down.'],
    ['30.09.2026', 'a child, 9', 'the turtle was bigger than me!!'],
    ['19.10.2026', 'anonymous', 'thank you for letting me hold the pencil.'],
    ['08.11.2026', 'yui', 'a little blue coming back on the old table. small. but there.'],
  ];
  const list = $('.ln-list'), mine = IB.get('lines', []);
  const add = (d, n, t, me, top) => {
    const li = document.createElement('li'); if (me) li.className = 'mine';
    li.innerHTML = '<span class="d"></span><span class="n"></span><span class="t"></span>';
    $('.d', li).textContent = d; $('.n', li).textContent = n || 'anonymous'; $('.t', li).textContent = t;
    top ? list.prepend(li) : list.append(li);
    return li;
  };
  [...SEED.map(s => [...s, false]), ...mine.map(m => [m[0], m[1], m[2], true])].sort((a, b) => b[0].split('.').reverse().join('').localeCompare(a[0].split('.').reverse().join(''))).forEach(l => add(l[0], l[1], l[2], l[3]));
  const txt = $('.ln-txt'), cnt = $('.ln-cnt b');
  txt.addEventListener('input', () => { cnt.textContent = txt.value.length; });
  $('.ln-f').addEventListener('submit', (ev) => {
    ev.preventDefault();
    const t = txt.value.trim(); if (!t) return;
    const n = $('.ln-name').value.trim(), dt = new Date(), d = `${String(dt.getDate()).padStart(2, '0')}.${String(dt.getMonth() + 1).padStart(2, '0')}.${dt.getFullYear()}`;
    mine.push([d, n, t]); IB.set('lines', mine.slice(-20));
    const li = add(d, n, t, true, true);
    list.scrollTop = 0;
    gsap.from(li, { autoAlpha: 0, y: -16, backgroundColor: 'rgba(255,255,255,.25)', duration: 1, ease: 'expo.out' });
    txt.value = ''; cnt.textContent = 0;
    IB.toast('WRITTEN', 'your line is in the logbook.');
  });
  gsap.from('.ln-list li', { scrollTrigger: { trigger: '.lines', start: 'top 55%' }, autoAlpha: 0, x: 30, duration: .7, stagger: .06, ease: 'power3.out' });
  gsap.from('.ln-t', { scrollTrigger: { trigger: '.lines', start: 'top 70%' }, yPercent: 20, autoAlpha: 0, duration: 1.1, ease: 'expo.out' });

  /* ═════════ 05 · next ═════════ */
  gsap.from('.nx-t', { scrollTrigger: { trigger: '.next', start: 'top 65%' }, yPercent: 30, autoAlpha: 0, duration: 1.1, ease: 'expo.out' });
  gsap.from('.nx-strip', { scrollTrigger: { trigger: '.next', start: 'top 45%' }, scaleX: 0, transformOrigin: 'left', duration: 1, ease: 'expo.inOut' });

  IB.help = () => console.log('IB.depthAt(y)  → how deep a point of the page is (m)\nIB.flood()     → go too deep (or konami)\nIB.log         → every dive of the year\nlocalStorage ib-lines → the lines you wrote');
  IB.log = LOG;
  addEventListener('load', () => ScrollTrigger.refresh());
})();
