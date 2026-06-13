# Design

## Scopo

Questa cartella è la fonte canonica per la direzione visuale di Qoovex:

- identità visiva;
- sistemi colore, tipografia, superfici e blur;
- differenza tra marketing e workspace;
- regole visuali dei componenti;
- criteri di accessibilità, performance e verifica;
- ordine di implementazione della futura UI.

La strategia UX resta in [`docs/ux`](../ux/README.md). Le business rule restano
nel Qoovex Brain e in `packages/config/plan_rules.json`.

## Stato

La specifica è approvata come fondazione visuale, ma non è ancora implementata.

- `apps/sirio` resta uno scaffold vuoto.
- `packages/ui` resta uno scaffold vuoto.
- Nessun token o preset descritto qui è disponibile nel runtime.
- I valori numerici sono contratti o intervalli candidati finché non vengono
  validati in Sirio con contenuti realistici.

## Mappa

- [`design.md`](design.md): decisione sintetica e principi non negoziabili.
- [`visual-language.md`](visual-language.md): composizione, forme, gerarchia e
  materiali.
- [`visual-reference-analysis.md`](visual-reference-analysis.md): evidenze
  ricavate dalle reference fornite.
- [`blur-system.md`](blur-system.md): ruoli, bande, preset e limiti del blur.
- [`color-system.md`](color-system.md): monocromia, accenti e colori funzionali.
- [`typography-system.md`](typography-system.md): famiglie, ruoli e leggibilità.
- [`marketing-ui-direction.md`](marketing-ui-direction.md): applicazione sul
  sito pubblico.
- [`workspace-ui-direction.md`](workspace-ui-direction.md): applicazione
  mobile-first nell’app.
- [`component-visual-rules.md`](component-visual-rules.md): contratti visuali
  dei componenti.
- [`implementation-plan.md`](implementation-plan.md): sequenza di prototipazione
  e implementazione.

## Ownership

- `docs/design` decide il linguaggio visuale.
- `docs/ux` decide target, priorità, flussi, messaggi e copy.
- `apps/sirio` servirà a validare visivamente token, stati e responsive behavior.
- `packages/ui` sarà la fonte runtime dei token e componenti condivisi.
- `packages/brand` resta l’unica fonte del logo originale.
- Il Qoovex Brain registra lo stato e le decisioni stabili senza duplicare
  questa specifica.

## Regole di modifica

1. Richiamare il contesto con MCP `qoovex_brain`.
2. Verificare UX, business rule e stato reale del repository.
3. Distinguere decisione stabile, valore candidato e punto da validare.
4. Descrivere impatto su marketing, workspace, accessibilità e performance.
5. Non modificare token o componenti condivisi senza un piano di migrazione.
6. Validare in Sirio a 375, 768, 1024 e 1440 px.
7. Aggiornare Brain e session log alla chiusura.

## Cosa può essere aggiunto

- evidenze di test visuali e di usabilità;
- decisioni su token validate in Sirio;
- regole responsive;
- audit di accessibilità e performance;
- note sui componenti canonici;
- motivazioni di una revisione visuale approvata.

## Cosa non deve essere aggiunto

- CSS o token non validati presentati come definitivi;
- mockup che mostrano feature non disponibili;
- copie degli screenshot di terzi usati come reference;
- business rule, prezzi o permessi duplicati;
- brainstorming non classificato;
- un design system alternativo a `packages/ui`;
- componenti app-local che duplicano primitive condivise.

## Rapporto con il Brain

Il Brain deve indicare che questa cartella è la fonte visuale canonica e se la
specifica è solo documentata, prototipata o implementata. I dettagli dei token
restano qui e, dopo l’implementazione, nella fonte runtime di `packages/ui`.

## Esempio

Una revisione di `glass-navigation` aggiorna prima la specifica e il prototipo
Sirio; solo dopo approvazione modifica token o componenti in `packages/ui`.

## Anti-pattern

- Aggiungere un valore CSS isolato a un documento come se fosse un token.
- Duplicare una regola UX o una business rule.
- Registrare nel Brain tutti i dettagli già presenti qui.
- Descrivere come implementata una decisione ancora solo documentale.

## Impatto sul marketing

Questa cartella governa materiali, tipografia, blur, colore e componenti del
sito pubblico senza cambiare messaggi e ordine delle sezioni definiti in UX.

## Impatto sul workspace

Questa cartella impone una UI mobile-first, sobria e leggibile. Le business
rule e i flussi restano nelle fonti prodotto e UX.

## Rischi tecnici

- Divergenza tra documentazione, Sirio e runtime.
- Token duplicati o consumer override.
- Stato documentale interpretato come disponibilità reale.
- Specifiche troppo astratte per produrre test verificabili.

## Richiede conferma

- Qualsiasi valore definitivo di token.
- Modifica di componenti condivisi.
- Nuove dipendenze visuali.
- Eccezioni ai limiti di blur, contrasto o performance.

## Checklist

- [ ] La modifica serve la strategia UX canonica.
- [ ] È chiaro cosa è deciso e cosa deve essere validato.
- [ ] Marketing e workspace restano coerenti ma non identici.
- [ ] Il blur ha una funzione esplicita.
- [ ] Leggibilità e performance prevalgono sull’effetto.
- [ ] Non sono state introdotte feature o business rule.
- [ ] Sirio, `packages/ui` e Brain hanno ownership non sovrapposte.
