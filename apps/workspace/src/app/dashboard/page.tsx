import { bootstrapUser } from "@shared/actions/bootstrap-user";
import { SignOutButton } from "@clerk/nextjs";
import { Button } from "@qoovex/ui";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await bootstrapUser();
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <main className="space-y-4 p-8">
      <h1 className="text-(length:--text-lg) font-bold text-(--color-text)">
        ✅ Login funzionante
      </h1>
      <pre className="overflow-x-auto rounded-lg border border-(--color-border) bg-(--color-surface) p-4 text-(length:--text-sm) text-(--color-text-muted)">
        {JSON.stringify(user, null, 2)}
      </pre>
      <SignOutButton redirectUrl="/sign-in">
        <Button type="button" variant="secondary" size="md" className="mt-4">
          Esci
        </Button>
      </SignOutButton>
    </main>
  );
}
