# Workspace App Router

Scopo: entrypoint Next.js dell'app workspace.

Metti qui:
- `layout.tsx`, `page.tsx`, route groups, `api/`, pagine top-level e file richiesti dal framework;
- composizione dei layer inferiori e bootstrap globale.

Non mettere qui:
- logica domain-heavy che deve stare in `shared`, `entities`, `features`, `widgets`, `views`;
- componenti UI riusabili che non sono entrypoint di route.

Regole:
- `page.tsx` e `layout.tsx` restano sottili;
- le route API validano e delegano;
- le cartelle route-specific hanno il loro `README.md`.
