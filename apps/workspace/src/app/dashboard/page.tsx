import { auth } from "@clerk/nextjs/server";
import { db } from "@qoovex/db";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    select: {
      id: true,
      name: true,
      email: true,
      plan: true,
      createdAt: true,
    },
  });

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <main style={{ padding: "2rem" }}>
      <h1
        style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}
      >
        ✅ Login funzionante
      </h1>
      <pre
        style={{
          background: "#f4f4f4",
          padding: "1rem",
          borderRadius: "8px",
          fontSize: "0.875rem",
        }}
      >
        {JSON.stringify(user, null, 2)}
      </pre>
    </main>
  );
}
