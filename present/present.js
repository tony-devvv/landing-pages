/* Strumenti di presentazione per il cliente: Strategia, Feedback per sezione, Varianti, Riepilogo.
   Dati in site.config.json. I feedback restano nel browser di chi li scrive (localStorage):
   dal Riepilogo si copiano, si scaricano in JSON o si inviano per email.
   ?clean nell'URL nasconde tutto. */
(async () => {
  if (new URLSearchParams(location.search).has('clean')) return;

  let cfg;
  try { cfg = await (await fetch('site.config.json', { cache: 'no-store' })).json(); }
  catch { return; }

  const KEY = 'pz:v1:' + location.pathname;
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
  const st = Object.assign({ strategy: false, feedback: false, fb: {}, v: { h: 0, a: 0, f: 0, t: 'alt' } }, load());
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch {} };

  const S = cfg.strategy || {};
  const sections = [...document.querySelectorAll('main section[id]')].filter(s => S[s.id]);
  const name = id => (S[id] && S[id].step) || id;
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

  /* ---------- UI ---------- */
  const bar = el('div', 'pz pz-glass pz-bar');
  bar.setAttribute('role', 'toolbar'); bar.setAttribute('aria-label', 'Strumenti di presentazione');
  bar.innerHTML = `
    <span class="pz-tag pz-mono">Prototipo</span>
    <button class="pz-btn" data-k="strategy" aria-pressed="false">Strategia</button>
    <button class="pz-btn" data-k="feedback" aria-pressed="false">Feedback</button>
    <button class="pz-btn" data-k="variants" aria-expanded="false">Varianti</button>
    <button class="pz-btn" data-k="summary">Riepilogo <span class="n"></span></button>`;
  const panel = el('aside', 'pz pz-glass pz-panel'); panel.setAttribute('aria-live', 'polite'); panel.setAttribute('aria-label', 'Sezione corrente');
  const pop = el('div', 'pz pz-glass pz-pop'); pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-label', 'Varianti');
  const modal = el('div', 'pz pz-modal'); modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); modal.setAttribute('aria-label', 'Riepilogo feedback');
  document.body.append(panel, pop, modal, bar);
  const btn = k => bar.querySelector(`[data-k="${k}"]`);

  /* ---------- Sezione corrente ---------- */
  let cur = null;
  function findCurrent() {
    const y = innerHeight * 0.45;
    return sections.find(s => { const r = s.getBoundingClientRect(); return r.top <= y && r.bottom > y; }) || null;
  }
  function renderPanel() {
    const open = st.strategy || st.feedback;
    panel.classList.toggle('open', open && !!cur);
    document.body.classList.toggle('pz-on', open);
    sections.forEach(s => s.classList.toggle('pz-current', open && s === cur));
    if (!open || !cur) return;
    const s = S[cur.id], f = st.fb[cur.id] || {};
    let h = `<div class="pz-mono" style="color:var(--pz-muted)">${esc(s.step)}</div><h4>${esc(s.role)}</h4>`;
    if (st.strategy) h += `
      <div class="blk"><span class="pz-mono">Perché funziona</span><p>${esc(s.why)}</p></div>
      <div class="blk"><span class="pz-mono">Cosa serve dal cliente</span><p>${esc(s.client)}</p></div>`;
    if (st.feedback) h += `
      <div class="blk"><span class="pz-mono">Il tuo feedback</span>
        <div class="pz-choice">
          <button class="ok" data-s="ok" aria-pressed="${f.s === 'ok'}">Approva</button>
          <button class="ko" data-s="ko" aria-pressed="${f.s === 'ko'}">Da cambiare</button>
        </div>
        <textarea placeholder="Cosa cambieresti in questa sezione?" aria-label="Nota per ${esc(s.step)}">${esc(f.n || '')}</textarea>
        <div class="pz-saved pz-mono"></div>
      </div>`;
    panel.innerHTML = h;
    const saved = panel.querySelector('.pz-saved');
    panel.querySelectorAll('.pz-choice button').forEach(b => b.onclick = () => {
      const id = cur.id, o = st.fb[id] || (st.fb[id] = {});
      o.s = o.s === b.dataset.s ? '' : b.dataset.s; save(); renderPanel(); count();
    });
    const ta = panel.querySelector('textarea');
    if (ta) {
      let t; ta.oninput = () => {
        const id = cur.id; (st.fb[id] || (st.fb[id] = {})).n = ta.value;
        clearTimeout(t); t = setTimeout(() => { save(); count(); saved.textContent = 'Salvato'; setTimeout(() => saved.textContent = '', 1200); }, 300);
      };
    }
  }
  let raf = 0;
  addEventListener('scroll', () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0; const c = findCurrent();
      // non ridisegnare mentre si scrive una nota
      if (c !== cur && !(panel.contains(document.activeElement) && document.activeElement.tagName === 'TEXTAREA')) { cur = c; renderPanel(); }
    });
  }, { passive: true });

  function count() {
    const n = sections.filter(s => { const f = st.fb[s.id]; return f && (f.s || (f.n && f.n.trim())); }).length;
    bar.querySelector('.n').textContent = `${n}/${sections.length}`;
  }

  /* ---------- Varianti ---------- */
  const V = cfg.variants || {};
  const heroTitle = document.getElementById('hero-title');
  function applyVariants() {
    const v = st.v;
    if (heroTitle && V.headlines && V.headlines[v.h]) heroTitle.textContent = V.headlines[v.h];
    if (V.accents && V.accents[v.a]) document.documentElement.style.setProperty('--accent', V.accents[v.a].value);
    if (V.titleFonts && V.titleFonts[v.f]) document.documentElement.style.setProperty(cfg.titleVar || '--font-dot', V.titleFonts[v.f].value);
    if (V.phases && V.phases[v.p || 0]) dispatchEvent(new CustomEvent('pz:phase', { detail: V.phases[v.p || 0].value }));
    document.body.classList.remove('pz-font-1', 'pz-font-2'); if (v.f) document.body.classList.add('pz-font-' + v.f);
    const dark = v.t === 'dark';
    document.body.classList.toggle('pz-theme-dark', dark);
    document.querySelectorAll('main section').forEach(s => {
      if (dark && !s.classList.contains('dark')) { s.dataset.pzOrig = s.classList.contains('white') ? 'white' : 'light'; s.classList.remove('light', 'white'); s.classList.add('dark'); }
      if (!dark && s.dataset.pzOrig) { s.classList.remove('dark'); s.classList.add(s.dataset.pzOrig); delete s.dataset.pzOrig; }
    });
    dispatchEvent(new Event('scroll'));
  }
  function renderPop() {
    const v = st.v, opt = (arr, sel) => arr.map((x, i) => `<option value="${i}" ${i === sel ? 'selected' : ''}>${esc(typeof x === 'string' ? x : x.name)}</option>`).join('');
    pop.innerHTML = `
      <div class="pz-mono" style="color:var(--pz-muted)">Varianti da mostrare al cliente</div>
      <label><span class="pz-mono">Titolo della hero</span><select data-v="h">${opt(V.headlines || [], v.h)}</select></label>
      <div><span class="pz-mono">Colore accento</span><div class="row" style="margin-top:6px">
        ${(V.accents || []).map((a, i) => `<button class="pz-sw" data-a="${i}" style="background:${a.value}" aria-label="${esc(a.name)}" title="${esc(a.name)}" aria-pressed="${i === v.a}"></button>`).join('')}
      </div></div>
      <label><span class="pz-mono">Font dei titoli</span><select data-v="f">${opt(V.titleFonts || [], v.f)}</select></label>
      ${V.phases ? `<label><span class="pz-mono">Fase della pagina</span><select data-v="p">${opt(V.phases, v.p || 0)}</select></label>` : ''}
      <label><span class="pz-mono">Tema</span><select data-v="t">${(V.themes || []).map(t => `<option value="${t.value}" ${t.value === v.t ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}</select></label>
      <button class="pz-btn" data-reset style="justify-self:start;box-shadow:inset 0 0 0 1px var(--pz-line)">Ripristina originale</button>`;
    pop.querySelectorAll('select').forEach(s => s.onchange = () => { st.v[s.dataset.v] = s.dataset.v === 't' ? s.value : +s.value; save(); applyVariants(); });
    pop.querySelectorAll('.pz-sw').forEach(b => b.onclick = () => { st.v.a = +b.dataset.a; save(); applyVariants(); renderPop(); });
    pop.querySelector('[data-reset]').onclick = () => { st.v = { h: 0, a: 0, f: 0, t: 'alt', p: 0 }; save(); applyVariants(); renderPop(); };
  }

  /* ---------- Riepilogo ---------- */
  const label = s => s === 'ok' ? 'Approvata' : s === 'ko' ? 'Da cambiare' : 'Nessun voto';
  function asText() {
    const d = new Date().toLocaleDateString('it-IT');
    return `Feedback — ${cfg.project || document.title} — ${d}\n\n` + sections.map(s => {
      const f = st.fb[s.id] || {}; return `${name(s.id)}: ${label(f.s)}${f.n && f.n.trim() ? '\n  ' + f.n.trim().replace(/\n/g, '\n  ') : ''}`;
    }).join('\n\n');
  }
  function renderModal() {
    const done = sections.filter(s => { const f = st.fb[s.id]; return f && (f.s || (f.n && f.n.trim())); }).length;
    modal.innerHTML = `<div class="pz-box pz-glass">
      <div class="pz-mono" style="color:var(--pz-muted)">Riepilogo feedback</div>
      <h3>${done === 1 ? '1 sezione' : done + ' sezioni'} su ${sections.length} ${done === 1 ? 'commentata' : 'commentate'}</h3>
      <p class="sub">I feedback sono salvati solo in questo browser. Inviali o scaricali per condividerli.</p>
      <ul>${sections.map(s => { const f = st.fb[s.id] || {}; return `<li><span class="st ${f.s || ''}"></span><b style="font-weight:500">${esc(name(s.id))} — ${label(f.s)}</b>${f.n && f.n.trim() ? `<span class="note">${esc(f.n.trim())}</span>` : ''}</li>`; }).join('')}</ul>
      <div class="actions">
        <button class="pz-btn primary" data-a="mail">Invia per email</button>
        <button class="pz-btn" data-a="copy">Copia testo</button>
        <button class="pz-btn" data-a="json">Scarica JSON</button>
        <button class="pz-btn" data-a="reset">Azzera</button>
        <button class="pz-btn" data-a="close" style="margin-left:auto">Chiudi</button>
      </div></div>`;
    const act = modal.querySelector('.actions');
    act.onclick = async e => {
      const a = e.target.closest('button'); if (!a) return;
      if (a.dataset.a === 'close') return closeModal();
      if (a.dataset.a === 'copy') { try { await navigator.clipboard.writeText(asText()); a.textContent = 'Copiato'; } catch { a.textContent = 'Copia non riuscita'; } }
      if (a.dataset.a === 'json') {
        const data = { project: cfg.project, date: new Date().toISOString(), variants: st.v, feedback: sections.map(s => ({ section: name(s.id), id: s.id, status: (st.fb[s.id] || {}).s || '', note: ((st.fb[s.id] || {}).n || '').trim() })) };
        const u = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
        const l = Object.assign(document.createElement('a'), { href: u, download: 'feedback-landing.json' }); l.click(); setTimeout(() => URL.revokeObjectURL(u), 1000);
      }
      if (a.dataset.a === 'mail') location.href = `mailto:${encodeURIComponent(cfg.feedbackEmail || '')}?subject=${encodeURIComponent('Feedback — ' + (cfg.project || document.title))}&body=${encodeURIComponent(asText())}`;
      if (a.dataset.a === 'reset' && confirm('Cancellare tutti i feedback salvati in questo browser?')) { st.fb = {}; save(); count(); renderModal(); renderPanel(); }
    };
  }
  let lastFocus = null;
  function openModal() { lastFocus = document.activeElement; renderModal(); modal.classList.add('open'); modal.querySelector('[data-a="mail"]').focus(); }
  function closeModal() { modal.classList.remove('open'); lastFocus && lastFocus.focus(); }
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  /* ---------- Barra ---------- */
  function sync() {
    btn('strategy').setAttribute('aria-pressed', st.strategy);
    btn('feedback').setAttribute('aria-pressed', st.feedback);
  }
  bar.onclick = e => {
    const b = e.target.closest('.pz-btn'); if (!b) return;
    const k = b.dataset.k;
    if (k === 'strategy' || k === 'feedback') { st[k] = !st[k]; save(); sync(); cur = findCurrent(); renderPanel(); }
    if (k === 'variants') { const o = !pop.classList.contains('open'); if (o) renderPop(); pop.classList.toggle('open', o); b.setAttribute('aria-expanded', o); }
    if (k === 'summary') openModal();
  };
  addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (modal.classList.contains('open')) closeModal();
    else if (pop.classList.contains('open')) { pop.classList.remove('open'); btn('variants').setAttribute('aria-expanded', false); btn('variants').focus(); }
  });

  sync(); count(); applyVariants(); cur = findCurrent(); renderPanel();
})();
