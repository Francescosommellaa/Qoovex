# 01 — Domain and authorization

## verified_current_state

`User` è l’identità personale unica. Ogni account può avere al massimo una `OrganizationMembership` attiva; per questo il runtime indirizza direttamente all'unica Azienda collegata e non presenta un selettore di contesto Azienda. `OrganizationRole` contiene soltanto `OWNER | COLLABORATOR`; `CLIENT` usa `JobSiteParticipant.kind=CLIENT` e non ottiene membership o permessi Azienda.

I resolver server-side sono distinti:

| Contesto | Fonte di autorizzazione | Confine |
| --- | --- | --- |
| `PLATFORM` | `PlatformRole` e support session | funzioni piattaforma |
| `ORGANIZATION` | route, membership attiva, scope, permission, `accessVersion` | una Azienda |
| `CLIENT` | identity e participant del JobSite | soli cantieri partecipati |

La route è la fonte del contesto. Ogni mutation ricontrolla tenant, resource ownership, membership/participant, stato, revisione e permesso. Un participant sospeso, terminato o revocato non può mutare.

## Partecipanti

`JobSiteParticipant` separa `ORGANIZATION_MEMBER` e `CLIENT`. Il primo richiede una membership attiva; il secondo non può avere membership o Worker. Un vincolo `userSideKey` impedisce allo stesso account di rappresentare entrambe le parti nello stesso cantiere. Il primo MVP ammette un solo cliente principale non revocato.

`JobSiteWorkerAssignment` resta per Worker senza account. Le assegnazioni account precedenti sono state migrate deterministicamente in participant Azienda e il modello precedente è stato eliminato.

## Autorità economica

Owner e responsabile non ricevono autorità economica implicita. Un Owner concede e revoca `JobSiteAuthorityGrant`, anche a sé stesso. Le capability persistite sono negoziazione, accettazione commerciale, richiesta pagamento, conferma ricezione e proposta chiusura; `validFrom`, scadenza, stato e revoca sono ricontrollati alla mutation finale.

Il creatore storico nullable e il responsabile corrente sono concetti separati. Il responsabile può essere riassegnato; non è possibile terminare il participant responsabile prima della riassegnazione.

## Privacy Collaborator

La proiezione cliente espone dei Collaborator soltanto nome, cognome e ruolo operativo pubblico. Non espone email, telefono, indirizzo, dati fiscali, documenti, attestati, scadenze, dati sanitari, note interne, permessi o altri cantieri.

## hard_stop

Mai aggiungere `CLIENT` a `OrganizationRole`; nessuna scorciatoia Platform Admin o Support consente accesso prodotto o file; i futuri ruoli cliente richiedono un nuovo contratto.
