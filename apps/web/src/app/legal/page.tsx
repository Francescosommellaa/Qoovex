import type { Metadata } from "next";
import Link from "next/link";
import { legalContent, legalDocuments } from "./content/legal-content";

export const metadata: Metadata = {
  title: "Documenti legali",
  description: legalContent.description,
};

export default function LegalPage() {
  return (
    <main>
      <h1>{legalContent.title}</h1>
      <p>{legalContent.description}</p>
      <ul>
        {Object.values(legalDocuments).map((document) => (
          <li key={document.slug}>
            <h2>
              <Link href={`/legal/${document.slug}`}>{document.title}</Link>
            </h2>
            <p>{document.description}</p>
            <p>Aggiornata il {document.lastUpdated}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
