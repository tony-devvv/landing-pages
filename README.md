# Landing pages

Landing page statiche (HTML, CSS e JavaScript senza build) pubblicate su Vercel, con strumenti per presentarle e farle revisionare ai clienti.

**Online:** https://nothing-landing-rho.vercel.app

| Pagina | Indirizzo | Cosa è |
|---|---|---|
| Headphone (1) Pro | [`/`](https://nothing-landing-rho.vercel.app/) | Prototipo ispirato al design di Nothing. Studio non ufficiale |
| Vèrso One | [`/verso/`](https://nothing-landing-rho.vercel.app/verso/) | Lo stesso prototipo adattato a un cliente simulato (Vèrso Audio) |

Tutte le pagine hanno `noindex`: sono prototipi e non devono comparire su Google.

## Struttura

```
index.html                 Landing Headphone (1) Pro
site.config.json           Varianti e note di strategia della landing principale
verso/                     Landing Vèrso One
  index.html
  site.config.json         Varianti, fasi, note di strategia, email per i feedback
  assets/                  Favicon, immagine di anteprima (og.png)
  legale/                  Privacy, cookie e condizioni di vendita (bozza)
shared/                    Base comune a tutte le landing
  landing.css              Comparsa allo scroll, focus, pulsante "Ferma animazioni", banner cookie, menu mobile
  landing.js               Navbar in vetro, menu mobile, loop() delle demo, numeri che contano
  consent.js               Banner cookie, Consent Mode v2, track() per GA4 e Meta Pixel
present/                   Barra per le presentazioni ai clienti
  present.css · present.js Strategia, Feedback per sezione, Varianti, Riepilogo
fonts/                     Font ospitati sul sito (licenza OFL, solo latin)
vendor/                    Librerie esterne copiate nel repo (generatore QR)
assets/                    Favicon e anteprima della landing principale
brand-guidelines/nothing/  Brand guidelines in PDF, JSON e sorgente HTML
copy/                      Copy in Markdown
docs/                      Brief per i clienti, brief compilato, note di consegna
404.html                   Pagina di errore
vercel.json                Header di sicurezza, cache, URL puliti
```

## Avviarlo in locale

Serve solo un server statico nella cartella del repo:

```bash
python -m http.server 5500 --bind 127.0.0.1
```

Poi apri http://localhost:5500 e http://localhost:5500/verso/.
I percorsi partono dalla radice (`/fonts/…`, `/shared/…`), quindi aprire i file con doppio clic non basta: serve il server.

## Presentare a un cliente

In basso nella pagina c'è la barra di presentazione:

- **Strategia**: per ogni sezione, a cosa serve, perché funziona e cosa serve dal cliente
- **Feedback**: il cliente approva o chiede modifiche sezione per sezione, con una nota
- **Varianti**: titoli, colori, font, tema e (su Vèrso) la fase della pagina
- **Riepilogo**: invia i feedback per email, li copia o li scarica in JSON

I feedback restano nel browser di chi li scrive finché non li invia.

Link utili:

- `?clean` nasconde la barra, per mostrare la pagina come la vedrà il pubblico
- `/verso/?phase=waitlist`, `preorder` o `sale` mostra una fase della pagina senza aspettare la data

## Adattare una landing a un nuovo cliente

1. Duplica la cartella `verso/` con il nome del cliente
2. Cambia i token di brand in testa al `<style>` (colori, font, raggi)
3. Riscrivi testi e sezioni partendo dal brief (`docs/brief-cliente.md`)
4. Aggiorna `site.config.json`: email per i feedback, varianti, note di strategia
5. Sostituisci `assets/og.png` e `assets/favicon.svg`, e aggiorna gli `og:` nell'`<head>`

Navbar, comparsa, numeri, pulsante delle animazioni e barra di presentazione arrivano già da `shared/` e `present/`.

## Integrazioni (Vèrso)

In `verso/index.html`:

- `const SHOP` — dominio Shopify e ID variante per colore. Vuoto = carrello dimostrativo
- `const KLAVIYO` — chiave **pubblica** e ID lista. Vuoto = lista d'attesa dimostrativa
- `const PHASE_DATES` — date di apertura dei pre-ordini e della vendita
- `window.CONSENT` — ID GA4 e Meta Pixel. Vuoti = non si carica nessuno strumento. `?debug=events` scrive gli eventi in console

## Prima di andare online con un cliente reale

Vedi [`docs/consegna-verso-v2.md`](docs/consegna-verso-v2.md): chiavi Shopify e Klaviyo, render veri, font con licenza, banner cookie e pagine legali, poi rimozione di `noindex` (anche da `vercel.json`) e della barra di presentazione.

## Pubblicazione

Ogni push su `main` aggiorna il sito su Vercel. Per proporre modifiche a un cliente senza toccare il sito online, lavora su un branch: Vercel crea un link di anteprima per ogni branch.
