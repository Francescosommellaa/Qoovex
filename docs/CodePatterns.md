# Code Patterns

Il Brain canonico definisce le regole complete. Nel repo restano questi
vincoli:
- naming esplicito e nessun file vago;
- logica business nei servizi, non nei controller;
- query DB attraverso repository server-only;
- import FSD verso il basso;
- shared code cross-app in `packages/*`;
- logo esclusivamente da `packages/brand`;
- future icone esclusivamente Phosphor, senza SVG sostitutivi.
