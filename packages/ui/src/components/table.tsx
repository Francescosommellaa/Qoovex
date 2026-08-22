"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { IconChevronUp, IconChevronDown, IconSelector, IconChevronLeft, IconChevronRight } from "@tabler/icons-react"

import { Button } from "#components/button"
import { cn } from "#lib/utils"
import {
  useSlidingIndicatorState,
  SlidingIndicatorProvider,
  SlidingIndicator,
  type SlidingIndicatorContextValue,
} from "#components/sliding-indicator"

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

/* ─── Context for Sliding Hover Indicator ─────────────────────── */

type TableHoverContextValue = {
  moveHoverIndicator: (element: HTMLElement) => void
  clearHoverIndicator: () => void
}

const TableHoverContext = React.createContext<TableHoverContextValue | null>(null)

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("bg-muted/50 border-b border-border/80 select-none", className)}
      {...props}
    />
  )
}

function TableBody({
  className,
  children,
  onMouseLeave: onMouseLeaveProp,
  onBlur: onBlurProp,
  ...props
}: React.ComponentProps<"tbody">) {
  const {
    containerRef,
    indicator,
    moveIndicator,
    clearIndicator,
    handleMouseLeave,
    handleBlur,
  } = useSlidingIndicatorState()

  const tableHoverCtxValue = React.useMemo<TableHoverContextValue>(
    () => ({
      moveHoverIndicator: moveIndicator,
      clearHoverIndicator: clearIndicator,
    }),
    [moveIndicator, clearIndicator]
  )

  const slidingCtxValue = React.useMemo<SlidingIndicatorContextValue>(
    () => ({
      indicator,
      moveIndicator,
      clearIndicator,
      containerRef,
    }),
    [indicator, moveIndicator, clearIndicator, containerRef]
  )

  return (
    <TableHoverContext.Provider value={tableHoverCtxValue}>
      <SlidingIndicatorProvider value={slidingCtxValue}>
        <tbody
          ref={containerRef as React.RefObject<HTMLTableSectionElement>}
          data-slot="table-body"
          className={cn("relative divide-y divide-border/60 [&_tr:last-child]:border-0", className)}
          onMouseLeave={(e) => {
            onMouseLeaveProp?.(e)
            handleMouseLeave()
          }}
          onBlur={(e) => {
            onBlurProp?.(e)
            handleBlur(e)
          }}
          {...props}
        >
          <tr aria-hidden className="pointer-events-none border-0 p-0 m-0">
            <td className="p-0 border-0 m-0" colSpan={999}>
              <SlidingIndicator rounded="md" />
            </td>
          </tr>
          {children}
        </tbody>
      </SlidingIndicatorProvider>
    </TableHoverContext.Provider>
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

function TableRow({
  className,
  onClick,
  onMouseEnter: onMouseEnterProp,
  onFocus: onFocusProp,
  ...props
}: React.ComponentProps<"tr">) {
  const tableHoverCtx = React.useContext(TableHoverContext)
  const isSelected = (props as Record<string, any>)["data-state"] === "selected" || props["aria-selected"] === true
  const isInteractive = Boolean(onClick || props["aria-selected"] !== undefined || (props as Record<string, any>)["data-state"] !== undefined)

  const handleMouseEnter = (event: React.MouseEvent<HTMLTableRowElement>) => {
    onMouseEnterProp?.(event)
    if (isInteractive) {
      if (isSelected) {
        tableHoverCtx?.clearHoverIndicator()
      } else {
        tableHoverCtx?.moveHoverIndicator(event.currentTarget)
      }
    }
  }

  const handleFocus = (event: React.FocusEvent<HTMLTableRowElement>) => {
    onFocusProp?.(event)
    if (isInteractive) {
      if (isSelected) {
        tableHoverCtx?.clearHoverIndicator()
      } else {
        tableHoverCtx?.moveHoverIndicator(event.currentTarget)
      }
    }
  }

  return (
    <tr
      data-slot="table-row"
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onFocus={handleFocus}
      className={cn(
        "relative z-10 transition-colors duration-150 has-aria-expanded:bg-muted/40",
        "data-[state=selected]:bg-muted/50 data-[state=selected]:hover:bg-muted/70 dark:data-[state=selected]:bg-muted/40 dark:data-[state=selected]:hover:bg-muted/60",
        isInteractive && "cursor-pointer active:scale-[0.995]",
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
        "h-10 px-4 text-left align-middle font-accent text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap select-none cursor-pointer transition-all duration-200 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:text-foreground active:scale-[0.98]",
        className
      )}
      onClick={onSort}
      {...props}
    >
      <div className="flex items-center gap-1.5">
        <span>{children}</span>
        {sortDirection === "asc" ? (
          <IconChevronUp aria-hidden="true" className="size-3.5 text-primary" />
        ) : sortDirection === "desc" ? (
          <IconChevronDown aria-hidden="true" className="size-3.5 text-primary" />
        ) : (
          <IconSelector aria-hidden="true" className="size-3.5 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
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
          aria-label="Pagina precedente"
          variant="outline"
          size="icon-xs"
          disabled={pageIndex <= 1}
          onClick={() => onPageChange?.(pageIndex - 1)}
        >
          <IconChevronLeft aria-hidden="true" className="size-3.5" />
        </Button>
        <span className="px-2">
          Pagina <strong className="text-foreground">{pageIndex}</strong> di {pageCount}
        </span>
        <Button
          aria-label="Pagina successiva"
          variant="outline"
          size="icon-xs"
          disabled={pageIndex >= pageCount}
          onClick={() => onPageChange?.(pageIndex + 1)}
        >
          <IconChevronRight aria-hidden="true" className="size-3.5" />
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
