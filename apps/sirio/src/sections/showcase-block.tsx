import type { ReactNode } from "react";

interface ShowcaseBlockProps {
  label: string;
  description: string;
  children: ReactNode;
  className?: string;
}

interface ShowcaseRowProps {
  label: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

const DEFAULT_BLOCK_GRID = "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4";
const DEFAULT_ROW_CONTENT = "flex flex-wrap items-center gap-3";

export function ShowcaseBlock({
  label,
  description,
  children,
  className,
}: ShowcaseBlockProps) {
  return (
    <div className="mb-10">
      <div className="mb-4 max-w-3xl">
        <p className="sirio-row__label">{label}</p>
        <p className="sirio-preview-text">{description}</p>
      </div>
      <div className={className ?? DEFAULT_BLOCK_GRID}>{children}</div>
    </div>
  );
}

export function ShowcaseRow({
  label,
  children,
  className,
  contentClassName,
}: ShowcaseRowProps) {
  return (
    <div className={className ?? "sirio-row"}>
      <p className="sirio-row__label">{label}</p>
      <div className={contentClassName ?? DEFAULT_ROW_CONTENT}>{children}</div>
    </div>
  );
}
