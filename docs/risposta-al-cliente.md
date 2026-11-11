# Risposta a Vèrso Audio — versione 3 della landing

> Progetto di esercitazione con cliente simulato. Risponde alle 4 richieste in fondo al [brief](brief-cliente-compilato-esempio.md).

**A:** Ufficio Marketing, Vèrso Audio S.r.l.
**Oggetto:** Vèrso One — landing pronta per la revisione finale
**Pagina:** https://nothing-landing-rho.vercel.app/verso/ (senza barra di revisione: aggiungere `?clean`)

Buongiorno,

la landing è pronta per la vostra revisione finale. Qui sotto le risposte alle quattro domande del brief e l'elenco di ciò che manca per andare online.

## 1. Tempi e budget

Confermiamo budget (9.500 € + IVA) e date:

| Data | Cosa |
|---|---|
| 2 dicembre 2026 | Approvazione della versione adattata (questa) |
| 20 dicembre 2026 | Online con la lista d'attesa |
| 15 gennaio 2027 | La pagina passa da sola ai pre-ordini |
| 1° marzo 2027 | La pagina passa da sola alla vendita |

Restano fuori dal budget, come concordato: traduzioni ES e DE e pacchetto di manutenzione.

## 2. Cosa ci manca da voi

| Cosa | Dove va | Stato |
|---|---|---|
| Dominio Shopify e ID variante dei 3 colori | `const SHOP` in `verso/index.html` | Manca: oggi si apre un carrello dimostrativo |
| Chiave pubblica Klaviyo e ID della lista | `const KLAVIYO` | Manca: oggi il modulo non invia dati |
| ID GA4 e ID Meta Pixel | `window.CONSENT` | Manca: oggi non si carica nessuno strumento |
| Render 4K e foto per colore | Hero, Offer, carrello | Oggi ci sono disegni vettoriali |
| Font Söhne in WOFF2 | `fonts/fonts.css` | Oggi ci sono sostituti gratuiti |
| Testi legali definitivi | `verso/legale/` | Oggi c'è una bozza da far rivedere al vostro legale |
| Dominio `one.verso-audio…` e accesso DNS | Vercel | Manca |

## 3. Proposta per la sezione Riparabilità

È online: esploso cliccabile dei quattro pezzi sostituibili con i prezzi (cuscinetti 29 €, archetto 39 €, batteria con attrezzi 34 €, kit cavi 19 €), la promessa dei 5 anni di ricambi e il servizio di sostituzione della batteria in laboratorio a 49 €. La demo "cambia i cuscinetti" è nella scheda 03 delle USP.

## 4. Passaggio da lista d'attesa a pre-ordine

Non serve ripubblicare nulla. La pagina legge la data e cambia da sola:

- **fino al 14 gennaio 2027**: lista d'attesa, con il conto alla rovescia dei giorni
- **15 gennaio – 28 febbraio**: pre-ordine a 239 € con il prezzo di listino barrato
- **dal 1° marzo**: vendita a 279 €

Cambiano insieme pulsanti, prezzo, note, sezione finale e carrello. Le date sono in un punto solo (`PHASE_DATES`). Per vedere le fasi in anticipo: `?phase=preorder` o `?phase=sale`, oppure *Varianti → Fase della pagina* nella barra di revisione.

Per il limite dei 3.000 pezzi: la pagina oggi lo scrive nelle note. Per fermare il prezzo di pre-ordine al raggiungimento del limite serve collegare le giacenze Shopify (un'ora di lavoro, quando avremo gli ID).

## Cosa trovate di nuovo rispetto alla versione 2

- **Banner cookie** con "Rifiuta" in evidenza quanto "Accetta", blocco preventivo di GA4 e Meta Pixel, link "Preferenze cookie" nel footer
- **Eventi tracciati** (solo con consenso): clic sui pulsanti, scelta del colore, iscrizione alla lista, uso delle demo, apertura delle FAQ, aggiunta al carrello, avvio del pagamento
- **Menu su mobile**
- **Pagina legale in bozza**: privacy, cookie, condizioni di vendita con la clausola sui pre-ordini
- **Pagina 404**, metodi di pagamento sotto il prezzo, dati strutturati Product per Google

## Come darci il feedback

Aprite la pagina, toccate **Feedback** nella barra in basso, votate ogni sezione e scrivete le note. Alla fine **Riepilogo → Invia per email**.

Grazie, a presto.
