# Color System

## Scopo

Definire una palette quasi monocromatica in cui il colore è raro, controllato e
distinto dagli stati funzionali.

## Principio

Qoovex non deve sembrare colorato. Deve sembrare costruito con carta, ossidiana,
luce e vetro.

- Il bianco crea respiro e chiarezza.
- Il nero struttura e concentra.
- I grigi costruiscono gerarchia e densità.
- Gli accenti freddi comunicano precisione e orientamento.
- L’albicocca segnala trasformazione o output, mai errore.
- Il violetto vive solo come rifrazione secondaria.

## Budget cromatico

| Ambiente        |    Superficie accentata massima | Regola                             |
| --------------- | ------------------------------: | ---------------------------------- |
| Marketing       |    8–12% nei momenti espressivi | Prevalentemente luce sotto vetro   |
| Workspace       |                            2–4% | Focus, stato, CTA critica o output |
| Sezione inversa | Il nero può dominare localmente | Gli accenti restano subordinati    |

Il budget non include colori funzionali necessari per comunicare stato.

## Primitive candidate

Questi valori servono per prototipazione e confronto. Non sono ancora token
runtime definitivi.

### Monocromia

| Nome candidato | Valore    | Ruolo                                     |
| -------------- | --------- | ----------------------------------------- |
| `paper-0`      | `#FFFFFF` | Canvas principale                         |
| `paper-25`     | `#FCFCFB` | Canvas caldo quasi impercettibile         |
| `paper-50`     | `#F7F7F5` | Superficie secondaria                     |
| `stone-100`    | `#EEEEEB` | Divisori e disabled surface               |
| `stone-200`    | `#DEDEDA` | Bordi leggibili                           |
| `stone-400`    | `#A4A49E` | Testo attenuato solo su fondi solidi      |
| `stone-600`    | `#666662` | Testo secondario                          |
| `ink-800`      | `#2A2A28` | Testo forte                               |
| `ink-900`      | `#151514` | Ossidiana strutturale                     |
| `ink-950`      | `#090909` | CTA e superfici inverse ad alta intensità |

### Accenti

| Nome candidato   | Valore    | Ruolo                                |
| ---------------- | --------- | ------------------------------------ |
| `signal-cyan`    | `#28C7D9` | Luce fredda e orientamento           |
| `signal-cobalt`  | `#3568E8` | Focus e profondità                   |
| `signal-apricot` | `#F2A56F` | Trasformazione e output              |
| `signal-violet`  | `#8C6DE8` | Rifrazione secondaria, mai dominante |

Gli accenti pieni richiedono verifica di contrasto e non devono essere usati
automaticamente come colore del testo.

## Combinazioni ammesse

- Ciano + cobalto sotto superficie bianca.
- Cobalto + violetto come rifrazione profonda e poco satura.
- Ciano + albicocca per raccontare input → output.
- Albicocca da sola come luce locale dietro una preview.
- Un solo accento su controllo o focus operativo.

## Combinazioni vietate

- Ciano + violetto + rosa saturi nella stessa superficie.
- Verde funzionale dentro gradienti brand.
- Rosso come accento marketing.
- Ambra warning usata come luce decorativa.
- Testo albicocca su bianco senza contrasto verificato.
- Gradienti arcobaleno.
- Accento pieno su intere card operative.

## Token semantici previsti

### Superfici

- `--surface-canvas`
- `--surface-canvas-muted`
- `--surface-paper`
- `--surface-inverse`
- `--surface-glass`
- `--surface-glass-strong`
- `--surface-veil`

### Testo

- `--text-primary`
- `--text-secondary`
- `--text-muted`
- `--text-inverse`
- `--text-disabled`
- `--text-link`

### Bordi

- `--border-subtle`
- `--border-default`
- `--border-strong`
- `--border-inverse`
- `--border-focus`

### Accenti

- `--accent-primary`
- `--accent-secondary`
- `--accent-warm`
- `--accent-refracted`
- `--accent-glow`
- `--accent-muted`

I token semantici non devono contenere nomi cromatici: il significato prevale
sulla tinta.

## Colori funzionali

Valori candidati, da verificare in coppie foreground/background:

| Stato    | Base candidata | Uso                                   |
| -------- | -------------- | ------------------------------------- |
| Successo | `#187A4B`      | Completato, confermato                |
| Warning  | `#9A6700`      | Da verificare, attenzione             |
| Danger   | `#B4232D`      | Errore e distruttivo                  |
| Info     | `#2459B3`      | Informazione operativa                |
| Focus    | `#315FD6`      | Focus ring accessibile                |
| Disabled | scala stone    | Riduzione di enfasi, non invisibilità |

Ogni stato combina colore con testo, icona Phosphor o struttura.

### Allergeni e affidabilità

- `rilevato`: info o neutro con spiegazione.
- `da verificare`: warning.
- `confermato`: success.
- `errore`: danger.

Non usare il verde per suggerire che un alimento è sicuro in assoluto.

## Gradienti

I gradienti brand:

- vivono dietro superfici traslucide;
- usano stop ampi e feathered;
- hanno saturazione inferiore sul workspace;
- non contengono più di tre famiglie cromatiche;
- non passano dietro testo operativo;
- devono degradare a una tinta neutra.

## Contrasto

- Testo normale: almeno 4.5:1.
- Testo grande: almeno 3:1.
- Controlli e focus: almeno 3:1 rispetto alle superfici adiacenti.
- I valori vengono misurati sulla composizione finale, non sul solo token.
- Su glass, testare il background peggiore previsto.
- Se il contrasto dipende dal backdrop, aumentare l’opacità della superficie.

## Esempio

Una CTA primaria può essere nera con testo bianco e un alone ciano-albicocca
dietro il contenitore. Il bottone non diventa un gradiente.

## Anti-pattern

- Palette scelta per “vibrazione premium”.
- Accento usato come riempitivo nelle icone.
- Stato attivo e successo con lo stesso verde.
- Warning trasformato in elemento decorativo.
- Grigio troppo chiaro per informazioni necessarie.
- Superficie inversa nera assoluta estesa all’intera app.

## Impatto sul marketing

Gli accenti raccontano trasformazione e profondità. Il nero può creare poche
sezioni inverse, separate da ampie aree bianche.

## Impatto sul workspace

Prevalgono canvas, paper, ink e stati funzionali. Gli accenti brand non
decorano navigazione, card o grafici.

## Rischi tecnici

- Contrast ratio instabile su gradienti e glass.
- Display P3 e filtri possono alterare la saturazione.
- Troppi token primitivi possono creare combinazioni arbitrarie.
- Colori funzionali simili agli accenti possono confondere stato e brand.

## Richiede conferma

- Valori finali dopo test in sRGB.
- Eventuale supporto Display P3.
- Coppie foreground/background funzionali.
- Palette per visualizzazioni dati, quando esisterà un caso reale.

## Checklist

- [ ] Il colore rispetta il budget dell’ambiente.
- [ ] Brand e stato funzionale sono distinti.
- [ ] Il contrasto è misurato sulla composizione finale.
- [ ] Nessuno stato dipende solo dal colore.
- [ ] I gradienti restano sotto il vetro.
- [ ] I valori candidati non sono trattati come token implementati.
