# Auth views

Componenti app-local per ingresso workspace:

- `SignInPageView`: login Credentials via NextAuth.
- `SignUpPageView`: registrazione Credentials con codice email.
- `OrganizationSetupForm`: creazione azienda minima per utenti autenticati senza Organization.
- `AuthAccessStates`: stati accesso riusabili per sessione mancante, azienda mancante e configurazione dati non pronta.

Non usare qui query DB dirette o logica permessi: le mutazioni passano da route API protette o pubbliche auth.
