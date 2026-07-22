"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { IconAlertTriangle, IconCheck, IconUpload } from "@tabler/icons-react";
import { Alert, AlertDescription, AlertTitle } from "@qoovex/ui/components/alert";
import { Button, buttonVariants } from "@qoovex/ui/components/button";
import { Field, FieldDescription, FieldLabel } from "@qoovex/ui/components/field";
import { Input } from "@qoovex/ui/components/input";
import { Spinner } from "@qoovex/ui/components/spinner";
import { submitFormData } from "../admin-api-client";

export function DocumentVersionUploadForm({ documentId, disabled, onUploaded, returnToDashboard = false }: { documentId: string; disabled?: boolean; onUploaded?: () => void | Promise<void>; returnToDashboard?: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setSuccess(false);
    const formData = new FormData(event.currentTarget);
    try {
      await submitFormData(`/api/documents/${documentId}/versions`, formData);
      event.currentTarget.reset();
      setSuccess(true);
      router.refresh();
      await onUploaded?.();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Upload non riuscito.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="grid gap-3" onSubmit={onSubmit}>
      {error ? <Alert variant="destructive"><IconAlertTriangle /><AlertTitle>Caricamento non riuscito</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : null}
      {success ? <Alert role="status" variant="success"><IconCheck /><AlertTitle>File caricato</AlertTitle><AlertDescription>Il documento resta da verificare.</AlertDescription></Alert> : null}
      <Field>
        <FieldLabel htmlFor={`document-file-${documentId}`}>File documento</FieldLabel>
        <Input accept="application/pdf,image/jpeg,image/png,image/webp" disabled={disabled || pending} id={`document-file-${documentId}`} name="file" required type="file" />
        <FieldDescription>PDF, JPEG, PNG o WebP · massimo 4 MB.</FieldDescription>
      </Field>
      <Button className="w-full sm:w-fit" disabled={disabled || pending} type="submit">
        {pending ? <><Spinner />Caricamento…</> : <><IconUpload />Carica file</>}
      </Button>
      {success && returnToDashboard ? <Link className={buttonVariants({ variant: "outline" })} data-link="plain" href={`/dashboard?updated=${encodeURIComponent(documentId)}`}>Torna alla dashboard</Link> : null}
    </form>
  );
}
