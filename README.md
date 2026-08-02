# Qoovex

## Stato canonico

- `verified_current_state`: repository foundation-only dopo D-VNEXT-46 Legacy Eradication.
- `approved_product_direction`: Qoovex vNext, spazio condiviso Azienda-cliente per il lavoro edile.
- `conceptual_not_implemented`: tutte le capacità prodotto vNext.

La build corrente conserva identità, Auth.js, MFA, sicurezza, Aziende, `OWNER`/`COLLABORATOR`, inviti aziendali, scope e grant, Worker e assegnazioni, `JobSite` minimo, file/versioni private, prove, notifiche di sistema, audit, supporto e data-control. Non contiene timeline prodotto, deadline, checklist, pacchetti, share link, richieste contestuali, fasi cantiere o processi prodotto.

`CLIENT` non è e non diventa un `OrganizationRole`. Account cliente, immobili, partecipazione al cantiere, timeline condivisa, step, proposte, pagamenti, dispute, chiusura reciproca ed export cliente saranno oggetto del Prompt B e non sono disponibili qui.

## Applicazioni

- `apps/workspace`: runtime autenticato foundation-only.
- `apps/web`: sito pubblico che distingue direzione approvata e capacità disponibile.
- `apps/sirio`: catalogo della sola foundation visuale; nessuna demo prodotto.
- `packages/db`, `packages/types`, `packages/ui`: persistence, contratti foundation e UI condivisa.

## Operazioni

Leggere [docs/HowToUse.md](docs/HowToUse.md) e [docs/OperationalProtocol.md](docs/OperationalProtocol.md). Database operation impact del task D-VNEXT-46: una migration locale distruttiva; Preview e Production non applicate.
