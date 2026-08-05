import type { FaqItem } from "@/components/faq-accordion";

/**
 * Contenuti FAQ. Le risposte descrivono solo organizzazione, documentazione,
 * visibilità e comunicazione: nessuna promessa legale, economica o di conformità.
 */

export type FaqGroup = { title: string; items: FaqItem[] };

export const faqGroups: FaqGroup[] = [
  {
    title: "Per le imprese",
    items: [
      {
        question: "A chi serve Qoovex?",
        answer:
          "Alle piccole imprese edili, agli artigiani e alle squadre che seguono più cantieri e vogliono tenere insieme aggiornamenti, modifiche e prove senza rincorrere messaggi e fotografie.",
      },
      {
        question: "È un gestionale edile completo?",
        answer:
          "No. Qoovex non è un ERP, un gestionale contabile o un sistema paghe. Aiuta a organizzare e documentare il processo condiviso di un lavoro, non a sostituire gli strumenti amministrativi.",
      },
      {
        question: "Devo diventare esperto di software per usarlo?",
        answer:
          "No. Qoovex è pensato per chi lavora anche fuori ufficio e ha poco tempo. L'obiettivo è ridurre il disordine, non aggiungere un altro strumento complicato.",
      },
    ],
  },
  {
    title: "Per i clienti",
    items: [
      {
        question: "Il cliente deve pagare per usare Qoovex?",
        answer:
          "Questa pagina non riporta prezzi o piani: le condizioni commerciali non fanno parte di questo contenuto. Qoovex è lo spazio in cui seguire il lavoro e ritrovare ciò che è stato condiviso.",
      },
      {
        question: "Il cliente vede tutto ciò che carica l'impresa?",
        answer:
          "No. Il cliente vede soltanto ciò che l'impresa condivide in modo esplicito. I contenuti interni all'impresa restano interni.",
      },
      {
        question: "Qoovex è uno strumento di controllo sull'impresa?",
        answer:
          "No. È uno spazio di chiarezza reciproca: aiuta cliente e impresa a capire cosa è stato fatto, cosa è cambiato e cosa richiede una risposta.",
      },
    ],
  },
  {
    title: "Modifiche e pagamenti",
    items: [
      {
        question: "Qoovex incassa o trattiene i pagamenti?",
        answer:
          "No. Qoovex non movimenta denaro, non è un servizio di escrow e non è un intermediario di pagamento. Documenta le informazioni sui pagamenti inserite dalle parti.",
      },
      {
        question: "Una ricevuta prova automaticamente che il pagamento è arrivato?",
        answer:
          "No. Una ricevuta caricata è un contenuto inserito dalle parti. La ricezione resta da confermare e Qoovex non certifica l'avvenuto pagamento.",
      },
    ],
  },
  {
    title: "File e informazioni",
    items: [
      {
        question: "Come vengono condivisi i file?",
        answer:
          "I file sono accessibili all'interno del contesto autorizzato e la condivisione con il cliente è esplicita. Non vengono esposti tramite URL pubblici permanenti.",
      },
      {
        question: "Cosa succede alle informazioni interne dell'impresa?",
        answer:
          "Restano interne all'azienda e visibili solo a chi è autorizzato. Diventano visibili al cliente soltanto quando l'impresa le condivide.",
      },
      {
        question: "Posso usare Qoovex da telefono?",
        answer:
          "Sì. L'interfaccia è pensata anche per chi lavora in cantiere e accede da dispositivo mobile.",
      },
    ],
  },
  {
    title: "Cosa Qoovex non fa",
    items: [
      {
        question: "Qoovex certifica documenti o lavori?",
        answer:
          "No. Qoovex non certifica documenti, non collauda e non garantisce la conformità o la qualità del lavoro.",
      },
      {
        question: "Posso usare Qoovex al posto di un tecnico o consulente?",
        answer:
          "No. Qoovex non sostituisce tecnici, consulenti o responsabili. Aiuta a organizzare e documentare, non a fornire pareri professionali.",
      },
      {
        question: "Qoovex sostituisce WhatsApp?",
        answer:
          "Qoovex non nasce per sostituire la messaggistica, ma per evitare che aggiornamenti, modifiche e prove importanti si perdano nelle chat: restano collegati al lavoro e alla loro cronologia.",
      },
    ],
  },
];

/** Sottoinsieme essenziale mostrato in home. */
export const homeFaq: FaqItem[] = [
  faqGroups[0].items[1], // È un gestionale edile completo?
  faqGroups[2].items[0], // Qoovex incassa o trattiene i pagamenti?
  faqGroups[1].items[1], // Il cliente vede tutto ciò che carica l'impresa?
  faqGroups[4].items[0], // Qoovex certifica documenti o lavori?
];
