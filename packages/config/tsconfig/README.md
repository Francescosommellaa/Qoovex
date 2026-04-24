# Shared Tsconfig

Scopo: preset TypeScript condivisi dal monorepo.

Metti qui:
- file base `tsconfig` estendibili da app e package.

Non mettere qui:
- config specifiche di una sola app se non riusate;
- opzioni runtime o env.

Regole:
- mantieni preset piccoli e chiari;
- documenta nel package consumer eventuali override necessari.
