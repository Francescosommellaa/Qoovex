# Tipografia Stable v0.5

## Famiglie

- Cabinet Grotesk variable: display, titoli e numeri editoriali.
- Synonym variable: UI, testo, dati, quantita` e unita`.

I WOFF2 sono self-hosted da `@qoovex/ui`; nessuna richiesta arriva a Fontshare
in runtime. `font-display: swap` e fallback Windows sono obbligatori.

## Ruoli

- Display: `clamp(3.2rem, 8vw, 7.5rem)`.
- Section: `clamp(2.25rem, 5vw, 4.5rem)`.
- Heading large: `clamp(1.9rem, 3vw, 2.75rem)`.
- Heading medium: `clamp(1.35rem, 2vw, 1.75rem)`.
- Body large: `clamp(1.075rem, 1.8vw, 1.3rem)`.
- Body: `1rem`; control `0.9375rem`; caption `0.8125rem`.

Quantita`, prezzi e tempi usano cifre tabulari quando devono essere confrontati.
La UI italiana verifica accenti, simboli, unita`, gradi e valuta.
