# Job Sites Admin Views

Composizioni app-local per lista, Dialog di creazione, Dialog di anteprima e gestione completa. Riutilizzano Card, Empty, Dialog, Field, Button e Badge della foundation Qoovex senza aggiungere primitive parallele.

Nel dettaglio, `Aggiornamenti` compone messaggi `INTERNAL`, richieste operative e `ContextTimelineEvent` aziendali reali; non e la timeline condivisa Azienda-cliente vNext. I `Collaboratori del cantiere` sono account Collaborator con accesso operativo assegnato. I lavoratori assegnati restano profili operativi separati e mostrano `Mansione` come dato libero. Gli identificatori query legacy `people` e `activities` restano validi, con etichette visibili `Collaboratori` e `Checklist`. Documento, prova, scadenza, checklist e condivisione si avviano in Dialog contestuali; i tipi documento vengono caricati solo all'apertura della relativa finestra. I cinque flussi usano `Field`, `Input`, `Select`, `Textarea`, `Alert`, `Spinner` e `DialogFooter` canonici, mostrano il cantiere preselezionato in una superficie informativa comune e non duplicano i controlli di contesto bloccati.

La direzione vNext approva una timeline `SHARED_WITH_CLIENT`, un solo cliente principale e una superficie cliente separata; sono `conceptual_not_implemented` e non corrispondono a componenti o route correnti.

Audience/disclosure, proposte, pagamenti, dispute e chiusura D-VNEXT-25-38 non riusano direttamente `ContextMessage` o `ContextTimelineEvent` correnti e non sono simulati da questa vista.

Non introduce coordinate GPS, presenze o geolocalizzazione continua.
