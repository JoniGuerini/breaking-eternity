import React, { memo, useMemo, useState, useEffect } from 'react';
import Decimal from 'break_eternity.js';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Zap } from 'lucide-react';

import { formatNumber, formatTime } from '../utils/formatUtils';
import OverclockDialog from './OverclockDialog';
import GeneratorDetailsDialog from './GeneratorDetailsDialog';
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Info } from 'lucide-react';

const GeneratorRow = ({
    generator,
    cost,
    canAfford,
    multiplier,
    nextMilestone,
    productionPerSecond,
    buyGenerator,
    research = {},
    isOverclocked, // This is now the expiry timestamp or undefined
    activateOverclock,
    deactivateOverclock,
    getMaintenanceRate,
    reservoirFragments
}) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);

    // Update countdown
    useEffect(() => {
        if (!isOverclocked) {
            setTimeLeft(0);
            return;
        }

        const tick = () => {
            const remaining = Math.max(0, Math.ceil((isOverclocked - Date.now()) / 1000));
            setTimeLeft(remaining);
        };

        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [isOverclocked]);

    const isActive = timeLeft > 0;

    const baseMaintenanceRate = useMemo(() => {
        const rank = nextMilestone.level;
        if (rank <= 0) return new Decimal(0);

        const tier = generator.id;
        // Base Cost: (Rank + Tier) * 0.01
        const baseCost = (rank + tier) * 0.01;

        // Upgrade Tax: (Tier + 1) * 0.01 per rank of Efficiency and Resonance
        // Logistics Buffer (speedLevel) is exempt from tax and provides relief
        const speedLevel = research[`gen${tier + 1}_speed`] || 0;
        const effLevel = research[`gen${tier + 1}_eff`] || 0;
        const resonanceLevel = research[`gen${tier + 1}_resonance`] || 0;
        const totalTaxedUpgrades = effLevel + resonanceLevel;

        const taxPerLevel = (tier + 1) * 0.01;
        const totalTax = totalTaxedUpgrades * taxPerLevel;

        // Logistics Buffer: -0.01 per level
        const buffer = speedLevel * 0.01;

        return new Decimal(baseCost + totalTax - buffer).max(0);
    }, [nextMilestone.level, generator.id, research]);

    const insightMultiplier = useMemo(() => {
        const level = research[`gen${generator.id + 1}_resonance`] || 0;
        return Math.pow(2, level);
    }, [research, generator.id]);

    const { next, level } = nextMilestone;
    const nextVal = new Decimal(next);
    const currentVal = generator.amount;

    // Locked State (Unowned)
    if (generator.amount.lte(0)) {
        return (
            <Card className="mb-4 rounded-xl border bg-card text-card-foreground shadow-sm hover:bg-accent/50 transition-all">
                <CardContent className="p-0">
                    <Button
                        onClick={() => {
                            if (canAfford) buyGenerator(generator.id);
                        }}
                        variant="ghost"
                        className={`w-full h-auto py-4 px-4 flex flex-row items-center justify-center gap-8 group hover:bg-accent/10 transition-colors ${!canAfford ? 'cursor-not-allowed hover:bg-transparent' : 'cursor-pointer'}`}
                    >
                        <div className={`flex flex-col items-end gap-0.5 text-right ${!canAfford ? 'opacity-80' : 'opacity-100'}`}>
                            <h3 className="font-bold text-lg text-foreground leading-tight group-hover:text-primary transition-colors">
                                Generator {generator.id + 1}
                            </h3>
                            <span className="text-xs text-foreground font-semibold">
                                Unlock to start production
                            </span>
                        </div>

                        <div className={`h-8 w-px ${!canAfford ? 'bg-foreground/20' : 'bg-foreground/40'}`}></div>

                        <div className={`flex flex-col items-start gap-0.5 text-left ${!canAfford ? 'opacity-80' : 'opacity-100'}`}>
                            <span className="text-[10px] uppercase tracking-wider text-foreground font-bold">Unlock Cost</span>
                            <div className="flex items-center gap-2">
                                <span className={`font-mono text-lg font-bold ${canAfford ? 'text-green-500' : 'text-red-400'}`}>
                                    {formatNumber(cost)}
                                </span>
                                <span className="text-xs text-foreground uppercase font-bold">Fragments</span>
                            </div>
                        </div>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <ContextMenu>
                <ContextMenuTrigger>
                    <Card className="mb-4 rounded-xl border bg-card text-card-foreground shadow-sm hover:bg-accent/50 transition-all">
                        <CardContent className="p-0 flex flex-col">
                            {/* Main Content Area */}
                            <div className="p-3 md:p-4 flex flex-col lg:grid lg:grid-cols-12 gap-3 lg:gap-4 items-center">
                                {/* 1. Name - STATIC */}
                                <div className="w-full lg:col-span-2 flex items-center justify-start">
                                    <h3 className="font-bold text-base md:text-lg text-foreground leading-tight">Generator {generator.id + 1}</h3>
                                </div>

                                {/* 2. Production Section */}
                                <div className="w-full lg:col-span-3 flex flex-col justify-center items-center py-1 lg:border-r border-border/10">
                                    <TooltipProvider>
                                        <Tooltip delayDuration={200}>
                                            <TooltipTrigger asChild>
                                                <div className="flex flex-col items-center cursor-help group">
                                                    <div className="text-xs md:text-sm font-medium text-foreground flex flex-wrap gap-1 justify-center group-hover:text-primary transition-colors">
                                                        <span>{formatNumber(productionPerSecond)}</span>
                                                        <span className="text-muted-foreground">/s</span>
                                                        <span className="text-primary/80 text-[10px] md:text-xs ml-1">
                                                            {generator.id === 0 ? "Fragments" : `Gen ${generator.id}`}
                                                        </span>
                                                    </div>
                                                    <span className="text-[9px] md:text-[10px] text-muted-foreground uppercase tracking-wider group-hover:text-foreground/80 transition-colors">Production</span>
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent side="bottom" className="p-4 bg-popover/95 backdrop-blur-sm border-primary/20 shadow-xl">
                                                <div className="flex flex-col gap-2 min-w-[180px]">
                                                    <div className="flex flex-col gap-0.5 pb-2 border-b border-border/50">
                                                        <span className="text-xs font-bold text-primary uppercase tracking-wider">Production Breakdown</span>
                                                        <span className="text-[10px] text-muted-foreground">Detailed calculation for Generator {generator.id + 1}</span>
                                                    </div>

                                                    <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-xs">
                                                        <span className="text-muted-foreground">Owned</span>
                                                        <span className="text-foreground font-mono font-bold">{formatNumber(generator.amount, { precision: 2 })}</span>

                                                        <span className="text-muted-foreground">Base Rate</span>
                                                        <span className="text-foreground font-mono">
                                                            {formatNumber(productionPerSecond.div(generator.amount.max(1)))} / s
                                                        </span>

                                                        <span className="text-muted-foreground">Milestone Rewards</span>
                                                        <span className="text-purple-400 font-mono font-bold">+{formatNumber(new Decimal(generator.id + 1).times(insightMultiplier))} Insight</span>
                                                    </div>

                                                    <div className="h-px bg-border/50 my-1"></div>

                                                    <div className="grid grid-cols-[1fr_auto] gap-x-4 items-center">
                                                        <span className="text-xs font-bold text-foreground">Total Output</span>
                                                        <div className="flex flex-col items-end leading-none">
                                                            <span className="text-sm font-bold text-primary">
                                                                {formatNumber(productionPerSecond)}
                                                                <span className="text-[10px] font-normal text-muted-foreground ml-1">/s</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>

                                {/* 3. Milestone Block */}
                                <div className="w-full lg:col-span-1 flex flex-col items-center justify-center">
                                    <Badge variant="secondary" className="text-[10px] md:text-xs px-1.5 md:px-2 py-0 h-5 md:h-6 bg-primary/10 text-primary border-primary/20 pointer-events-none mb-1">
                                        Rank {level}
                                    </Badge>
                                    <span className="text-[9px] md:text-[10px] text-muted-foreground uppercase tracking-wider">Milestones</span>
                                </div>

                                {/* 4. Owned Block */}
                                <div className="w-full lg:col-span-1 flex flex-col items-center justify-center">
                                    <span className="text-foreground font-mono font-bold text-sm md:text-base">{formatNumber(generator.amount)}</span>
                                    <span className="text-[9px] md:text-[10px] text-muted-foreground uppercase tracking-wider">Owned</span>
                                </div>

                                {/* 5. Next Milestone Block */}
                                <div className="w-full lg:col-span-2 flex flex-col items-center justify-center">
                                    <span className="font-mono text-foreground/80 text-[10px] md:text-xs whitespace-nowrap">
                                        {formatNumber(Decimal.min(currentVal, nextVal).sub(nextMilestone.prev || 0))}<span className="opacity-50 mx-0.5">/</span>{formatNumber(nextVal.sub(nextMilestone.prev || 0))}
                                    </span>
                                    <div className="text-[9px] md:text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1 justify-center whitespace-nowrap">
                                        Next: <span className="text-purple-400 font-bold">+{formatNumber(new Decimal(generator.id + 1).times(insightMultiplier))}</span>
                                    </div>
                                </div>

                                {/* 6. Action Button Block */}
                                <div className="w-full lg:col-span-3 flex items-center justify-center lg:justify-end gap-2">
                                    <TooltipProvider>
                                        <Tooltip delayDuration={200}>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    onClick={() => isActive ? deactivateOverclock(generator.id) : setIsDialogOpen(true)}
                                                    variant="outline"
                                                    size={isActive ? "default" : "icon"}
                                                    className={`h-11 transition-all duration-300 relative ${isActive ? 'w-28 gap-2 bg-red-500/20 text-red-500 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'w-11 bg-muted/10 text-muted-foreground border-zinc-800 hover:border-zinc-700 hover:text-foreground'}`}
                                                >
                                                    <Zap size={20} className={isActive ? 'fill-current animate-pulse' : ''} />
                                                    {isActive && (
                                                        <span className="font-mono font-bold text-sm tabular-nums">
                                                            {formatTime(timeLeft)}
                                                        </span>
                                                    )}
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-zinc-950 border-red-500/20 p-3">
                                                <div className="text-xs space-y-1">
                                                    <div className="font-bold text-red-500 uppercase tracking-widest text-[9px]">Experimental Overclock</div>
                                                    {isActive ? (
                                                        <p className="text-zinc-400">Click to <span className="text-white font-bold">Abort</span>. Ends in {formatTime(timeLeft)}.</p>
                                                    ) : (
                                                        <p className="text-zinc-400">Force the generator beyond temporal limits.</p>
                                                    )}
                                                    <div className="flex justify-between gap-4 pt-1">
                                                        <span className="text-emerald-400 font-bold">Production: x5</span>
                                                        <span className="text-red-400 font-bold">Stability Cost: x5</span>
                                                    </div>
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>

                                    <OverclockDialog
                                        isOpen={isDialogOpen}
                                        onClose={() => setIsDialogOpen(false)}
                                        onConfirm={(duration) => {
                                            activateOverclock(generator.id, duration);
                                            setIsDialogOpen(false);
                                        }}
                                        generator={generator}
                                        baseMaintenanceRate={baseMaintenanceRate}
                                        reservoirFragments={reservoirFragments}
                                    />

                                    <Button
                                        onClick={() => buyGenerator(generator.id)}
                                        disabled={!canAfford}
                                        variant={canAfford ? "default" : "secondary"}
                                        className={`flex-1 min-w-[120px] max-w-[180px] h-auto py-2.5 md:py-2 px-4 flex flex-row lg:flex-col items-center justify-center gap-3 lg:gap-0 ${!canAfford && "opacity-50"}`}
                                    >
                                        <span className="text-sm font-bold">Buy</span>
                                        <div className="flex items-center gap-1.5 lg:gap-0">
                                            <span className="text-xs font-mono font-bold lg:font-normal opacity-90 lg:opacity-80">
                                                {formatNumber(cost)}
                                            </span>
                                        </div>
                                    </Button>
                                </div>
                            </div>

                            {/* Badges Section */}
                            {(research[`gen${generator.id + 1}_speed`] > 0 || research[`gen${generator.id + 1}_eff`] > 0) && (
                                <div className="flex flex-col w-full">
                                    <Separator className="opacity-50" />
                                    <div className="px-4 py-1.5 flex flex-wrap gap-2 bg-muted/20">
                                        {research[`gen${generator.id + 1}_speed`] > 0 && (
                                            <Badge variant="outline" className="text-[10px] h-5 bg-purple-500/5 text-purple-400 border-purple-500/20 pointer-events-none">
                                                Overclock Rank {research[`gen${generator.id + 1}_speed`]}
                                            </Badge>
                                        )}
                                        {research[`gen${generator.id + 1}_eff`] > 0 && (
                                            <Badge variant="outline" className="text-[10px] h-5 bg-purple-500/5 text-purple-400 border-purple-500/20 pointer-events-none">
                                                Efficiency Rank {research[`gen${generator.id + 1}_eff`]}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-56 bg-zinc-950 border-zinc-800 text-zinc-100 shadow-2xl">
                    <div className="px-2 py-1.5 text-[10px] uppercase font-black text-zinc-500 tracking-widest border-b border-zinc-900 mb-1">
                        Generator {generator.id + 1}
                    </div>
                    <ContextMenuItem
                        onClick={() => setIsDetailsOpen(true)}
                        className="flex items-center gap-2 px-2 py-1.5 cursor-pointer focus:bg-accent focus:text-accent-foreground"
                    >
                        <Info className="h-4 w-4 text-primary" />
                        <span className="font-bold">Informações</span>
                    </ContextMenuItem>
                    <ContextMenuItem
                        onClick={() => isActive ? deactivateOverclock(generator.id) : setIsDialogOpen(true)}
                        className="flex items-center gap-2 px-2 py-1.5 cursor-pointer focus:bg-accent focus:text-accent-foreground"
                    >
                        <Zap className={`h-4 w-4 ${isActive ? 'text-red-500' : 'text-zinc-500'}`} />
                        <span className="font-bold">{isActive ? 'Desativar Overclock' : 'Ativar Overclock'}</span>
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>

            <GeneratorDetailsDialog
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                generator={generator}
                productionPerSecond={productionPerSecond}
                baseMaintenanceRate={baseMaintenanceRate}
                nextMilestone={nextMilestone}
                isActive={isActive}
                research={research}
            />
        </>
    );

};

const arePropsEqual = (prevProps, nextProps) => {
    if (prevProps.canAfford !== nextProps.canAfford) return false;
    if (!prevProps.generator.amount.eq(nextProps.generator.amount)) return false;
    if (!prevProps.cost.eq(nextProps.cost)) return false;
    if (!prevProps.productionPerSecond.eq(nextProps.productionPerSecond)) return false;

    if (prevProps.isOverclocked !== nextProps.isOverclocked) return false;

    return true;
};

export default memo(GeneratorRow, arePropsEqual);
