# Crystal Material System Stable v0.5

## Fisica

Crystal deriva dalla Card approvata:

- frame trasparente da 6 px;
- radius esterno 28 px e interno 22 px (`28 - 6`);
- frame e centro sono aree non sovrapposte;
- nessun bordo tra frame e centro;
- il backdrop reale e` l'unica sorgente cromatica;
- host, testo, controlli e discendenti non ricevono blur.

## Profili desktop

| Scopo | Centro | Frame | Uso |
| --- | --- | --- | --- |
| navigation | `.82 / 12px` | `.06 / 20px` | barre e divisori stabili |
| focus | `.68 / 18px` | `.08 / 28px` | dettaglio selezionato |
| feature | `.48 / 20px` | `.10 / 32px` | preview e marketing |
| overlay | `.92 / 24px` | `.08 / 32px` | dialog e drawer |

Mobile usa centri `.96/.88/.72/.98` e blur `8/12/14/16px`. Il frame scende a
`12/20/24/24px`.

## Budget

- Massimo due backdrop layer per superficie: frame e centro.
- Nessun Crystal annidato.
- Liste, tabelle, input e testo lungo usano Paper.
- `feature` non entra nel workspace operativo.
- Nessuna animazione ambientale continua.

## Degradazione

Senza backdrop-filter o con reduced transparency: centro `.98`, frame `.92`,
nessun filtro. Forced colors rimuove gli pseudo-layer e conserva bordo,
contrasto e focus.
