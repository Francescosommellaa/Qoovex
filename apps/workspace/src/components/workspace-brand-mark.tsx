import Image from "next/image";
import workspaceIcon from "@qoovex/brand-resources/qoovex-worckspace-icon/qoovex-icona-bianca-sfondo-arrotondato.svg";
import { BrandMark } from "@qoovex/ui/components/brand-mark";

export function WorkspaceBrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <BrandMark
      compact={compact}
      label="Qoovex"
      mark={<Image alt="" aria-hidden="true" className="size-full object-contain" height={28} loading="eager" src={workspaceIcon} unoptimized width={28} />}
    />
  );
}
