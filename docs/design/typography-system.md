# Typography System

## Scopo

Definire una tipografia editoriale nel marketing e altamente leggibile nel
workspace, usando esclusivamente famiglie disponibili su Fontshare.

## Famiglie candidate

### Cabinet Grotesk

Ruolo:

- headline marketing;
- numeri o parole chiave ad alta intensità;
- brevi momenti editoriali.

Non usare per:

- form;
- tabelle;
- copy lungo;
- ingredienti, quantità o task;
- microcopy.

Fonte: [Fontshare — Cabinet Grotesk](https://www.fontshare.com/fonts/cabinet-grotesk).

### Synonym

Ruolo:

- UI;
- body copy;
- label;
- dati;
- navigazione;
- pulsanti;
- documentazione visuale.

Fonte: [Fontshare — Synonym](https://www.fontshare.com/fonts/synonym).

### Fallback

General Sans è il fallback di progetto se Synonym fallisce i test su:

- cifre tabulari;
- unità e frazioni;
- diacritici italiani;
- leggibilità a 12–14 px;
- resa Windows;
- peso dei file.

Fonte: [Fontshare — General Sans](https://www.fontshare.com/fonts/general-sans).

Nessun font viene scaricato o integrato prima della verifica di licenza e del
prototipo.

## Principi

- La gerarchia nasce da scala, peso e spazio, non dal colore.
- Cabinet Grotesk è una voce, non la famiglia universale.
- Il workspace usa sentence case.
- Le cifre devono essere distinguibili rapidamente.
- Il testo non viene sfocato nel workspace.
- Copy breve, diretto e professionale.
- Le unità rimangono visivamente legate alla quantità.

## Scala candidata

### Marketing

| Token candidato   |    Range | Line-height | Uso                |
| ----------------- | -------: | ----------: | ------------------ |
| `display-hero`    | 56–96 px |   0.92–1.00 | Hero desktop       |
| `display-section` | 40–64 px |   0.98–1.08 | Titoli sezione     |
| `heading-lg`      | 30–40 px |   1.08–1.18 | Casi d’uso         |
| `heading-md`      | 22–28 px |   1.15–1.25 | Card e proof       |
| `body-lg`         | 18–22 px |   1.45–1.60 | Lead               |
| `body-md`         | 16–18 px |   1.50–1.65 | Copy               |
| `label`           | 13–15 px |   1.25–1.40 | Eyebrow e metadati |

### Workspace

| Token candidato   |    Range | Line-height | Uso              |
| ----------------- | -------: | ----------: | ---------------- |
| `workspace-title` | 28–36 px |   1.10–1.20 | Titolo area      |
| `section-title`   | 20–24 px |   1.20–1.30 | Sezioni          |
| `control`         | 15–17 px |   1.30–1.45 | Input e button   |
| `body`            | 15–17 px |   1.45–1.60 | Contenuto        |
| `data`            | 14–16 px |   1.35–1.50 | Quantità e righe |
| `caption`         | 12–14 px |   1.35–1.50 | Stato e supporto |

Su mobile il body operativo non scende sotto 15 px salvo metadati non
essenziali.

## Pesi

- Display: 500–600.
- Titoli UI: 550–650 se la famiglia lo permette.
- Body: 400–450.
- Label e button: 500–600.
- Dati importanti: peso medio, non bold esteso.
- Disabled: stesso peso, contrasto ridotto; non usare peso ultralight.

## Tracking

- Display grande: leggermente negativo, da validare per parola.
- Titoli UI: neutro o appena negativo.
- Body e controlli: neutro.
- Uppercase: evitare; se necessario per codici brevi, tracking positivo.
- Non usare tracking largo come segnale premium.

## Numeri e dati

- Verificare cifre tabulari per tabelle e quantità.
- Separare valore e unità con spazio non divisibile dove opportuno.
- Non affidare la gerarchia a numeri enormi in stile dashboard.
- Percentuali, grammi e porzioni devono essere leggibili senza zoom.
- Intervalli nutrizionali devono mostrare chiaramente minimo, massimo e unità.

## Responsive

- La hero mobile usa 40–56 px, senza comprimere artificiosamente il tracking.
- I titoli non superano circa 12–14 parole visibili senza pausa.
- La larghezza del copy marketing resta leggibile, circa 45–70 caratteri.
- Nel workspace la gerarchia non cambia significato tra mobile e desktop.

## Accessibilità

- Zoom al 200% senza perdita di contenuto.
- Nessun testo incorporato in immagini.
- Minimo WCAG 2.2 AA.
- Link distinguibili anche senza colore.
- Placeholder non sostituisce label.
- Testo su glass testato sul background peggiore.

## Esempio

Hero:

> Cabinet Grotesk per “Trasforma le tue ricette”, Synonym per spiegazione e
> CTA.

Workspace:

> Synonym per titolo, quantità, stato “Da verificare” e azioni; nessun uso di
> Cabinet Grotesk.

## Anti-pattern

- Serif hospitality come scorciatoia per “premium”.
- Display font nei form.
- Testo piccolo dentro superfici traslucide.
- Uppercase esteso.
- Pesi light per dati secondari ma necessari.
- Scala enorme senza gerarchia informativa.
- Animazione o blur sulle lettere operative.

## Impatto sul marketing

Cabinet Grotesk crea la presenza editoriale. Synonym mantiene il messaggio
concreto e impedisce alla pagina di diventare un manifesto lifestyle.

## Impatto sul workspace

Synonym deve sostenere lettura rapida, cifre, unità, stati e touch UI. La
personalità arriva da composizione e precisione, non dal cambio frequente di
font.

## Rischi tecnici

- FOUT e layout shift.
- Set di glifi o feature OpenType insufficienti.
- File variabile troppo pesante.
- Resa diversa tra Windows e macOS.
- Mancanza di vere cifre tabulari.

## Richiede conferma

- Licenza e modalità di self-hosting.
- Subset e formati.
- Pesi effettivamente inclusi.
- Esito dei test con testo italiano e dati food.
- Eventuale attivazione del fallback General Sans.

## Checklist

- [ ] Il ruolo di ogni famiglia è rispettato.
- [ ] I dati sono leggibili a dimensione mobile.
- [ ] Cifre, unità e diacritici sono stati verificati.
- [ ] Il display non entra nei controlli.
- [ ] Zoom e contrasto rispettano WCAG.
- [ ] I font non sono integrati prima della validazione.
