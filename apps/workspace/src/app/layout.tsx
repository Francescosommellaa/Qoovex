import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { bootstrapUser } from "@shared/actions/bootstrap-user";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Qoovex Workspace",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

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
