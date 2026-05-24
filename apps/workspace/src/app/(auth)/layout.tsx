import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { ToastProvider } from "@qoovex/ui";
import { AuthSessionProvider } from "@shared/providers/session-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Qoovex Workspace",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function AuthRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthSessionProvider>
      <ToastProvider position="top-right">
        <Suspense fallback={null}>{children}</Suspense>
      </ToastProvider>
    </AuthSessionProvider>
  );
}
