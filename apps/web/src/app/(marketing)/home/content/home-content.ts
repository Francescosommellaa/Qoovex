export const workspaceUrl = "https://app.qoovex.com";

export const homeHero = {
  title: "Il prossimo passo.",
  highlight: "Sempre chiaro.",
  description:
    "Qoovex tiene insieme ricette, preparazioni, menu, allergeni e lavoro della brigata. Così non devi ricordare tutto: apri, assegni, esegui.",
  primaryAction: { label: "Metti ordine in cucina", href: `${workspaceUrl}/sign-up` },
  secondaryAction: { label: "Guarda come funziona", href: "/product" },
} as const;

export const socialProof = [
  { value: "50+", label: "ricette organizzate nella prima settimana" },
  { value: "100%", label: "allergeni calcolati in automatico" },
  { value: "0", label: "fogli sparsi, chat e appunti persi" },
  { value: "1", label: "posto solo per tutto il lavoro" },
] as const;

export const kitchenProblems = [
  {
    label: "Ricette",
    today: "Versioni in fogli, chat e memoria.",
    qoovex: "Una scheda chiara che diventa menu, task e riferimento per il team.",
  },
  {
    label: "Servizio",
    today: "Cambi, urgenze e tempi passivi si incastrano a mano.",
    qoovex: "Il piano mostra priorità, assegnazioni e prossimo passo.",
  },
  {
    label: "Stock",
    today: "Basi e semilavorati si scoprono quando mancano.",
    qoovex: "Produzione e consumo restano visibili dentro il lavoro.",
  },
] as const;

export const workflowSteps = [
  {
    label: "Ricettario",
    title: "Scrivi bene una volta.",
    description:
      "Ingredienti, passaggi, rese, note e allergeni restano ordinati in un formato che anche la brigata legge al volo.",
    tone: "primary",
  },
  {
    label: "Condivisione",
    title: "La usi ovunque serve.",
    description:
      "La usi nei menu, la assegni nei piani, la condividi con il team e mantieni uno snapshot quando serve proteggere il contenuto.",
    tone: "success",
  },
  {
    label: "Piano",
    title: "La brigata vede il prossimo passo.",
    description:
      "Produzione, evento o servizio: assegni task, tempi, dipendenze e quantità. Chi lavora vede cosa fare, non tutto il caos.",
    tone: "warning",
  },
  {
    label: "AI",
    title: "L'AI toglie lavoro ripetitivo.",
    description:
      "Legge menu e testo libero, suggerisce task, collega ricette e aiuta a non dimenticare stock, tempi passivi e preparazioni.",
    tone: "neutral",
  },
] as const;

export const workPlanHighlights = [
  {
    label: "Produzione e stock",
    description: "Tieni sotto controllo basi, salse, impasti e semilavorati con soglie minime e quantità prodotte.",
  },
  {
    label: "Eventi e servizi",
    description: "Prepara un matrimonio, una cena o il servizio serale con task assegnati e orari chiari.",
  },
  {
    label: "Ricette dentro il lavoro",
    description: "Ogni task può portare con sé la ricetta giusta, anche come snapshot leggibile dal team.",
  },
  {
    label: "AI contestuale",
    description: "Ti aiuta a costruire il piano, importare piatti da menu e trovare cosa manca prima del servizio.",
  },
] as const;

export const operatingPrinciples = [
  "Scrivi una volta la ricetta e la riusi dove serve.",
  "Trasformi il menu in lavoro da fare, non in una lista da interpretare.",
  "Il team vede il prossimo passo senza chiedere continuamente allo chef.",
] as const;

export const finalCta = {
  title: "Meno cose da ricordare.",
  highlight: "Più servizio da guidare.",
  description:
    "Qoovex mette ordine prima che inizi la pressione: ricette pronte, task chiari, stock visibile e meno decisioni ripetute.",
  primaryAction: { label: "Inizia a mettere ordine", href: `${workspaceUrl}/sign-up` },
  secondaryAction: { label: "Parla con noi", href: "/contact" },
} as const;
