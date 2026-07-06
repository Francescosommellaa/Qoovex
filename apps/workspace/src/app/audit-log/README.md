# Audit Log Page

Route admin `/audit-log`.

- Legge gli eventi da `listProductAuditEvents`.
- Mostra access denied coerente se il ruolo non puo leggere l'audit.
- La scrittura audit avviene solo dai service server-side.
