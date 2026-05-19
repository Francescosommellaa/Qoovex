# Account Avatar API

Upload e rimozione avatar account.

## Storage
- Il file immagine vive in Vercel Blob private.
- Clerk conserva il pathname Blob in `unsafeMetadata.avatarBlobPathname`.
- Prisma non conserva l'avatar utente.
