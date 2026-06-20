# Strategia applicativa

## Superfici future

- `apps/web` → `qoovex.com`: sito marketing.
- `apps/workspace` → `app.qoovex.com`: prodotto Next.js responsive, desktop per pianificazione e browser mobile come fallback.
- `apps/mobile`: futura app Expo iOS/Android per assistente, piani e registrazioni puntuali.
- `apps/sirio` → `sirio.qoovex.com`: scope e design system pubblico.

`apps/product` e React Native Web non fanno più parte della direzione canonica. Questa fase non introduce runtime Expo né prodotto Event.

## Condivisione UI

`packages/ui` conserva token TypeScript, `base.css`, contratti e semantica. Le future API dei componenti restano coerenti; gli adattatori web e native possono rendere diversamente quando DOM, CSS e primitive React Native divergono. Sirio valida ogni candidato prima della promozione.

`@qoovex/ui/web` è l’adattatore React DOM canonico usato da Sirio. Token e
contratti restano platform-neutral; l’adattatore native verrà aggiunto con Expo.

## Posture

- Desktop/tablet grande: setup, intake, confronto eventi e approvazione chef.
- Phone/tablet: piani approvati, produzione, verifica e domanda rapida.
- Service: sola consultazione essenziale, schermo stabile e nessun input continuo.
