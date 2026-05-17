# Notifications API

Scopo: controller HTTP per feed notifiche persistenti del workspace.

Metti qui:
- `GET` per notifiche recenti;
- `PATCH` per mark read e mark all read.

Non mettere qui:
- query Prisma dirette;
- UI topbar o toast.

Regole:
- validare input e delegare a `shared/server/notification-service`.
