/* ═══════════════════════════════════════════════════════════════
   ISOBATH 等深線 — dive
   concept, design & code by ghostly.grl ♥

   01 come down   the surface is a line. the mouse makes ripples,
                  scroll and the water rises over the page (pinned)
   02 a saturday  hour by hour, sideways, a pixel clock runs (pinned)
   03 bring       nothing. almost.
   04 book        the next eight saturdays, two places each,
                  a boarding slate in pencil (kept in this browser)
   05 next        visit
   ═══════════════════════════════════════════════════════════════ */
(() => {
  const { $, $$, RM, FINE } = IB;
  if (!window.gsap) return;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const H = (a, b = 0) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
  const visible = (el) => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; };

  /* ═════════ 01 · the surface ═════════ */
  const cd = $('.cd'), water = $('.cd-water'), line = $('.cd-line path'), atm = $('.cd-w-n b');
  let W = innerWidth, Hh = cd.offsetHeight, p = 0, t = 0, lastRip = 0;
  const rip = [];
  addEventListener('resize', () => { W = innerWidth; Hh = cd.offsetHeight; });
  const level = () => Hh * (.64 - p * .78);
  const yAt = (x, L) => {
    let y = L + Math.sin(x * .006 + t) * 9 + Math.sin(x * .013 - t * 1.3) * 5;
    for (const r of rip) {
      const age = t - r.t0, d = x - r.x, w = 60 + age * 160;
      y += r.a * Math.exp(-(d * d) / (w * w)) * Math.sin(d * .045 - age * 7) * Math.exp(-age * 1.1);
    }
    return y;
  };
  cd.addEventListener('pointermove', (e) => {
    const r = cd.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, L = level();
    if (Math.abs(y - yAt(x, L)) < 140 && t - lastRip > .12) { rip.push({ x, t0: t, a: 22 * (1 - Math.abs(y - L) / 160) }); lastRip = t; if (rip.length > 8) rip.shift(); }
  });
  cd.addEventListener('click', (e) => { const r = cd.getBoundingClientRect(); rip.push({ x: e.clientX - r.left, t0: t, a: 40 }); });
  const surf = () => {
    if (!visible(cd)) return;
    t += RM ? 0 : .025;
    for (let i = rip.length - 1; i >= 0; i--) if (t - rip[i].t0 > 4) rip.splice(i, 1);
    const L = level(), step = Math.max(12, W / 90);
    let poly = '', d = '';
    for (let x = 0; x <= W + step; x += step) {
      const y = yAt(x, L).toFixed(1);
      poly += `${x.toFixed(0)}px ${y}px,`;
      d += (x ? 'L' : 'M') + x.toFixed(0) + ' ' + y;
    }
    water.style.clipPath = `polygon(${poly}${W}px ${Hh}px,0px ${Hh}px)`;
    line.setAttribute('d', d);
    atm.textContent = (1 + p * .8).toFixed(1);
  };
  gsap.ticker.add(surf);
  // bubbles
  const bub = $('.cd-bub');
  for (let i = 0; i < 22; i++) {
    const s = 4 + H(i, 1) * 14, el = document.createElement('i');
    Object.assign(el.style, { width: s + 'px', height: s + 'px', left: H(i, 2) * 100 + '%', animationDuration: 6 + H(i, 3) * 9 + 's', animationDelay: -H(i, 4) * 12 + 's' });
    el.style.setProperty('--dx', (H(i, 5) - .5) * 80 + 'px');
    bub.appendChild(el);
  }
  ScrollTrigger.create({
    trigger: cd, start: 'top top', end: '+=130%', pin: true, scrub: true,
    onUpdate: (s) => { p = s.progress; document.body.classList.toggle('on-blue', s.isActive && level() < 70); },
    onLeave: () => document.body.classList.remove('on-blue'),
    onLeaveBack: () => document.body.classList.remove('on-blue'),
  });
  // intro
  gsap.set('.cd-t span', { yPercent: 40, autoAlpha: 0 });
  gsap.set('.cd-s, .cd-air-n, .cd-hint, .cd-w-n, .cd-w-s', { autoAlpha: 0 });
  const lvl = { v: 1 };
  IB.ready.then(() => {
    gsap.timeline()
      .to('.cd-t span', { yPercent: 0, autoAlpha: 1, duration: 1.2, ease: 'expo.out', stagger: .12 }, 0)
      .to('.cd-s, .cd-air-n, .cd-hint, .cd-w-n, .cd-w-s', { autoAlpha: 1, duration: .8, stagger: .06 }, .5)
      .add(() => IB.scramble($('.cd-k')), .3)
      // a first splash, so you see it is water
      .add(() => rip.push({ x: W * .3, t0: t, a: 34 }), .7);
  });

  /* ═════════ 02 · a saturday ═════════ */
  const sat = $('.sat'), track = $('.sat-track'), clock = $('.sat-clock b'), hrs = $$('.hr'), bar = $('.sat-bar i');
  const mins = hrs.map(h => { const [a, b] = h.dataset.t.split(':'); return +a * 60 + +b; });
  const dist = () => Math.max(0, track.scrollWidth - innerWidth + innerWidth * .1);
  gsap.to(track, {
    x: () => -dist(), ease: 'none',
    scrollTrigger: {
      trigger: sat, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: .6, invalidateOnRefresh: true,
      onToggle: (s) => document.body.classList.toggle('on-blue', s.isActive),
      onUpdate: (s) => {
        const f = s.progress * (mins.length - 1), i = Math.min(mins.length - 2, Math.floor(f)), m = Math.round(mins[i] + (mins[i + 1] - mins[i]) * (f - i));
        clock.textContent = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
        bar.style.transform = `scaleX(${s.progress})`;
      },
    },
  });
  $$('.hr-ph').forEach((ph, i) => gsap.fromTo(ph, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.2, ease: 'expo.out', delay: i * .05,
    scrollTrigger: { trigger: sat, start: 'top 60%' } }));
  $$('.hr-end .btn').forEach(b => b.addEventListener('click', (e) => { e.preventDefault(); IB.lenis ? IB.lenis.scrollTo('#book', { duration: 1.8 }) : $('#book').scrollIntoView({ behavior: 'smooth' }); }));

  /* ═════════ 03 · bring: we tick our list ═════════ */
  const ours = $$('.br-c:first-child li');
  ScrollTrigger.create({ trigger: '.br-cols', start: 'top 70%', once: true, onEnter: () => ours.forEach((li, i) => setTimeout(() => li.classList.add('ok'), 250 + i * 220)) });
  gsap.from('.br-t', { scrollTrigger: { trigger: '.bring', start: 'top 70%' }, yPercent: 20, autoAlpha: 0, duration: 1.2, ease: 'expo.out' });
  gsap.from('.br-t s', { scrollTrigger: { trigger: '.bring', start: 'top 40%' }, textDecorationColor: 'rgba(21,52,255,0)', duration: .8 });

  /* ═════════ 04 · book ═════════ */
  const MON = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const days = [];
  {
    const d = new Date(); d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7)); // the next saturday, never today
    for (let k = 0; k < 8; k++) { days.push(new Date(d)); d.setDate(d.getDate() + 7); }
  }
  const keyOf = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  // how many places are already taken: soon is busier
  const taken = days.map((d, k) => { const h = H(d.getDate(), d.getMonth()); return k < 2 ? (h < .55 ? 2 : 1) : h < .2 ? 2 : h < .55 ? 1 : 0; });
  let board = IB.get('boarding', null);
  const daysEl = $('.bk-days');
  let sel = -1;
  const leftOf = (k) => 2 - taken[k] - (board && board.key === keyOf(days[k]) ? 1 : 0);
  const renderDays = () => {
    daysEl.innerHTML = days.map((d, k) => {
      const l = leftOf(k);
      return `<button type="button" class="day${k === sel ? ' on' : ''}" data-k="${k}" data-left="${l}" ${l <= 0 ? 'disabled' : ''} role="radio" aria-checked="${k === sel}" data-cur="${l <= 0 ? 'full' : l + ' left'}"><b>${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}</b><span>sat · ${l <= 0 ? 'full' : l + ' left'}</span><i></i></button>`;
    }).join('');
  };
  sel = days.findIndex((_, k) => leftOf(k) > 0);
  renderDays();
  daysEl.addEventListener('click', (e) => { const b = e.target.closest('.day'); if (!b || b.disabled) return; sel = +b.dataset.k; renderDays(); });

  const s2 = $('.slate2'), s2name = $('.s2-name');
  const write = (el, txt) => {
    el.textContent = '';
    if (RM) { el.textContent = txt; return; }
    [...txt].forEach((c, i) => setTimeout(() => { el.textContent += c; }, 60 * i));
  };
  const showBoard = (anim) => {
    if (!board) {
      s2.classList.remove('done'); s2name.textContent = 'your name here';
      $('.s2-no').textContent = '№ —'; $('.s2-day').textContent = 'saturday —'; $('.s2-lv').textContent = '—'; $('.s2-line').textContent = '—';
      return;
    }
    s2.classList.add('done');
    $('.s2-no').textContent = '№ ' + board.no;
    $('.s2-day').textContent = 'saturday ' + board.label;
    $('.s2-lv').textContent = board.lv === 'diver' ? 'diver · the belt, −8 m' : 'snorkeler · the moat, −2 m';
    $('.s2-line').textContent = board.lv === 'diver' ? 'T07 · shiraho · fish census' : 'the moat · sea grass quadrats';
    anim ? write(s2name, board.name) : (s2name.textContent = board.name);
    if (anim) gsap.fromTo(s2, { y: -80, rotate: 6, autoAlpha: 0 }, { y: 0, rotate: -2, autoAlpha: 1, duration: 1.2, ease: 'expo.out' });
  };
  showBoard(false);
  $('.bk-f').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('.bk-in').value.trim();
    if (!name || sel < 0) return;
    const d = days[sel], lv = $('.bk-lv input:checked').value, place = taken[sel] + 1;
    board = { key: keyOf(d), label: `${d.getDate()} ${MON[d.getMonth()]}`, name, lv, no: `ISB-${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-0${place}` };
    IB.set('boarding', board);
    renderDays(); showBoard(true);
    IB.toast('ON BOARD', `saturday ${board.label}, 06:45, end of the pier.`);
  });
  $('.s2-x').addEventListener('click', () => {
    board = null; IB.set('boarding', null); renderDays(); showBoard(false);
    IB.toast('PLACE GIVEN BACK', 'someone else will count your fish.');
  });
  gsap.from('.bk-t', { scrollTrigger: { trigger: '.book', start: 'top 70%' }, yPercent: 20, autoAlpha: 0, duration: 1.1, ease: 'expo.out' });
  gsap.from('.day', { scrollTrigger: { trigger: '.bk-days', start: 'top 85%' }, autoAlpha: 0, y: 16, stagger: .05, duration: .6, ease: 'power3.out' });

  /* ═════════ 05 · next ═════════ */
  gsap.from('.nx-t', { scrollTrigger: { trigger: '.next', start: 'top 65%' }, yPercent: 30, autoAlpha: 0, duration: 1.1, ease: 'expo.out' });
  gsap.from('.nx-strip', { scrollTrigger: { trigger: '.next', start: 'top 45%' }, scaleX: 0, transformOrigin: 'left', duration: 1, ease: 'expo.inOut' });

  IB.help = () => console.log('IB.depthAt(y)  → how deep a point of the page is (m)\nIB.flood()     → go too deep (or konami)\nclick the surface → a splash\nlocalStorage ib-boarding → your place on the boat');
  addEventListener('load', () => ScrollTrigger.refresh());
})();
