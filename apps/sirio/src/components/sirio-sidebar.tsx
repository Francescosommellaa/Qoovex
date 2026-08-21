"use client";

import * as React from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AdaptiveSidebar } from "@qoovex/ui/components/sidebar";
import { CatalogSearchModal } from "@/components/catalog-search-modal";
import { catalogNavigationGroups } from "@/lib/catalog-navigation";
import sirioIcon from "@qoovex/brand-resources/sirio-icon/sirio.svg";
import sirioWhiteIcon from "@qoovex/brand-resources/sirio-icon/sirio-white.svg";
export function SirioSidebar() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = React.useState(false);

  return (
    <>
      <AdaptiveSidebar
        brand={{
          href: "/",
          title: "Sirio",
          logo: (
            <span className="inline-flex size-7 shrink-0 items-center justify-center">
              <Image
                alt="Sirio"
                aria-hidden="true"
                className="size-6 object-contain dark:hidden"
                height={24}
                loading="eager"
                src={sirioIcon}
                unoptimized
                width={24}
              />
              <Image
                alt="Sirio"
                aria-hidden="true"
                className="hidden size-6 object-contain dark:block"
                height={24}
                loading="eager"
                src={sirioWhiteIcon}
                unoptimized
                width={24}
              />
            </span>
          ),
        }}
        search={{
          placeholder: "Cerca nel catalogo",
          onClick: () => setSearchOpen(true),
        }}
        groups={catalogNavigationGroups.map((group) => ({
          label: group.label,
          items: [...group.items],
        }))}
        pathname={pathname}
        variant="inset"
        collapsible="icon"
      />

      <CatalogSearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
