# Qoovex Visual Language

## Scopo

Definire la decisione visuale sintetica che governa sito marketing, workspace,
Sirio e futuro `packages/ui`.

## Tesi

Qoovex è un workspace professionale costruito con **chiarezza, luce e
profondità controllata**. Il blur è la firma riconoscibile del prodotto, ma
viene usato come strumento di gerarchia: mette a fuoco, separa livelli, riduce
interferenze e accompagna una decisione.

La direzione non è glassmorphism. Il vetro non è una texture applicata a ogni
card; è un materiale raro che rende leggibile la relazione tra ciò che è
secondario e ciò che richiede attenzione.

## Decisioni canoniche

| Asse                  | Decisione                                                               |
| --------------------- | ----------------------------------------------------------------------- |
| Personalità           | Editoriale tecnica: autorevole, chiara, precisa, non fredda.            |
| Composizione          | Bianco dominante, nero strutturale, ampia scala di grigi.               |
| Rapporto chiaro/scuro | Circa 80/20, con superfici inverse locali e nessun dark mode v1.        |
| Firma                 | Lente operativa: contesto sfocato, flusso professionale nitido.         |
| Colore                | Accenti freddi rari; calore albicocca solo per trasformazione e output. |
| Marketing             | Una hero memorabile e pochi momenti blur ad alta intensità.             |
| Workspace             | Mobile-first, molto sobrio, dati e azioni sempre nitidi.                |
| Tipografia            | Cabinet Grotesk display; Synonym per UI e testo.                        |
| Motion                | Fisica, breve, non continua; ridotta senza perdita di significato.      |
| Accessibilità         | WCAG 2.2 AA come minimo; il colore non comunica mai da solo.            |

## Principi non negoziabili

1. **Nitidezza prima dell’effetto.** Testo, quantità, allergeni, stato di
   verifica e task non vengono sfocati.
2. **Un blur, una funzione.** Ogni uso deve dichiarare focus, separazione,
   de-enfasi, stato o trasformazione.
3. **Colore sotto il vetro.** Gli accenti appaiono soprattutto come luce
   filtrata, non come grandi superfici piene.
4. **Una firma, non una decorazione diffusa.** La lente operativa concentra
   l’espressività; il resto rimane disciplinato.
5. **Workspace più sobrio del marketing.** La UI di lavoro non compete con i
   dati e non anima l’ambiente in modo continuo.
6. **Mobile come contesto primario.** Consultazione, verifica e completamento
   devono funzionare rapidamente anche in cucina.
7. **Fallback equivalenti.** Ridurre blur e motion non deve ridurre gerarchia,
   comprensione o feedback.
8. **Controllo professionale visibile.** Automazione, stima, verifica e
   conferma hanno stati distinti.

## Esempio

Una preview marketing può mostrare documenti e messaggi sfocati fuori dalla
lente e una ricetta che alimenta menu e lista dentro la zona nitida.

Nel workspace, la stessa idea diventa un drawer opaco e leggibile sopra un
canvas attenuato: il blur separa i livelli, ma non attraversa il contenuto.

## Anti-pattern

- Dashboard interamente trasparente.
- Card tutte lattiginose e indistinguibili.
- Gradienti saturi sopra testo o controlli.
- Glow neon su azioni ordinarie.
- Blur su righe di tabella, liste o task ripetuti.
- Estetica wellness, crypto, gaming o AI generica.
- Tipografia editoriale che rallenta la scansione operativa.
- Nero usato come tema dominante anziché come struttura.

## Impatto sul marketing

- La hero deve dimostrare ricetta → output, non mostrare una dashboard generica.
- La tipografia può interagire con membrane solo in aree non critiche.
- Il colore può occupare circa l’8–12% dei momenti più espressivi.
- La pagina torna prevalentemente bianca dopo ogni momento ad alta intensità.

## Impatto sul workspace

- Il colore d’accento occupa circa il 2–4% della superficie.
- Sono ammessi al massimo due layer `backdrop-filter` simultanei.
- Card operative e liste sono prevalentemente opache.
- Blur forte solo per overlay, focus isolato e transizioni non ripetute.
- Touch target e leggibilità mobile governano la composizione.

## Rischi tecnici

- GPU e batteria penalizzate da blur grandi o annidati.
- Contrasto variabile quando il background attraversa una superficie.
- Incoerenza tra browser senza fallback opaco.
- Font display usato impropriamente nell’interfaccia.
- Preset semantici trasformati in classi estetiche generiche.

## Richiede conferma

- Valori finali dei token dopo il prototipo Sirio.
- Download e self-hosting dei font dopo test su licenza e glifi.
- Introduzione di un dark mode completo.
- Uso del preset `glass-ai`.
- Nuove dipendenze per noise, distorsione o motion.

## Checklist

- [ ] Il contenuto principale è più nitido dello sfondo.
- [ ] Il blur risponde a una funzione UX.
- [ ] Il colore è raro e semanticamente motivato.
- [ ] Marketing e workspace usano intensità diverse.
- [ ] La UI resta comprensibile senza blur o motion.
- [ ] Le informazioni professionali rispettano WCAG 2.2 AA.
