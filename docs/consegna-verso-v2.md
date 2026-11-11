# Vèrso One — consegna versione 2

> Progetto di esercitazione con **cliente simulato** (Vèrso Audio S.r.l.). I materiali "consegnati dal cliente" qui sotto sono inventati per completare la simulazione.
> Pagina: `verso/index.html` · Brief: [brief-cliente-compilato-esempio.md](brief-cliente-compilato-esempio.md)

## Materiali ricevuti dal cliente (simulati) e dove sono usati

| Richiesta | Consegna | Dove |
|---|---|---|
| Render e foto | Render vettoriali del prodotto nei 3 colori (Grafite, Carta, Salvia), generati nel codice. Al posto della foto del laboratorio: grafico del banco di misura | Hero, Offer, carrello, sezione Laboratorio |
| ID varianti Shopify | Integrazione pronta: oggetto `SHOP` con dominio e ID varianti. Finché è vuoto si apre un carrello dimostrativo (colore, quantità, totale) senza pagamento | Pulsante dell'Offer |
| Funzioni di tasti e touch | Schema del product manager (18/11): Power, Rumore, Voce, Touch con tutti i gesti | Sezione Comandi |
| Prezzi dei ricambi | Cuscinetti 29 € · Archetto 39 € · Batteria con kit 34 € · Kit cavi 19 € · Sostituzione batteria in laboratorio 49 € | Sezione Riparabilità |
| Citazioni beta tester | 3 citazioni scelte tra le 18 autorizzate (Giulia R., Marco B., Sara L.) | Sezione Recensioni |
| Account Klaviyo | Integrazione pronta: oggetto `KLAVIYO` con chiave pubblica e ID lista (API client "subscriptions", doppio opt-in). Finché è vuoto il modulo è dimostrativo e non invia dati | Lista d'attesa |
| PEC e P. IVA | Sede, P. IVA, REA, capitale sociale e PEC nel footer (valori di esempio) | Footer |
| Domande aperte nelle FAQ | Riparazioni in garanzia nel laboratorio di Bologna con ritiro gratuito; latenza Bluetooth ~80 ms in modalità Gioco (nuova nota 5) | FAQ, Note |

## Per andare in produzione con un cliente reale

1. **Shopify** — in `verso/index.html`, cercare `const SHOP` e compilare:
   ```js
   const SHOP = { domain: 'negozio.myshopify.com', variants: { grafite: '1234…', carta: '1234…', salvia: '1234…' } };
   ```
2. **Klaviyo** — cercare `const KLAVIYO` e inserire la **chiave pubblica** (6 caratteri) e l'ID della lista. Mai la chiave privata.
3. **Render e foto veri** — sostituire `render()` con `<img>` WebP/AVIF per colore (3 colori × 8 angolazioni).
4. **Font con licenza** — caricare i WOFF2 di Söhne e togliere i sostituti Google Fonts.
5. **Legale** — banner cookie (iubenda) prima di GA4 e Meta Pixel, link reali a privacy, cookie e condizioni di vendita, dati societari veri nel footer.
6. **Pulizia** — togliere `noindex`, la barra di presentazione (`../present/`) e la riga "progetto di esercitazione" nel footer.
7. **Verifiche** — Lighthouse > 90, WCAG 2.1 AA, test del pre-ordine su Shopify in modalità test.
