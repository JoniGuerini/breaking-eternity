import * as React from "react"
import { Tooltip as TooltipPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  )
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 6, children, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      data-slot="tooltip-content"
      sideOffset={sideOffset}
      className={cn(
        "group/tooltip fade-in-0 zoom-in-95 data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) animate-in rounded-md border border-border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md data-[state=closed]:animate-out",
        className
      )}
      {...props}
    >
      {children}
      {/* Borda contínua: stroke no polígono + 1px de sobreposição na junta com o retângulo */}
      <TooltipPrimitive.Arrow
        className={cn(
          "fill-[hsl(var(--popover))] stroke-[hsl(var(--border))]",
          "group-data-[side=top]/tooltip:-translate-y-px",
          "group-data-[side=bottom]/tooltip:translate-y-px",
          "group-data-[side=left]/tooltip:-translate-x-px",
          "group-data-[side=right]/tooltip:translate-x-px"
        )}
        height={7}
        width={14}
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
    </TooltipPrimitive.Content>
  </TooltipPrimitive.Portal>
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName ?? "TooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
