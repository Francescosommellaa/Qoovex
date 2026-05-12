import { Icon, Stack, Text } from "@qoovex/ui";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { HomeSectionShell, WorkPlanBoard } from "../_components/index";
import { operatingPrinciples } from "../content/index";

export function ProductValueSection() {
  return (
    <HomeSectionShell
      title="La regia del servizio, non un altro task manager."
      description="Produzione, evento e servizio hanno tempi diversi. Qoovex li mette nello stesso flusso, con ricette, stock e persone gi\u00e0 collegati."
      accent="primary"
    >
      <div className="grid grid-cols-1 gap-(--spacing-10) lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-(--spacing-16)">
        <Stack gap="10" className="max-w-(--measure-copy)">

          {/* Subheading: non compete col titolo sezione — xl, non 2xl */}
          <Stack gap="3">
            <Text
              as="h3"
              family="display"
              size="lg"
              weight="semibold"
              leading="tight"
              className="md:text-(length:--text-xl)"
            >
              Lo chef decide. Qoovex tiene il filo.
            </Text>
            <Text size="base" tone="muted" leading="relaxed">
              L&apos;AI serve solo a togliere passaggi ripetitivi: legge, suggerisce, collega e avvisa.
              Non sostituisce lo chef, gli libera attenzione.
            </Text>
          </Stack>

          <Stack gap="3">
            {operatingPrinciples.map((item) => (
              <Stack key={item} direction="row" gap="3" align="start">
                <Icon
                  icon={CheckCircle}
                  tone="success"
                  size="sm"
                  weight="bold"
                  className="mt-[0.2rem] shrink-0"
                />
                <Text size="sm" tone="muted" leading="relaxed">
                  {item}
                </Text>
              </Stack>
            ))}
          </Stack>
        </Stack>

        <WorkPlanBoard />
      </div>
    </HomeSectionShell>
  );
}
