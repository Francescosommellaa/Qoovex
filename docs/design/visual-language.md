# Visual Language

## Scopo

Tradurre la tesi visuale in regole operative per composizione, forme,
superfici, gerarchia, luce e densità.

## Personalità

Qoovex deve apparire:

- professionale senza essere istituzionale;
- premium senza diventare lifestyle;
- tecnico senza sembrare un pannello amministrativo;
- leggero senza sembrare fragile;
- innovativo senza usare codici crypto o AI generici.

La qualità nasce dalla precisione di spazio, tipo, contrasto e profondità, non
dalla quantità di effetti.

## Composizione

### Regole

- Il bianco è il canvas prevalente.
- Il nero organizza testo, CTA, navigazione e sezioni inverse.
- Ogni viewport ha un solo punto di massima intensità.
- I blocchi principali hanno spazio sufficiente per essere compresi prima del
  successivo.
- Le preview devono mostrare dati leggibili, non mosaici di schermate.
- Le griglie servono a confrontare o ordinare contenuti; non sono il layout
  predefinito per ogni sezione.

### Gerarchia

1. Contenuto o decisione corrente: massimo contrasto.
2. Azione primaria: forma chiara e separazione netta.
3. Navigazione e strumenti: stabili, meno intensi del contenuto.
4. Contesto: visibile ma attenuato.
5. Atmosfera: quasi invisibile e sempre sacrificabile.

## Firma: lente operativa

La lente operativa visualizza il posizionamento di Qoovex:

- fuori dalla lente: frammenti di file, fogli, messaggi o dati duplicati;
- attraversamento: membrane concentriche e luce filtrata;
- dentro la lente: una ricetta nitida collegata a menu, allergeni, lista o task;
- uscita: un output professionale leggibile e controllabile.

La lente può essere circolare, ad arco o rettangolare con grande raggio. Non
deve sembrare una lente fotografica letterale né un elemento fantascientifico.

## Forme

### Consentite

- archi concentrici;
- cerchi parziali tagliati dal viewport;
- capsule per controlli compatti;
- pannelli con raggio generoso;
- membrane con bordi feathered;
- rettangoli stabili per dati e moduli.

### Regole

- Gli archi indicano trasformazione, continuità o focus.
- Le capsule sono riservate ad azioni, filtri e stati brevi.
- I pannelli operativi usano raggi più contenuti delle superfici narrative.
- La forma non sostituisce mai un’etichetta o una gerarchia.

## Superfici

| Livello  | Aspetto                               | Uso                             |
| -------- | ------------------------------------- | ------------------------------- |
| Canvas   | Bianco o grigio quasi bianco, stabile | Pagine e aree operative         |
| Paper    | Opaco, ombra minima                   | Form, liste, card dati          |
| Glass    | Traslucido, blur e bordo morbido      | Navigazione, focus, preview     |
| Lens     | Profondità e rifrazione controllata   | Hero e storytelling             |
| Obsidian | Nero morbido, non assoluto            | CTA, sezioni inverse, contrasto |
| Veil     | Tinta neutra e desaturazione          | Dialog, drawer, focus mode      |

Ogni superficie glass deve combinare almeno:

- trasparenza controllata;
- `backdrop-filter`;
- bordo percettibile ma non bianco pieno;
- ombra diffusa;
- contrasto interno verificato.

Noise e highlight sono opzionali e non devono compensare una superficie mal
progettata.

## Bordi e ombre

- I bordi separano materiali vicini, non disegnano scatole.
- Su canvas chiaro usare un bordo neutro a basso contrasto.
- Su vetro usare highlight interno e bordo variabile, mai un contorno bianco
  uniforme.
- Le ombre sono larghe, morbide e a bassa opacità.
- Le ombre dure sono riservate a nessun componente canonico.
- Un elemento non usa contemporaneamente bordo forte, ombra forte e glow.

## Densità

### Marketing

- ritmo ampio;
- titoli display;
- una relazione visuale dominante per sezione;
- dettagli solo quando dimostrano una promessa.

### Workspace mobile

- una decisione primaria per viewport;
- progressiva disclosure;
- righe e controlli facili da toccare;
- azioni persistenti solo quando servono al task corrente.

### Workspace desktop

- maggiore densità informativa;
- confronto tra elenco e dettaglio;
- più colonne solo quando riducono navigazione;
- stessa gerarchia semantica del mobile.

## Responsive

| Viewport | Regola                                                                         |
| -------: | ------------------------------------------------------------------------------ |
|   375 px | Una colonna; lente semplificata; superfici più opache; touch target ≥ 44 px    |
|   768 px | Transizione a pannelli affiancati solo per contenuti correlati                 |
|  1024 px | Shell completa e preview più profonde; nessun aumento gratuito degli effetti   |
|  1440 px | Ampio respiro editoriale; densità controllata; contenuto con larghezza massima |

## Motion

- Entrata superficie: 160–240 ms.
- Cambio di contesto: 220–360 ms.
- Momento narrativo marketing: fino a 600 ms se non blocca la lettura.
- Background ambientale: ammesso solo nel marketing e con movimento quasi
  impercettibile.
- Easing fisico, senza bounce.
- In reduced motion: dissolvenza breve o cambio immediato.

I token runtime stabili sono 160, 220, 360 e 600 ms con easing
`cubic-bezier(.22, 1, .36, 1)`.

## Esempi

Corretto:

> Una topbar lattiginosa separa il contenuto che scorre sotto con blur medio e
> bordo inferiore quasi impercettibile.

Errato:

> Ogni recipe card usa blur, glow ciano, bordo bianco e animazione al passaggio.

## Anti-pattern

- Blob casuali.
- Forme organiche wellness.
- Archi senza relazione con il flusso.
- Card SaaS generiche con icona colorata, titolo e paragrafo.
- Ombre nere compatte.
- Noise visibile sul testo.
- Device mockup che rende i dati illeggibili.
- Layout desktop semplicemente ristretto su mobile.

## Impatto sul marketing

La composizione deve rendere evidente una trasformazione reale. La profondità
può essere scenografica, ma headline, CTA e prova restano indipendenti
dall’effetto.

## Impatto sul workspace

Paper e canvas sono i materiali principali. Glass e veil entrano solo quando
separano navigazione, contesto o focus.

## Rischi tecnici

- Maschere e gradienti grandi possono produrre banding.
- Noise raster può degradare su display ad alta densità.
- Layer fixed con blur possono peggiorare lo scroll mobile.
- Raggi e ombre incoerenti possono frammentare il sistema.

## Richiede conferma

- Tecnologia della distorsione della lente.
- Uso di noise come asset o gradiente generato.
- Qualsiasi forma aggiuntiva che diventi firma ricorrente.

## Checklist

- [ ] Ogni forma ha una funzione.
- [ ] Esiste un solo punto di massima intensità.
- [ ] Il contenuto resta leggibile senza atmosfera.
- [ ] Mobile non eredita complessità desktop.
- [ ] Le superfici usano materiali distinti e coerenti.
- [ ] Motion e profondità non ostacolano il task.
