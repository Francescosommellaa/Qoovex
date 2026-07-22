# Workers Admin Views

UI app-local per lista e dettaglio lavoratori. La lista usa le primitive canoniche condivise per intestazione, conteggio, avatar, stato vuoto e Dialog, senza rendere interattive le superfici che non eseguono azioni.

I form raccolgono solo dati minimi operativi e non introducono campi sanitari o qualifiche legali automatiche. `Mansione` resta separata dal ruolo di accesso; dalla scheda si puo inviare soltanto un invito WORKER e il recupero invito evita di duplicare un profilo gia creato. ADMIN, SAFETY_CONSULTANT e SITE_MANAGER vengono invitati dalla superficie account dedicata.

La gestione completa usa Card, Badge, Empty, Button, Avatar e icone Tabler per separare riepilogo, azioni, relazioni e gestione avanzata. Il breadcrumb mostra il nome del lavoratore gia caricato dal server; gli URL leggibili e legacy vengono deduplicati nella cronologia locale senza query aggiuntive.
