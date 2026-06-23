import { IBM_Plex_Mono } from "next/font/google";
import type { ReactNode } from "react";

import "@qoovex/ui/styles.css";

const data = IBM_Plex_Mono({ subsets: ["latin"], variable: "--font-data", weight: ["400", "500", "600"] });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="it" className={data.variable}>
      <body>{children}</body>
    </html>
  );
}
