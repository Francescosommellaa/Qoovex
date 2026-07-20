# Scadenze

Timeline Workspace delle scadenze registrate, ordinata cronologicamente e separata dal calendario operativo.

La pagina legge record `Deadline` filtrati server-side per Azienda. Creazione, modifica e archiviazione continuano a usare `/api/deadlines`; il calendario li compone in sola lettura senza duplicarli come `CalendarEvent`.
