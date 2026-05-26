import { AuthShell } from "../ui";
import { ForgotPasswordClient } from "./forgot-password-client";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Recupera l'accesso"
      subtitle="Inserisci l'email del tuo account."
    >
      <ForgotPasswordClient />
    </AuthShell>
  );
}
