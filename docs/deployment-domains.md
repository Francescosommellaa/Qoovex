# Domini canonici

| Superficie | Dominio | Responsabilità |
| --- | --- | --- |
| Web pubblico | `https://qoovex.com` | Presenza pubblica, contatti e documenti legali. |
| Prodotto | `https://app.qoovex.com` | App desktop web e origine auth; la stessa esperienza sarà distribuita su iOS e Android. |
| Sirio | `https://sirio.qoovex.com` | Scope, direzione grafica e catalogo componenti. |

`packages/config/src/index.ts` è la fonte eseguibile degli origin. Il repo guard
blocca metadata o costanti mancanti. DNS, certificati e associazione dei domini
ai progetti di hosting restano configurazioni infrastrutturali esterne al repo.
