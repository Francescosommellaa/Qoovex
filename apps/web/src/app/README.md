# Web App Router

Scopo: entrypoint App Router del sito marketing.

Metti qui:
- `layout.tsx`, `page.tsx`, `globals.css`, route groups e pagine marketing;
- composizione di sezioni e shell globale del sito.

Non mettere qui:
- logica condivisa riusabile da altre app;
- primitive di design system che devono stare in `packages/ui`.

Regole:
- pagine snelle e orientate alla composizione;
- stili globali minimi e coerenti con i token condivisi;
- niente Clerk in questa app.
