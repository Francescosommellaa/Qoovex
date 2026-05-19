# Account Avatar Media

Proxy autenticato per avatar account salvati in Vercel Blob private.

## Regole
- Serve solo pathname sotto `avatars/<clerk-user-id>/`.
- Risponde 404 per accessi non autorizzati o pathname non validi.
