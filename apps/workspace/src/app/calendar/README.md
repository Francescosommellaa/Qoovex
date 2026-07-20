# Calendario operativo

Pagina Workspace `/calendar` per eventi, task e scadenze registrate mostrate in sola lettura.

Usa i service server-side per leggere dati filtrati per Azienda, `/api/calendar` per gli eventi e `/api/deadlines` per le scadenze. I record Deadline vengono rappresentati direttamente nel calendario e non duplicati come CalendarEvent.

La toolbar usa uno switcher app-local a indicatore animato per mese, settimana, giorno e agenda. `Oggi` riposiziona il periodo e porta la cella corrente al centro del viewport. Lo stato vuoto resta fuori dalla griglia e non ne copre i giorni.

Il Dialog di creazione/modifica presenta prima impegno e intervallo, poi il contesto opzionale. Con `Giornata intera` attiva gli orari vengono rimossi dall'interfaccia e l'ultima data selezionata è inclusiva; i valori tecnici degli enum restano nel payload e non sono mostrati all'utente.
