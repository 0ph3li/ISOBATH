/* ═══════════════════════════════════════════════════════════════
   ISOBATH 等深線 — shared engine (window.IB)
   concept, design & code by ghostly.grl ♥

   image slots, lenis, the sounding cursor (reads depth where it points),
   the depth gauge, scramble, magnetic, marquee strips, glass lenses,
   contour lines, toast for pages still underwater, tab title,
   konami flood, loader (a sounding), console
   ═══════════════════════════════════════════════════════════════ */
(() => {
  const IB = (window.IB = {});
  const RM = (IB.RM = matchMedia('(prefers-reduced-motion: reduce)').matches);
  const FINE = (IB.FINE = matchMedia('(hover: hover) and (pointer: fine)').matches);
  const $ = (IB.$ = (s, r = document) => r.querySelector(s));
  const $$ = (IB.$$ = (s, r = document) => [...r.querySelectorAll(s)]);
  IB.get = (k, d) => { try { const v = localStorage.getItem('ib-' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
  IB.set = (k, v) => { try { localStorage.setItem('ib-' + k, JSON.stringify(v)); } catch (e) {} };
  IB.MAX = 40; // the page is a dive: top of the page is 0 m, the footer is −40 m
  if (window.gsap && window.ScrollTrigger) { gsap.registerPlugin(ScrollTrigger); ScrollTrigger.clearScrollMemory('manual'); }
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  scrollTo(0, 0);
  addEventListener('load', () => { scrollTo(0, 0); IB.lenis && IB.lenis.scrollTo(0, { immediate: true }); });

  /* ═══════════════ image slots ═══════════════ */
  IB.fillSlot = (el) => {
    const path = el.dataset.img;
    el.classList.remove('has-img');
    $$(':scope > img', el).forEach(i => i.remove());
    el.dataset.label = path ? 'img/' + path + (el.dataset.note ? ' — ' + el.dataset.note : '') : (el.dataset.note || '');
    if (!path) return;
    const base = path.replace(/\.(jpe?g|png|webp)$/i, '');
    const tries = [path, base + '.png', base + '.webp', base + '.jpeg'].filter((v, i, a) => a.indexOf(v) === i);
    const go = (i) => {
      if (i >= tries.length || el.dataset.img !== path) return;
      const im = new Image(); im.alt = ''; im.decoding = 'async';
      im.onload = () => {
        if (el.dataset.img !== path) return;
        el.prepend(im); el.classList.add('has-img');
        el.dispatchEvent(new CustomEvent('ib:img', { detail: im }));
      };
      im.onerror = () => go(i + 1);
      im.src = 'img/' + tries[i];
    };
    go(0);
  };
  $$('.slot[data-img]').forEach(IB.fillSlot);

  /* ═══════════════ lenis ═══════════════ */
  if (window.Lenis && !RM) {
    const lenis = (IB.lenis = new Lenis({ duration: 1.3, easing: t => 1 - Math.pow(1 - t, 4), smoothWheel: true }));
    if (window.ScrollTrigger) { lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const t = $(a.getAttribute('href')); if (t) { e.preventDefault(); lenis.scrollTo(t, { duration: 2 }); } }));
  }

  /* ═══════════════ pointer ═══════════════ */
  IB.mx = innerWidth / 2; IB.my = innerHeight / 2;
  addEventListener('pointermove', e => { IB.mx = e.clientX; IB.my = e.clientY; }, { passive: true });

  /* depth of any point of the page (0 at the top, −40 m at the bottom) */
  IB.depthAt = (pageY) => Math.max(0, Math.min(1, pageY / Math.max(1, document.documentElement.scrollHeight - 1))) * IB.MAX;
  IB.fmt = (d) => '−' + d.toFixed(1).padStart(4, '0');

  /* ═══════════════ cursor: a sounding crosshair ═══════════════ */
  const cur = $('.cur');
  if (cur && FINE && window.gsap) {
    const lab = $('span', cur);
    const qx = gsap.quickTo(cur, 'x', { duration: .25, ease: 'power3' }), qy = gsap.quickTo(cur, 'y', { duration: .25, ease: 'power3' });
    let hint = '';
    addEventListener('pointermove', e => { qx(e.clientX); qy(e.clientY); });
    document.addEventListener('pointerover', e => {
      const t = e.target.closest('[data-cur]');
      cur.classList.toggle('big', !!t);
      hint = t ? t.dataset.cur : '';
    });
    // a page can read its own depth under the cursor (IB.curText returns a string or nothing)
    gsap.ticker.add(() => { lab.dataset.t = (IB.curText && IB.curText()) || hint || IB.fmt(IB.depthAt(scrollY + IB.my)) + ' m'; });
  }

  /* ═══════════════ the gauge: how deep you are, which section ═══════════════ */
  const gauge = $('.gauge'), secs = $$('[data-sec]');
  if (gauge) {
    const gd = $('.g-d', gauge), gi = $$('.g-i i', gauge), gb = $('.g-bar', gauge);
    gi[1].textContent = String(secs.length).padStart(2, '0');
    const upd = () => {
      const max = document.documentElement.scrollHeight - innerHeight, p = max > 0 ? scrollY / max : 0;
      gd.textContent = IB.fmt(p * IB.MAX);
      gb.style.setProperty('--p', p.toFixed(4));
      let cur = secs[0];
      for (const s of secs) if (s.getBoundingClientRect().top < innerHeight * .5) cur = s;
      if (cur) gi[0].textContent = cur.dataset.sec;
    };
    window.gsap ? gsap.ticker.add(upd) : addEventListener('scroll', upd);
  }
  /* sections painted blue turn the chrome white */
  if (window.ScrollTrigger) $$('[data-blue]').forEach(s => ScrollTrigger.create({ trigger: s, start: 'top 40px', end: 'bottom 40px', refreshPriority: -1, // after the pins above them
    onToggle: x => document.body.classList.toggle('on-blue', x.isActive) }));

  /* ═══════════════ scramble ═══════════════ */
  const GLY = '0123456789°′−.NE海線深';
  IB.scramble = (el, txt = el.dataset.text || el.textContent) => {
    el.dataset.text = txt;
    if (RM) { el.textContent = txt; return; }
    clearInterval(el._s);
    let f = 0; const n = 16;
    el._s = setInterval(() => {
      el.textContent = txt.split('').map((c, i) => i < (f / n) * txt.length || c === ' ' ? c : GLY[Math.random() * GLY.length | 0]).join('');
      if (++f > n) { clearInterval(el._s); el.textContent = txt; }
    }, 34);
  };
  if (window.ScrollTrigger) $$('[data-scramble]').forEach(el => {
    el.dataset.text = el.textContent;
    ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => IB.scramble(el) });
  });

  /* ═══════════════ magnetic ═══════════════ */
  if (FINE && window.gsap) $$('[data-magnetic]').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * .3, y: (e.clientY - r.top - r.height / 2) * .3, duration: .5, ease: 'power3' });
    });
    el.addEventListener('pointerleave', () => gsap.to(el, { x: 0, y: 0, duration: .8, ease: 'elastic.out(1,.4)' }));
  });

  /* ═══════════════ marquee strips (one clock, so lens copies stay in sync) ═══════════════ */
  IB.t0 = performance.now();
  IB.velo = 0;
  const rows = [];
  IB.marquee = (root = document) => {
    $$('.row[data-mq]', root).forEach(r => {
      if (r._mq) return; r._mq = 1;
      const s = r.firstElementChild;
      // repeat until it is wider than two screens, so the loop never shows a gap
      const one = s.outerHTML; let n = 1;
      while (r.scrollWidth < innerWidth * 2.2 && n < 30) { r.insertAdjacentHTML('beforeend', one); n++; }
      r._unit = s.getBoundingClientRect().width || 1;
      rows.push(r);
    });
  };
  IB.marquee();
  let off = 0;
  const mq = () => {
    if (!RM) off += 1 / 60 * (1 + Math.min(6, Math.abs(IB.velo) * .004));
    for (const r of rows) {
      if (!r.isConnected) continue;
      const v = +r.dataset.mq, u = r._unit;
      let x = (off * v) % u; if (x > 0) x -= u;
      r.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
    }
  };
  if (window.gsap) gsap.ticker.add(mq); else mq();
  if (IB.lenis) IB.lenis.on('scroll', e => { IB.velo = e.velocity * 60; });

  /* ═══════════════ glass lens: a drop that magnifies what is behind it ═══════════════
     stage = the box both live in, src = the thing behind, lens = the .drop, s = zoom */
  IB.lens = (stage, src, lens, s = 1.45) => {
    const wrap = document.createElement('div'); wrap.className = 'lens-c';
    const c = src.cloneNode(true); c.removeAttribute('id'); c.setAttribute('aria-hidden', 'true');
    $$('[data-mq]', c).forEach(r => { r._mq = 0; });
    wrap.appendChild(c); lens.prepend(wrap);
    // clone rows join the same clock: copy their unit once the originals are measured
    const cr = $$('.row[data-mq]', c), or = $$('.row[data-mq]', src);
    cr.forEach((r, i) => { r._mq = 1; r._unit = or[i] ? or[i]._unit : 1; rows.push(r); });
    const L = { s, update() {
      const sr = stage.getBoundingClientRect(), lr = lens.getBoundingClientRect(), qr = src.getBoundingClientRect();
      const lx = lr.left - sr.left, ly = lr.top - sr.top, cx = lx + lr.width / 2, cy = ly + lr.height / 2;
      c.style.left = (qr.left - sr.left) + 'px'; c.style.top = (qr.top - sr.top) + 'px'; c.style.width = qr.width + 'px'; c.style.height = qr.height + 'px';
      wrap.style.width = sr.width + 'px'; wrap.style.height = sr.height + 'px';
      wrap.style.transformOrigin = `${cx}px ${cy}px`;
      wrap.style.transform = `translate(${-lx}px,${-ly}px) scale(${L.s})`;
    } };
    return L;
  };

  /* ═══════════════ contour lines (isobaths) around one point ═══════════════ */
  IB.contour = (seed, r, k = 1) => {
    // a closed wobbly ring: radius made of a few slow sines, the same seed gives the same island
    const rnd = (i) => { const x = Math.sin(seed * 91.7 + i * 47.3) * 43758.5453; return x - Math.floor(x); };
    const H = [2, 3, 5, 7].map((f, i) => ({ f, a: (.05 + rnd(i) * .09) * k / (i * .6 + 1), p: rnd(i + 9) * 6.28 }));
    let d = '';
    for (let i = 0; i <= 96; i++) {
      const t = i / 96 * Math.PI * 2;
      let m = 1; for (const h of H) m += h.a * Math.sin(h.f * t + h.p);
      const x = Math.cos(t) * r * m * 1.18, y = Math.sin(t) * r * m * .86;
      d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
    }
    return d + 'Z';
  };

  /* ═══════════════ links to pages still underwater ═══════════════ */
  const toast = $('.toast');
  IB.toast = (k, txt) => {
    if (!toast || !window.gsap) return;
    toast.innerHTML = `<b>${k}</b><span>${txt}</span>`;
    gsap.killTweensOf(toast);
    gsap.timeline().to(toast, { autoAlpha: 1, duration: .4, ease: 'power3.out' }).to(toast, { autoAlpha: 0, duration: .6 }, '+=1.8');
  };
  // the pages that exist (add each new page here). a fixed list, so it also works opened as a file
  IB.PAGES = ['index.html', 'reef.html', 'census.html', 'logbook.html', 'dive.html', 'visit.html'];
  const here = location.pathname.split('/').pop() || 'index.html';
  $$('a[href$=".html"]').forEach(a => {
    const href = a.getAttribute('href');
    if (href === here) a.classList.add('here');
    if (!IB.PAGES.includes(href)) a.addEventListener('click', e => { e.preventDefault(); IB.toast('−40 M', 'this page is still underwater. it surfaces soon.'); });
  });
  const mbtn = $('.mbtn');
  if (mbtn) mbtn.addEventListener('click', () => { const o = document.documentElement.classList.toggle('nav-open'); mbtn.textContent = o ? 'CLOSE' : 'MENU'; });

  /* ═══════════════ footer: the poem floats, the name rises (every page) ═══════════════ */
  if (window.gsap) {
    $$('.ft-poem span').forEach((s, i) => {
      s.style.left = (i * 11 + (i % 2) * 4) + '%'; s.style.top = (i * 10 + (i % 3) * 5) + '%';
      if (!RM) gsap.to(s, { y: -6, duration: 2 + i * .2, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: i * .1 });
    });
    if (window.ScrollTrigger && $('.ft-big')) gsap.from('.ft-big', { scrollTrigger: { trigger: '.ft', start: 'top 70%' }, yPercent: 20, autoAlpha: 0, duration: 1.2, ease: 'expo.out' });
  }

  /* ═══════════════ tab title ═══════════════ */
  const title = document.title;
  document.addEventListener('visibilitychange', () => { document.title = document.hidden ? 'surfacing… ↑ come back down' : title; });

  /* ═══════════════ konami: you went too deep ═══════════════ */
  const K = 'ArrowUp ArrowUp ArrowDown ArrowDown ArrowLeft ArrowRight ArrowLeft ArrowRight b a'.split(' ');
  let ki = 0;
  addEventListener('keydown', e => {
    ki = e.key === K[ki] ? ki + 1 : (e.key === K[0] ? 1 : 0);
    if (ki === K.length) { ki = 0; IB.flood(); }
  });
  IB.flood = () => {
    const f = $('.flood'); if (!f || !window.gsap) return;
    const b = $('b', f);
    gsap.timeline()
      .fromTo(f, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.4, ease: 'power2.inOut' })
      .add(() => { b.textContent = 3; }).to({}, { duration: .7 }).add(() => { b.textContent = 2; }).to({}, { duration: .7 }).add(() => { b.textContent = 1; }).to({}, { duration: .7 })
      .to(f, { clipPath: 'inset(0 0 100% 0)', duration: 1.2, ease: 'power3.inOut' });
  };

  /* ═══════════════ loader: a sounding (once per visit) ═══════════════ */
  IB.ready = new Promise(res => {
    const L = $('.loader');
    if (!L || !window.gsap) { L && L.remove(); return res(); }
    const seen = sessionStorage.getItem('ib-in');
    sessionStorage.setItem('ib-in', 1);
    if (seen || RM) { gsap.to(L, { autoAlpha: 0, duration: .4, onComplete: () => L.remove() }); return res(); }
    const svg = $('.ld-lines', L), num = $('.ld-n b', L);
    let html = '';
    for (let i = 9; i >= 1; i--) html += `<path class="${i % 3 ? 't' : ''}" d="${IB.contour(7, i * 30, 1 + i * .08)}"/>`;
    svg.innerHTML = html;
    const ps = $$('path', svg);
    ps.forEach(p => { const l = p.getTotalLength(); p.style.strokeDasharray = l; p.style.strokeDashoffset = l; });
    const n = { v: 0 };
    gsap.timeline({ onComplete: () => L.remove() })
      .to(ps, { strokeDashoffset: 0, duration: 1.3, ease: 'power2.inOut', stagger: .09 }, 0)
      .to(n, { v: IB.MAX, duration: 2.1, ease: 'power2.inOut', onUpdate: () => { num.textContent = n.v.toFixed(1).padStart(5, '0'); } }, 0)
      .to(svg, { scale: .9, rotate: -6, duration: 2.4, ease: 'power1.inOut' }, 0)
      .to('.ld-strip', { scaleX: 1, duration: .7, ease: 'expo.inOut' }, 2)
      .fromTo('.ld-strip span', { x: 0 }, { x: -innerWidth * .4, duration: 1.6, ease: 'none' }, 2)
      .to(L, { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'expo.inOut' }, 2.75)
      .add(res, 2.95);
  });

  /* ═══════════════ console ═══════════════ */
  console.log('%c\n      ~  ~   ~    ~   ~  ~\n   .~~~~~~~~~~~~~~~~~~~~~~~~.\n  (   ─ ─ ─  −3 m  ─ ─ ─     )      /\\_/\\\n   ( ─ ─ ─  −8 m  ─ ─ ─ ─   )      ( o.o )  the cat does not dive.\n    (  ─ ─  −20 m  ─ ─     )        > ^ <   it waits on the boat.\n      ( ─ ─ −40 m ─ ─  )\n        \'~~~~~~~~~~~\'      ISOBATH 等深線 · ishigaki\n\n   ┌─┐┬ ┬┌─┐┌─┐┌┬┐┬ ┬ ┬  ┌─┐┬─┐┬\n   │ ┬├─┤│ │└─┐ │ │ └┬┘  │ ┬├┬┘│\n   └─┘┴ ┴└─┘└─┘ ┴ ┴─┘┴ o └─┘┴└─┴─┘ ♥\n\n   concept, design & code by ghostly.grl ♥\n   try IB.help()\n', 'color:#1534ff;font-family:monospace;font-size:12px');
  IB.help = () => console.log('IB.depthAt(y)  → how deep a point of the page is (m)\nIB.flood()     → go too deep (or konami)\nIB.toast(k, t) → a small note\nIB.bleach()    → home: how much reef your hand has bleached');
})();
