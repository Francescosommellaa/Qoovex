<div align="center">

# Qoovex

**Il workspace operativo per cuochi e chef professionisti.**  
Piani di lavoro, menu, ricette, allergeni e spesa intelligente — tutto in un solo posto.

</div>

***

## Overview

Qoovex è una SaaS italiana per cuochi e chef professionisti. Ogni utente ha un workspace personale e indipendente in cui organizzare ricette, costruire menu digitali con allergeni e valori nutrizionali, coordinare il team con piani di lavoro collaborativi, scoprire contenuti dalla community e gestire la lista della spesa in modo intelligente.

Il prodotto si divide in tre app:

| App | Percorso | Scopo |
| -------------------- | ---------------- | ----------------------------------- |
| **Qoovex Web** | `apps/web` | Sito vetrina, landing, pricing, SEO |
| **Qoovex Workspace** | `apps/workspace` | Web app principale — workspace chef |
| **Sirio** | `apps/sirio` | Design system showcase |

***

## Stack

| Layer | Tecnologia |
| ---------- | ----------------------------- |
| Framework | Next.js 15 App Router |
| Linguaggio | TypeScript |
| Stile | Tailwind CSS v4 |
| ORM | Prisma 7 |
| Database | Vercel Postgres |
| Storage | Vercel Blob |
| Auth | Clerk (solo `apps/workspace`) |
| Monorepo | Turborepo + pnpm workspaces |
| Deploy | Vercel |
| Icone | Phosphor Icons |
| Animazioni | Framer Motion |

***

## Struttura del monorepo

```
Qoovex/
├── apps/
│   ├── web/               # Sito vetrina
│   ├── workspace/         # Web app principale (Qoovex Workspace)
│   └── sirio/             # Design system showcase
│
├── packages/
│   ├── ui/                # Design system condiviso
│   ├── db/                # Schema Prisma, client, config
│   ├── types/             # Tipi condivisi tra app e packages
│   ├── utils/             # Funzioni pure, hook riusabili
│   ├── config/            # Config condivise (eslint, tsconfig, ecc.)
│   ├── brand/             # Asset brand condivisi (logo, icone, mark)
│   └── ai/                # Provider AI, scheduling engine, parsing
│
├── docs/
│   ├── HowToUse.md
│   ├── OperationalProtocol.md
│   ├── CodePatterns.md
│   └── project_brain.archive.json
│
├── project_brain.json
├── README.md
├── turbo.json
└── pnpm-workspace.yaml
```

`apps/workspace` segue **Feature-Sliced Design (FSD)** rigorosa:

```
apps/workspace/src/
├── app/         # Routing Next.js, page, layout, route handlers
├── shared/      # Primitive app-local, config, lib, api, shared actions
├── entities/    # Modelli di dominio (Recipe, Menu, WorkPlan…)
├── features/    # Azioni utente e casi d'uso
├── widgets/     # Composizioni grandi riusabili
└── views/       # Schermate complete
```

> ⚠️ Importa sempre verso il basso. Mai verso l'alto.

***

## Prerequisiti

- **Node.js** ≥ 20
- **pnpm** ≥ 9
- Account **Vercel** con Postgres e Blob configurati
- Account **Clerk** per autenticazione workspace

***

## Setup locale

```bash
# 1. Clona il repository
git clone https://github.com/your-org/qoovex.git
cd Qoovex

# 2. Installa le dipendenze
pnpm install

# 3. Configura le variabili d'ambiente
cp apps/web/.env.example apps/web/.env.local
cp apps/workspace/.env.example apps/workspace/.env.local

# 4. Genera il client Prisma
pnpm db:generate

# 5. Applica le migration al database
pnpm db:migrate

# 6. Avvia il dev server (tutte le app in parallelo)
pnpm dev
```

Le app saranno disponibili su:

- `apps/web` → http://localhost:3000
- `apps/workspace` → http://localhost:3001
- `apps/sirio` → http://localhost:3002

***

## Comandi principali

```bash
# Sviluppo
pnpm dev                                # Avvia tutte le app
pnpm --filter @qoovex/workspace dev     # Solo Qoovex Workspace
pnpm --filter @qoovex/web dev           # Solo sito vetrina
pnpm --filter @qoovex/sirio dev         # Solo Sirio showcase

# Build
pnpm build                              # Build completa (Turborepo)
pnpm --filter @qoovex/workspace build   # Build solo workspace

# Database
pnpm db:generate                        # Genera il client Prisma
pnpm db:push                            # Applica lo schema al DB di sviluppo
pnpm db:migrate                         # Esegue le migration in sviluppo
pnpm db:workspace                       # Prisma Studio (GUI)

# Qualità del codice
pnpm lint                               # Lint di tutto il monorepo
pnpm type-check                         # Typecheck TypeScript
pnpm check:fast                         # Guardrail repo + lint + typecheck
pnpm check                              # Guardrail completi: repo + lint + typecheck + build + audit browser
```

