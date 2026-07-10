# Procedura cliente: supporto, export, cancellazione e logout

Questa procedura rende operativo il flusso cliente per assistenza, export dati, cancellazione organization e uscita dal workspace. Usa solo funzioni gia previste dal prodotto: supporto auditato, Data Control, Prisma e Vercel Blob.

Qoovex aiuta a tenere ordinati documenti, scadenze, checklist, prove e pacchetti documentali. Non certifica conformita, non garantisce validita legale dei documenti e non sostituisce consulenti, responsabili tecnici o valutazioni del cliente.

## 1. Apertura richiesta

1. Ricevere la richiesta tramite `supporto@qoovex.com`.
2. Registrare richiedente, email, azienda, organization code se disponibile, motivo e azione richiesta: supporto, export, cancellazione o uscita dal pilota.
3. Verificare che il richiedente sia OWNER o referente autorizzato dall'azienda.
4. Se la richiesta riguarda cancellazione o export, chiedere conferma scritta separata prima di procedere.
5. Non accettare richieste informali, telefoniche non tracciate o provenienti da utenti senza autorita verificata.

## 2. Accesso supporto controllato

1. Accedere a `/qoovex-admin/organizations` con un account Operatore Qoovex autorizzato e MFA attivo.
2. Indicare motivo specifico, organization code e durata necessaria.
3. Limitare l'accesso ai dati strettamente necessari alla richiesta.
4. Non visualizzare, copiare o condividere password, TOTP, backup code, token, hash, URL Blob permanenti o `blobKey`.
5. Verificare che gli eventi `SupportAuditEvent` e audit prodotto registrino l'accesso.
6. Chiudere la sessione dal banner persistente appena completata l'operazione.

## 3. Export metadata cliente

L'export corrente e metadata JSON privato. Non include file binari, allegati, URL Blob permanenti, token, hash o `blobKey`.

1. Entrare nel workspace dell'azienda come OWNER o tramite sessione supporto autorizzata.
2. Aprire `/data-control`.
3. Creare un job export metadata con il pulsante "Crea job export" oppure via `POST /api/data/export-jobs`.
4. Eseguire il runner solo da ambiente autorizzato:

```bash
curl -X POST "$NEXT_PUBLIC_WORKSPACE_URL/api/data/jobs/run" \
  -H "x-qoovex-cron-secret: $QOOVEX_CRON_SECRET"
```

5. Attendere `DataControlJob.status = COMPLETED`.
6. Scaricare l'export dalla route privata `/api/data/export-jobs/{jobId}/download`.
7. Consegnare il file solo tramite canale concordato e tracciato.
8. Registrare nel ticket: job id, data/ora, operatore, organization code, canale di consegna e conferma ricezione.

## 4. Cancellazione organization

La cancellazione definitiva non parte mai da una richiesta non verificata.

1. Confermare che il cliente abbia ricevuto o rifiutato l'export metadata.
2. Verificare organization code e autorita del richiedente.
3. In `/data-control`, creare il job `ORGANIZATION_DELETE`.
4. Inserire il codice azienda esatto e la conferma testuale esatta:

```text
ELIMINA DEFINITIVAMENTE
```

5. Eseguire il runner da ambiente autorizzato con `QOOVEX_CRON_SECRET`.
6. Il job deve eliminare prima i Blob sotto il prefisso organization e poi i record Prisma previsti.
7. Registrare `DataControlJob.id`, stato finale, eventuale `errorCode`, numero Blob eliminati e ora completamento.
8. Se il job fallisce, non riprovare alla cieca: leggere l'errore, verificare log Vercel e aprire correzione dedicata se serve.

## 5. Controlli post-cancellazione

1. Verificare che organization, documenti, scadenze, checklist, prove, pacchetti e share link non siano piu accessibili.
2. Verificare che un fresh login dell'utente cliente non veda l'azienda cancellata.
3. Verificare che i link condivisi anonimi ritornino `404 { "message": "Link non disponibile." }`.
4. Eseguire dry-run Blob orfani se l'ambiente lo consente e verificare il prefisso organization.
5. Controllare che backup o restore successivi non reintroducano dati cancellati.
6. Conservare solo l'evidenza operativa minima necessaria: ticket, conferme, job id, date, operatori e risultato.

## 6. Logout e offboarding cliente

Per logout cliente si intende chiusura dell'accesso operativo dopo supporto, export, cancellazione o uscita dal pilota.

1. Chiedere al cliente di uscire dal workspace usando il normale sign-out dell'app.
2. Se si revoca un membro, usare il flusso membri: la revoca incrementa `authVersion` e rimuove le sessioni persistenti dell'utente revocato.
3. Dopo cancellazione organization, verificare da sessione pulita o browser anonimo che `/api/context` non esponga piu membership attiva.
4. Revocare eventuali share link non piu necessari prima della chiusura, se l'organization non viene cancellata.
5. Chiudere eventuali sessioni supporto aperte.
6. Registrare nel ticket l'esito: logout confermato, accesso revocato, organization cancellata o pilota convertito.

## 7. Chiusura ticket

Il ticket puo essere chiuso solo quando sono presenti:

- richiesta originale e conferme scritte;
- verifica identita/autorita del richiedente;
- eventuale export consegnato o rifiutato;
- eventuale job cancellazione completato o motivazione del blocco;
- controlli post-cancellazione eseguiti;
- support session chiusa;
- indicazione che non sono stati condivisi token, hash, `blobKey` o URL Blob permanenti.

## 8. Comandi di verifica tecnica

Prima di usare questa procedura con clienti reali, verificare l'ambiente:

```bash
pnpm --filter @qoovex/workspace type-check
pnpm --filter @qoovex/workspace test
pnpm --filter @qoovex/db exec prisma validate
pnpm test:e2e
```

In produzione verificare inoltre che `QOOVEX_CRON_SECRET`, database, auth e Blob siano configurati e che il runner Data Control risponda solo con secret corretto.
