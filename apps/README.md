# Apps

- `workspace`: runtime Next.js del prodotto, con Centro operativo, motore exception-driven, pagine, auth, MFA, API, servizi server, supporto e Console Qoovex.
- `web`: sito marketing pubblico e pagine legali.
- `sirio`: catalogo e superficie di verifica del design system, invariata in Fase 3.
- `mobile`: placeholder per una futura app mobile nativa.

Regole:

- le app non importano codice da altre app;
- il codice condiviso appartiene a `packages/*`;
- Prisma e schema DB restano in `packages/db`;
- tipi e DTO condivisi restano in `packages/types`;
- foundation e primitive condivise provengono da `packages/ui`;
- asset proprietari provengono da `packages/brand-resources`;
- composizioni e logica dominio restano app-locali.

Il motore operativo vive nel Workspace server-side e orchestra il dominio esistente. Web, Sirio e Mobile non ricevono logica operativa. La Fase 3 cambia architettura informativa e composizioni funzionali del Workspace, non il linguaggio visivo.
