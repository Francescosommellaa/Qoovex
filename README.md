<div align="center">

# Qoovex

**Il workspace operativo per cuochi e chef professionisti.**  
Piani di lavoro, menu, ricette, allergeni e spesa intelligente — tutto in un solo posto.

[
[
[
[
[

</div>

---

## Overview

Qoovex è una SaaS italiana per cuochi e chef professionisti. Ogni utente ha un workspace personale e indipendente in cui organizzare ricette, costruire menu digitali con allergeni e valori nutrizionali, coordinare il team con piani di lavoro collaborativi, scoprire contenuti dalla community e gestire la lista della spesa in modo intelligente.

Il prodotto si divide in due app:

| App               | Percorso      | Scopo                               |
| ----------------- | ------------- | ----------------------------------- |
| **Qoovex Web**    | `apps/web`    | Sito vetrina, landing, pricing, SEO |
| **Qoovex Studio** | `apps/studio` | Web app principale — workspace chef |

---

## Stack

| Layer      | Tecnologia                  |
| ---------- | --------------------------- |
| Framework  | Next.js 15 App Router       |
| Linguaggio | TypeScript                  |
| Stile      | Tailwind CSS v4             |
| ORM        | Prisma 7                    |
| Database   | Vercel Postgres             |
| Storage    | Vercel Blob                 |
| Auth       | Clerk                       |
| Monorepo   | Turborepo + pnpm workspaces |
| Deploy     | Vercel                      |
| Icone      | Lucide React                |
| Animazioni | Framer Motion               |

---

## Struttura del monorepo

```
qoovex/
├── apps/
│   ├── web/               # Sito vetrina
│   └── studio/            # Web app principale (Qoovex Studio)
│
├── packages/
│   ├── ui/                # Design system condiviso
│   ├── db/                # Schema Prisma, client, config
│   ├── types/             # Tipi condivisi tra app e packages
│   ├── utils/             # Funzioni pure e logica riusabile
│   └── config/            # Config condivise (eslint, tsconfig, ecc.)
│
├── README.md
├── turbo.json
└── pnpm-workspace.yaml
```

`apps/studio` segue **Feature-Sliced Design (FSD)** rigorosa:

```
apps/studio/src/
├── shared/      # Primitive, UI base, config
├── entities/    # Modelli di dominio (Recipe, Menu, WorkPlan…)
├── features/    # Azioni utente e casi d'uso
├── widgets/     # Composizioni complesse
└── views/       # Pagine e schermate
```

> ⚠️ Importa sempre verso il basso. Mai verso l'alto.

---

## Prerequisiti

- **Node.js** ≥ 20
- **pnpm** ≥ 9
- Account **Vercel** con Postgres e Blob configurati
- Account **Clerk** per autenticazione

---

## Setup locale

```bash
# 1. Clona il repository
git clone https://github.com/your-org/qoovex.git
cd qoovex

# 2. Installa le dipendenze
pnpm install

# 3. Configura le variabili d'ambiente
cp apps/web/.env.example apps/web/.env.local
cp apps/studio/.env.example apps/studio/.env.local

# 4. Genera il client Prisma
pnpm --filter @qoovex/db db:generate

# 5. Applica le migration al database
pnpm --filter @qoovex/db db:migrate

# 6. Avvia il dev server (tutte le app in parallelo)
pnpm dev
```

Le app saranno disponibili su:

- `apps/web` → [http://localhost:3000](http://localhost:3000)
- `apps/studio` → [http://localhost:3001](http://localhost:3001)

---

## Comandi principali

```bash
# Sviluppo
pnpm dev                          # Avvia tutte le app
pnpm --filter studio dev          # Solo Qoovex Studio
pnpm --filter web dev             # Solo sito vetrina

# Build
pnpm build                        # Build completa (Turborepo)
pnpm --filter studio build        # Build solo Studio

# Database
pnpm --filter @qoovex/db db:generate   # Genera client Prisma
pnpm --filter @qoovex/db db:migrate    # Applica migration
pnpm --filter @qoovex/db db:studio     # Prisma Studio (GUI)
pnpm --filter @qoovex/db db:seed       # Seed dati iniziali

# Qualità del codice
pnpm lint                         # Lint di tutto il monorepo
pnpm typecheck                    # Typecheck TypeScript
pnpm format                       # Formattazione con Prettier
```

---

## Variabili d'ambiente

### `apps/studio`

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Database (Vercel Postgres)
POSTGRES_PRISMA_URL=
POSTGRES_URL_NON_POOLING=

# Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### `apps/web`

```env
NEXT_PUBLIC_STUDIO_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Feature core

| Feature               | Descrizione                                                                         |
| --------------------- | ----------------------------------------------------------------------------------- |
| **Ricette**           | Crea e gestisce ricette con ingredienti, allergeni automatici e valori nutrizionali |
| **Menu digitali**     | Componi menu dalle ricette, genera QR code, condividi o esporta                     |
| **Allergeni**         | Calcolo automatico degli allergeni per ricetta e per menu                           |
| **Esplora**           | Scopri ricette e menu della community, copia e forka con credito all'autore         |
| **Lista della spesa** | Generata dalle ricette e dai menu, scala per porzioni, acquista solo ciò che serve  |
| **Piani di lavoro**   | Organizza il team con task collegabili a ricette, notifiche al completamento        |
| **Notifiche**         | Aggiornamenti in tempo reale su task, piani e attività del workspace                |

### Regole business fondamentali

- Ogni workspace è personale e indipendente
- Partecipare ai piani altrui è sempre **gratuito e illimitato**
- I limiti si applicano solo alla **creazione** di piani e al numero di membri per piano
- Solo il **creatore del piano** può creare task; i membri possono completarli
- Il completamento di un task invia **notifica al creatore**

---

## Piani

| Piano      | Prezzo    | Ricette | Menu | Piani di lavoro     |
| ---------- | --------- | ------- | ---- | ------------------- |
| **Free**   | 0€        | 50      | 2    | 0 (join illimitati) |
| **Start**  | ~19€/mese | 300     | 6    | 1 attivo, 5 membri  |
| **Pro**    | ~49€/mese | ∞       | ∞    | 3 attivi, 10 membri |
| **Studio** | Custom    | ∞       | ∞    | ∞                   |

> Il file canonico dei piani è `packages/config/plan-rules.json`. Non definire limiti in altri file.

---

## Design system

Il design system è documentato in `packages/ui`. Regole chiave:

- **Font testi:** Satoshi
- **Font titoli:** Chillax (`font-display`)
- **Icone:** Lucide React — `strokeWidth={1.5}` decorative, `strokeWidth={2}` funzionali
- **Token semantici** obbligatori — niente valori hardcoded se esiste il token
- **Mai hover** su elementi non interattivi
- **Mai SVG inline** — usa sempre Lucide React

---

## Deploy

Il deploy è gestito da **Vercel** con preview automatica su ogni PR e produzione su `main`.

```bash
# Deploy manuale (raramente necessario)
vercel --prod
```

> Assicurati che le variabili d'ambiente siano configurate nel dashboard Vercel per ogni ambiente (development, preview, production).

---

## Contribuire

Questo è un repository privato. Prima di lavorare su qualsiasi feature:

1. Leggi `HowToUse.md` — regole operative del progetto
2. Leggi `project_brain.json` — memoria viva e decisioni confermate
3. Verifica l'architettura FSD in `apps/studio`
4. Non introdurre dipendenze nuove senza verificarne la necessità
5. Consegna sempre file completi — niente patch parziali

---

<div align="center">

**Qoovex** — La regia dietro ogni servizio.  
[qoovex.com](https://qoovex.com)

</div>
