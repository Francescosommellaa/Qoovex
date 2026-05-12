import { Stack, Text } from "@qoovex/ui";
import { socialProof } from "../content/index";

export function HomeSocialProofSection() {
  return (
    <section className="py-(--spacing-10) md:py-(--spacing-12)">
      <div className="border-y border-(--color-divider) py-(--spacing-8)">
        <div className="grid grid-cols-2 gap-(--spacing-6) md:grid-cols-4 md:gap-(--spacing-8)">
          {socialProof.map((item) => (
            <Stack key={item.label} gap="1" align="start">
              <Text
                as="span"
                family="display"
                size="2xl"
                weight="semibold"
                leading="tight"
                className="text-(--color-text)"
              >
                {item.value}
              </Text>
              <Text size="xs" tone="faint" leading="snug" className="max-w-[12rem]">
                {item.label}
              </Text>
            </Stack>
          ))}
        </div>
      </div>
    </section>
  );
}
