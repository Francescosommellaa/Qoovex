import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contatti",
};

export default function ContactPage() {
  return (
    <main>
      <h1>Contatti</h1>
      <address>
        <a href="mailto:ciao@qoovex.com">ciao@qoovex.com</a>
      </address>
    </main>
  );
}
