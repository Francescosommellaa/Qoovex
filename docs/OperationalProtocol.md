# Operational Protocol (Brain First)

Fonte di verita':
- `A:/Qoovex-Brain` e' la memoria operativa canonica.

Checklist operativa:
1. classificare la task (architecture, feature, decision, bug, workflow, auth/db/ui);
2. chiamare il routing Brain (`00_System/task-routing.md` o tool MCP `get_task_context`);
3. leggere `README.md` locale delle cartelle toccate;
4. dichiarare i file da modificare e restare nello scope;
5. evitare duplicazioni e placement errato;
6. chiudere con:
   - `pnpm brain:check`
   - `pnpm check:fast` (o `pnpm check` quando richiesto)

Regole di sincronizzazione:
- qualsiasi cambiamento stabile su regole/processo deve essere riflesso nel Brain canonico;
- i file repo devono restare leggeri e non duplicare contenuti gia' presenti nel Brain.
