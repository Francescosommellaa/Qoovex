# Select

Select canonico per scelta singola o multipla.

## API

- `size`: `sm | md | lg`
- `status`: `default | error | success`
- `surface`: `light | dark`
- Supporta gruppi, limite di selezioni, count, label e helper.
- Propaga gli attributi ARIA ricevuti da `FormControl`.

## Interazione

- Enter e Space aprono o confermano.
- Arrow Up/Down, Home, End e typeahead aggiornano l'opzione attiva.
- Escape chiude e restituisce il focus al trigger.
- Click esterno chiude sia single sia multi.

## Aspetto

Trigger e `Input` condividono altezza, bordo, radius e focus. Il dropdown usa
Paper 94%, bordo Ink 6%, radius 12 px, padding 8 px, ombra multilivello e blur
reale 20 px. I tag multi sono monocromatici.

Non creare select locali o override visuali nei consumer.
