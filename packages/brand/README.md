# Brand Package

Scopo: fonte canonica degli asset brand condivisi.

Metti qui:
- logo, icon e mark originali Qoovex.

Export canonici:
- `@qoovex/brand/logo-Icon/*` per le varianti originali del logo.

Il pacchetto e` asset-only: non espone componenti React, adapter SVG o generatori.
Le app consumano direttamente gli SVG reali tramite import asset e li renderizzano
con `<img>` quando serve un logo in pagina.

Non mettere qui:
- asset temporanei;
- asset usati da una sola app senza reale riuso.
- componenti React o wrapper del logo.

Regole:
- una sola fonte di verita` per asset shared;
- non ricreare il logo in componenti o SVG alternativi;
- non aggiungere adapter React del logo: scegliere la variante SVG corretta;
- non duplicare asset identici in cartelle `public` delle app.
