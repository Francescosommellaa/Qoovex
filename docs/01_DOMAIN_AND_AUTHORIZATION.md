# Domain and authorization

## `verified_current_state`

`OrganizationRole` contiene soltanto `OWNER` e `COLLABORATOR`; `PlatformRole` contiene `USER`, `SUPPORT_AGENT` e `PLATFORM_ADMIN`. `Worker`, `User`, `OrganizationMembership`, resource grant e assegnazioni sono distinti. `OrganizationMembership.userId @unique` limita oggi un User a zero o una membership. Gli inviti correnti creano Collaborator e durano sette giorni; nessun invito o assegnazione corrente rappresenta un cliente.

Il server deriva `organizationId`, ruolo, permessi e scope. Solo Owner gestisce accessi Azienda. Support e metadata-only in sessione temporanea motivata; Platform Admin usa guard separati.

## `approved_product_direction`

### D-VNEXT-18 - contesti account

`User` resta l'identita personale unica. I contesti concettuali sono:

| Contesto | Fonte di autorizzazione | Scope | Invarianti |
| --- | --- | --- | --- |
| `PLATFORM` | `platformRole` e guard piattaforma | funzioni globali esplicite | non eredita membership o partecipazioni |
| `ORGANIZATION` | membership attiva selezionata, permission keys, scope e grant | una sola Azienda scelta | non derivare l'Azienda da `userId` soltanto |
| `CLIENT_JOB_SITE` | partecipazione cliente attiva selezionata | un solo cantiere e contenuti condivisi | non crea membership e `organizationId` del client non e autorevole |

Un cambio contesto ricostruisce authorization e scope server-side, invalida cache contestuali incompatibili e non trasferisce capability. Lo stesso account puo avere membership in piu Aziende e partecipazioni cliente in cantieri di altre Aziende, ma non puo rappresentare entrambe le parti nello stesso cantiere.

### D-VNEXT-19 e D-VNEXT-20 - partecipazione e membership multiple

`JobSiteParticipant` e un concetto futuro separato:

