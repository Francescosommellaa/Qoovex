# Types Source

Scopo: entrypoint TypeScript dei tipi condivisi.

Metti qui:
- export ordinati e file type-only del package.
- enum e DTO platform-neutral per il dominio MVP.
- DTO pubblici per versioni documento senza URL Blob permanenti.
- DTO pubblici per Worker e JobSite senza dati sanitari o geolocalizzazione.
- DTO pubblici per Checklist, ChecklistItem ed Evidence senza URL Blob permanenti.
- DTO pubblici per DocumentPackage e ShareLink senza token hash, blob key o URL permanenti.
- DTO pubblici per Dashboard senza dati sensibili, blob key, token o URL permanenti.
- DTO pubblici per Notification e Reminder senza dedupe key, token, blob key o URL permanenti.
- DTO pubblici per digest email notifiche senza destinatari arbitrari, provider internals, token, blob key o URL permanenti.
- DTO pubblici per preferenze email, delivery log e scheduling senza body email, provider internals sensibili o destinatari client-side.
- DTO pubblici per audit log prodotto con metadata gia redatti.
- DTO pubblici per assegnazioni risorsa e `my-scope` senza dati personali non necessari.
- DTO pubblici per inventory, export metadata e retention senza file, token, blob key, URL permanenti o body email.

Non mettere qui:
- codice runtime;
- duplicati di tipi gia definiti in un package sorgente unico.
- logica normativa, preset documentali o scadenze ufficiali.
- alias legacy `Structure*`.

Regole:
- usa `index.ts` come API pubblica curata;
- evita re-export confusi o ciclici.
