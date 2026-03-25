import React from "react"
import { useGame } from "@/components/game-provider"
import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LayoutGrid, Settings } from "lucide-react"

export const Footer: React.FC = () => {
  const { fps, state } = useGame()

  const fpsColor =
    fps >= 60 ? "text-green-500" : fps >= 30 ? "text-yellow-500" : "text-red-500"

  return (
    <footer className="relative sticky bottom-0 z-50 border-t border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="flex justify-center px-3 py-3">
        <TabsList className="grid h-11 w-full max-w-sm grid-cols-2 gap-1 rounded-xl p-1 sm:h-12 sm:max-w-md">
          <TabsTrigger
            value="generators"
            className="group gap-2 rounded-lg px-3 text-[13px] sm:text-sm"
          >
            <LayoutGrid className="size-4 shrink-0 text-muted-foreground transition-colors group-data-[state=active]:text-foreground" />
            Geradores
          </TabsTrigger>
          <TabsTrigger value="options" className="group gap-2 rounded-lg px-3 text-[13px] sm:text-sm">
            <Settings className="size-4 shrink-0 text-muted-foreground transition-colors group-data-[state=active]:text-foreground" />
            Opções
          </TabsTrigger>
        </TabsList>
      </div>
      {state.showFps ? (
        <span
          className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 font-sans text-[11px] font-bold tabular-nums sm:right-3 sm:text-[13px] ${fpsColor}`}
          aria-live="polite"
        >
          {fps} FPS
        </span>
      ) : null}
    </footer>
  )
}
