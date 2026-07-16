import Image from "next/image";
import marketingIcon from "@qoovex/brand-resources/qoovex-marketing-icon/qoovex-icona-nera-no-sfondo.svg";
import { BrandMark as SharedBrandMark } from "@qoovex/ui/components/brand-mark";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <SharedBrandMark
      compact={compact}
      label="Qoovex"
      mark={
        <Image
          alt=""
          aria-hidden="true"
          className="size-full object-contain dark:invert"
          height={28}
          src={marketingIcon}
          unoptimized
          width={28}
        />
      }
    />
  );
}
