# Job Sites Admin Views

Composizioni app-local per lista, Dialog di creazione, Dialog di anteprima e gestione completa. Riutilizzano Card, Empty, Dialog, Field, Button e Badge della foundation Qoovex senza aggiungere primitive parallele.

Nel dettaglio, `Aggiornamenti` compone messaggi interni, richieste operative e `ContextTimelineEvent` reali; la timeline condivisa usa gruppi per data e ancore stabili. I `Collaboratori del cantiere` sono account Collaboratore con accesso operativo assegnato. I lavoratori assegnati restano profili operativi separati e mostrano `Mansione` come dato libero. Gli identificatori query legacy `people` e `activities` restano validi, con etichette visibili `Collaboratori` e `Checklist`. Documento, prova, scadenza, checklist e condivisione si avviano in Dialog contestuali; i tipi documento vengono caricati solo all'apertura della relativa finestra. I cinque flussi usano `Field`, `Input`, `Select`, `Textarea`, `Alert`, `Spinner` e `DialogFooter` canonici, mostrano il cantiere preselezionato in una superficie informativa comune e non duplicano i controlli di contesto bloccati.

Non introduce coordinate GPS, presenze o geolocalizzazione continua.
