"use client";

import { IconArrowRight, IconSparkles, IconLayoutDashboard, IconPalette } from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import { BrandMark, type BrandVariant } from "@/components/brand-mark";
import { buttonVariants } from "@qoovex/ui/components/button";
import { ThemeToggle } from "@qoovex/ui/components/theme-toggle";
import {
  FloatingNavigation,
  type FloatingNavigationSection,
} from "@qoovex/ui/components/floating-navigation";

export type SectionTag = FloatingNavigationSection;

const surfaceLinks = [
  { href: "/", label: "Catalogo & Fondazioni" },
  { href: "/marketing", label: "Superficie Marketing" },
  { href: "/dashboard", label: "Superficie Workspace" },
];

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
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {action ? (
            <span className="hidden sm:contents">
              <a
                className={buttonVariants({ variant: "default", size: "sm" })}
                data-cursor-label="Catalogo"
                data-cursor-magnetic="true"
                href="/"
              >
                <IconSparkles aria-hidden="true" className="size-3.5" />
                <span className="hidden lg:inline">Design System</span>
                <IconArrowRight aria-hidden="true" className="size-3.5" />
              </a>
            </span>
          ) : undefined}
        </div>
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

