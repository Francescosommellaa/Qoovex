import Image, { type StaticImageData } from "next/image";
import marketingIcon from "@qoovex/brand-resources/qoovex-marketing-icon/qoovex-icona-nera-no-sfondo.svg";
import workspaceIcon from "@qoovex/brand-resources/qoovex-worckspace-icon/qoovex-icona-bianca-sfondo-arrotondato.svg";
import sirioIcon from "@qoovex/brand-resources/sirio-icon/sirio.svg";
import sirioWhiteIcon from "@qoovex/brand-resources/sirio-icon/sirio-white.svg";
import { BrandMark as SharedBrandMark } from "@qoovex/ui/components/brand-mark";
import { cn } from "@qoovex/ui/lib/utils";

export type BrandVariant = "marketing" | "sirio" | "workspace";

const labels: Record<BrandVariant, string> = {
  marketing: "Qoovex",
  sirio: "Sirio",
  workspace: "Qoovex",
};

function MarkImage({ asset, className = "" }: { asset: StaticImageData; className?: string }) {
  return <Image alt="" aria-hidden="true" className={cn("size-full object-contain", className)} height={28} src={asset} unoptimized width={28} />;
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
    <SharedBrandMark
      className={className}
      compact={compact}
      label={label}
      mark={
        <>
        {variant === "sirio" ? (
          <>
            <MarkImage asset={sirioIcon} className="p-0.5 dark:hidden" />
            <MarkImage asset={sirioWhiteIcon} className="hidden p-0.5 dark:block" />
          </>
        ) : null}
        {variant === "marketing" ? <MarkImage asset={marketingIcon} className="dark:invert" /> : null}
        {variant === "workspace" ? <MarkImage asset={workspaceIcon} /> : null}
        </>
      }
    />
  );
}
