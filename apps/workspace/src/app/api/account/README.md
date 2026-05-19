# Account API

Route server-side per impostazioni account del workspace autenticato.

## Regole
- Non espone dati account enumerabili.
- Usa Clerk come fonte account e Vercel Blob per file utente.
- Non salva contenuto immagini profilo in Prisma.
