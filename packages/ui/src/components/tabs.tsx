"use client";

import { Tabs as TabsPrimitive } from "radix-ui";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

export type TabItem = {
  content: ReactNode;
  disabled?: boolean;
  label: string;
  value: string;
};

export type TabsProps = ComponentPropsWithoutRef<typeof TabsPrimitive.Root> & {
  "aria-label": string;
  items: readonly TabItem[];
};

export function Tabs({
  "aria-label": ariaLabel,
  items,
  ...props
}: TabsProps) {
  return (
    <TabsPrimitive.Root className="qv-tabs" {...props}>
      <TabsPrimitive.List aria-label={ariaLabel} className="qv-tabs__list">
        {items.map((item) => (
          <TabsPrimitive.Trigger
            className="qv-tabs__trigger"
            disabled={item.disabled}
            key={item.value}
            value={item.value}
          >
            {item.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      {items.map((item) => (
        <TabsPrimitive.Content
          className="qv-tabs__content"
          key={item.value}
          value={item.value}
        >
          {item.content}
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  );
}
