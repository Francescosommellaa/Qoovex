# How to use

1. Richiamare `get_task_context` dal server MCP `qoovex_brain`.
2. Per task UI chiamare `check_ui_task`; non esiste uno stile canonico da riusare dopo il reset.
3. Leggere prima `/docs/00_PRODUCT_RESET.md`, `/docs/09_DOMAIN_NAMING_AND_PERMISSIONS.md` e `/docs/11_STORAGE_AND_DATABASE_DECISIONS.md`.
4. Verificare README locale, codice reale e confini auth.
5. Non inventare normative, documenti ufficiali, scadenze, pricing o permessi non approvati.
6. Usare Prisma per dati e Blob per file/documenti/prove.
7. Non modificare migrazioni Prisma o valori enum persistiti senza piano esplicito.
8. Eseguire lint, type-check, test e build pertinenti.
9. Aggiornare il Brain e appendere il riepilogo a `00_System/session-log.md`.
