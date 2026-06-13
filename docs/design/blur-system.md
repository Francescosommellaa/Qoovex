# Blur System

## Scopo

Definire il blur come sistema semantico, con ruoli, bande di intensità, preset,
fallback e limiti prestazionali.

## Regola fondamentale

Un blur è ammesso solo se risponde ad almeno una domanda:

- cosa viene messo a fuoco?
- cosa viene separato?
- cosa diventa secondario?
- quale stato viene comunicato?
- quale trasformazione viene dimostrata?

Se la risposta non è esplicita, il blur va rimosso.

## Ruoli

| Ruolo        | Funzione                                         | Uso                                      | Vietato                        |
| ------------ | ------------------------------------------------ | ---------------------------------------- | ------------------------------ |
| Lens         | Isolare un contenuto sopra un contesto complesso | Hero, onboarding, preview, dettaglio     | Liste ripetute                 |
| Veil         | Ridurre competizione del piano sottostante       | Dialog, drawer, focus mode               | Nascondere contesto necessario |
| Depth        | Separare piani senza bordi duri                  | Hero, shell, empty state                 | Ogni card                      |
| Divider      | Separare aree stabili                            | Topbar, sidebar, toolbar                 | Divisori interni di dati       |
| Glow         | Comunicare energia o stato raro                  | Focus, CTA primaria, conferma importante | Azioni ordinarie               |
| Motion trail | Rendere percepibile una trasformazione           | Hero, cambio step, apertura pannello     | Animazione continua            |

## Bande stabili

| Banda    | Intervallo | Uso                            |
| -------- | ---------: | ------------------------------ |
| `subtle` |       8 px | Divider e navigazione compatta |
| `soft`   |      16 px | Superfici leggere e toolbar    |
| `medium` |      24 px | Pannelli, popover, focus       |
| `strong` |      40 px | Dialog, lens e preview isolate |
| `deep`   |      64 px | Hero e fondali narrativi       |

## Variabili da tokenizzare

Ogni preset deve comporre token separati:

- blur;
- opacità della superficie;
- tinta;
- saturazione del backdrop;
- luminosità interna;
- bordo;
- highlight;
- ombra;
- glow;
- noise;
- contrasto testo;
- livello di profondità.

Il nome del preset descrive la funzione; non sostituisce i token primitivi.

## Preset

| Preset             | Ruolo     | Banda        | Superficie                      | Uso                           | Non usare            |
| ------------------ | --------- | ------------ | ------------------------------- | ----------------------------- | -------------------- |
| `glass-subtle`     | Depth     | subtle       | Chiara 96%                      | Highlight locale, empty state | Testo su foto        |
| `glass-soft`       | Depth     | soft         | Chiara 92%                      | Preview e pannelli singoli    | Liste lunghe         |
| `glass-medium`     | Lens      | medium       | Chiara 88%                      | Card focale, onboarding       | Dati ad alta densità |
| `glass-strong`     | Lens      | strong       | Chiara 80%                      | Hero e preview isolate        | Componenti ripetuti  |
| `glass-deep`       | Depth     | deep         | Chiara 72%, solo marketing      | Fondali narrativi             | Workspace operativo  |
| `glass-focus`      | Lens/Glow | medium       | Alta leggibilità                | Focus critico, selezione      | Hover ordinario      |
| `glass-modal`      | Lens      | strong       | Pannello quasi opaco            | Dialog e drawer               | Form trasparente     |
| `glass-navigation` | Divider   | subtle/soft  | Neutra e stabile                | Topbar, bottom bar, sidebar   | Glow colorato        |
| `glass-danger`     | Veil      | medium       | Neutra con segnale rosso locale | Conferma distruttiva          | Pannello rosso pieno |
| `glass-success`    | Glow      | soft         | Neutra con segnale verde locale | Conferma importante           | Decorazione          |
| `glass-ai`         | Riservato | non definito | Non implementabile              | Solo futura decisione AI      | Qualsiasi UI v1      |

Su mobile la progressione diventa 98/96/94/92/90% e usa blur ridotto. Il
fallback senza `backdrop-filter` usa superficie al 98%.

## Regole dei preset

### `glass-subtle`

- Deve apparire come separazione di materiale, non come effetto.
- Testo con contrasto AA indipendente dal backdrop.
- Nessun glow.

### `glass-medium`

- Un solo pannello dominante per area.
- Contenuto interno opaco quando include form o dati.
- Bordo più leggibile sul lato illuminato, mai uniforme.

### `glass-deep`

- Solo marketing.
- Non contiene copy lungo.
- Deve degradare a gradienti statici senza cambiare il significato.

### `glass-modal`

- Il veil attenua e desatura lo sfondo.
- Il pannello resta più nitido del contesto.
- Focus trap, Escape e ripristino focus sono parte del contratto futuro.

### Preset funzionali

`danger` e `success` non sostituiscono i token di stato. Il colore è un segnale
locale abbinato a icona, testo e conseguenza.

## Limiti workspace

- Massimo due layer `backdrop-filter` simultanei.
- Nessun blur per ogni elemento di una lista virtualizzata o scorrevole.
- Nessun blur sul testo o sul contenitore immediato del testo.
- `strong` solo per un overlay o focus isolato.
- `deep` vietato.
- Mobile usa opacità maggiore e blur minore rispetto al desktop.
- Durante scroll intenso privilegiare layer statici e superfici opache.

## Fallback

Ordine di degradazione:

1. ridurre motion ambientale;
2. ridurre intensità blur;
3. aumentare opacità superficie;
4. sostituire rifrazione con gradiente statico;
5. rimuovere noise e highlight;
6. conservare bordo, ombra, contrasto e gerarchia.

Con `prefers-reduced-motion`, il blur non anima continuamente. Con
`prefers-reduced-transparency`, quando supportato, le superfici diventano più
opache.

## Esempio

Un dialog usa `Veil` sul canvas e `glass-modal` sul pannello. Gli input dentro
il pannello usano `Paper`, non un secondo blur.

## Anti-pattern

- `backdrop-blur-md` scelto senza ruolo.
- Blur annidato tra card, input e tooltip.
- Testo importante sopra background in movimento.
- Glow come focus ring.
- Blur enorme su tutta una pagina mobile.
- Overlay che finisce con un bordo rettangolare netto.
- Preset usato come variante estetica intercambiabile.

## Impatto sul marketing

Sono ammessi `strong` e `deep` in aree isolate. La hero può combinare più
membrane purché una sola superficie contenga il contenuto primario.

## Impatto sul workspace

Prevalgono `subtle`, `soft`, `navigation` e `modal`. Il blur non definisce le
card operative di base.

## Rischi tecnici

- Compositing costoso su mobile.
- Contrasto non deterministico.
- Artefatti sui bordi con maschere e radius.
- Differenze Safari/Chromium.
- Scroll jank con layer fixed.

## Richiede conferma

- Breaking change a blur, alpha o saturazione Stable v0.1.
- Tecnologia per feathering e rifrazione.
- Introduzione o attivazione di `glass-ai`.

## Checklist

- [ ] Il ruolo del blur è dichiarato.
- [ ] Il contenuto è leggibile senza conoscere lo sfondo.
- [ ] Il numero di layer rispetta il budget.
- [ ] Esiste un fallback opaco equivalente.
- [ ] Il preset non sostituisce i token primitivi.
- [ ] `strong` e `deep` rispettano i limiti di superficie.
