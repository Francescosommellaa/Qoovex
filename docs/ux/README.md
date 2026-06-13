# UX Strategy

## Scopo

Questa cartella è la fonte canonica di Qoovex per:

- strategia UX;
- target, personas e nicchie;
- posizionamento e messaggi;
- struttura informativa della landing;
- principi dei flussi prodotto;
- priorità e criteri decisionali delle feature;
- strategia di copy;
- evidenze e punti da validare con utenti reali.

Non è un design system e non definisce componenti, token, font, colori,
layout finali o animazioni.

## Gerarchia delle fonti

**Fatto confermato**

1. Business rule, piani, permessi e limiti: Qoovex Brain e
   `packages/config/plan_rules.json`.
2. Architettura e stato implementativo: Qoovex Brain, README locali e codice.
3. Strategia UX e comunicazione: questa cartella.
4. Decisioni visuali future: decisione dedicata ancora da creare.

Se un documento UX contraddice una fonte di livello superiore, il documento
UX è errato e deve essere corretto.

## Tassonomia obbligatoria

Ogni decisione o affermazione non banale deve essere classificata:

- **Fatto confermato**: verificato nel Brain, nelle regole prodotto, nel codice
  o in una fonte esterna citata.
- **Ipotesi ragionata**: deduzione coerente con le evidenze, ma non ancora
  confermata da ricerca utente.
- **Punto da validare**: domanda aperta con metodo e criterio di validazione.
- **Decisione proposta**: scelta operativa adottata fino a nuova evidenza.

## Decisioni

**Decisione proposta**

- `docs/ux` è la fonte canonica delle decisioni UX.
- I dettagli di prodotto restano nelle fonti superiori indicate.
- Ogni documento adotta la tassonomia e gli stati definiti qui.
- Nessun documento UX può introdurre implicitamente una business rule.

## Stato delle feature

Usare solo questi stati:

- `disponibile`: capacità verificata e realmente utilizzabile;
- `scope confermato`: parte del perimetro prodotto, ma non necessariamente
  disponibile tramite UI;
- `roadmap`: visione futura non vendibile come capacità attuale;
- `da validare`: valore o soluzione non ancora dimostrati;
- `da escludere dalla comunicazione`: elemento che crea confusione o aspettative
  scorrette.

Lo stato implementativo deve essere verificato prima di pubblicare copy o
materiali marketing.

## Regole

**Decisione proposta**

- Scrivere per founder, designer, developer e AI agent.
- Preferire regole verificabili a principi astratti.
- Collegare ogni messaggio a un problema, un risultato e una prova.
- Non inventare piani, prezzi, permessi o feature gating.
- Non presentare allergeni o nutrizione come infallibili, certificati o
  sostitutivi della verifica professionale.
- Non presentare AI, PrepStock o scheduling avanzato come parte della v1.
- Non duplicare nei documenti UX dettagli operativi già canonici: citarne la
  fonte.
- Aggiornare la data delle ricerche esterne e conservare i link alle fonti.

## Cosa può essere aggiunto

- report di interviste anonimizzati;
- risultati di test dei cinque secondi e smoke test;
- decisioni di information architecture;
- content model e tassonomie UX;
- metriche di attivazione e usabilità;
- revisioni motivate delle personas o del posizionamento.

## Cosa non deve essere aggiunto

- componenti UI o specifiche visuali;
- codice o API contract;
- schema database;
- regole di billing duplicate;
- roadmap presentate come impegni;
- note personali, brainstorming non classificato o copy senza contesto.

## Procedura di aggiornamento

1. Richiamare il contesto tramite MCP `qoovex_brain`.
2. Verificare Brain, `plan_rules.json`, README locale e stato reale.
3. Identificare i documenti UX impattati.
4. Separare fatto, ipotesi, validazione e decisione.
5. Aggiornare i riferimenti incrociati.
6. Eseguire i quality gate del repository.
7. Registrare la decisione stabile nel Brain senza duplicarne i dettagli.

## Esempi

Corretto:

> **Decisione proposta**: la hero parla prima a chef consulenti e freelance.
> **Punto da validare**: confrontare la comprensione con chef di ristoranti
> indipendenti tramite due varianti di landing.

Errato:

> Qoovex è perfetto per ogni professionista del food.

## Anti-pattern

- Confondere modello backend con feature già disponibile.
- Usare “automatico” senza spiegare controllo e affidabilità.
- Elencare tutte le feature nella hero.
- Definire il target come “tutti gli chef”.
- Copiare i limiti dei piani in più documenti senza riferimento canonico.
- Trasformare una richiesta del founder in “dato di ricerca”.

## Checklist finale

- [ ] La fonte di ogni business rule è esterna a `docs/ux`.
- [ ] Ogni affermazione strategica è classificata.
- [ ] Le feature future sono indicate come roadmap.
- [ ] Esistono esempi, anti-pattern e criteri verificabili.
- [ ] I punti incerti specificano come essere validati.
- [ ] Il documento aiuta a decidere cosa mostrare o non mostrare.
