# Piano di Lavoro — Roadmap futura non canonica

> [!WARNING]
> Questo documento descrive una proposta di roadmap avanzata redatta prima
> della baseline prodotto corrente. Non è una specifica approvata per la v1,
> non modifica business rule, piani, database o architettura e non può essere
> usato per landing, demo, personas, copy o promesse commerciali.
>
> AI chat, parsing AI, PrepStock, scheduling avanzato, nuovi stati, nuovi
> permessi e limiti token sono `roadmap` e richiedono decisioni dedicate prima
> di qualsiasi implementazione o comunicazione.
>
> Per lo scope corrente valgono Qoovex Brain,
> `packages/config/plan_rules.json` e `docs/ux`.

**Qoovex · apps/workspace · v1.0 · April 2026**

---

## Executive Summary della proposta futura

La visione esplorata in questa roadmap estende il Piano di Lavoro verso
orchestrazione, stock dei semilavorati, scheduling e assistenza AI. Queste
capacità non fanno parte dello scope corrente e devono essere validate prima
di diventare decisioni di prodotto.

Il contenuto seguente è materiale di esplorazione. Non costituisce architettura,
schema DB, business rule, gating o ordine di implementazione approvati.

---

## 1. I Tre Orizzonti del Piano di Lavoro

Una cucina professionale non pianifica solo "cosa c'è nel menu di stasera". Esistono tre livelli sovrapposti che devono coesistere nel sistema:

| Orizzonte            | Tipo Piano   | Esempio concreto                          | Output                   |
| -------------------- | ------------ | ----------------------------------------- | ------------------------ |
| **Produzione/Stock** | `PRODUCTION` | "Sessione crocchette 14 Aprile — 1000 pz" | +1000 PrepItem stock     |
| **Evento**           | `EVENT`      | "Matrimonio Rossi — Sabato 19 Aprile"     | Consuma stock esistente  |
| **Servizio**         | `SERVICE`    | "Cena Venerdì — servizio serale"          | Mix produzione + consumo |

La novità chiave è il **PrepStock**: ogni prodotto semilavorato (crocchette, fondi, salse, impasti, etc.) esiste come entità indipendente nel workspace, con stock tracciato, soglia minima (PAR level), tipo di stoccaggio e ricetta collegata. I piani producono o consumano PrepItem — e il sistema lo sa in ogni momento.

---

## 2. AI Stack — Ipotesi di roadmap non approvata

### Filosofia

Tre problemi distinti richiedono tre soluzioni distinte. Non tutto è AI: il calcolo delle tempistiche è algoritmo deterministico puro. L'AI serve dove serve davvero: parsing del linguaggio naturale, conversazione, suggerimenti contestuali.

### Componente 1 — Scheduling Engine (TypeScript puro, zero AI)

Il problema di ottimizzare la timeline di una brigata è un problema di **scheduling con dipendenze e risorse parallele**. È risolvibile con un algoritmo deterministico, non con un LLM:

```
Algoritmo:
1. Topological sort dei task per dipendenze
2. Critical Path Method (CPM) per identificare il percorso più lungo
3. Greedy assignment: riempire i "buchi" dei tempi passivi
   con task compatibili e senza dipendenze bloccanti
4. Output: timeline per persona, con slot orari esatti
```

Nessuna chiamata API, nessun costo, nessuna latenza imprevedibile. Risultato determinístico e spiegabile.

### Componente 2 — AI Operativa: Task Parsing + Recipe Matching

Usata per: parsare testo libero dello chef in task strutturati, matchare task con ricette del workspace, estrarre piatti da foto/PDF di menu.

**Modello scelto: `google/gemini-2.0-flash`** via Google AI SDK

- Costo: ~$0.075/1M token input — praticamente gratuito per questo uso
- Latenza: sub-secondo per chiamate strutturate
- Output JSON nativo (structured output)
- Vision API inclusa (per scan del menu)

**Alternativa open-source**: `meta-llama/llama-3.1-8b-instruct` via Groq (latenza ~200ms, quasi gratuito) per parsing/matching quando la Vision non serve.

### Componente 3 — AI Conversazionale: Chef Co-Pilot Chat

Usata per: chat contestuale durante costruzione del piano, suggerimenti proattivi, controllo dimenticanze, avvisi PAR level, risposta a domande organizzative.

