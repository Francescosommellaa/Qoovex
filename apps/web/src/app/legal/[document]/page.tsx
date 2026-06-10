import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  legalDocuments,
  type LegalDocumentSlug,
} from "../content/legal-content";

type PageProps = {
  params: Promise<{ document: string }>;
};

function getDocument(slug: string) {
  if (!(slug in legalDocuments)) return null;
  return legalDocuments[slug as LegalDocumentSlug];
}

export function generateStaticParams() {
  return Object.keys(legalDocuments).map((document) => ({ document }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { document } = await params;
  const content = getDocument(document);
  if (!content) return {};
  return {
    title: content.title,
    description: content.description,
  };
}

export default async function LegalDocumentPage({ params }: PageProps) {
  const { document } = await params;
  const content = getDocument(document);
  if (!content) notFound();

  return (
    <main>
      <p>
        <Link href="/legal">Tutti i documenti</Link>
      </p>
      <article>
        <header>
          <h1>{content.title}</h1>
          <p>{content.description}</p>
          <p>Aggiornata il {content.lastUpdated}</p>
        </header>
        {content.sections.map((section) => (
          <section key={section.title}>
            <h2>{section.title}</h2>
            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {section.items ? (
              <ul>
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </article>
    </main>
  );
}