***

## Feature core

| Feature | Descrizione |
| --------------------- | ----------------------------------------------------------------------------------- |
| **Ricette** | Crea e gestisce ricette con ingredienti, allergeni automatici e valori nutrizionali |
| **Menu digitali** | Componi menu dalle ricette, genera QR code, condividi o esporta |
| **Allergeni** | Calcolo automatico degli allergeni per ricetta e per menu |
| **Esplora** | Scopri ricette e menu della community, copia e forka con credito all'autore |
| **Lista della spesa** | Generata dalle ricette e dai menu, scala per porzioni, acquista solo ciò che serve |
| **Piani di lavoro** | Organizza il team con task collegabili a ricette, notifiche al completamento |
| **Notifiche** | Aggiornamenti in tempo reale su task, piani e attività del workspace |

### Regole business fondamentali

- Ogni workspace è personale e indipendente
- Partecipare ai piani altrui è sempre **gratuito e illimitato**
- I limiti si applicano solo alla **creazione** di piani e al numero di membri per piano
- Solo il **creatore del piano** può creare task; i membri possono completarli
- Il completamento di un task invia **notifica al creatore**
- I task possono essere testo libero o collegati a una **ricetta tramite snapshot immutabile**

***

## AI Stack

Il Piano di Lavoro usa tre componenti distinti per tre problemi distinti:

| Componente | Tipo | Modello | Usato per |
| ---------------------- | -------------------- | -------------------------- | ------------------------------------------------ |
| **Scheduling Engine** | TypeScript puro | — | Ordinamento topologico, Critical Path, assegnazione parallela |
| **Operational AI** | LLM API | Gemini 2.0 Flash | Parsing task da testo libero, recipe matching, Vision scan (PRO) |
| **Conversational AI** | LLM API | Mistral Small 3.1 | Chat co-pilot durante la costruzione del piano |

> I token AI sono limitati **per WorkPlan**, non al mese. I limiti variano per piano.

***

## Piani

| Piano | Ricette | Menu | Piani di lavoro |
| -------------- | ------- | ---- | ------------------- |
| **Free** | 50 | 2 | 0 (join illimitati) |
| **Start** | 300 | 6 | 1 attivo, 5 membri |
| **Pro** | ∞ | ∞ | 3 attivi, 10 membri |
| **Enterprise** | ∞ | ∞ | ∞ |

> I limiti canonici sono definiti in `packages/config/plan_rules.json`. Non definirli altrove.

***

## Design system

Il design system è documentato in `packages/ui` e mostrato in `apps/sirio`. Regole chiave:

- **Font testi:** Satoshi
- **Font titoli:** Cabinet Grotesk (`font-display`)
- **Icone:** Phosphor Icons — `weight="regular"` decorative/UI, `weight="bold"` funzionali/check/alert
- **Token semantici** obbligatori — niente valori hardcoded se esiste il token
- **Asset brand condivisi** — sempre da `packages/brand`, mai duplicati in `apps/*/public`
- **Mai hover** su elementi non interattivi
- **Mai SVG inline** — usa sempre Phosphor Icons

***

## CSS Architecture

Tailwind v4 CSS-first. Niente `tailwind.config.js`.

```
packages/ui/styles/tokens.css   → @theme — unica fonte di verità per i token
packages/ui/styles/base.css     → @layer base — reset, html, body, font, scroll
apps/*/src/app/globals.css      → minima: import + @source + regole app-specific
```

Il path `@source` in `globals.css` è sempre **relativo al file CSS stesso**:

```css
@source "../../../../packages/ui/src";
```

***

## Deploy

Il deploy è gestito da **Vercel** con preview automatica su ogni PR e produzione su `main`.

- `apps/workspace` → Vercel project **Qoovex-workspace** → `app.qoovex.com`
- `apps/web` → Vercel project separato → `qoovex.com`

> Le variabili d'ambiente Clerk devono essere configurate **esclusivamente** nel progetto Vercel `Qoovex-workspace`.

***

## Contribuire

Questo è un repository privato. Prima di lavorare su qualsiasi feature:

1. Leggi `docs/HowToUse.md` — regole operative del progetto
2. Leggi `project_brain.json` — memoria operativa corrente e decisioni attive
3. Leggi il `README.md` della cartella in cui stai entrando
4. Verifica l'architettura FSD in `apps/workspace`
5. Leggi `docs/OperationalProtocol.md` per la checklist operativa del monorepo
6. Leggi `docs/CodePatterns.md` per l'ordine standard dei file
7. Non introdurre dipendenze nuove senza verificarne la necessità
8. Consegna sempre file completi — niente patch parziali

Se serve il contesto storico dettagliato, leggi `docs/project_brain.archive.json` solo quando il task lo richiede davvero.

***

<div align="center">

**Qoovex** — La regia dietro ogni servizio.  
[qoovex.com](https://qoovex.com)

</div>
