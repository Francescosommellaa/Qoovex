# Dev Fixtures API

Fixture E2E disponibili esclusivamente all'identita dev-auth firmata su localhost, con modalita E2E, database CI loopback e cleanup attestato. Mai attive in Preview o Production.

`opened-by-participant` crea soltanto il grafo sintetico necessario ai test autenticati Azienda/Cliente. Il test crea le richieste attraverso le API prodotto reali e il cleanup accetta esclusivamente gli ID restituiti dalla stessa run.
