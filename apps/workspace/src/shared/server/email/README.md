# Email transazionali

Layout HTML condiviso per le email Resend inviate dal workspace.

- `transactional-email-tokens.ts` — palette email-safe derivata dai token UI
- `transactional-email-layout.ts` — shell brand, CTA, OTP, notifiche e footer

Il servizio `transactional-email-service.ts` mappa i template dominio sul layout e invia via Resend o sink E2E.
