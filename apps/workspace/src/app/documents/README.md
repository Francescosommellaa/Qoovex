# Documents Pages

Pagine workspace per lista e dettaglio documenti.

Usano i service server-side esistenti per leggere dati filtrati per azienda e le API `/api/documents` per le mutation client-side.

La lista compone esclusivamente primitive canoniche `@qoovex/ui`, mantiene i filtri nello stato della URL e conserva `origin=dashboard` e `intent=upload` quando presenti. La composizione e app-local e non modifica route, payload, permessi o ordinamento server-side.

OWNER e ADMIN possono aprire la route dedicata `/documents/archive`, filtrarla per contesto, ripristinare un documento come `TO_REVIEW` o eliminarlo definitivamente dopo averne digitato il titolo esatto. Scadenze ed elementi dei pacchetti restano registrati senza il collegamento al documento eliminato. Il vecchio filtro URL `status=ARCHIVED` reindirizza alla route dedicata.

L'azione primaria di ogni riga apre un dialog app-local con i dati gia presenti nella lista. Le versioni file vengono richieste una sola volta alla prima apertura tramite la API protetta esistente; `Gestisci documento` e l'unica CTA del footer e apre la pagina completa per le operazioni avanzate.

I link nuovi usano `/documents/[titolo-normalizzato]--[id]`: il suffisso opaco resta la chiave server-side, mentre i vecchi URL `/documents/[id]` continuano a essere accettati. Titolo pagina e breadcrumb derivano dal documento autorizzato, senza nuove letture dedicate.
