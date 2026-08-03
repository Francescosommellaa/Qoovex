"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { IconAlertCircle, IconArrowRight } from "@tabler/icons-react";
import { Alert, AlertDescription } from "@qoovex/ui/components/alert";
import { Button } from "@qoovex/ui/components/button";
import { Field, FieldDescription, FieldLabel } from "@qoovex/ui/components/field";
import { Input } from "@qoovex/ui/components/input";
import { Spinner } from "@qoovex/ui/components/spinner";
import styles from "./AuthPages.module.css";

export function OrganizationSetupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const response = await fetch("/api/organizations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    setLoading(false);
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setError(typeof body.message === "string" ? body.message : "Creazione azienda non riuscita.");
      return;
    }

    router.push("/contexts");
    router.refresh();
  }

  return (
    <form aria-busy={loading} className={styles.form} onSubmit={onSubmit}>
      <Field>
        <FieldLabel htmlFor="organization-name">Nome azienda</FieldLabel>
        <Input autoComplete="organization" className="h-11 px-3" id="organization-name" name="name" required type="text" />
        <FieldDescription>Usa la denominazione con cui il team riconosce l’Azienda nel lavoro quotidiano.</FieldDescription>
      </Field>
      {error ? <Alert variant="destructive"><IconAlertCircle /><AlertDescription>{error}</AlertDescription></Alert> : null}
      <Button className="h-11 w-full active:scale-[0.985]" disabled={loading} type="submit">
        {loading ? <><Spinner /> Creazione in corso</> : <>Crea la tua azienda <IconArrowRight data-icon="inline-end" /></>}
      </Button>
    </form>
  );
}
