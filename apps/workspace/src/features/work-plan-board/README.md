# Work Plan Board Feature

Scopo: casi d'uso interattivi della board dei piani di lavoro.

Metti qui:
- drag, reorder, completion flow, member interaction e mutazioni board-specific.

Non mettere qui:
- dominio puro `WorkPlan`;
- layout completo della schermata.

Regole:
- usa `entities/work-plan` per model e UI di base;
- la composizione finale sta in `views/work-plan`.
- il completamento task puo creare notifiche persistenti per il creator.
