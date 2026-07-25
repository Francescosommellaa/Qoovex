"use client";

import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { cn } from "#lib/utils";
import { buttonVariants } from "#components/button";

interface PaginationProps {
  page: number;
  totalPages?: number;
  hasNextPage: boolean;
  baseHref: string;
  searchParams?: Record<string, string>;
  ariaLabel?: string;
}

function buildHref(
  baseHref: string,
  page: number,
  searchParams?: Record<string, string>,
): string {
  const params = new URLSearchParams(searchParams);
  params.set("page", String(page));
  return `${baseHref}?${params.toString()}`;
}

export function Pagination({
  page,
  totalPages,
  hasNextPage,
  baseHref,
  searchParams,
  ariaLabel = "Paginazione",
}: PaginationProps) {
  const hasPrev = page > 1;
  const showNav = hasPrev || hasNextPage;

  if (!showNav) return null;

  return (
    <nav aria-label={ariaLabel} className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        {hasPrev ? (
          <a
            aria-disabled
            className={cn(
              buttonVariants({ variant: "outline" }),
              "pointer-events-none opacity-50",
            )}
            href={buildHref(baseHref, page - 1, searchParams)}
          >
            <IconChevronLeft />
            Precedente
          </a>
        ) : null}
        {hasNextPage ? (
          <a
            className={buttonVariants({ variant: "outline" })}
            href={buildHref(baseHref, page + 1, searchParams)}
          >
            Successiva
            <IconChevronRight />
          </a>
        ) : null}
      </div>
      <span className="text-sm text-muted-foreground">
        Pagina {page}
        {totalPages != null ? ` di ${totalPages}` : null}
      </span>
    </nav>
  );
}
