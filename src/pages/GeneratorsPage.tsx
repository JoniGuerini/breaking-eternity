import React, { useRef, useCallback, useEffect } from "react"
import { useGame } from "@/components/game-provider"
import { formatNumber, getGeneratorCost, formatTime } from "@/lib/game-logic"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Decimal from "break_eternity.js"

const GeneratorRow: React.FC<{ 
  gen: any; 
  resources: Decimal; 
  buyGenerator: (id: string) => void;
  registerBar: (id: string, el: HTMLDivElement | null) => void;
}> = ({ gen, resources, buyGenerator, registerBar }) => {
  const cost = getGeneratorCost(gen)
  const canAfford = resources.gte(cost)
  const totalProduction = gen.baseProduction.times(gen.level)
  const timerRef = useRef<any>(null)

  const stopBuying = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startBuying = useCallback(() => {
    stopBuying()
    // Initial buy
    buyGenerator(gen.id)
    
    // Series buy (10 times per second)
    timerRef.current = setInterval(() => {
      buyGenerator(gen.id)
    }, 100)
  }, [buyGenerator, gen.id, stopBuying])

  // Cleanup on unmount
  useEffect(() => {
    return () => stopBuying()
  }, [stopBuying])

  // Segurar "Comprar" dispara compras a cada 100ms; sem isto o intervalo pode continuar
  // ao mudar de janela/aba (mouseleave/mouseup não disparam) e drenar recursos "sozinho".
  useEffect(() => {
    const stop = () => stopBuying()
    const onVis = () => {
      if (document.hidden) stop()
    }
    window.addEventListener("blur", stop)
    window.addEventListener("pointerup", stop)
    window.addEventListener("pointercancel", stop)
    document.addEventListener("visibilitychange", onVis)
    return () => {
      window.removeEventListener("blur", stop)
      window.removeEventListener("pointerup", stop)
      window.removeEventListener("pointercancel", stop)
      document.removeEventListener("visibilitychange", onVis)
    }
  }, [stopBuying])

  return (
    <div className="flex items-center gap-2 w-full">
      {/* 1. Name Card (Simplified Index) */}
      <div className="h-10 min-w-[48px] px-2 bg-[hsl(var(--progress-bg))] border border-muted-foreground/15 rounded-lg flex items-center justify-center">
        <h2 className="text-[14px] font-medium tracking-wide">
          {gen.id.replace("generator", "")}
        </h2>
      </div>

      {/* 2. Quantity Card (Fixed Width for Stability) */}
      <div className="h-10 w-24 bg-[hsl(var(--progress-bg))] border border-muted-foreground/15 rounded-lg flex items-center justify-center shrink-0">
        <span className="text-[14px] font-medium font-sans tabular-nums">
          {formatNumber(new Decimal(gen.level))}
        </span>
      </div>

      {/* 3. Progress Bar Card */}
      <div className="flex-1 relative h-10 bg-[hsl(var(--progress-bg))] rounded-lg overflow-hidden border border-muted-foreground/15 shadow-inner group">
        {/* Base Fill - GPU Accelerated */}
        <div 
          ref={(el) => registerBar(gen.id, el)}
          className="absolute top-0 left-0 h-full w-full bg-[hsl(var(--progress-fill))] border-r border-[hsl(var(--progress-fill))/0.5] origin-left will-change-transform"
          style={{ transform: 'scaleX(0)' }}
        />
        
        {/* Labels inside the bar (Refined 14px Medium) */}
        <div className="absolute inset-0 flex items-center justify-between px-5 font-sans tabular-nums font-medium text-[14px] pointer-events-none tracking-normal mix-blend-difference text-white">
          <span className="drop-shadow-sm">
            {formatTime(gen.duration)}
          </span>
          <span className="drop-shadow-sm">
            {formatNumber(totalProduction)}
          </span>
        </div>
      </div>

      {/* 4. Buy Button Card (With Hold-to-Buy) */}
      {canAfford ? (
        <Button
          onMouseDown={startBuying}
          onMouseUp={stopBuying}
          onMouseLeave={stopBuying}
          className="h-10 min-w-[160px] rounded-lg border border-muted-foreground/15 px-6 text-[14px] font-medium tracking-wide shadow-none transition-transform active:scale-[0.98] bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Comprar
        </Button>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex cursor-default">
              <Button
                disabled
                className="h-10 min-w-[160px] rounded-lg border border-muted-foreground/15 px-6 text-[14px] font-medium tracking-wide shadow-none bg-secondary/50 text-muted-foreground"
              >
                Comprar
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent side="top">
            <span className="text-sm font-semibold tabular-nums text-destructive">
              {formatNumber(cost)}
            </span>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}

export const GeneratorsPage: React.FC = () => {
  const { state, buyGenerator, registerBar, offlineProgress, clearOfflineProgress } = useGame()

  // Dynamic rendering of all generators
  const generators = Object.values(state.generators)

  return (
    <div className="flex-1 p-6 space-y-4 overflow-y-auto w-full font-sans relative">
      {/* Welcome Back Dialog */}
      <AlertDialog open={!!offlineProgress} onOpenChange={(open) => !open && clearOfflineProgress()}>
        <AlertDialogContent className="flex max-h-[min(92vh,44rem)] max-w-lg flex-col gap-4 overflow-hidden">
          <AlertDialogHeader className="shrink-0 space-y-3 text-left">
            <AlertDialogTitle>Bem-vindo de volta!</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <p>
                Sua produção continuou enquanto você estava fora por{" "}
                <span className="font-semibold text-foreground tabular-nums">
                  {offlineProgress ? formatTime(offlineProgress.timeOffline) : "—"}
                </span>
                .
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>

          {offlineProgress && (
            <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-border bg-muted/30 scrollbar-none">
              <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Recurso base
                </span>
                <span className="text-sm font-semibold tabular-nums text-foreground">
                  +{formatNumber(offlineProgress.resourcesGained)}
                </span>
              </div>

              <div className="overflow-x-auto px-2 pb-2 pt-2 sm:px-3">
                <table className="w-full min-w-[320px] border-collapse text-sm">
                  <caption className="sr-only">
                    Produção offline por gerador
                  </caption>
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th
                        scope="col"
                        className="px-2 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground sm:px-3"
                      >
                        Gerador
                      </th>
                      <th
                        scope="col"
                        className="px-2 py-2.5 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground sm:px-3"
                      >
                        Antes
                      </th>
                      <th
                        scope="col"
                        className="px-2 py-2.5 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground sm:px-3"
                      >
                        Atual
                      </th>
                      <th
                        scope="col"
                        className="px-2 py-2.5 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground sm:px-3"
                      >
                        Gerado offline
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(offlineProgress.finalLevels)
                      .sort(
                        (a, b) =>
                          parseInt(a.replace("generator", ""), 10) -
                          parseInt(b.replace("generator", ""), 10)
                      )
                      .map((id) => {
                        const initial = offlineProgress.initialLevels[id] ?? 0
                        const final = offlineProgress.finalLevels[id] ?? 0
                        const gained = final - initial

                        return (
                          <tr
                            key={id}
                            className="border-b border-border/70 transition-colors last:border-b-0 hover:bg-muted/40"
                          >
                            <th
                              scope="row"
                              className="whitespace-nowrap px-2 py-2.5 text-left font-medium text-foreground sm:px-3"
                            >
                              Gerador {id.replace("generator", "")}
                            </th>
                            <td className="px-2 py-2.5 text-right tabular-nums text-muted-foreground sm:px-3">
                              {formatNumber(new Decimal(initial))}
                            </td>
                            <td className="px-2 py-2.5 text-right tabular-nums font-medium text-foreground sm:px-3">
                              {formatNumber(new Decimal(final))}
                            </td>
                            <td
                              className={`px-2 py-2.5 text-right tabular-nums font-medium sm:px-3 ${
                                gained === 0
                                  ? "text-muted-foreground"
                                  : "text-emerald-600 dark:text-emerald-400"
                              }`}
                            >
                              {gained >= 0 ? "+" : ""}
                              {formatNumber(new Decimal(gained))}
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <AlertDialogFooter className="shrink-0">
            <AlertDialogAction
              onClick={clearOfflineProgress}
              className="w-full sm:w-auto"
            >
              Continuar Produzindo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {generators.map((gen) => (
        <GeneratorRow 
          key={gen.id} 
          gen={gen} 
          resources={state.resources} 
          buyGenerator={buyGenerator} 
          registerBar={registerBar}
        />
      ))}
    </div>
  )
}
