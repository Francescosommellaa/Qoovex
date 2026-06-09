import { CtaBand } from "@qoovex/ui";
import { finalCta } from "../content/index";

export function HomeFinalCtaSection() {
  return (
    <CtaBand
      title={`${finalCta.title} ${finalCta.highlight}`}
      description={finalCta.description}
      actions={[
        finalCta.primaryAction,
        { ...finalCta.secondaryAction, variant: "secondary" as const },
      ]}
    />
  );
}
