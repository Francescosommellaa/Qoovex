"use client";

import { IconArrowRight } from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import { BrandMark, type BrandVariant } from "@/components/brand-mark";
import { buttonVariants } from "@qoovex/ui/components/button";
import {
  FloatingNavigation,
  type FloatingNavigationSection,
} from "@qoovex/ui/components/floating-navigation";

export type SectionTag = FloatingNavigationSection;

const surfaceLinks = [{ href: "/", label: "Foundation visuale" }];

export function SiteHeader({
  action = true,
  brand = "sirio",
  sections = [],
}: {
  action?: boolean;
  brand?: Exclude<BrandVariant, "workspace">;
  sections?: SectionTag[];
}) {
  const pathname = usePathname();
  const homeHref = "/";

  return (
    <FloatingNavigation
      action={
        action ? (
          <span className="hidden sm:contents">
            <a
              className={buttonVariants()}
              data-cursor-label="Apri"
              data-cursor-magnetic="true"
              href="/"
            >
              <span className="hidden lg:inline">Apri il catalogo</span>
              <IconArrowRight aria-hidden="true" />
              <span className="sr-only lg:hidden">Apri il catalogo</span>
            </a>
          </span>
        ) : undefined
      }
      activeHref={pathname}
      brand={(compact) => <BrandMark compact={compact} variant={brand} />}
      homeHref={homeHref}
      sections={sections}
      surfaceLabel="Superfici Sirio"
      surfaceLinks={surfaceLinks}
    />
  );
}
