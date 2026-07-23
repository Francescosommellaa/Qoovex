# Controllo duplicati Cantieri

`POST /api/job-sites/duplicate-check` esegue un confronto semplice e tenant-scoped su nome, committente e indirizzo. Restituisce al massimo cinque record attivi e non crea o modifica dati.

La corrispondenza e un avviso esplicito: la creazione prosegue solo quando il client invia `continueAfterDuplicateWarning: true`. Non vengono usati dati sensibili o confronti fuzzy.
