# Clerk Webhook

Scopo: handler dei webhook Clerk.

Metti qui:
- verifica firma Svix;
- parsing payload minimo;
- delega a `@shared/server/clerk-webhooks/clerk-webhook-dispatcher`.

Non mettere qui:
- logica email, billing o altri provider;
- codice generico non legato a Clerk.
- handler evento con side effect.

Regole:
- mantieni il provider boundary netto;
- ogni evento deve avere un service dedicato in `shared/server/clerk-webhooks`;
- la route restituisce `NextResponse`, i service restituiscono DTO `{ body, status }`.
