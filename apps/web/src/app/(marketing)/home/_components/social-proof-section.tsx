import { Stack, Text } from "@qoovex/ui";
import { socialProof } from "../content/index";

export function HomeSocialProofSection() {
  return (
    <section className="py-(--spacing-4) md:py-(--spacing-6)">
      <div className="border-y border-(--color-divider) py-(--spacing-10)">
        <div className="grid grid-cols-2 gap-x-(--spacing-6) gap-y-(--spacing-8) md:grid-cols-4 md:gap-(--spacing-10)">
          {socialProof.map((item) => (
            <Stack key={item.label} gap="2" align="start">
              <Text
                as="span"
                family="display"
                size="2xl"
                weight="semibold"
                leading="none"
              >
                {item.value}
              </Text>
              <Text size="xs" tone="faint" leading="snug" className="max-w-[14rem]">
                {item.label}
              </Text>
            </Stack>
          ))}
        </div>
      </div>
    </section>
  );
}
