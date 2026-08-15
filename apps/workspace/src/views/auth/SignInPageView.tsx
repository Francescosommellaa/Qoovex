"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { IconAlertCircle, IconArrowRight, IconCircleCheck, IconCode } from "@tabler/icons-react";
import { Alert, AlertDescription } from "@qoovex/ui/components/alert";
import { Button } from "@qoovex/ui/components/button";
import { Field, FieldGroup, FieldLabel, FieldSeparator } from "@qoovex/ui/components/field";
import { Input } from "@qoovex/ui/components/input";
import { PasswordInput } from "@qoovex/ui/components/password-input";
import { Spinner } from "@qoovex/ui/components/spinner";
import { getGenericAuthFailureMessage } from "@shared/lib/auth-error";
import { AuthPageShell, AuthStage } from "./AuthPageShell";
import styles from "./AuthPages.module.css";

export function SignInPageView({
  callbackUrl,
  clientInvitation,
  showDevAuth,
  statusMessage,
}: {
  callbackUrl: string;
  clientInvitation: boolean;
  showDevAuth: boolean;
  statusMessage: string | null;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [devLoading, setDevLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const identifier = String(formData.get("identifier") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    const result = await signIn("credentials", {
      identifier,
      password,
      redirect: false,
      callbackUrl,
    });

    setLoading(false);
    if (result?.error) {
      setError(getGenericAuthFailureMessage());
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  async function signInAsDev() {
    setDevLoading(true);
    setError(null);
    const response = await fetch("/api/dev-auth", { method: "POST" });
    const body = await response.json().catch(() => null) as { error?: string } | null;
    if (!response.ok) {
      setDevLoading(false);
      setError(body?.error ?? "Accesso dev non disponibile.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <AuthPageShell
      description={clientInvitation
        ? <p>Accedi con l'email che ha ricevuto l'invito. Se non hai ancora un account, crealo con lo stesso indirizzo.</p>
        : <p>Rientra nel workspace per gestire i cantieri e collaborare nel contesto autorizzato.</p>}
      footer={(
        <div className="grid gap-2">
          <p>Non hai un account? <Link data-link="inline" href={`/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}`}>Crea account</Link></p>
          <p>Verifica email non completata? <Link data-link="quiet" href={`/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}`}>Riprendi la registrazione</Link></p>
        </div>
      )}
      title={clientInvitation ? "Accedi per continuare con l'invito" : "Bentornato"}
      titleId="sign-in-title"
    >
      <AuthStage>
        {statusMessage ? (
          <Alert role="status" variant="success"><IconCircleCheck /><AlertDescription>{statusMessage}</AlertDescription></Alert>
        ) : null}

        <form aria-busy={loading} className={styles.form} onSubmit={onSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="identifier">Email o username</FieldLabel>
              <Input autoComplete="username" className="h-11 px-3" id="identifier" name="identifier" required type="text" />
            </Field>
            <Field>
              <div className="flex items-center justify-between gap-3">
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Link className="text-xs text-muted-foreground hover:text-foreground" data-link="quiet" href={`/reset-password?callbackUrl=${encodeURIComponent(callbackUrl)}`}>Password dimenticata?</Link>
              </div>
              <PasswordInput
                autoComplete="current-password"
                id="password"
                inputClassName="h-11 px-3"
                name="password"
                required
                revealLabel="Mostra password"
                concealLabel="Nascondi password"
              />
            </Field>
          </FieldGroup>

          {error ? <Alert variant="destructive"><IconAlertCircle /><AlertDescription>{error}</AlertDescription></Alert> : null}

          <Button className="h-11 w-full active:scale-[0.985]" disabled={loading || devLoading} type="submit">
            {loading ? <><Spinner /> Accesso in corso</> : <>Accedi <IconArrowRight data-icon="inline-end" /></>}
          </Button>
        </form>

        {showDevAuth ? (
          <div className="mt-5 grid gap-4">
            <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">Ambiente locale</FieldSeparator>
            <Button className="h-10 w-full" disabled={devLoading || loading} onClick={signInAsDev} type="button" variant="outline">
              {devLoading ? <><Spinner /> Accesso dev in corso</> : <><IconCode /> Accedi come dev</>}
            </Button>
          </div>
        ) : null}
      </AuthStage>
    </AuthPageShell>
  );
}
