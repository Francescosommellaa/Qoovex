# Organization members

`GET` elenca le membership minimizzate, `PATCH` modifica atomicamente preset, permessi, scope, grant e scadenza con controllo `accessVersion`, `DELETE` revoca l'accesso e invalida le sessioni.

La gestione resta limitata all'`OWNER`. Ogni grant viene verificato nella stessa Azienda; il server normalizza le dipendenze dei permessi, rimuove capacità riservate alla proprietà e registra un audit minimizzato.
