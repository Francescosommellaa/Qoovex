import { CtaBand } from "@qoovex/ui";
import { workspaceSignUpHref } from "@/shared/workspace-url";

export function SharedCtaSection() {
  return (
    <CtaBand
      title="Pronto a portare ordine in cucina?"
      description="Crea il tuo workspace Qoovex e inizia a organizzare ricette, menu e piani di lavoro."
      actions={[
        { label: "Registrati gratis", href: workspaceSignUpHref },
        { label: "Vedi i piani", href: "/pricing", variant: "secondary" },
      ]}
    />
  );
}
