# How To Use (Brain Canonical)

Fonte canonica globale:
- `A:/Qoovex-Brain`

Entrypoint obbligatorio:
- `A:/Qoovex-Brain/00_System/index.json`
- `A:/Qoovex-Brain/00_System/task-routing.md`

Workflow minimo prima di scrivere codice:
1. usa il routing Brain per recuperare i must-read della task;
2. leggi il `README.md` locale della cartella che stai per toccare;
3. leggi i file reali della feature coinvolta;
4. implementa nel layer corretto;
5. esegui quality check;
6. aggiorna e valida Brain (`pnpm brain:check`) prima di chiudere la task.

Regola dura:
- non duplicare nel repo informazioni operative gia' canoniche nel Brain.

Archivio:
- se serve storico lungo, usare il Brain nelle sezioni dedicate (`04_Decisions`, `05_Bugs`) e non duplicare nei docs repo.
