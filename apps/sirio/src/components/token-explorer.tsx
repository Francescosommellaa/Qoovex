import * as React from "react";
import { cn } from "@qoovex/ui/lib/utils";

export function ColorSwatch({
  name,
  variable,
}: {
  name: string;
  variable: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="h-20 w-full rounded-md border shadow-xs"
        style={{ backgroundColor: `var(${variable})` }}
      />
      <div className="flex flex-col">
        <span className="text-sm font-medium">{name}</span>
        <code className="text-xs text-muted-foreground">{variable}</code>
      </div>
    </div>
  );
}

export function ColorGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {children}
    </div>
  );
}

export function TypographySpecimen({
  label,
  fontFamily,
}: {
  label: string;
  fontFamily: string;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border p-6">
      <div className="flex flex-col">
        <span className="text-sm font-medium">{label}</span>
        <code className="text-xs text-muted-foreground">{fontFamily}</code>
      </div>
      <div
        className="text-4xl text-foreground"
        style={{ fontFamily: `var(${fontFamily})` }}
      >
        AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz 0123456789
      </div>
    </div>
  );
}

export function SpacingSpecimen({
  name,
  variable,
  size,
}: {
  name: string;
  variable: string;
  size: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex w-32 flex-col">
        <span className="text-sm font-medium">{name}</span>
        <code className="text-xs text-muted-foreground">{variable}</code>
        <span className="text-xs text-muted-foreground">{size}</span>
      </div>
      <div
        className="bg-primary rounded-xs"
        style={{ width: `var(${variable})`, height: "1.5rem" }}
      />
    </div>
  );
}

export function RadiusSpecimen({
  name,
  variable,
}: {
  name: string;
  variable: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="h-24 w-full border-2 border-primary bg-muted"
        style={{ borderTopLeftRadius: `var(${variable})` }}
      />
      <div className="flex flex-col mt-2">
        <span className="text-sm font-medium">{name}</span>
        <code className="text-xs text-muted-foreground">{variable}</code>
      </div>
    </div>
  );
}
