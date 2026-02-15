import React from 'react';
import { useGame } from '../game/gameState';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Landmark, TrendingDown, Clock, ArrowBigUpDash, Coins, AlertTriangle } from 'lucide-react';
import { formatNumber, formatTime } from '../utils/formatUtils';
import { GENERATOR_NAMES } from '../game/generatorData';
import Decimal from 'break_eternity.js';

const ChronosView = () => {
    const { gameState, depositInReservoir, getMaintenanceRate, getGeneratorMaintenance } = useGame();
    const { eternityFragments, reservoirEternityFragments, generators } = gameState;

    const maintenanceRate = getMaintenanceRate();
    const expansionLevel = gameState.talents?.['reservoir_expansion'] || 0;
    const expansionMult = 1 + (expansionLevel * 0.2);

    const timeRemaining = maintenanceRate.gt(0)
        ? reservoirEternityFragments.div(maintenanceRate).toNumber() * expansionMult
        : 0;


    const isDepleted = reservoirEternityFragments.lte(0) && maintenanceRate.gt(0);

    // Calculate per-generator maintenance
    const genMaintenance = generators.map((gen, i) => {
        if (gen.amount.lte(0)) return null;
        const cost = getGeneratorMaintenance(i);
        if (cost.lte(0)) return null;
        return { id: i, cost };
    }).filter(Boolean);

    return (
        <div className="w-full space-y-4 pb-32 h-full overflow-y-auto custom-scrollbar">
            {/* Main Reservoir Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                <div className="space-y-4 h-full">
                    {isDepleted && (
                        <header className="flex justify-end">
                            <div className="flex items-center gap-2 text-xs font-bold text-destructive bg-destructive/10 px-3 py-1.5 rounded-lg border border-destructive/20 animate-pulse">
                                <AlertTriangle className="w-4 h-4" />
                                RESERVOIR EMPTY - ETERNITY COLLAPSING
                            </div>
                        </header>
                    )}

                    <Card className="border border-border shadow-sm overflow-hidden bg-card h-full flex flex-col justify-between">
                        <div className="p-4 md:p-6 space-y-6 flex-1 flex flex-col justify-center">
                            <div className="flex flex-col items-center text-center space-y-6">
                                {/* Unified Info Area */}
                                <div className="space-y-4 w-full">
                                    <div className="flex flex-col items-center">
                                        <div className="text-primary bg-primary/10 p-3 rounded-full mb-4">
                                            <Clock size={32} />
                                        </div>
                                        <h3 className="text-4xl font-mono font-black tracking-tighter text-foreground">
                                            {maintenanceRate.gt(0) ? formatTime(Math.floor(timeRemaining)) : "∞"}
                                        </h3>
                                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">
                                            Stability Remaining
                                        </span>
                                    </div>

                                    <div className="w-full py-3 px-6 rounded-2xl bg-muted/30 border border-border/50 text-sm">
                                        <p className="text-muted-foreground leading-relaxed">
                                            You have <span className="text-foreground font-black">{formatNumber(reservoirEternityFragments)}</span> Eternity Fragments infused,
                                            maintaining reality synchronization for the next <span className="text-primary font-black">{maintenanceRate.gt(0) ? formatTime(Math.floor(timeRemaining)) : "eternity"}</span>.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Infusion Controls (Compact) */}
                        <div className="pt-4 pb-4 px-4 md:px-6 border-t border-border/30 mt-auto">
                            <div className="flex flex-col gap-3">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-center text-muted-foreground/50">Infusion Controls</span>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        variant="outline"
                                        className="bg-background/50 border h-9 text-xs font-bold hover:bg-primary hover:text-primary-foreground"
                                        onClick={() => depositInReservoir(maintenanceRate.times(3600))}
                                        disabled={eternityFragments.lt(maintenanceRate.times(3600)) || maintenanceRate.lte(0)}
                                    >
                                        1 Hour
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="bg-background/50 border h-9 text-xs font-bold hover:bg-primary hover:text-primary-foreground"
                                        onClick={() => depositInReservoir(maintenanceRate.times(3600 * 6))}
                                        disabled={eternityFragments.lt(maintenanceRate.times(3600 * 6)) || maintenanceRate.lte(0)}
                                    >
                                        6 Hours
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="bg-background/50 border h-9 text-xs font-bold hover:bg-primary hover:text-primary-foreground"
                                        onClick={() => depositInReservoir(maintenanceRate.times(3600 * 12))}
                                        disabled={eternityFragments.lt(maintenanceRate.times(3600 * 12)) || maintenanceRate.lte(0)}
                                    >
                                        12 Hours
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="bg-background/50 border h-9 text-xs font-bold hover:bg-primary hover:text-primary-foreground"
                                        onClick={() => depositInReservoir(maintenanceRate.times(3600 * 24))}
                                        disabled={eternityFragments.lt(maintenanceRate.times(3600 * 24)) || maintenanceRate.lte(0)}
                                    >
                                        24 Hours
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="col-span-2 bg-background/50 border h-9 text-xs font-black shadow-sm hover:bg-primary hover:text-primary-foreground text-primary"
                                        onClick={() => depositInReservoir('all')}
                                        disabled={eternityFragments.lte(0)}
                                    >
                                        <ArrowBigUpDash className="w-4 h-4 mr-1.5" />
                                        INFUSE ALL
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Stability Report Column */}
                <div className="h-full">
                    {genMaintenance.length > 0 ? (
                        <Card className="border border-border bg-card shadow-sm overflow-hidden h-full flex flex-col">
                            <CardHeader className="bg-muted/30 py-4 flex-none">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <TrendingDown className="w-4 h-4 text-primary" />
                                        <CardTitle className="text-sm font-bold uppercase tracking-wider">Stability Report</CardTitle>
                                    </div>
                                    <div className="text-xs font-mono font-bold text-red-500">
                                        Total Consumption: -{formatNumber(maintenanceRate)}/s
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 flex-1 overflow-y-auto max-h-[400px] custom-scrollbar">
                                <div className="divide-y divide-border/30">
                                    {genMaintenance.map((item) => (
                                        <div key={item.id} className="grid grid-cols-2 gap-4 px-6 py-3 items-center hover:bg-muted/10 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400">
                                                    #{item.id + 1}
                                                </div>
                                                <span className="text-xs font-bold text-foreground/80">{GENERATOR_NAMES[item.id]}</span>
                                            </div>
                                            <div className="flex justify-end items-center gap-2">
                                                <span className="text-xs font-mono font-bold text-red-500">-{formatNumber(item.cost)}/s</span>
                                                <span className="text-[10px] font-medium text-muted-foreground w-12 text-right">
                                                    {maintenanceRate.gt(0)
                                                        ? ((item.cost.toNumber() / maintenanceRate.toNumber()) * 100).toFixed(1)
                                                        : 0}%
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="h-full border border-dashed border-border/50 rounded-xl flex items-center justify-center p-6 text-muted-foreground bg-muted/10">
                            <span className="text-sm font-medium">No active generators consuming stability.</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Educational Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-24">
                <Card className="bg-card border border-border shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            < Landmark className="w-4 h-4 text-primary" />
                            Reservoir Rules
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground space-y-3 leading-relaxed">
                        <p>To keep reality stable while you are away, the Void requires a steady flow of <strong>Eternity Fragments</strong>.</p>
                        <p>The stabilization cost is based on the <strong>current Rank and Tier</strong> of each generator. Each improvement (Speed, Efficiency, Resonance) adds an <strong>Upgrade Tax</strong> to the maintenance cost.</p>
                    </CardContent>
                </Card>

                <Card className="bg-card border border-border shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" />
                            Sync Priority
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground space-y-3 leading-relaxed">
                        <p>If the reservoir balance reaches zero, production will cease immediately to prevent the collapse of Eternity.</p>
                        <p>Ensure the reservoir is always infused before breaking the connection.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ChronosView;
