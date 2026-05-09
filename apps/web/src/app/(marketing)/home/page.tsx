import type { Metadata } from "next";
import {
  Badge,
  CtaBand,
  FeatureShowcase,
  HeroSection,
  Icon,
  PageSection,
  ProductPreviewFrame,
  Stack,
  Text,
} from "@qoovex/ui";
import {
  ClipboardText,
  ForkKnife,
  LockSimple,
  QrCode,
  ShieldCheck,
} from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "Qoovex - Il workspace per chef professionisti",
  description:
    "Gestisci ricette, menu digitali, allergeni, valori nutrizionali e piani di lavoro collaborativi in un unico workspace.",
};

const workspaceUrl = "https://app.qoovex.com";

const trustPoints = [
  { label: "Allergeni e nutrizione aggiornati", icon: ShieldCheck },
  { label: "Menu digitali con QR sempre aggiornato", icon: QrCode },
  { label: "Piani di lavoro con snapshot ricetta", icon: LockSimple },
];

const features = [
  {
    label: "Ricette",
    tone: "primary" as const,
    title: "Ogni ricetta. Sempre in ordine.",
    body: "Crea e organizza ricette con ingredienti, procedimento e valori nutrizionali calcolati in automatico. Gli allergeni si aggiornano ad ogni modifica.",
    icon: <Icon icon={ForkKnife} size="sm" weight="bold" />,
  },
  {
    label: "Menu digitali",
    tone: "success" as const,
    title: "Dal piatto al tavolo, in minuti.",
    body: "Componi menu digitali partendo dalle tue ricette. Ogni variazione si riflette automaticamente e il QR resta sempre aggiornato.",
    icon: <Icon icon={QrCode} size="sm" weight="bold" />,
  },
  {
    label: "Piano di lavoro",
    tone: "warning" as const,
    title: "Il team sempre allineato.",
    body: "Piani di lavoro collaborativi con task assegnabili e collegati alle ricette, anche quando sono private o protette da snapshot.",
    icon: <Icon icon={ClipboardText} size="sm" weight="bold" />,
  },
  {
    label: "Esplora",
    tone: "neutral" as const,
    title: "Ispirati dalla community.",
    body: "Sfoglia ricette e menu pubblici di altri professionisti e importa quello che ti ispira nel tuo workspace.",
    icon: <Icon icon={ShieldCheck} size="sm" weight="bold" />,
  },
];

export default function Page() {
  return (
    <>
      <HeroSection
        title={
          <>
            La cucina professionale <Text as="span" tone="primary">merita un tool serio.</Text>
          </>
        }
        description="Ricette, menu digitali, allergeni automatici, valori nutrizionali e piani di lavoro collaborativi: tutto in un unico workspace pensato per chi lavora davvero in cucina."
        actions={[
          { label: "Inizia gratis", href: `${workspaceUrl}/sign-up` },
          { label: "Vedi i piani", href: "/pricing", variant: "secondary" },
        ]}
        proof={
          <Stack gap="2">
            {trustPoints.map((point) => (
              <Stack key={point.label} direction="row" gap="2" align="start">
                <Icon icon={point.icon} tone="primary" size="sm" weight="bold" />
                <Text size="sm" tone="muted" leading="snug">
                  {point.label}
                </Text>
              </Stack>
            ))}
          </Stack>
        }
        visual={<ProductPreviewFrame activeScreen="recipes" />}
      />

      <PageSection
        title="Tutto ciò che serve al pass, in un'unica interfaccia."
        description="Qoovex riduce errori, copie e versioni sparse tra fogli e chat. Ogni funzione nasce dal flusso operativo reale di una cucina professionale."
      >
        <FeatureShowcase items={features} />
      </PageSection>

      <PageSection
        title="Dal laboratorio alla sala senza cambiare strumento."
        description="Il workspace tiene insieme archivio ricette, composizione menu, verifica allergeni e lavoro del team. Ogni dato resta leggibile, aggiornato e pronto per essere condiviso."
      >
        <Stack gap="4" className="grid grid-cols-1 md:grid-cols-3">
          {[
            "Archivia ricette complete con ingredienti, procedimento e dati nutrizionali.",
            "Pubblica menu digitali collegati alle ricette e condivisi via QR.",
            "Coordina task e preparazioni con snapshot ricetta sempre tracciabili.",
          ].map((copy, index) => (
            <Stack key={copy} gap="3" className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-(--spacing-5)">
              <Badge variant="soft" tone="primary" size="sm">
                0{index + 1}
              </Badge>
              <Text size="sm" tone="muted" leading="relaxed">
                {copy}
              </Text>
            </Stack>
          ))}
        </Stack>
      </PageSection>

      <CtaBand
        title="Passa dal caos allo stack digitale della cucina."
        description="Piano gratuito per iniziare: ricette, menu con QR, allergeni e valori nutrizionali, più piani di lavoro quando ti serve coordinare il team."
        actions={[
          { label: "Apri il workspace", href: `${workspaceUrl}/sign-up` },
          { label: "Confronta i piani", href: "/pricing", variant: "secondary" },
        ]}
      />
    </>
  );
}
