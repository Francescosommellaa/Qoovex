import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react/dist/ssr";
import { Text } from "@qoovex/ui";

export interface WorkspaceBreadcrumbItem {
  label: string;
  href?: string;
}

export function WorkspaceBreadcrumb({ items }: { items: WorkspaceBreadcrumbItem[] }) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Percorso" className="mb-(--spacing-3) overflow-x-auto">
      <ol className="flex min-w-max items-center gap-(--spacing-2)">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-(--spacing-2)">
              {index > 0 ? (
                <CaretRight size={12} className="text-(--color-text-muted)" aria-hidden />
              ) : null}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="text-(length:--text-xs) font-(--font-weight-medium) text-(--color-text-muted) transition-colors duration-(--motion-duration-fast) hover:text-(--color-text)"
                >
                  {item.label}
                </Link>
              ) : (
                <Text size="xs" tone={isLast ? "neutral" : "muted"} weight="medium">
                  {item.label}
                </Text>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
