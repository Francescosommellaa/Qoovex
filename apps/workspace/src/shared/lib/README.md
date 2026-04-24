# Shared Lib

Scopo: utility pure app-local della workspace app.

Metti qui:
- formatter, guard, parser, helper puri non abbastanza shared da stare in `packages/utils`.

Non mettere qui:
- query DB;
- componenti React;
- hook generici cross-app.

Regole:
- una responsabilita` per file;
- se il riuso esce dall'app, promuovi il codice in `packages/utils`.
