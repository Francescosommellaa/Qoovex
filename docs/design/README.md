# Direzione grafica — Registro di preparazione

Sirio (`apps/sirio`) è la fonte visuale eseguibile. La direzione deriva da
fogli produzione, regole annotate e conteggi verificati senza imitarli come decorazione.

## Firma

`Event Spine` mantiene identità, data, sala e coperti. `Calculation Trace` è la
nuova firma: collega dato, regola, formula, risultato e stato di verifica.

## Fondazioni

- Grafite `#182024`, acciaio `#526168`, canvas `#F3F6F4`.
- Verde `#28704A` solo per pronto; ambra `#99500E` per attenzione; rosso
  `#AD3030` per blocchi.
- Barlow Condensed per titoli operativi, Source Sans 3 per testo, IBM Plex Mono
  per orari, quantità e revisioni.
- Target interattivo Qoovex: minimo 48 px.
- Motion solo per continuità; reduced motion elimina transizioni non essenziali.

## Sirio

- `/`: scope, modalità, ciclo pre-servizio e architettura futura.
- `/components`: catalogo unico a sezioni con specimen phone/tablet/desktop.

Fixture e telaio documentale restano app-local. Primitive e componenti prodotto
web validati sono esposti da `@qoovex/ui/web`; non costituiscono API React Native,
che userà un adattatore separato.
