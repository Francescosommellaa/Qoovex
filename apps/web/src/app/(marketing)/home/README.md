## Home

Pagina principale del sito marketing Qoovex (`/`).

Struttura:
- `page.tsx` — route Next, compone le sezioni in ordine
- `sections/` — blocchi della home (hero, screenshot + rail, social proof, workflow, valore prodotto, CTA)
- `_components/` — composizioni solo home (shell sezione, board, rail se usato qui)
- `content/` — testi e dati statici (`home-content.ts` + `index.ts` barrel)

Costanti condivise con il resto del marketing: `src/shared/workspace-url.ts` (origine workspace e link sign-in / sign-up).

Regole:
- `home.tsx` compone, non contiene logica
- ogni sezione ha il suo file dedicato in `sections/`
- i contenuti testuali statici stanno in `content/`
- le sezioni condivise con altre pagine stanno in `src/shared/sections/`