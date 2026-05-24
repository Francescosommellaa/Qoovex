# MFA Challenge

Scopo: verifica interna A2F TOTP/backup code dopo login NextAuth e prima dell'accesso al workspace.

Regole:
- Usa la sessione NextAuth per identificare l'utente primario;
- MFA è gestita da Qoovex (cookie/servizio interno), non da provider auth esterno.
