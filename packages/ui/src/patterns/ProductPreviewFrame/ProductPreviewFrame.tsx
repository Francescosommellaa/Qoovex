import * as React from "react";
import {
  BookOpen,
  ClipboardText,
  ForkKnife,
  MagnifyingGlass,
  SquaresFour,
} from "@phosphor-icons/react/dist/ssr";
import { Badge, Skeleton } from "../../components";
import { cn } from "../../lib/utils";
import { Box, Icon, Stack, Text } from "../../primitives";
import type {
  ProductPreviewFrameProps,
  ProductPreviewScreen,
} from "./ProductPreviewFrame.types";

const navigation: Array<{
  id: ProductPreviewScreen;
  label: string;
  icon: React.ComponentType<React.ComponentProps<typeof BookOpen>>;
}> = [
  { id: "recipes", label: "Ricette", icon: BookOpen },
  { id: "menus", label: "Menu", icon: ForkKnife },
  { id: "workplan", label: "Lavoro", icon: ClipboardText },
  { id: "explore", label: "Esplora", icon: MagnifyingGlass },
];

const screenCopy: Record<ProductPreviewScreen, { title: string; action: string; rows: string[] }> = {
  recipes: {
    title: "Le mie ricette",
    action: "Nuova",
    rows: ["Risotto al limone", "Tartare di tonno", "Creme brulee", "Pappardelle"],
  },
  menus: {
    title: "Menu digitali",
    action: "QR",
    rows: ["Menu degustazione", "Carta estate", "Menu vegano", "Carta vini"],
  },
  workplan: {
    title: "Piano di lavoro",
    action: "Oggi",
    rows: ["Prep fondi", "Tartare x 12", "Crema limone", "Mise en place"],
  },
  explore: {
    title: "Esplora",
    action: "Importa",
    rows: ["Chef Mario Russo", "Osteria del Porto", "Ristorante Alma", "Bistrot Nord"],
  },
};

export function ProductPreviewFrame({
  activeScreen = "recipes",
  className,
  ...props
}: ProductPreviewFrameProps) {
  const screen = screenCopy[activeScreen];

  return (
    <Box
      radius="2xl"
      border="subtle"
      surface="surface"
      className={cn(
        "pointer-events-none mx-auto w-full max-w-(--product-preview-width) select-none overflow-hidden border-dashed [box-shadow:none]",
        className,
      )}
      role="img"
      aria-label="Screenshot statico di Qoovex Workspace"
      {...props}
    >
      <div className="flex min-h-(--product-preview-chrome-height) items-center gap-(--spacing-3) border-b border-(--color-border) bg-(--color-surface-2) px-(--spacing-3)">
        <Stack direction="row" gap="1" aria-hidden="true">
          <span className="h-(--product-preview-dot) w-(--product-preview-dot) rounded-(--radius-full) bg-(--color-error)" />
          <span className="h-(--product-preview-dot) w-(--product-preview-dot) rounded-(--radius-full) bg-(--color-warning)" />
          <span className="h-(--product-preview-dot) w-(--product-preview-dot) rounded-(--radius-full) bg-(--color-success)" />
        </Stack>
        <Badge variant="soft" tone="neutral" size="sm">
          app.qoovex.com
        </Badge>
        <Text as="span" size="xs" tone="faint" weight="semibold" className="ml-auto">
          Screenshot app
        </Text>
      </div>
      <div className="grid min-h-(--product-preview-height) grid-cols-[var(--product-preview-nav-width)_minmax(0,1fr)] opacity-90">
        <aside className="border-r border-(--color-border) bg-(--color-surface-2) p-(--spacing-3)">
          <Stack gap="3">
            <Icon icon={SquaresFour} tone="primary" weight="bold" />
            <Stack gap="1">
              {navigation.map((item) => {
                const isActive = item.id === activeScreen;
                return (
                  <div
                    key={item.id}
                    className={
                      isActive
                        ? "flex items-center gap-(--spacing-2) rounded-(--radius-md) bg-(--color-surface-offset) px-(--spacing-2) py-(--spacing-2) text-(--color-text)"
                        : "flex items-center gap-(--spacing-2) rounded-(--radius-md) px-(--spacing-2) py-(--spacing-2) text-(--color-text-faint)"
                    }
                  >
                    <Icon icon={item.icon} size="sm" tone="current" weight={isActive ? "bold" : "regular"} />
                    <Text as="span" size="xs" tone="neutral">
                      {item.label}
                    </Text>
                  </div>
                );
              })}
            </Stack>
          </Stack>
        </aside>
        <main className="min-w-0 bg-(--color-bg)">
          <div className="flex items-center justify-between border-b border-(--color-divider) px-(--spacing-4) py-(--spacing-3)">
            <Text as="span" size="sm" weight="semibold">
              {screen.title}
            </Text>
            <Badge variant="soft" tone="neutral" size="sm">
              {screen.action}
            </Badge>
          </div>
          <Stack gap="2" className="p-(--spacing-3)">
            {screen.rows.map((row, index) => (
              <Box key={row} surface="surface" border="divider" radius="lg" padding="3">
                <Stack direction="row" align="center" gap="3">
                  <Skeleton variant="block" size="sm" radius="md" className="shrink-0" />
                  <Stack gap="1" className="min-w-0">
                    <Text as="span" size="xs" tone="faint" weight="medium" className="truncate">
                      {row}
                    </Text>
                    <Skeleton variant="text" size="xs" width={index % 2 === 0 ? "62%" : "48%"} />
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Stack>
        </main>
      </div>
    </Box>
  );
}
