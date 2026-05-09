import { CtaBand } from "@qoovex/ui";

export function SharedCtaSection() {
  return (
    <CtaBand
      title="Pronto a portare ordine in cucina?"
      description="Crea il tuo workspace Qoovex e inizia a organizzare ricette, menu e piani di lavoro."
      actions={[
        { label: "Registrati gratis", href: "https://app.qoovex.com/sign-up" },
        { label: "Vedi i piani", href: "/pricing", variant: "secondary" },
      ]}
    />
  );
}
