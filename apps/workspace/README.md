# Workspace App

Runtime API-only di Qoovex.

Contiene route API, NextAuth, servizi, repository e regole di dominio. Le
route frontend, auth UI, viste, widget e componenti sono intenzionalmente
assenti.

Regole:
- FSD resta il modello di placement per la futura ricostruzione;
- import sempre verso layer inferiori;
- ogni cartella manuale in `src` richiede `README.md`;
- nessun file generico;
- accesso DB solo nei moduli server consentiti;
- `src/proxy.ts` intercetta esclusivamente `/api/**`.
