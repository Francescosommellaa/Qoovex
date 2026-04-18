# Comment Guidelines

Questa guida definisce lo standard obbligatorio per i commenti del progetto.

## Obiettivo

I commenti devono aiutare persone e AI a capire:

- perche esiste una scelta
- quale vincolo non deve essere rotto
- come estendere il codice senza uscire dal pattern del progetto

Se un commento non aggiunge una di queste informazioni, non va scritto.

## Ambito

Questa regola vale per il codice authored in:

- `apps/*`
- `packages/*`
- `docs/*` quando contiene snippet o esempi operativi

Sono esclusi file generati, vendor, output di build e file che non controlliamo direttamente.

## Regola base

Prima prova sempre a chiarire il codice con:

1. naming migliore
2. estrazione di una funzione o subview
3. tipi piu espliciti

Il commento arriva solo dopo, se il motivo resta non ovvio.

## Quando un commento e obbligatorio

Scrivi un commento solo se serve a spiegare almeno uno di questi casi:

- un vincolo architetturale o di prodotto
- un comportamento non ovvio o fragile
- un workaround tecnico e cosa si rompe se lo rimuovi
- un extension point o pattern che altri devono riusare
- una scelta intenzionale che sembra strana ma e corretta

## Quando un commento e vietato

Non scrivere commenti che fanno solo da etichetta o decorazione:

- banner di sezione
- separatori visuali
- `Header`, `Layout`, `Info`, `Demo box`, `Helper`
- commenti che ripetono il nome del componente o del blocco
- commenti che descrivono codice ovvio riga per riga
- TODO vaghi senza azione concreta

Esempi da evitare:

```tsx
{/* Header */}
{/* Info */}
// Update state
/* Button styles */
```

## Stile obbligatorio

- Nel codice i commenti devono essere in English semplice e diretto.
- In `docs/` la guida puo restare in italiano.
- Massimo 1-2 righe nella maggior parte dei casi.
- Metti il commento sopra il blocco che spiega.
- Usa frasi complete e specifiche.
- Spiega il why o il constraint, non il what ovvio.
- Niente emoji, banner, ASCII art o separatori lunghi.

## JSX e componenti

In JSX non usare commenti come etichette di layout.

Scrivi un commento solo se il blocco:

- ha una dipendenza implicita da altri elementi
- gestisce accessibilita non ovvia
- mantiene un pattern che deve essere copiato altrove

Buono:

```tsx
// Keep the action outside the scroll area so the footer stays reachable on mobile.
```

Cattivo:

```tsx
{/* Footer */}
```

## CSS

Nei file CSS i commenti sono ammessi solo quando spiegano:

- una relazione visiva non immediata tra piu selettori
- un vincolo di overflow, stacking o focus ring
- una differenza importante tra desktop e mobile

Buono:

```css
/* Split the focus ring between the field and the dropdown. */
```

Cattivo:

```css
/* Dropdown */
/* Mobile */
```

## Hook, utility e logica

Commenta solo la parte che non e deducibile leggendo codice e tipi.

Buono:

```ts
// Resize the textarea itself so the wrapper layout stays stable.
```

Cattivo:

```ts
// Handle input change
// Loop through items
```

## JSDoc

Usa JSDoc solo per API pubbliche o prop non ovvie, soprattutto nei package condivisi.

Buono:

```ts
/** Shows the toggle that reveals or hides the password. */
```

Non usare JSDoc per descrivere prop ovvie o duplicate del nome.

## Manutenzione

- Se refattorizzi un blocco, aggiorna o rimuovi il commento nello stesso task.
- Se un commento diventa falso, e un bug di documentazione.
- Se un pattern e abbastanza importante da essere riusato, oltre al commento valuta se va aggiunto anche in `project_brain.json`.

## Test rapido prima di lasciare un commento

Prima di tenere un commento, chiediti:

1. senza questo commento il blocco sarebbe facile da fraintendere?
2. il commento spiega un vincolo reale e non solo il layout?
3. il testo restera vero anche dopo piccole modifiche?

Se una risposta e `no`, il commento va tolto.
