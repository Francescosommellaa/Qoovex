# Calendario e scadenze

Pagina Workspace che unifica eventi, task e scadenze registrate. La route resta `/deadlines` per compatibilita con link, reminder e permessi esistenti.

Usa i service server-side per leggere dati filtrati per Azienda, `/api/calendar` per gli eventi e `/api/deadlines` per le scadenze. I record Deadline vengono rappresentati direttamente nel calendario e non duplicati come CalendarEvent.
