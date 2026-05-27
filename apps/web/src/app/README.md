## App

Routing Next.js 16 App Router del sito marketing Qoovex.

Struttura:
- `layout.tsx` — Root Layout: `<html>`, `<body>`, metadata globali, import `globals.css`
- `page.tsx` — Root route `/`: redirect verso `/(marketing)/home`
- `globals.css` — import font, token UI, Tailwind, `@source` per Tailwind scanner
- `(marketing)/` — route group senza segmento URL; contiene layout marketing e tutte le pagine

Regole:
- `layout.tsx` monta shell e provider, non feature logic
- `page.tsx` nella root fa solo redirect, non renderizza contenuto
- ogni pagina ha il proprio `page.tsx` come entry point App Router
- le sezioni specifiche di una pagina stanno dentro la cartella della pagina stessa
- le sezioni condivise tra pagine stanno in `src/shared/sections/`
