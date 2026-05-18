# Clerk admin metadata

Qoovex Workspace usa `publicMetadata` (e opzionalmente i session claims) per il flag admin:

- `role === "admin"` oppure
- `isAdmin === true`

Vedi [`bootstrap-user.ts`](../src/shared/actions/bootstrap-user.ts) (`hasAdminAccess`).

## Checklist Dashboard Clerk

1. **User & authentication → User profile → Public metadata**  
   Disabilita qualsiasi opzione che permetta agli utenti finali di modificare i public metadata dal profilo.

2. **Assegnazione admin**  
   Imposta `role` / `isAdmin` solo da:
   - Clerk Dashboard (utente singolo)
   - Backend API Clerk con secret key (script interno / webhook controllato)

3. **Non usare `unsafeMetadata` per privilegi**  
   I campi unsafe sono pensati per dati utente (es. telefono in signup), non per ruoli.

4. **Verifica session claims**  
   Se usi custom session claims, assicurati che `publicMetadata` non sia sovrascrivibile dal client SDK.

## Dev locale

La sessione `dev-auth` imposta `isAdmin: true` solo in sviluppo locale (`DEV_AUTH_SECRET` + host localhost). Non e' attiva su Vercel.

## Azione manuale post-deploy

Dopo ogni nuovo ambiente Clerk, ripeti la checklist sopra e prova con un utente non admin che non veda la sezione Admin in sidebar.