**Modello scelto: `mistral/mistral-small-3.1-24b`** via Mistral AI

- Costo: ~$0.10/1M token — ottimo per chat con session memory
- **Europeo/GDPR-friendly**: Mistral è francese, fondamentale per il mercato italiano
- Contesto: 128k token — sufficiente per tenere il piano completo in contesto
- Qualità conversazionale alta, ottima comprensione dell'italiano

**Alternativa**: `google/gemini-2.0-flash` può coprire anche questo ruolo se si vuole unificare su un unico provider.

### Provider Strategy

Usare **Vercel AI SDK** (`ai` package) con provider multipli — compatibile con lo stack Next.js 16:

```
packages/ai/              ← nuovo package condiviso
  src/
    providers.ts          ← configura gemini + mistral
    scheduling.ts         ← algoritmo TypeScript puro
    chat.ts               ← streaming chat con mistral
    parse-tasks.ts        ← parsing testo → task strutturati
    match-recipes.ts      ← task text → ricetta match
    scan-menu.ts          ← vision: foto/PDF → lista piatti
    token-limits.ts       ← limiti per piano (START/PRO/ENTERPRISE)
```

### Token Limits per Piano

| Piano      | Chat AI              | AI Parsing | AI Schedule  |
| ---------- | -------------------- | ---------- | ------------ |
| FREE       | ✗                    | ✗          | ✗            |
| START      | ✓ (50k token/piano)  | ✓          | ✓ one-shot   |
| PRO        | ✓ (500k token/piano) | ✓          | ✓ one-shot   |
| ENTERPRISE | ✓ illimitato         | ✓          | ✓ illimitato |

Il contatore token è per singolo WorkPlan, non mensile. Così uno chef START con un piano attivo ha tutto ciò che serve per quel piano senza sorprese.

---

## 3. Schema DB Completo — packages/db

Schema Prisma da aggiungere/integrare (Prisma 7, `prisma.config.ts`).

### Nuove Enum

```prisma
enum WorkPlanType {
  PRODUCTION   // sessione di produzione batch → aumenta PrepItem stock
  EVENT        // cerimonia/evento → consuma PrepItem stock
  SERVICE      // servizio quotidiano → mix produzione e consumo
}

enum WorkPlanStatus {
  DRAFT        // chef sta costruendo, team non lo vede ancora
  ACTIVE       // team può vedere e completare i task
  COMPLETED    // tutti i task done o chef ha chiuso manualmente
  ARCHIVED     // storico, non modificabile
}

enum WorkTaskType {
  FREE_TEXT         // testo libero, nessuna ricetta collegata
  RECIPE_SNAPSHOT   // collegato a snapshot ricetta
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
}

enum TaskStatus {
  PENDING
  IN_PROGRESS   // opzionale: membro ha iniziato
  DONE
}

enum PrepDirection {
  PRODUCE   // il task completato aumenta lo stock del PrepItem
  CONSUME   // il task completato diminuisce lo stock del PrepItem
}

enum StorageType {
  AMBIENT         // temperatura ambiente
  FRIDGE          // frigorifero
  BLAST_CHILLED   // abbattuto (temperatura positiva)
  FROZEN          // abbattuto/congelatore (negativo)
}

enum AiMessageRole {
  USER
  ASSISTANT
}
```

### PrepItem — Semilavorati/Stock

