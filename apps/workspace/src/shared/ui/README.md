# Shared UI

Scopo: primitive UI riusabili solo dentro la workspace app.

Metti qui:
- componenti base app-local che non hanno senso nel design system condiviso;
- wrapper di componenti shared con comportamento specifico workspace.

Non mettere qui:
- componenti riusabili da altre app: vanno in `packages/ui`;
- widget grandi o componenti di dominio.

Regole:
- file TSX ordinati secondo `docs/CodePatterns.md`;
- niente business logic pesante dentro i componenti.
