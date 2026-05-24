# Account Avatar API

Upload e rimozione avatar account.

## Storage
- Il file immagine vive in Vercel Blob private.
- Il pathname Blob è salvato in `User.avatarBlobPathname` (Prisma).
- La UI consuma il proxy autenticato sotto `avatar/media/`.
