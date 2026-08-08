# 03 â€” Data storage and security

## verified_current_state

La migration la sesta migration pubblicata nel migration ledger porta la history a 6 migration e rimuove fisicamente il dominio precedente partendo dal baseline Production a 5. Blob Ã¨ privato; upload e download passano dal server, applicano autorizzazione oggetto, audit, pathname generato, checksum SHA-256, MIME reale e limite tecnico 4 MiB.

## Timeline, snapshot e allegati

La timeline Ã¨ append-only, sequenziata atomicamente e paginata a cursore. Audience: `INTERNAL | SHARED`; disclosure: `GENERAL | COMMERCIAL | RESTRICTED_COMMERCIAL`. Correzioni, ritiri e sostituzioni aggiungono eventi o metadata senza riscrivere versioni precedenti.

JSON Ã¨ limitato a payload versionati di agreement, closure, timeline ed effect. Ogni payload Ã¨ validato da Zod e fingerprint SHA-256. Allegati e publication conservano origine, audience, categoria, checksum e metadata fotografati; il binario non viene duplicato.

## IBAN e ricevute

Il profilo pagamento Ã¨ versionato. Lâ€™IBAN Ã¨ cifrato AES-256-GCM con `QOOVEX_DATA_ENCRYPTION_KEYS` e `QOOVEX_DATA_ENCRYPTION_ACTIVE_KEY_ID`; ciphertext, nonce, auth tag e key id sono separati. AAD lega organizzazione, profilo e versione. Ãˆ vietato il fallback su segreti Auth/MFA. La modifica richiede MFA attiva e soddisfatta.

Una ricevuta `PAYMENT_RECEIPT` Ã¨ collegata a una precisa richiesta. Ãˆ visibile al cliente principale e agli attori Azienda con autoritÃ  commerciale; non prova automaticamente lâ€™accredito.

## Threat controls

Tenant/participant isolation, IDOR protection, token hash monouso, rate limit, `accessVersion`, optimistic concurrency, idempotency fingerprint, transazioni Serializable, MIME spoofing/path traversal/oversize rejection, grant scaduti, cache per contesto, export audience-specific e audit minimizzato. Token hash, Blob key, IBAN completo e URL permanenti non entrano nei DTO client.

## Retention e legal hold

Inviti cliente 14 giorni; pagina link export 7 giorni; grant download 15 minuti; archivio ZIP 30 giorni. Record canonici, timeline, proposte, pagamenti e dispute seguono il JobSite. `LegalHold` e dispute preservation bloccano cleanup pertinente senza ampliare la visibilitÃ .

## hard_stop

Nessuna cancellazione fisica automatica di record attuale; nessun cleanup di contenuti soggetti a hold; nessuna chiave reale versionata. Il reset one-shot empty-store esiste soltanto nel workflow manuale attuale ed Ã¨ congelato in attesa di una nuova autorizzazione esplicita; non Ã¨ un'operazione ordinaria nÃ© implicitamente autorizzata.
