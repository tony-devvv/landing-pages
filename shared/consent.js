/* Consenso cookie + tracciamento eventi.
   Uso nella pagina, PRIMA di questo file:
     <script>window.CONSENT = { ga4: '', metaPixel: '', demo: true, policyUrl: 'legale/#cookie' };</script>
   - ga4:       ID di misurazione GA4 (G-XXXXXXX). Vuoto = GA4 non viene mai caricato.
   - metaPixel: ID del Pixel di Meta. Vuoto = il Pixel non viene mai caricato.
   - demo:      true mostra il banner anche senza ID, per farlo vedere al cliente. In produzione: false.
   Niente viene caricato prima del consenso (Consent Mode v2: tutto "denied" di default).
   Rifiutare è facile quanto accettare. La scelta si riapre con qualsiasi elemento [data-consent-open].
   window.track(nome, parametri) invia un evento solo se le statistiche sono state accettate.
   Con ?debug=events gli eventi vengono anche scritti in console. */
(() => {
  const cfg = Object.assign({ ga4: '', metaPixel: '', demo: false, policyUrl: '#' }, window.CONSENT || {});
  const KEY = 'consent:v1';
  const debug = new URLSearchParams(location.search).get('debug') === 'events';
  const has = cfg.ga4 || cfg.metaPixel;
  let state = null;
  try { state = JSON.parse(localStorage.getItem(KEY)); } catch {}

  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied', wait_for_update: 500 });

  let gaLoaded = false, fbLoaded = false;
  function apply() {
    const a = !!(state && state.analytics), m = !!(state && state.marketing);
    gtag('consent', 'update', { analytics_storage: a ? 'granted' : 'denied', ad_storage: m ? 'granted' : 'denied', ad_user_data: m ? 'granted' : 'denied', ad_personalization: m ? 'granted' : 'denied' });
    if (a && cfg.ga4 && !gaLoaded) {
      gaLoaded = true;
      const s = document.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(cfg.ga4); document.head.appendChild(s);
      gtag('js', new Date()); gtag('config', cfg.ga4, { anonymize_ip: true });
    }
    if (m && cfg.metaPixel && !fbLoaded) {
      fbLoaded = true;
      const n = window.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      n.queue = []; n.loaded = true; n.version = '2.0';
      const s = document.createElement('script'); s.async = true; s.src = 'https://connect.facebook.net/en_US/fbevents.js'; document.head.appendChild(s);
      fbq('init', cfg.metaPixel); fbq('track', 'PageView');
    }
  }

  /* Eventi: partono solo con il consenso alle statistiche */
  window.track = (name, params = {}) => {
    const ok = !!(state && state.analytics);
    if (debug) console.log('[evento]', name, params, ok ? '→ inviato' : '→ non inviato (manca il consenso)');
    if (!ok) return;
    gtag('event', name, params);
    if (window.fbq && state.marketing) {
      const map = { add_to_cart: 'AddToCart', begin_checkout: 'InitiateCheckout', waitlist_signup: 'Lead' };
      if (map[name]) fbq('track', map[name], params);
    }
  };

  function save(analytics, marketing) {
    state = { analytics, marketing, ts: new Date().toISOString() };
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
    apply(); close();
  }

  let box = null, last = null;
  function close() { if (box) { box.remove(); box = null; last && last.focus && last.focus(); } }
  function open(prefs) {
    if (box) return;
    last = document.activeElement;
    box = document.createElement('div');
    box.className = 'consent-box';
    box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Preferenze sui cookie');
    box.innerHTML = `
      <p class="consent-title">Cookie, solo se vuoi</p>
      <p class="consent-text">Usiamo cookie di statistica e di marketing solo con il tuo consenso. Quelli tecnici servono a far funzionare il sito. <a href="${cfg.policyUrl}">Cookie policy</a></p>
      <div class="consent-prefs" ${prefs ? '' : 'hidden'}>
        <label><input type="checkbox" checked disabled> Tecnici (sempre attivi)</label>
        <label><input type="checkbox" data-c="analytics" ${state && state.analytics ? 'checked' : ''}> Statistiche (Google Analytics)</label>
        <label><input type="checkbox" data-c="marketing" ${state && state.marketing ? 'checked' : ''}> Marketing (Meta Pixel)</label>
      </div>
      <div class="consent-actions">
        <button type="button" data-a="reject">Rifiuta</button>
        <button type="button" data-a="accept">Accetta tutti</button>
        <button type="button" data-a="prefs" class="ghost">${prefs ? 'Salva le scelte' : 'Personalizza'}</button>
      </div>`;
    box.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      const p = box.querySelector('.consent-prefs');
      if (b.dataset.a === 'reject') save(false, false);
      if (b.dataset.a === 'accept') save(true, true);
      if (b.dataset.a === 'prefs') {
        if (p.hidden) { p.hidden = false; b.textContent = 'Salva le scelte'; }
        else save(p.querySelector('[data-c=analytics]').checked, p.querySelector('[data-c=marketing]').checked);
      }
    });
    document.body.appendChild(box);
  }

  const ready = fn => document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn) : fn();
  ready(() => {
    if (state) apply();
    else if (has || cfg.demo) open(false);
    document.addEventListener('click', e => { const o = e.target.closest('[data-consent-open]'); if (o) { e.preventDefault(); close(); open(true); } });
  });
})();
