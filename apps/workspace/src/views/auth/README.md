# Auth views

Componenti app-local per ingresso workspace:

- `SignInPageView`: login Credentials via NextAuth.
- `SignUpPageView`: registrazione Credentials con codice email.
- `InvitationPageView`: stati non valido, accesso richiesto, conferma e successo del flusso `/invite?token=...`.
- `OrganizationSetupForm`: creazione azienda minima per utenti autenticati senza Organization.
- `AuthAccessStates`: stati accesso riusabili per sessione mancante, azienda mancante e configurazione dati non pronta.

Non usare qui query DB dirette o logica permessi: le mutazioni passano da route API protette o pubbliche auth.
