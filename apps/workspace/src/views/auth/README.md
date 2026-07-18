# Auth views

Componenti app-local per ingresso workspace:

- `AuthPageShell`: gerarchia responsiva condivisa tra le route pubbliche auth, senza logica di sessione.
- `SignInPageView`: login Credentials via NextAuth.
- `SignUpPageView`: registrazione Credentials con codice email.
- `ResetPasswordPageView`: richiesta codice e impostazione nuova password.
- `InvitationPageView`: stati non valido, accesso richiesto, conferma e successo del flusso `/invite?token=...`.
- `OrganizationSetupForm`: creazione azienda minima per utenti autenticati senza Organization.
- `AuthAccessStates`: stati accesso riusabili per sessione mancante, azienda mancante e configurazione dati non pronta.

La composizione usa esclusivamente primitive `@qoovex/ui`; `PasswordInput` e `OtpInput` restano generici nel package condiviso. Non usare qui query DB dirette o logica permessi: le mutazioni passano da route API protette o pubbliche auth.
