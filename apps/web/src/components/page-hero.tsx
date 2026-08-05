import type { ReactNode } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@qoovex/ui/components/breadcrumb";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  /** Etichetta della pagina corrente per il breadcrumb. */
  current: string;
  children?: ReactNode;
};

export function PageHero({ eyebrow, title, description, current, children }: PageHeroProps) {
  return (
    <section className="border-b">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-16">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{current}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="mt-6 max-w-3xl">
          <span className="text-sm font-medium text-muted-foreground">{eyebrow}</span>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </section>
  );
}
