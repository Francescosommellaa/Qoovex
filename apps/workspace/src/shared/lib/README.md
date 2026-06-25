# Shared Lib

Scopo: utility pure app-local della workspace app.

Metti qui:
- formatter, guard, parser e helper puri app-local.

Non mettere qui:
- query DB;
- componenti React;
- hook generici cross-app.

Regole:
- una responsabilita` per file;
- se il riuso esce dall'app, promuovi solo contratti stabili in `packages/types`.
