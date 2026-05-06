## Home

Pagina principale del sito marketing Qoovex (`/`).

Struttura:
- `home.tsx` — componente pagina, compone le sezioni in ordine
- `index.ts` — barrel, esporta `HomePage`
- `sections/` — sezioni specifiche della home (hero, features, social proof, ecc.)
- `content/` — testi e dati statici della home

Regole:
- `home.tsx` compone, non contiene logica
- ogni sezione ha il suo file dedicato in `sections/`
- i contenuti testuali statici stanno in `content/`
- le sezioni condivise con altre pagine stanno in `src/shared/sections/`