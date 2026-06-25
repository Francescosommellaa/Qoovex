# Code Patterns

Il Brain canonico definisce le regole complete. Nel repo restano questi vincoli:

- naming esplicito e nessun file vago;
- logica business nei servizi, non nei controller;
- query DB attraverso repository server-only quando il modulo lo consente;
- auth, tenant e supporto confinati in `apps/workspace`;
- contratti condivisi solo in `packages/types`;
- schema e client database solo in `packages/db`.
