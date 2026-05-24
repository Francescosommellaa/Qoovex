import { AuthShell } from "../ui";
import { ForgotPasswordClient } from "./forgot-password-client";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Recupera l'accesso"
      subtitle="Riceverai un codice temporaneo per impostare una nuova password."
    >
      <ForgotPasswordClient />
    </AuthShell>
  );
}
