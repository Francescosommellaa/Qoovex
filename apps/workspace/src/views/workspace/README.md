# Workspace Views

Componenti app-local per shell, navigazione, topbar e account del Workspace. Non sono un design system condiviso e non importano Prisma o logica server-side.

La navigazione primaria e costruita dalla policy role-aware: Centro operativo, Documenti, Lavoratori, Cantieri, Pacchetti quando autorizzato e Impostazioni. Non espone Preferiti, Azioni rapide o placeholder Ricerca/Analisi. Nessuna voce concede nuovi permessi.

L'ingresso universale vive nel Centro operativo e compone i flussi autorizzati esistenti. Notifiche e account restano nella topbar; su mobile il ritorno fisso punta al Centro operativo. Il breadcrumb conserva in `sessionStorage` al massimo tre pagine distinte e deduplica varianti slug/ID della stessa risorsa.

In development locale, `DevRoleSwitcher` mostra il ruolo simulato dalla sessione dev firmata. Riusa controlli `@qoovex/ui`, non modifica la membership persistita e rimanda al Centro operativo dopo il cambio ruolo.

Il collasso desktop continua a usare `SidebarCollapseButton` e il cookie condiviso. Sidebar e topbar restano nel viewport; soltanto il contenuto centrale scorre. La Fase 3 non modifica token, font, tema, iconografia, motion o primitive condivise.
