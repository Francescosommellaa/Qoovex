# Sirio App

Showcase tecnico e superficie di prova del design system Qoovex.

## Stato

La direzione Traccia Operativa è approvata e integrata. Sirio documenta la fondazione canonica importata da `@qoovex/ui`; non possiede un design system parallelo e non contiene business logic.

## Responsabilità

- mostrare palette, scala di grigi, tipografia e densità;
- provare controlli, feedback e grammatica `Trace` in tutti gli stati;
- verificare contenuto lungo, loading, errore, assenza dati e responsive;
- conservare `/foundations` come tavola narrativa della direzione approvata;
- documentare in `/foundations#token` i tre livelli del contratto token prima dell'approvazione;
- ospitare `/situazione-aperta` come specimen identitario in attesa di approvazione;
- separare copy prudente da copy da evitare.

## Divieti

- niente Prisma, auth o servizi prodotto;
- niente token locali alternativi alla foundation condivisa;
- niente preset, obblighi o promesse normative inventate;
- niente import Fontshare duplicati.

## Comandi

```bash
pnpm --filter @qoovex/sirio type-check
pnpm --filter @qoovex/sirio build
```
