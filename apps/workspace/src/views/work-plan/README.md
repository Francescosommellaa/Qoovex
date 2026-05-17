# Work Plan View

Scopo: composizione delle schermate dei piani di lavoro.

Metti qui:
- board screen, detail screen e shell di pagina del work plan.

Non mettere qui:
- interazioni atomiche della board;
- modello puro `WorkPlan`.

Regole:
- usa `features/work-plan-board` per i casi d'uso;
- usa `entities/work-plan` per il dominio.
- notifiche persistenti sono create dal service quando un membro completa un task.
