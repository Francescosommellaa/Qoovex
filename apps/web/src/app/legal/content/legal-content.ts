export type LegalSection = {
  title: string;
  paragraphs?: readonly string[];
  items?: readonly string[];
};

export type LegalDocument = {
  slug: "privacy" | "cookie-policy" | "terms";
  title: string;
  description: string;
  lastUpdated: string;
  sections: readonly LegalSection[];
};

export const legalDocuments = {
  privacy: {
    slug: "privacy",
    title: "Privacy policy",
    description:
      "Come Qoovex raccoglie, usa, conserva e protegge i dati personali.",
    lastUpdated: "10 giugno 2026",
    sections: [
      {
        title: "1. Titolare e contatti",
        paragraphs: [
          "Qoovex gestisce il sito pubblico e il workspace applicativo. Per richieste privacy o per esercitare i tuoi diritti puoi scrivere a ciao@qoovex.com.",
        ],
      },
      {
        title: "2. Dati trattati",
        items: [
          "Dati di account e profilo, come nome, email, username e immagine.",
          "Dati di autenticazione e sicurezza, inclusi eventi di accesso, dispositivi e verifiche.",
          "Contenuti inseriti nel workspace, come ricette, menu, liste e piani di lavoro.",
          "Dati tecnici necessari al funzionamento, come log applicativi, indirizzo IP e informazioni sul browser.",
          "Comunicazioni inviate volontariamente via email.",
        ],
      },
      {
        title: "3. Finalita e basi giuridiche",
        items: [
          "Fornire il servizio e gestire l'account, sulla base del contratto o delle misure precontrattuali richieste.",
          "Proteggere account e infrastruttura, prevenire abusi e risolvere problemi tecnici, sulla base del legittimo interesse.",
          "Adempiere a obblighi legali, fiscali e di sicurezza applicabili.",
          "Inviare comunicazioni promozionali o attivare strumenti opzionali solo con consenso, quando richiesto.",
        ],
      },
      {
        title: "4. Fornitori e destinatari",
        paragraphs: [
          "Qoovex puo usare fornitori infrastrutturali strettamente necessari, tra cui hosting, database, storage, invio email e autenticazione. L'accesso e limitato alle finalita del servizio e regolato da accordi sul trattamento dei dati.",
          "Le integrazioni opzionali, incluse analisi o marketing, non devono essere caricate prima del consenso quando la normativa lo richiede.",
        ],
      },
      {
        title: "5. Trasferimenti internazionali",
        paragraphs: [
          "Quando un fornitore tratta dati fuori dallo Spazio Economico Europeo, Qoovex adotta gli strumenti previsti dal GDPR, come decisioni di adeguatezza o clausole contrattuali standard, insieme a misure supplementari quando necessarie.",
        ],
      },
      {
        title: "6. Conservazione",
        items: [
          "I dati dell'account sono conservati per la durata del rapporto e per il periodo necessario a gestire obblighi o contestazioni.",
          "I codici temporanei e i dati di sicurezza seguono tempi ridotti coerenti con la loro funzione.",
          "I contenuti eliminati possono restare nei backup per un periodo tecnico limitato prima della cancellazione definitiva.",
        ],
      },
      {
        title: "7. Diritti",
        paragraphs: [
          "Puoi chiedere accesso, rettifica, cancellazione, limitazione, portabilita e opposizione, oltre a revocare il consenso senza pregiudicare i trattamenti gia effettuati. Puoi inoltre proporre reclamo al Garante per la protezione dei dati personali.",
        ],
      },
      {
        title: "8. Sicurezza e aggiornamenti",
        paragraphs: [
          "Qoovex applica misure tecniche e organizzative proporzionate al rischio. Questa informativa puo essere aggiornata quando cambiano il servizio, i fornitori o gli obblighi applicabili; la data in alto indica la versione corrente.",
        ],
      },
    ],
  },
  "cookie-policy": {
    slug: "cookie-policy",
    title: "Cookie policy",
    description:
      "Tecnologie di memorizzazione, categorie di consenso e modalita di scelta.",
    lastUpdated: "10 giugno 2026",
    sections: [
      {
        title: "1. Cosa usiamo",
        paragraphs: [
          "Al momento della presente versione il sito pubblico non usa cookie o memorizzazioni locali opzionali per analisi, preferenze o marketing.",
          "Restano possibili esclusivamente le tecnologie tecniche strettamente necessarie al funzionamento dell'infrastruttura e alla sicurezza.",
        ],
      },
      {
        title: "2. Categorie",
        items: [
          "Necessari: tecnologie richieste per funzionamento, sicurezza e trasmissione delle richieste.",
          "Preferenze, analisi e marketing: non attivi nella versione corrente del sito pubblico.",
        ],
      },
      {
        title: "3. Introduzione di nuove tecnologie",
        paragraphs: [
          "Prima di introdurre tecnologie opzionali Qoovex aggiornera questa policy e, quando richiesto, chiedera un consenso esplicito prima del loro caricamento.",
        ],
      },
      {
        title: "4. Controlli del browser",
        paragraphs: [
          "Puoi controllare o cancellare cookie e dati locali tramite le impostazioni del browser. La disabilitazione di tecnologie strettamente necessarie puo impedire il corretto funzionamento del servizio.",
        ],
      },
      {
        title: "5. Durata e aggiornamenti",
        paragraphs: [
          "Questa policy verra aggiornata prima di introdurre nuovi strumenti, categorie opzionali o fornitori che usano tecnologie di memorizzazione.",
        ],
      },
    ],
  },
  terms: {
    slug: "terms",
    title: "Termini di servizio",
    description:
      "Condizioni applicabili all'accesso e all'uso di Qoovex.",
    lastUpdated: "10 giugno 2026",
    sections: [
      {
        title: "1. Servizio",
        paragraphs: [
          "Qoovex e un workspace operativo per professionisti della cucina. Permette di organizzare ricette, menu, informazioni alimentari e attivita di lavoro secondo le funzioni disponibili nel piano scelto.",
        ],
      },
      {
        title: "2. Account",
        items: [
          "Devi fornire informazioni accurate e mantenere riservate le credenziali.",
          "Sei responsabile delle attivita svolte dal tuo account e devi segnalare accessi non autorizzati.",
          "Non puoi usare il servizio per violare norme, diritti di terzi o sicurezza della piattaforma.",
        ],
      },
      {
        title: "3. Contenuti e responsabilita professionale",
        paragraphs: [
          "Mantieni la titolarita dei contenuti che inserisci e concedi a Qoovex i soli diritti tecnici necessari a ospitarli, elaborarli e mostrarli per fornire il servizio.",
          "Le informazioni su allergeni, nutrizione e operativita supportano il lavoro professionale ma devono essere verificate dall'utente prima dell'uso in contesti sanitari, normativi o rivolti al pubblico.",
        ],
      },
      {
        title: "4. Piani, limiti e pagamenti",
        paragraphs: [
          "Funzioni, limiti e prezzi applicabili sono quelli comunicati prima dell'acquisto. Eventuali servizi a pagamento indicheranno durata, rinnovo, imposte e modalita di recesso prima della conferma.",
        ],
      },
      {
        title: "5. Disponibilita e modifiche",
        paragraphs: [
          "Qoovex puo aggiornare il servizio per sicurezza, affidabilita o evoluzione del prodotto. Interventi programmati e problemi tecnici possono causare interruzioni temporanee.",
        ],
      },
      {
        title: "6. Sospensione e chiusura",
        paragraphs: [
          "L'accesso puo essere limitato in caso di abuso, rischio per la sicurezza, mancato pagamento o violazione sostanziale dei termini. L'utente puo chiedere la chiusura dell'account e l'esportazione disponibile prima della cancellazione.",
        ],
      },
      {
        title: "7. Proprieta intellettuale",
        paragraphs: [
          "Marchi, interfacce, codice e contenuti proprietari di Qoovex restano del rispettivo titolare. Nessuna clausola trasferisce diritti oltre alla licenza limitata necessaria a usare il servizio.",
        ],
      },
      {
        title: "8. Legge applicabile e contatti",
        paragraphs: [
          "I termini sono regolati dalla legge italiana, fatti salvi i diritti inderogabili applicabili. Per assistenza o comunicazioni relative ai termini puoi scrivere a ciao@qoovex.com.",
        ],
      },
    ],
  },
} satisfies Record<string, LegalDocument>;

export type LegalDocumentSlug = keyof typeof legalDocuments;

export const legalContent = {
  title: "Documenti legali",
  description:
    "Informazioni chiare su privacy, tecnologie di memorizzazione e condizioni d'uso.",
};
