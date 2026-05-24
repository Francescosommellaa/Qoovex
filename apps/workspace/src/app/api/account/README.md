# Account API

Route server-side per impostazioni account del workspace autenticato.

## Regole
- Non espone dati account enumerabili.
- Sessione NextAuth + `User` Prisma; file utente su Vercel Blob.
- Non salva contenuto immagini profilo in Prisma (solo pathname Blob in `User.avatarBlobPathname`).
