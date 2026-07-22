# Admin Evidence View

Componenti app-local per note, foto e file operativi. I file passano dagli endpoint Evidence esistenti e la UI non espone riferimenti interni di storage.

`EvidenceForm` parte dalla modalita foto in ogni consumer. Il picker immagine e disponibile su desktop e mobile; sui viewport mobile compare anche un input separato con `capture="environment"` per lo scatto dalla fotocamera posteriore. Prima del submit lo scatto viene spostato nel campo `file` gia previsto dall'API e il campo temporaneo viene rimosso dal payload.
