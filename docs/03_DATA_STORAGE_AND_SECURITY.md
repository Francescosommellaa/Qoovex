# Data, storage and security

## Stato attuale verificato

Prisma conserva record, relazioni, stati e audit; Vercel Blob privato conserva i binari. Il motore non salva contenuto file, Blob key, token, URL firmati, credenziali, stack trace o dati sensibili non necessari.

Il repository contiene dieci migration canoniche, fino a `20260726010000_operational_engine_phase_3`. La decima migration e additiva ed e stata applicata e verificata soltanto sul database locale guardato. Nessun ambiente Preview o Production e dichiarato allineato.

`OperationalEvent` e append-only per servizio e usa `eventKey` idempotente. `OperationalArtifactReference` valida tipo, Azienda e risorsa. `OperationalRuleSnapshot` conserva uno snapshot minimizzato e immutabile dei `DocumentRequirement` usati; modifiche successive non riscrivono i run aperti. `OperationalEffectReceipt` impedisce effetti equivalenti duplicati.

## Garanzie runtime implementate

- idempotency key univoca per Azienda e processo;
- step univoci per processo;
- claim token, lease di cinque minuti e fencing al completamento;
- massimo cinque tentativi e backoff 1/5/15/60 minuti;
- eventi e payload allow-listed/minimizzati;
- query e mutazioni sempre tenant-scoped;
- timeline utente separata dall'audit tecnico.

## Specifiche non implementate

Non sono implementati retention automatica dedicata, cifratura applicativa aggiuntiva, indicizzazione del contenuto, OCR/AI, compensazioni generali o export di processo.

## Decisioni aperte e hard stop

Retention, ricerca, provider, trattamento ulteriore dei dati sensibili e deploy remoto restano decisioni separate. Non usare `db push`, reset o `migrate resolve` per aggirare cronologia o drift.
