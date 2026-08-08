import * as React from "react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"

import { cn } from "#lib/utils"
import { IconChevronRight, IconDots } from "@tabler/icons-react"

export interface BreadcrumbItemSpec {
  label: React.ReactNode
  href?: string
  icon?: React.ReactNode
  isCurrent?: boolean
  render?: useRender.ComponentProps<"a">["render"]
  className?: string
}

export interface BreadcrumbProps extends React.ComponentProps<"nav"> {
  items?: BreadcrumbItemSpec[]
  separator?: React.ReactNode
}

function Breadcrumb({ className, items, separator, children, ...props }: BreadcrumbProps) {
  if (items && items.length > 0) {
    return (
      <nav
        aria-label="breadcrumb"
        data-slot="breadcrumb"
        className={cn("w-full min-w-0", className)}
        {...props}
      >
        <BreadcrumbList>
          {items.map((item, index) => {
            const isLast = index === items.length - 1
            const isCurrentPage = item.isCurrent ?? isLast
            return (
              <React.Fragment key={index}>
                {index > 0 ? (
                  <BreadcrumbSeparator>{separator}</BreadcrumbSeparator>
                ) : null}
                <BreadcrumbItem className={item.className}>
                  {isCurrentPage ? (
                    <BreadcrumbPage>
                      {item.icon}
                      {item.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={item.href} render={item.render}>
                      {item.icon}
                      {item.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            )
          })}
        </BreadcrumbList>
      </nav>
    )
  }

  return (
    <nav
      aria-label="breadcrumb"
      data-slot="breadcrumb"
      className={cn("w-full min-w-0", className)}
      {...props}
    >
      {children}
    </nav>
  )
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "flex max-w-full overflow-x-auto scrollbar-none items-center gap-1.5 text-xs sm:text-sm text-muted-foreground whitespace-nowrap",
        className
      )}
      {...props}
    />
  )
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1.5 min-w-0", className)}
      {...props}
    />
  )
}

function BreadcrumbLink({
  className,
  render,
  ...props
}: useRender.ComponentProps<"a">) {
  return useRender({
    defaultTagName: "a",
    props: mergeProps<"a">(
      {
        className: cn(
          "inline-flex items-center gap-1.5 font-medium transition-colors hover:text-foreground [&_svg]:size-3.5 [&_svg]:shrink-0 [&_svg]:text-muted-foreground hover:[&_svg]:text-foreground",
          className
        ),
      },
      props
    ),
    render,
    state: {
      slot: "breadcrumb-link",
    },
  })
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn(
        "inline-flex items-center gap-1.5 font-semibold text-foreground [&_svg]:size-3.5 [&_svg]:shrink-0",
        className
      )}
      {...props}
    />
  )
}

function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("inline-flex items-center text-muted-foreground/50 [&_svg]:size-3.5 shrink-0", className)}
      {...props}
    >
      {children ?? <IconChevronRight />}
    </li>
  )
}

function BreadcrumbEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn(
        "inline-flex size-6 items-center justify-center rounded-md border border-border/60 bg-muted/40 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground [&_svg]:size-3.5 shrink-0 select-none",
        className
      )}
      {...props}
    >
      <IconDots />
      <span className="sr-only">Visualizza altri livelli</span>
    </span>
  )
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}
