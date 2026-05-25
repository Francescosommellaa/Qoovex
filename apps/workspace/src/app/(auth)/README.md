# Workspace Auth Routes

Scopo: organizzazione interna delle route NextAuth senza esporre `(auth)` nell'URL pubblico.

Metti qui:
- sole route di autenticazione, UI sign-in/sign-up e file strettamente legati ai flussi auth.

Non mettere qui:
- feature prodotto;
- logica business del workspace.

Regole:
- URL pubblici: `/sign-in`, `/sign-up`, `/sign-up/verify`, `/sign-up/setup`, `/sign-in/verify`, `/forgot-password`, `/reset-password`, `/complete-profile`, `/mfa-challenge`;
- sessione primaria: NextAuth v5 + Prisma adapter (`/api/auth/[...nextauth]`);
- accesso email/password via Credentials provider; niente magic link;
- registrazione email-first con verifica codice prima di username/password;
- verifica email e reset password tramite codice monouso;
- dettaglio canonico: `A:/Qoovex-Brain/02_Features/auth.md`;
- niente altro routing prodotto in questa route group.