```prisma
model PrepItem {
  id              String   @id @default(cuid())
  workspaceUserId String
  workspaceUser   User     @relation("PrepItems", fields: [workspaceUserId], references: [id])

  name            String
  description     String?
  unit            String        // "pz", "kg", "L", "porzioni", "vaschette"
  currentStock    Float         @default(0)
  parLevel        Float         // soglia alert sotto cui il sistema notifica
  typicalBatch    Float?        // quantità tipica di una sessione di produzione
  storageType     StorageType   @default(FRIDGE)
  shelfLifeDays   Int?          // durata in giorni dalla data di produzione
  notes           String?

  recipeId        String?       // ricetta collegata (opzionale, per snapshot automatico nei task)
  recipe          Recipe?       @relation("PrepItemRecipe", fields: [recipeId], references: [id], onDelete: SetNull)

  productions     PrepProduction[]
  consumptions    PrepConsumption[]
  tasks           WorkTask[]       @relation("TaskPrepItem")

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### PrepProduction — Storico produzioni

```prisma
model PrepProduction {
  id           String    @id @default(cuid())
  prepItemId   String
  prepItem     PrepItem  @relation(fields: [prepItemId], references: [id], onDelete: Cascade)

  quantity     Float           // quantità effettivamente prodotta (dichiarata dal membro)
  producedAt   DateTime        @default(now())
  producedById String?         // userId del membro che ha dichiarato
  producedBy   User?           @relation("ProducedBy", fields: [producedById], references: [id])
  workTaskId   String?         // task che ha generato questa produzione
  workTask     WorkTask?       @relation("TaskProduction", fields: [workTaskId], references: [id], onDelete: SetNull)
  notes        String?
}
```

### PrepConsumption — Storico consumi

```prisma
model PrepConsumption {
  id           String    @id @default(cuid())
  prepItemId   String
  prepItem     PrepItem  @relation(fields: [prepItemId], references: [id], onDelete: Cascade)

  quantity     Float
  consumedAt   DateTime  @default(now())
  consumedById String?
  consumedBy   User?     @relation("ConsumedBy", fields: [consumedById], references: [id])
  workTaskId   String?
  workTask     WorkTask? @relation("TaskConsumption", fields: [workTaskId], references: [id], onDelete: SetNull)
  workPlanId   String?
  workPlan     WorkPlan? @relation("PlanConsumptions", fields: [workPlanId], references: [id], onDelete: SetNull)
  notes        String?
}
```

### WorkPlan

```prisma
model WorkPlan {
  id          String        @id @default(cuid())
  creatorId   String
  creator     User          @relation("CreatedWorkPlans", fields: [creatorId], references: [id])

  name        String
  description String?
  type        WorkPlanType  @default(SERVICE)
  status      WorkPlanStatus @default(DRAFT)
  serviceDate DateTime?     // data target del servizio/evento/produzione

  // AI fields
  aiTokensUsed      Int       @default(0)   // counter token chat usati
  aiScheduleData    Json?     // timeline ottimizzata serializzata (one-shot)
  aiScheduledAt     DateTime?

  members       WorkPlanMember[]
  tasks         WorkTask[]
  aiMessages    WorkPlanAiMessage[]
  consumptions  PrepConsumption[]   @relation("PlanConsumptions")

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### WorkPlanMember

```prisma
model WorkPlanMember {
  id         String   @id @default(cuid())
  workPlanId String
  workPlan   WorkPlan @relation(fields: [workPlanId], references: [id], onDelete: Cascade)
  userId     String
  user       User     @relation("WorkPlanMemberships", fields: [userId], references: [id])
  joinedAt   DateTime @default(now())

  @@unique([workPlanId, userId])
}
```

### WorkTask

```prisma
model WorkTask {
  id         String   @id @default(cuid())
  workPlanId String
  workPlan   WorkPlan @relation(fields: [workPlanId], references: [id], onDelete: Cascade)

  title           String
  notes           String?
  type            WorkTaskType  @default(FREE_TEXT)
  recipeSnapshot  Json?         // snapshot completo ricetta al momento dell'assegnazione

  // timing
  activeMinutes   Int?          // minuti che richiedono presenza fisica
  passiveMinutes  Int?          // minuti passivi (abbattimento, lievitazione, etc.)
  passiveLabel    String?       // "Abbattimento", "Riposo impasto", "Marinatura"
  scheduledStart  DateTime?     // orario pianificato di inizio (output AI scheduler)

  // assignment
  assignedToId    String?
  assignedTo      User?         @relation("AssignedTasks", fields: [assignedToId], references: [id])

  // ordering
  priority        TaskPriority  @default(MEDIUM)
  order           Int           @default(0)

  // status
  status          TaskStatus    @default(PENDING)
  completedAt     DateTime?
  completedById   String?
  completedBy     User?         @relation("CompletedTasks", fields: [completedById], references: [id])

  // prep stock
  prepItemId      String?       // PrepItem collegato (se il task produce/consuma)
  prepItem        PrepItem?     @relation("TaskPrepItem", fields: [prepItemId], references: [id])
  prepDirection   PrepDirection?  // PRODUCE | CONSUME
  prepQuantity    Float?          // quantità pianificata
  reportedQuantity Float?         // quantità effettiva dichiarata dal membro al completamento

  // dipendenze tra task
  dependsOn       WorkTask[]    @relation("TaskDeps")
  dependents      WorkTask[]    @relation("TaskDeps")

  productions     PrepProduction[]  @relation("TaskProduction")
  consumptions    PrepConsumption[] @relation("TaskConsumption")

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### WorkPlanAiMessage — Chat log

```prisma
model WorkPlanAiMessage {
  id         String         @id @default(cuid())
  workPlanId String
  workPlan   WorkPlan       @relation(fields: [workPlanId], references: [id], onDelete: Cascade)
  role       AiMessageRole
  content    String         @db.Text
  tokenCount Int?           // token usati per questo messaggio
  createdAt  DateTime       @default(now())
}
```

---

## 4. Business Rules Complete

### Invarianti da non violare mai

1. **Solo il creatore crea task** — i membri non toccano la struttura del piano.
2. **Solo i membri completano task** — il creatore non può completare i propri task (ma può forzare in casi eccezionali, da definire in v2).
3. **Completare un task PRODUCE** → popup quantità → aggiorna `PrepItem.currentStock` atomicamente.
4. **Completare un task CONSUME** → aggiorna `PrepItem.currentStock` in negativo (mai sotto zero — alert se va a zero).
5. **Joining è gratis e illimitato** per tutti i piani incluso FREE.
6. **Limiti creazione** per piano: FREE=0, START=1 attivo, PRO=3 attivi, ENTERPRISE=illimitato.
7. **AI chat** disponibile da START in su, con token limit per piano (50k START, 500k PRO, illimitato ENTERPRISE).
8. **PrepItem** è del workspace del creatore, non del piano. Tutti i piani dello stesso workspace condividono lo stesso stock.
9. **DRAFT** → il team non vede il piano. Solo ACTIVE in poi è visibile ai membri.
10. **AI Schedule** è one-shot: chef preme "Ottimizza con AI" → viene generata la timeline → può essere accettata o ignorata.
11. **Snapshot ricetta**: se la ricetta originale viene modificata o cancellata, il task mantiene lo snapshot al momento dell'assegnazione. Non puntare alla ricetta live.

### PAR Level Alert

Quando `PrepItem.currentStock < PrepItem.parLevel`:

- Notifica push al creator del workspace
- Badge rosso sul PrepItem nella lista stock
- Suggestion proattiva nella AI chat se un piano è aperto

### Stock atomicity

Le operazioni su `currentStock` devono essere transazionali (Prisma `$transaction`). Due membri non possono completare task sullo stesso PrepItem simultaneamente senza conflitti.

---

## 5. Architettura FSD — apps/workspace

### Nuovo package: packages/ai

```
packages/ai/
  src/
    index.ts
    providers.ts          ← configura @ai-sdk/google + @ai-sdk/mistral
    token-limits.ts       ← getTokenLimit(plan: Plan): number
    scheduling/
      index.ts            ← buildTimeline(tasks, members): ScheduledTimeline
      topological-sort.ts
      critical-path.ts
      greedy-assign.ts
    chat/
      index.ts            ← streamChat(messages, context, planId): StreamingText
      build-context.ts    ← assembla contesto (prepItems, recipes, plan)
    parsing/
      parse-tasks.ts      ← text → WorkTaskDraft[]
      match-recipes.ts    ← taskTitle → Recipe | null
      scan-menu.ts        ← imageUrl/pdfUrl → string[] (nomi piatti)
```

### FSD in apps/workspace

```
src/
  entities/
    work-plan/
      model/
        types.ts
        selectors.ts      ← isOverdue, getProgress, canActivate, etc.
      ui/
        work-plan-card.tsx
        work-plan-status-badge.tsx
        work-plan-type-badge.tsx
      api/
        work-plan.queries.ts

    work-task/
      model/
        types.ts
        selectors.ts      ← isBlocked, canComplete, getTimeLabel
      ui/
        work-task-item.tsx
        work-task-timeline-slot.tsx
      api/
        work-task.queries.ts

    prep-item/
      model/
        types.ts
        selectors.ts      ← isUnderPar, getStockStatus, getEstimatedWeeks
      ui/
        prep-item-card.tsx
        prep-item-stock-badge.tsx
        prep-stock-alert.tsx
      api/
        prep-item.queries.ts

  features/
    create-work-plan/
    update-work-plan-status/      ← DRAFT → ACTIVE → COMPLETED
    add-task/
    edit-task/
    delete-task/
    assign-task/
    reorder-tasks/
    complete-task/                ← include popup quantità per PRODUCE/CONSUME
    add-task-dependency/
    invite-member/
    remove-member/
    generate-ai-schedule/         ← one-shot timeline ottimizzata
    import-tasks-from-menu/       ← vision scan → task drafts (PRO gate)
    create-prep-item/
    update-prep-stock/            ← manuale (aggiustamenti stock)
    work-plan-ai-chat/            ← streaming chat (START+ con token limit)

  widgets/
    work-plan-builder/            ← vista creazione piano con task list
    work-plan-timeline/           ← vista timeline ottimizzata per persona
    work-plan-progress/           ← vista membro: i miei task oggi
    prep-stock-dashboard/         ← lista semilavorati con stock e alert
    work-plan-ai-chat-panel/      ← chat collassabile durante costruzione

  views/
    work-plans-view/              ← lista piani (creati + partecipazioni)
    work-plan-detail-view/        ← piano specifico + gestione
    prep-stock-view/              ← gestione semilavorati workspace
```

---

## 6. Flussi Principali

### 6.1 Chef — Costruzione Piano (sera)

```
1. Apre "Nuovo Piano di Lavoro"
   → Sceglie tipo: PRODUZIONE / EVENTO / SERVIZIO
   → Imposta nome + data target

2. AI Chat si apre nel pannello laterale (collassabile)
   → Se tipo SERVIZIO: "Hai un menu per questa data? Vuoi importare i piatti?"
   → Se PRODUZIONE: "Quali semilavorati vuoi produrre?"
   → Alert proattivi: "Crocchette sotto soglia (52/200 pz) — considera una sessione di produzione"

3. Chef aggiunge task (manuale o da ricetta)
   → Seleziona ricetta → snapshot automatico allegato
   → Oppure testo libero → AI suggerisce match ricetta se trovata
   → Imposta: activeMinutes, passiveMinutes, passiveLabel, assignedTo, priority

4. Chef collega PrepItem ai task:
   → Task "Forma 1000 crocchette" → prepDirection: PRODUCE → prepItem: Crocchette → prepQuantity: 1000
   → Task "Scongela crocchette" → prepDirection: CONSUME → prepItem: Crocchette → prepQuantity: 50

5. Chef imposta dipendenze:
   → "Forma crocchette" dipende da "Cuoci patate"

6. Chef preme "Ottimizza con AI" (one-shot)
   → Lo scheduling engine (TypeScript puro) calcola la timeline
   → Output: scheduledStart per ogni task, task paralleli visualizzati
   → Chef revisiona e può aggiustare manualmente

7. Chef invita i membri (link o cerca utente)

8. Chef attiva il piano → status: ACTIVE → team può accedere
```

### 6.2 Membro — Esecuzione (mattina/servizio)

```
1. Membro apre il suo piano
   → Vede solo i task assegnati a lui, ordinati per scheduledStart
   → Ogni task: titolo, orario stimato, ricetta snapshot (se presente), note

2. Membro apre task → legge la ricetta snapshot se collegata

3. Membro completa task:
   → [✓ Segna come fatto]
   → Se prepDirection = PRODUCE: popup "Quante unità hai prodotto?" → inserisce 987
   → Se prepDirection = CONSUME: popup "Hai usato [50 crocchette], confermi?" → conferma
   → DB aggiorna PrepItem.currentStock in transazione
   → Notifica push al creatore

4. Se stock scende sotto PAR: alert automatico al creator
```

### 6.3 AI Chat — Esempi di interazione

```
Chef: "devo preparare per il buffet di sabato, abbiamo 80 ospiti"
AI:   "Ho trovato il Menu 'Buffet Estivo' con 8 ricette. Vuoi che generi
       i task da tutte? Nota: le Crocchette di Patate sono sotto PAR
       (52/200 pz). Ti suggerisco di aggiungere una sessione di produzione
       prima di sabato."

Chef: "sì ma aggiungi anche i cantucci e l'allestimento dolci"
AI:   "Aggiunto. Non trovo una ricetta 'Cantucci' nel workspace —
       vuoi aggiungere un task testo libero o stai usando una ricetta
       esterna?"

Chef: "lascia testo libero, quante persone mi servono?"
AI:   "Con il carico attuale stimato: 4h 20min di lavoro attivo totale.
       Con 2 persone il servizio è raggiungibile. Con 3 persone
       hai un buffer di 45 minuti. Dipende da cosa trovi disponibile."
```

---

## 7. Gating per Piano

| Feature                 | FREE         | START               | PRO                  | ENTERPRISE   |
| ----------------------- | ------------ | ------------------- | -------------------- | ------------ |
| Partecipare a piani     | ✓ illimitato | ✓ illimitato        | ✓ illimitato         | ✓ illimitato |
| Creare piani            | ✗            | 1 attivo            | 3 attivi             | illimitato   |
| Membri per piano        | —            | 5                   | 10                   | illimitato   |
| PrepStock               | ✗            | ✓                   | ✓                    | ✓            |
| AI Chat                 | ✗            | ✓ (50k token/piano) | ✓ (500k token/piano) | ✓ illimitato |
| AI Schedule (one-shot)  | ✗            | ✓                   | ✓                    | ✓            |
| Import da Menu (Vision) | ✗            | ✗                   | ✓                    | ✓            |
| Activity Log piano      | ✗            | ✗                   | ✓                    | ✓            |

---

## 8. Aggiornamenti project_brain.json richiesti

Dopo questa spec, aggiornare `project_brain.json` con:

- `domain_entities`: aggiungere `PrepItem`, `PrepProduction`, `PrepConsumption`, `WorkPlanAiMessage`
- `confirmed_decisions`: aggiungere decisioni AI stack (Gemini 2.0 Flash + Mistral Small 3.1)
- `architecture.packages`: aggiungere `ai` package
- `product.work_plan_rules`: estendere con le nuove regole PrepStock e AI
- `product.plans`: aggiungere feature `prep_stock` e `ai_chat_token_limit`
- `current_state.next_focus`: aggiornare con work plan come prossimo step dopo recipes
- `implementation_order`: confermare ordine (work plan è dopo explore, come già stabilito)

---

## 9. Fasi di Implementazione

### Fase 0 — Schema e Types (packages/db + packages/types)

- Aggiungere tutte le enum e i modelli al prisma schema
- `prisma db push` su dev
- Esportare i tipi condivisi in `packages/types`

### Fase 1 — PrepStock CRUD (nessuna AI)

- `prep-stock-view` con lista PrepItem
- CRUD completo PrepItem
- Alert visivo sotto PAR
- Notifica push quando stock scende sotto PAR

### Fase 2 — WorkPlan base (nessuna AI)

- `work-plans-view` lista piani
- Creazione piano (tipo + data + nome)
- Task CRUD manuale
- Assegnazione task
- Invito membri
- Completamento task con dichiarazione quantità
- Aggiornamento stock PrepItem al completamento
- Notifiche completamento al creatore

### Fase 3 — Scheduling Engine (TypeScript puro)

- `packages/ai/scheduling`
- Topological sort + Critical Path + Greedy assign
- Timeline view nel `work-plan-timeline` widget
- Pulsante "Ottimizza" → genera scheduledStart per ogni task

### Fase 4 — AI Chat (Mistral Small)

- `packages/ai/chat`
- `work-plan-ai-chat-panel` widget
- Streaming chat contestuale al piano
- Context builder: prepItems + recipes + tasks correnti
- Token counter + gate per piano START (50k) / PRO (500k)

### Fase 5 — AI Parsing + Recipe Match (Gemini Flash)

- `packages/ai/parsing`
- Parsing testo libero → task strutturati
- Recipe matching automatico al salvataggio task
- Suggerimenti proattivi in chat (PAR alert, task mancanti)

### Fase 6 — Import da Menu Vision (PRO+)

- `packages/ai/parsing/scan-menu`
- Upload foto/PDF menu
- Vision → lista nomi piatti → match ricette → task draft
- Gate: solo PRO e ENTERPRISE
