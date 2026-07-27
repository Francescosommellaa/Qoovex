# Data, storage and security

## Stato attuale verificato

Prisma conserva record, relazioni, stati e audit; Vercel Blob privato conserva i binari. Il motore non salva contenuto file, Blob key, token, URL firmati, credenziali, stack trace o dati sensibili non necessari.

Il repository contiene tredici migration canoniche. Dopo le due migration Fase 4, `20260727030000_adaptive_access_model` aggiunge preset, permessi persistiti, scope, scadenza e grant tenant-safe, quindi mappa i ruoli professionali esistenti a `MEMBER` senza ampliare le assegnazioni. Le tredici migration sono applicate e verificate soltanto sul database locale guardato. Nessun ambiente Preview o Production e dichiarato allineato.

`OperationalEvent` e append-only per servizio e usa `eventKey` idempotente. `OperationalEventArtifactReference` aggrega timeline senza duplicare eventi. `DocumentPackageRevision` congela manifest minimizzato e fingerprint SHA-256; una mutazione successiva non riscrive revisioni o link. I link legacy sono associati a revisioni `LEGACY_BACKFILL` preservando accesso, scadenza e download preesistenti.

## Garanzie runtime implementate

- idempotency key univoca per Azienda e processo;
- step univoci per processo;
- claim token, lease di cinque minuti e fencing al completamento;
- massimo cinque tentativi e backoff 1/5/15/60 minuti;
- eventi e payload allow-listed/minimizzati;
- query e mutazioni sempre tenant-scoped;
- timeline utente separata dall'audit tecnico.

## Specifiche non implementate

Non sono implementati retention automatica dedicata, cifratura applicativa aggiuntiva, indicizzazione del contenuto file, OCR/AI, ricerca semantica, compensazioni generali o export di processo.

## Decisioni aperte e hard stop

Retention, ricerca, provider, trattamento ulteriore dei dati sensibili e deploy remoto restano decisioni separate. Non usare `db push`, reset o `migrate resolve` per aggirare cronologia o drift.
