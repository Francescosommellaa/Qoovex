# MFA Challenge

Scopo: verifica interna A2F TOTP/backup code dopo login Clerk e prima dell'accesso al workspace.

## Regole
- Usa Clerk solo per identificare la sessione primaria.
- La verifica del secondo fattore passa dai servizi Prisma interni.
