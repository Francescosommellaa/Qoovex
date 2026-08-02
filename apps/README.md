# Apps

- `workspace`: runtime Next.js del prodotto, con Panoramica exception-driven, motore operativo, pagine, auth, MFA, API, servizi server, supporto e Console Qoovex.
- `web`: sito marketing pubblico e pagine legali.
- `sirio`: catalogo e superficie di verifica del design system, inclusa la proof operativa Fase 4 senza logica prodotto.
- `mobile`: placeholder per una futura app mobile nativa.

Regole:

- le app non importano codice da altre app;
- il codice condiviso appartiene a `packages/*`;
- Prisma e schema DB restano in `packages/db`;
- tipi e DTO condivisi restano in `packages/types`;
- foundation e primitive condivise provengono da `packages/ui`;
- asset proprietari provengono da `packages/brand-resources`;
- composizioni e logica dominio restano app-locali.

Il motore operativo, la ricerca metadata-only, la timeline e le condivisioni revisionate vivono nel Workspace server-side. Web, Sirio e Mobile non ricevono logica operativa. La Fase 4 aggiunge alla foundation condivisa soltanto primitive generiche dimostrate in Sirio; non cambia il linguaggio visivo.
