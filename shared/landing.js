/* Base condivisa tra tutte le landing.
   Da caricare PRIMA dello script della pagina. Espone window.Landing = { still, loop, paused }.
   Fa da sola: comparsa delle sezioni (.rv), navbar in vetro allo scroll (.top/.bar),
   numeri che contano (.count[data-to]), pulsante "Ferma animazioni". */
(() => {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const KEY = 'landing:motion-paused';
  let paused = false;
  try { paused = localStorage.getItem(KEY) === '1'; } catch {}
  root.classList.toggle('motion-paused', paused);

  /* Esegue fn ogni ms solo quando el è visibile e le animazioni non sono ferme.
     Con "riduci movimento" del sistema rallenta e la pagina toglie le transizioni.
     Restituisce una funzione che ferma il ciclo per sempre (es. dopo un clic dell'utente). */
  function loop(el, ms, fn) {
    if (still) ms *= 1.6;
    let t = null, done = false;
    const tick = () => { if (!paused) fn(); };
    const ob = new IntersectionObserver(([e]) => {
      if (done) return;
      if (e.isIntersecting && !t) { tick(); t = setInterval(tick, ms); }
      else if (!e.isIntersecting && t) { clearInterval(t); t = null; }
    }, { threshold: .3 });
    ob.observe(el);
    return () => { done = true; clearInterval(t); ob.disconnect(); };
  }

  window.Landing = { still, loop, paused: () => paused };

  const ready = fn => document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn) : fn();

  ready(() => {
    /* comparsa allo scroll */
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
    document.querySelectorAll('.rv').forEach(el => io.observe(el));

    /* navbar: vetro dopo 24px di scroll, testo chiaro o scuro in base alla sezione sotto */
    const top = document.querySelector('.top'), bar = top && top.querySelector('.bar');
    if (bar) {
      let raf = 0;
      const update = () => {
        raf = 0;
        top.classList.toggle('scrolled', scrollY > 24);
        const y = bar.getBoundingClientRect().bottom - 4;
        const el = document.elementsFromPoint(innerWidth / 2, y).find(e => !top.contains(e) && e.closest('section, .strip, .notes, footer'));
        const zone = el && el.closest('section, .strip, .notes, footer');
        const dark = !!zone && (zone.classList.contains('dark') || zone.classList.contains('strip') || zone.tagName === 'FOOTER');
        top.classList.toggle('on-dark', dark);
        top.classList.toggle('on-light', !dark);
      };
      addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
      addEventListener('resize', update);
      update();
    }

    /* numeri che contano quando entrano in vista */
    document.querySelectorAll('.count[data-to]').forEach(el => {
      const to = +el.dataset.to;
      if (still || paused) { el.textContent = to; return; }
      el.textContent = '0';
      new IntersectionObserver(([e], ob) => {
        if (!e.isIntersecting) return; ob.disconnect();
        const t0 = performance.now();
        (function f(t) { const k = Math.min(1, (t - t0) / 1400); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); })(t0);
      }, { threshold: .5 }).observe(el);
    });

    /* pulsante "Ferma animazioni" (solo se la pagina ha qualcosa che si muove da solo) */
    if (!document.querySelector('[data-motion]')) return;
    const btn = document.createElement('button');
    btn.className = 'motion-toggle';
    btn.type = 'button';
    const label = () => {
      btn.setAttribute('aria-pressed', paused);
      btn.innerHTML = `<span class="ico" aria-hidden="true"><i></i><i></i></span>${paused ? 'Riprendi animazioni' : 'Ferma animazioni'}`;
    };
    btn.addEventListener('click', () => {
      paused = !paused;
      root.classList.toggle('motion-paused', paused);
      try { localStorage.setItem(KEY, paused ? '1' : '0'); } catch {}
      label();
      dispatchEvent(new CustomEvent('landing:motion', { detail: { paused } }));
    });
    label();
    document.body.appendChild(btn);
  });
})();
