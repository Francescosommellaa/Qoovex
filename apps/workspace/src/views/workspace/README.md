# Workspace Views

Componenti app-local per shell, navigazione, topbar e account del Workspace. Non sono un design system condiviso e non importano Prisma o logica server-side.

La navigazione primaria e costruita dai permessi effettivi e contiene soltanto destinazioni. La ricerca apre un modale separato e non una pagina; la card Azioni rapide nel footer raccoglie le mutazioni manuali principali autorizzate. Non espone Preferiti o Analisi. Nessun elemento UI concede nuovi permessi.

L'ingresso universale vive nel Centro operativo e compone i flussi autorizzati esistenti. Notifiche e account restano nella topbar; su mobile il ritorno fisso punta al Centro operativo. Il breadcrumb conserva in `sessionStorage` al massimo tre pagine distinte e deduplica varianti slug/ID della stessa risorsa.

In development locale, un solo `DevViewSwitcher` nella topbar passa tra `OWNER`, `SUPPORT_AGENT` e `PLATFORM_ADMIN` usando la sessione dev firmata. Non modifica la membership persistita; apre il Centro operativo per Owner e la console interna per le viste operatore. Non esiste piu un banner di cambio vista.

Il collasso desktop continua a usare `SidebarCollapseButton` e il cookie condiviso. Sidebar e topbar restano nel viewport; soltanto il contenuto centrale scorre. La Fase 4 non modifica token, font, tema, iconografia o motion.
