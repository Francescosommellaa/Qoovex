# Data, storage and security

## Stato attuale verificato

Prisma conserva record, relazioni, stati e audit; Vercel Blob privato conserva i binari. Il motore non salva contenuto file, Blob key, token, URL firmati, credenziali, stack trace o dati sensibili non necessari.

Il repository contiene sedici migration canoniche. `20260728010000_access_model_expand` e `20260728020000_access_model_contract` sono applicate soltanto al database locale guardato. La migration additiva `20260728030000_operational_workspace_expansion` introduce profilo e contatti, lifecycle versioni, collegamenti documento-cantiere, storico assegnazioni, prove revisionate, richieste/messaggi/timeline, fonti manuali e snapshot estesi; al termine di questa implementazione resta pendente perche il wrapper richiede un backup reference esplicito. Nessun ambiente Preview o Production e dichiarato allineato.

`OperationalEvent` e append-only per servizio e usa `eventKey` idempotente. `OperationalEventArtifactReference` aggrega timeline senza duplicare eventi. `DocumentPackageRevision` congela manifest minimizzato e fingerprint SHA-256; una mutazione successiva non riscrive revisioni o link. I link legacy sono associati a revisioni `LEGACY_BACKFILL` preservando accesso, scadenza e download preesistenti.

## Garanzie runtime implementate

- idempotency key univoca per Azienda e processo;
- step univoci per processo;
- claim token, lease di cinque minuti e fencing al completamento;
- massimo cinque tentativi e backoff 1/5/15/60 minuti;
- eventi e payload allow-listed/minimizzati;
- query e mutazioni sempre tenant-scoped;
- timeline utente separata dall'audit tecnico.
- download documenti subordinato a `documents:file:read` e, per categorie sensibili, a `documents:sensitive:read`;
- download prove subordinato a `evidence:file:read` e, per classificazione `RESTRICTED`, a `evidence:sensitive:read`;
- sessioni Support sempre metadata-only, senza file documentali o prove;
- versione corrente approvata puntata da `Document.currentVersionId`, con revisioni condivise immutabili;
- prove `INTERNAL` per default, condivisibili soltanto se `ACCEPTED` e `SHAREABLE`.

## Specifiche non implementate

Non sono implementati retention automatica dedicata, cifratura applicativa aggiuntiva, indicizzazione del contenuto file, OCR/AI, ricerca semantica, compensazioni generali o export di processo.

## Decisioni aperte e hard stop

Retention, ricerca, provider, trattamento ulteriore dei dati sensibili e deploy remoto restano decisioni separate. Non usare `db push`, reset o `migrate resolve` per aggirare cronologia o drift.
