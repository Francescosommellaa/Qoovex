# 03 — Dati, storage e sicurezza

## verified_current_state

Una sola migration additiva alla history, `20260802010000_remove_legacy_product_foundation`, elimina tabelle, FK, indici, colonne ed enum legacy. Le 17 migration precedenti restano immutate. `Document`, `DocumentVersion`, `Evidence` ed `EvidenceRevision` conservano soltanto primitive generiche; upload/download sono autorizzati server-side con Blob privato, checksum, MIME e limiti dimensionali.

Gli export metadata non includono `blobKey`, token, hash, segreti o contenuti file. Audit di sicurezza, auth, accessi e file resta attivo. Le notifiche sono soltanto `SYSTEM`.

## Migration safety

Backup locale prima dell’upgrade: JSON privato in directory temporanea, 63 tabelle/179 righe, SHA-256 registrato nel report task. La history completa e l’upgrade 17→18 sono stati provati su database locali distinti. Preview e Production non sono stati interrogati né modificati.

## Hard stop

Retention definitiva, legal hold e cancellazione richiedono policy verificata. Nessuna cancellazione fisica del cantiere è autorizzata. Le future audience `INTERNAL/SHARED_WITH_CLIENT`, ricevute e IBAN non sono implementate.
