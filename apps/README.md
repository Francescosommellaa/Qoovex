# Apps

- `workspace`: runtime Next.js del prodotto, con pagine, auth, MFA, API, servizi server, supporto e Console Qoovex.
- `web`: sito marketing pubblico e pagine legali.
- `sirio`: catalogo e superficie di verifica del design system.
- `mobile`: placeholder per una futura app mobile nativa.

Regole:

- le app non importano codice da altre app;
- il codice condiviso appartiene a `packages/*`;
- Prisma e schema DB restano in `packages/db`;
- tipi e DTO condivisi restano in `packages/types`;
- foundation e primitive condivise provengono da `packages/ui`;
- asset proprietari provengono da `packages/brand-resources`;
- composizioni e logica dominio restano app-locali.

Il motore operativo exception-driven e una direzione approvata ma non implementata. La futura orchestrazione appartiene al workspace server-side; Web e Sirio non ricevono logica dominio.
