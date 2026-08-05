import type { ReactNode } from "react";
import { cn } from "@qoovex/ui/lib/utils";

type SectionProps = {
  children: ReactNode;
  className?: string;
  id?: string;
  /** Aggiunge un bordo inferiore per separare le fasce. */
  bordered?: boolean;
  /** Sfondo alternativo (card/muted) per ritmare la pagina. */
  tone?: "default" | "muted";
  "aria-labelledby"?: string;
};

export function Section({
  children,
  className,
  id,
  bordered = false,
  tone = "default",
  ...rest
}: SectionProps) {
  return (
    <section
      className={cn(
        "marketing-section scroll-mt-24",
        bordered && "border-b",
        tone === "muted" && "bg-card",
        className,
      )}
      id={id}
      {...rest}
    >
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">{children}</div>
    </section>
  );
}

type SectionHeadingProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "start" | "center";
  titleId?: string;
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "start",
  titleId,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "mx-auto max-w-3xl text-center",
        align === "start" && "max-w-3xl",
        className,
      )}
    >
      {eyebrow ? (
        <span className="text-sm font-medium text-muted-foreground">{eyebrow}</span>
      ) : null}
      <h2
        className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
        id={titleId}
      >
        {title}
      </h2>
      {description ? (
        <p className="text-pretty text-lg leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}
