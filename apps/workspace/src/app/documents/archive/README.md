# Documents Archive Page

Pagina Workspace dedicata ai documenti archiviati, disponibile soltanto a OWNER e ADMIN tramite la capability server-side `canManageArchivedDocuments` e il permesso `documents:archive`.

La route riusa `DocumentsPageView` in modalità archivio, mantiene le mutation protette sotto `/api/documents/[documentId]/archive` e separa le azioni irreversibili dai normali filtri di stato. Gli URL legacy `/documents?status=ARCHIVED` vengono reindirizzati qui.
