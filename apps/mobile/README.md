# Qoovex Mobile — scaffold documentale

Futura app Expo iOS/Android per assistente operativo, piani approvati, task della brigata, registrazioni puntuali di produzione e consultazione minimale durante il servizio.

Userà token e contratti platform-neutral di `@qoovex/ui`, senza importare DOM o
`base.css`. La brigata accederà soltanto dopo invito del Capo cucina.

## Confini

- Nessun runtime Expo, dipendenza o codice prodotto è presente in questa fase.
- Non è un KDS e non richiede aggiornamenti continui durante il servizio.
- Backend, auth e sincronizzazione saranno forniti da `apps/workspace`.
- `apps/mobile` non importa mai codice dalle altre app.

## UI condivisa

`packages/ui` sarà la fonte di token TypeScript, contratti e semantica. CSS e primitive DOM restano web-only; gli adattatori native manterranno le stesse API quando possibile senza fingere che `base.css` funzioni su React Native.

Ogni componente nasce come specimen Draft in Sirio e viene promosso solo dopo la validazione nelle posture web e native.
