import Image, { type StaticImageData } from "next/image";
import marketingIcon from "@qoovex/brand-resources/qoovex-marketing-icon/qoovex-icona-nera-no-sfondo.svg";
import workspaceIcon from "@qoovex/brand-resources/qoovex-worckspace-icon/qoovex-icona-bianca-sfondo-arrotondato.svg";
import sirioIcon from "@qoovex/brand-resources/sirio-icon/sirio.svg";
import sirioWhiteIcon from "@qoovex/brand-resources/sirio-icon/sirio-white.svg";
import { cn } from "@/lib/utils";

export type BrandVariant = "marketing" | "sirio" | "workspace";

const labels: Record<BrandVariant, string> = {
  marketing: "Qoovex",
  sirio: "Sirio",
  workspace: "Qoovex",
};

function MarkImage({ asset, className = "" }: { asset: StaticImageData; className?: string }) {
  return <Image alt="" aria-hidden="true" className={cn("size-full object-contain", className)} src={asset} unoptimized />;
}

export function BrandMark({
  compact = false,
  className,
  variant = "marketing",
}: {
  compact?: boolean;
  className?: string;
  variant?: BrandVariant;
}) {
  const label = labels[variant];

  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2 font-semibold tracking-tight", className)}>
      <span className="relative grid size-7 shrink-0 place-items-center overflow-hidden rounded-md">
        {variant === "sirio" ? (
          <>
            <MarkImage asset={sirioIcon} className="p-0.5 dark:hidden" />
            <MarkImage asset={sirioWhiteIcon} className="hidden p-0.5 dark:block" />
          </>
        ) : null}
        {variant === "marketing" ? <MarkImage asset={marketingIcon} className="dark:invert" /> : null}
        {variant === "workspace" ? <MarkImage asset={workspaceIcon} /> : null}
      </span>
      {compact ? <span className="sr-only">{label}</span> : <span className="truncate">{label}</span>}
    </span>
  );
}
