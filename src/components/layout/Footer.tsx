import React from "react"
import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LayoutGrid, Settings } from "lucide-react"

export const Footer: React.FC = () => {
  return (
    <footer className="sticky bottom-0 z-50 border-t border-border/40 bg-background/80 px-3 py-3 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <TabsList className="mx-auto grid h-11 w-full max-w-sm grid-cols-2 gap-1 rounded-xl p-1 sm:h-12 sm:max-w-md">
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
    </footer>
  )
}
