"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { IconChevronUp, IconChevronDown, IconSelector, IconChevronLeft, IconChevronRight } from "@tabler/icons-react"

import { Button } from "#components/button"
import { cn } from "#lib/utils"

const tableVariants = cva("w-full caption-bottom text-sm border-collapse", {
  variants: {
    density: {
      compact: "[&_th]:py-2 [&_th]:px-3 [&_td]:py-2 [&_td]:px-3 text-xs",
      default: "[&_th]:py-3 [&_th]:px-4 [&_td]:py-3 [&_td]:px-4 text-xs sm:text-sm",
      spacious: "[&_th]:py-4 [&_th]:px-5 [&_td]:py-4 [&_td]:px-5 text-sm",
    },
    striped: {
      true: "[&_tbody_tr:nth-child(even)]:bg-muted/25",
      false: "",
    },
  },
  defaultVariants: {
    density: "default",
    striped: false,
  },
})

function TableContainer({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="table-container"
      className={cn(
        "relative w-full overflow-x-auto rounded-xl border border-border bg-card shadow-2xs",
        className
      )}
      {...props}
    />
  )
}

function Table({
  className,
  density = "default",
  striped = false,
  ...props
}: React.ComponentProps<"table"> & VariantProps<typeof tableVariants>) {
  return (
    <div className="w-full overflow-x-auto">
      <table
        data-slot="table"
        data-density={density}
        className={cn(tableVariants({ density, striped }), className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("bg-muted/50 border-b border-border/80 select-none", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("divide-y divide-border/60 [&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t border-border/80 bg-muted/40 font-medium text-muted-foreground [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "transition-colors duration-150 hover:bg-muted/40 has-aria-expanded:bg-muted/40 data-[state=selected]:bg-primary/5 dark:data-[state=selected]:bg-primary/10",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-10 px-4 text-left align-middle font-accent text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

function TableHeadSort({
  className,
  children,
  sortDirection,
  onSort,
  ...props
}: React.ComponentProps<"th"> & {
  sortDirection?: "asc" | "desc" | false
  onSort?: () => void
}) {
  return (
    <th
      data-slot="table-head-sort"
      className={cn(
        "h-10 px-4 text-left align-middle font-accent text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap select-none cursor-pointer hover:text-foreground transition-colors",
        className
      )}
      onClick={onSort}
      {...props}
    >
      <div className="flex items-center gap-1.5">
        <span>{children}</span>
        {sortDirection === "asc" ? (
          <IconChevronUp className="size-3.5 text-primary" />
        ) : sortDirection === "desc" ? (
          <IconChevronDown className="size-3.5 text-primary" />
        ) : (
          <IconSelector className="size-3.5 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
    </th>
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "px-4 py-3 align-middle whitespace-nowrap text-foreground/90 [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-xs text-muted-foreground font-accent tracking-wide", className)}
      {...props}
    />
  )
}

function TableToolbar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="table-toolbar"
      className={cn(
        "flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 border-b border-border/80 bg-card/60",
        className
      )}
      {...props}
    />
  )
}

function TablePagination({
  className,
  pageIndex = 1,
  pageCount = 10,
  totalItems = 100,
  pageSize = 10,
  onPageChange,
}: {
  className?: string
  pageIndex?: number
  pageCount?: number
  totalItems?: number
  pageSize?: number
  onPageChange?: (page: number) => void
}) {
  const startItem = (pageIndex - 1) * pageSize + 1
  const endItem = Math.min(pageIndex * pageSize, totalItems)

  return (
    <div
      data-slot="table-pagination"
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border/80 bg-muted/20 text-xs text-muted-foreground font-accent",
        className
      )}
    >
      <span>
        Visualizzati <strong className="text-foreground">{startItem}-{endItem}</strong> di <strong className="text-foreground">{totalItems}</strong> elementi
      </span>
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="icon-xs"
          disabled={pageIndex <= 1}
          onClick={() => onPageChange?.(pageIndex - 1)}
        >
          <IconChevronLeft className="size-3.5" />
        </Button>
        <span className="px-2">
          Pagina <strong className="text-foreground">{pageIndex}</strong> di {pageCount}
        </span>
        <Button
          variant="outline"
          size="icon-xs"
          disabled={pageIndex >= pageCount}
          onClick={() => onPageChange?.(pageIndex + 1)}
        >
          <IconChevronRight className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}

export {
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableHeadSort,
  TableRow,
  TableCell,
  TableCaption,
  TableToolbar,
  TablePagination,
}