```text
JobSiteParticipant
|- ORGANIZATION_MEMBER
`- CLIENT
```

Campi concettuali: `id`, `jobSiteId`, `userId`, `participantKind`, `clientRole`, `status`, `accessVersion`, `membershipId?`, `jobSiteAssignmentId?`, `invitedById?`, `invitedAt?`, `acceptedAt?`, `activatedAt?`, `suspendedAt?`, `endedAt?`, `revokedAt?`, `reason?`, `createdAt`, `updatedAt`.

- `ORGANIZATION_MEMBER` richiede una membership valida nella stessa Azienda; non sostituisce `JobSiteUserAssignment` o `JobSiteWorkerAssignment`.
- `CLIENT` non ha membership e non accede alle superfici interne.
- Il primo MVP ammette un solo `PRIMARY_CLIENT` attivo per cantiere.
- L'Azienda deriva sempre dal `JobSite`, mai da un valore client-controlled.
- Il modello membership futuro usa unicita `(organizationId, userId)`; le partecipazioni cliente restano fuori da questa unicita.

Matrice partecipante-stato-azioni:

| Tipo | Stato | Lettura | Mutazioni ammesse | Transizioni ammesse |
| --- | --- | --- | --- | --- |
| entrambi | `INVITED` | solo preview invito minimizzata | accettare o rifiutare | `PENDING_INITIAL_CONFIRMATION`, `REVOKED`, `ENDED` |
| entrambi | `PENDING_INITIAL_CONFIRMATION` | riepilogo iniziale autorizzato | confermare o terminare | `ACTIVE`, `ENDED`, `REVOKED` |
| entrambi | `ACTIVE` | secondo matrice capability | azioni contestuali autorizzate | `SUSPENDED`, `ENDED`, `REVOKED`, `ACCOUNT_DELETED` |
| entrambi | `SUSPENDED` | storia gia autorizzata in sola lettura secondo policy | nessuna nuova azione economica o disclosure | `ACTIVE`, `ENDED`, `REVOKED` |
| entrambi | `ENDED` | storia autorizzata in sola lettura | nessuna nuova azione | terminale salvo nuovo invito/partecipazione |
| entrambi | `REVOKED` | nessun nuovo accesso; preservazione storica | nessuna | terminale salvo nuova partecipazione esplicita |
| entrambi | `ACCOUNT_DELETED` | autore storico pseudonimizzato secondo policy | nessuna | terminale |

Per un partecipante Azienda, scadenza/revoca membership o assegnazione invalida l'autorita anche se la riga partecipante non e ancora riconciliata. Per un cliente, sospensione o revoca non cancella storia, accettazioni o ricevute.

### D-VNEXT-22 - matrice attore-capability

Le capability sono nomi concettuali, non permission key runtime. `R` significa solo lettura autorizzata; `S` azione consentita; `D` consentita solo con delega attiva; `C` consentita soltanto se l'Owner ricopre anche il ruolo contestuale richiesto; `-` negata.

| Capability | Owner | Responsabile cantiere | Collaborator autorizzato | Collaborator operativo | Cliente principale |
| --- | --- | --- | --- | --- | --- |
| vedere riepilogo condiviso | S | S | S | R | R |
| vedere timeline interna | S | S | secondo permessi Azienda | secondo permessi Azienda | - |
| aggiornare dati operativi | S | S | secondo permessi | secondo permessi | - |
| pubblicare/condividere | S | S | D | - | - |
| commentare nel condiviso | S | S | S | S se assegnato | S |
| caricare prove proprie | S | S | S se assegnato | S se assegnato | S nelle proprie richieste |
| gestire partecipanti | S | S | D | - | - |
| gestire step | S | S | D | solo aggiornamenti assegnati | - |
| proporre modifiche | C | S | S se autorizzato | - | S |
| negoziare per Azienda | C | S | D | - | controparte cliente |
| accettare per Azienda | C | D | D | - | - |
| accettare per cliente | - | - | - | - | S |
| richiedere pagamento | C | D | D | - | - |
| dichiarare trasferimento | - | - | - | - | S |
| confermare ricezione | C | D | D | - | - |
| aprire disputa | S | S | S se parte autorizzata | S se coinvolto | S |
| proporre chiusura | C | D | D | - | - |
| confermare chiusura Azienda | C | D | D | - | - |
| confermare chiusura cliente | - | - | - | - | S |
| creare richiesta post-chiusura | S | S | S se autorizzato | - | S |
| archiviare dopo chiusura | S | D | - | - | - |
| scaricare export cliente | - | - | - | - | S |
| scaricare export Azienda | S | S se autorizzato | D | - | - |
| concedere/revocare deleghe | S | - | - | - | - |

Default-deny: una riga `D` richiede grant valido e capability sottostante; il responsabile non riceve automaticamente autorita economica oltre alle capability esplicitamente definite. Owner amministra le deleghe ma non e automaticamente l'autore economico del cantiere.

### D-VNEXT-23 - delega economica

`JobSiteAuthorityGrant` e un concetto futuro con campi `jobSiteId`, `granteeUserId`, `capability`, `grantedByUserId`, `reason`, `validFrom`, `validUntil?`, `revokedAt?`, `revokedByUserId?`, `revocationReason?`, `accessVersion`.

Capability delegabili concettuali: `COMMERCIAL_NEGOTIATE`, `COMMERCIAL_ACCEPT`, `PAYMENT_REQUEST`, `PAYMENT_CONFIRM_RECEIPT`, `CLOSURE_PROPOSE`.

Invarianti:

- nel primo MVP solo Owner concede o revoca;
- il grant vale per un solo cantiere, non e trasferibile e non amplia membership, scope o altre capability;
- il delegato non puo delegare altri e il grant presuppone membership e scope validi;
- ogni invio, accettazione o conferma rivalida membership, partecipazione, assegnazione, grant, scadenza e `accessVersion`;
- la revoca impedisce di inviare bozze o riusare autorizzazioni stale;
- effetti gia accettati restano storia immutabile e non vengono annullati dalla revoca.

### D-VNEXT-24 - invito cliente

`JobSiteClientInvitation` e separato da `OrganizationInvitation`, crea una partecipazione e mai una membership. Il token e forte, one-time, persistito solo come hash, associato all'email verificata e valido 14 giorni. Un account esistente deve autenticarsi con l'email invitata. Un nuovo invito supersede quello attivo precedente; email e notifiche non contengono allegati o dati interni.

### D-VNEXT-39 - ruoli cliente

Il primo MVP usa soltanto `PRIMARY_CLIENT`. Ruoli futuri concettuali, mai `OrganizationRole`:

| Ruolo futuro | Limite concettuale |
| --- | --- |
| `CLIENT_DELEGATE` | azioni espressamente delegate dal cliente principale, senza autorita implicita |
| `CLIENT_CONTRIBUTOR` | commenti e allegati propri, senza accettazioni economiche o chiusura |
| `CLIENT_OBSERVER` | sola lettura dei contenuti condivisi autorizzati |

Il cliente vede dei Collaborator soltanto nome, cognome e ruolo operativo nel cantiere. Worker documenti, contatti, dati fiscali, sanitari, permessi e altri cantieri restano esclusi.

## `conceptual_not_implemented`

Contesti, partecipanti, membership multiple, grant, stati e capability sopra descritti non esistono nello schema, nei tipi o nell'authorization runtime. `CLIENT` non deve essere aggiunto a `OrganizationRole`; non reintrodurre `ADMIN`, `MEMBER`, `SAFETY_CONSULTANT`, `SITE_MANAGER` come ruolo Azienda, `WORKER` come ruolo account o `VIEWER`.

## `hard_stop`

La protezione tecnica dell'IBAN e il modello commerciale definitivo restano hard stop vNext. Nessun client puo autoattribuirsi contesto, Azienda, partecipazione, delega, parte rappresentata o visibilita.
