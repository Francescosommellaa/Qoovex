# Workspace Views

Componenti app-local per l'interfaccia prodotto di `apps/workspace`.

Contengono solo UI specifica del workspace admin. Non sono un design system condiviso e non devono importare Prisma o logica server-side.

In development locale, `DevRoleSwitcher` mostra in modo esplicito il ruolo simulato dalla sessione dev firmata. Riusa i controlli di `@qoovex/ui`, non modifica la membership persistita e rimanda sempre alla dashboard dopo il cambio ruolo.

La shell rende esplicito il collasso desktop con il solo `SidebarCollapseButton` iconico nella topbar e ripristina lo stato dal cookie condiviso. Sidebar e topbar restano nel viewport; soltanto il contenuto centrale scorre. Il breadcrumb desktop conserva in `sessionStorage` al massimo tre pagine distinte e rende navigabili le precedenti; le pagine di risorsa possono registrarne il titolo autorizzato e le varianti URL slug/ID della stessa risorsa vengono deduplicate. Su mobile il logo lascia posto al ritorno fisso `Da fare`. La campanella apre `WorkspaceNotificationsPanel`, che carica al bisogno cinque notifiche recenti e offre la pagina completa soltanto come azione intenzionale.

La navigazione e task-first: Ricerca in preparazione, Da fare, Analisi soltanto per OWNER/ADMIN, quindi Documenti, Calendario, il gruppo espandibile Persone e Cantieri. Persone distingue `Lavoratori` da `Utenti e inviti`; SITE_MANAGER vede soltanto Lavoratori e WORKER non riceve il gruppo. Le assegnazioni cantieri restano contestuali e non vengono duplicate nella sidebar o nei collegamenti rapidi.

`Azioni rapide` mostra tutte le creazioni autorizzate in un action tray nel footer, sopra `Azienda e account`. Il fondo alternativo lo distingue dalla navigazione senza renderlo una card dominante: una riga desktop, una colonna nella rail e una griglia etichettata nel drawer mobile. Documento e Cantiere usano icone composte con il `+`, quindi restano distinguibili quando il menu e chiuso. Ogni link chiude il drawer mobile dopo la navigazione. `Personalizza collegamenti rapidi` resta un'azione di intestazione distinta dai link. `WorkspaceQuickLinks` permette di mantenere fino a quattro route secondarie nella sidebar; la scelta e locale al browser, viene filtrata contro `buildWorkspaceNavigation` e non concede nuove destinazioni o permessi.
