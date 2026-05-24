# Settings View

Scopo: composizione delle schermate impostazioni.

Metti qui:
- sezioni account, preferences, subscription e impostazioni utente.

Non mettere qui:
- routing auth;
- utility generiche o componenti shared.

Regole:
- mantieni chiari i confini tra settings e dominio `User`;
- se una parte diventa riusabile cross-view, estraila nel layer giusto.
- Profilo e sicurezza: identità da sessione NextAuth + riga `User` Prisma; MFA TOTP interna Qoovex; avatar su Vercel Blob (`avatarBlobPathname` in DB).
