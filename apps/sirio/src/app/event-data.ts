export const preparationFixture = {
  event: "Comunione Rossi",
  date: "Domani · 12:30",
  children: 22,
  item: "Cotolette bambini",
  rule: "1 cotoletta per bambino + 10% margine",
  formula: "22 × 1,10 = 24,2 → 25",
  required: 25,
  approved: 35,
  produced: 38,
  assigned: 35,
  theoretical: 3,
  verified: null,
  location: "Frigo 2",
} as const;

export const futureEvents = [
  ["Oggi", "Matrimonio Russo", "198 ospiti", "2 criticità"],
  ["Domani", "Comunione Rossi", "22 bambini", "3 preparazioni"],
  ["Domani", "Comunione Crespi", "14 bambini", "1 dato mancante"],
  ["Lun 29", "Battesimo De Luca", "65 ospiti", "Regole complete"],
] as const;

export type CatalogGroup = "Struttura" | "Accessi" | "Intake" | "Regole" | "Pre-Service" | "Produzione" | "Assistente" | "Service" | "Primitive";

export interface CatalogItem {
  id: string;
  name: string;
  group: CatalogGroup;
  purpose: string;
  anatomy: string;
  variants: string;
  accessibility: string;
}

export const catalog: CatalogItem[] = [
  ["adaptive-shell", "AdaptiveAppShell", "Struttura", "Mantiene contesto e accesso all’assistente in ogni postura.", "Navigazione, contesto, launcher, area lavoro", "Phone · Tablet · Desktop", "Ordine e nomi delle destinazioni restano coerenti."],
  ["team-access", "TeamAccessPanel", "Accessi", "Mostra soltanto persone e ruoli gestibili dall’utente corrente.", "Membro, reparto, ruolo, revoca", "Admin · Chef", "Le azioni derivano dai permessi server-side."],
  ["invitation-composer", "InvitationComposer", "Accessi", "Invita capi reparto o brigata senza auto-promozioni.", "Email, ruolo, scadenza, invia", "Admin · Chef", "Email e ruolo hanno label persistenti."],
  ["support-access", "SupportAccessPanel", "Accessi", "Apre una sessione temporanea usando il codice come identificativo.", "Codice, motivo, MFA, sessione", "Ricerca · Attiva", "Motivo obbligatorio e identità supporto visibile."],
  ["support-banner", "SupportSessionBanner", "Accessi", "Mantiene evidente una sessione Qoovex attiva.", "Struttura, motivo, scadenza, chiudi", "Desktop · Mobile", "Banner persistente e chiusura esplicita."],
  ["assistant-launcher", "OperationalAssistantLauncher", "Assistente", "Apre l’assistente con un solo gesto senza occupare sempre lo schermo.", "Trigger, stato, scorciatoia", "Icona · Pulsante esteso", "Nome accessibile, target 48 px e shortcut documentata."],
  ["assistant-panel", "AssistantPanel", "Assistente", "Risponde in modo numerico con dettaglio e regola usata.", "Domanda, risposta, dettaglio, trace, follow-up", "Sheet phone · Panel desktop", "Focus confinato e risposta annunciata senza interrompere."],
  ["free-text-intake", "FreeTextEventIntake", "Intake", "Accetta la descrizione naturale di un evento.", "Testo, esempio, azione struttura", "Vuoto · Compilato · Elaborazione", "Label persistente e stato elaborazione testuale."],
  ["extraction-review", "ExtractionReview", "Intake", "Separa dati confermati, incerti e mancanti prima dei calcoli.", "Campo, valore, confidenza, correzione", "Confermato · Incerto · Mancante", "Lo stato non dipende dal solo colore."],
  ["missing-data", "MissingDataPrompt", "Intake", "Fa una domanda specifica quando manca un dato o una regola.", "Problema, domanda, risposta, conseguenza", "Dato · Regola · Conflitto", "Errore collegato al campo e focus sull’azione risolutiva."],
  ["rule-library", "RuleLibrary", "Regole", "Rende cercabili le regole interne e il loro contesto.", "Ricerca, regola, contesto, versione", "Per preparazione · Per evento", "Lista e ricerca navigabili da tastiera."],
  ["rule-editor", "RuleEditor", "Regole", "Salva formula, unità, margine e arrotondamento come una sola regola.", "Contesto, base, margine, unità, rounding", "Nuova · Versione successiva", "Anteprima formula leggibile prima del salvataggio."],
  ["calculation-trace", "CalculationTrace", "Regole", "Dimostra come un numero è stato calcolato senza nascondere passaggi.", "Input, operatore, margine, rounding, risultato, fonte", "Compatta · Estesa", "Ordine di lettura lineare e simboli accompagnati da testo."],
  ["pre-service-dashboard", "PreServiceDashboard", "Pre-Service", "Mostra oggi, domani, criticità e lavoro anticipabile.", "Orizzonte, eventi, criticità, prossima decisione", "Oggi · Tre giorni · Settimana", "Titoli e regioni permettono navigazione rapida."],
  ["kitchen-briefing", "KitchenBriefing", "Pre-Service", "Raccoglie quantità, allergeni, preparazioni e mancanze per la cucina.", "Evento, numeri, menu, allergeni, prep", "Evento · Giorno", "Contenuto stampabile e ordine semantico stabile."],
  ["service-briefing", "ServiceBriefing", "Pre-Service", "Raccoglie timing, note cliente e vincoli pertinenti alla sala.", "Evento, timing, bambini, speciali, note", "Evento · Giorno", "Le note critiche hanno testo e destinatario."],
  ["critical-issues", "CriticalIssues", "Pre-Service", "Ordina dati mancanti e problemi per conseguenza operativa.", "Severità, evento, causa, azione", "Attenzione · Critico", "Priorità espressa con testo, icona e colore."],
  ["future-planner", "FutureEventPlanner", "Pre-Service", "Collega eventi futuri alle preparazioni anticipabili.", "Giorni, eventi, carico, problemi", "Tre giorni · Settimana", "Alternativa lineare alla griglia temporale."],
  ["preparation-plan", "PreparationPlan", "Produzione", "Raggruppa proposte e task approvati per giorno.", "Data, preparazioni, stato, owner", "Chef · Brigata", "Le azioni batch hanno equivalenti da tastiera."],
  ["preparation-proposal", "PreparationProposal", "Produzione", "Presenta la quantità richiesta come proposta motivata.", "Richiesto, regola, evento, conseguenza", "Da valutare · Approvata · Modificata", "Lo scostamento è sempre espresso nel testo."],
  ["chef-approval", "ChefApprovalPanel", "Produzione", "Lascia allo chef la decisione su quantità, margine, data e assegnazione.", "Proposta, quantità, margine, data, owner, approva", "Accetta · Modifica", "Campi numerici hanno unità e limiti espliciti."],
  ["quantity-status", "QuantityStatus", "Produzione", "Distingue sei stati quantitativi senza simulare un magazzino contabile.", "Richiesto, approvato, prodotto, assegnato, teorico, verificato", "Compatta · Estesa", "Teorico e verificato hanno etichette persistenti."],
  ["physical-verification", "PhysicalVerification", "Produzione", "Registra un conteggio fisico separato dal teorico.", "Teorico, conteggio, autore, momento, scarto", "Da verificare · Verificato", "Non precompila il valore verificato con quello teorico."],
  ["crew-task", "CrewTaskCard", "Produzione", "Riduce il lavoro della brigata al prossimo compito approvato.", "Task, quantità, evento, priorità, scadenza", "Assegnato · In corso · Fatto", "Target grandi e nessun dato gestionale superfluo."],
  ["production-completion", "ProductionCompletionSheet", "Produzione", "Registra quantità prodotta, posizione e nota opzionale.", "Quantità, unità, posizione, nota, conferma", "Sheet · Dialog", "Input mode numerico e conferma esplicita."],
  ["minimal-service", "MinimalServiceReference", "Service", "Consulta allergeni, evento, prossima portata e note critiche senza input continuo.", "Evento, adesso, dopo, allergeni, nota", "Phone · Schermo sempre acceso", "Testo grande, contrasto alto e nessuna azione obbligatoria."],
  ["button", "Button e IconButton", "Primitive", "Avviano azioni con peso coerente.", "Label o icona, superficie, focus", "Primary · Secondary · Danger", "IconButton ha sempre un nome accessibile."],
  ["fields", "TextField e NumberField", "Primitive", "Raccolgono testo e quantità senza ambiguità.", "Label, input, unità, aiuto, errore", "Default · Error · Disabled", "Input mode ed errori sono associati."],
  ["status", "StatusControl", "Primitive", "Comunica o modifica uno stato operativo.", "Controllo, label, dettaglio", "Booleano · Progressivo", "Area attiva minima 48 px."],
  ["feedback", "Badge e InlineAlert", "Primitive", "Mostrano metadati e problemi persistenti.", "Icona, titolo, messaggio, azione", "Info · Warning · Critical", "Alert riservato ai problemi urgenti."],
  ["overlays", "Sheet, Dialog e Popover", "Primitive", "Mostrano attività contestuali senza perdere orientamento.", "Trigger, titolo, contenuto, azioni", "Sheet · Modal · Non modale", "Focus confinato e restituito al trigger."],
  ["adaptive-list", "Table e List adattiva", "Primitive", "Mantengono gli stessi dati in densità diverse.", "Header, righe, celle, azioni", "Table desktop · List phone", "Header associati e alternativa lineare equivalente."],
].map(([id, name, group, purpose, anatomy, variants, accessibility]) => ({ id, name, group: group as CatalogGroup, purpose, anatomy, variants, accessibility }));

export const groups: CatalogGroup[] = ["Struttura", "Accessi", "Intake", "Regole", "Pre-Service", "Produzione", "Assistente", "Service", "Primitive"];
