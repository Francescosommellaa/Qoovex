import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { bootstrapUser } from "@shared/actions/bootstrap-user";
import "@/app/globals.css";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (userId) await bootstrapUser();

  return (
    <ClerkProvider>
      <html lang="it">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
