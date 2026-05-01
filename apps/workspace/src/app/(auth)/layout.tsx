import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { ToastProvider } from "@qoovex/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "Qoovex Workspace",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <ToastProvider position="top-right">
        <Suspense fallback={null}>{children}</Suspense>
      </ToastProvider>
    </ClerkProvider>
  );
}
