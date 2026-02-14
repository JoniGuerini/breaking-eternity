import React from 'react';
import { useGame } from '../game/gameState';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Landmark, TrendingDown, Clock, ArrowBigUpDash, Coins, AlertTriangle } from 'lucide-react';
import { formatNumber, formatTime } from '../utils/formatUtils';
import Decimal from 'break_eternity.js';

const ChronosView = () => {
    const { gameState, depositInTreasury, getMaintenanceRate } = useGame();
    const { iterons, treasuryIterons } = gameState;

    const maintenanceRate = getMaintenanceRate();
    const expansionLevel = gameState.talents?.['reservoir_expansion'] || 0;
    const expansionMult = 1 + (expansionLevel * 0.2);

    const timeRemaining = maintenanceRate.gt(0)
        ? treasuryIterons.div(maintenanceRate).toNumber() * expansionMult
        : 0;


    const isDepleted = treasuryIterons.lte(0) && maintenanceRate.gt(0);

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8 pb-32 fade-in-animation h-full overflow-y-auto">
            {/* Main Treasury Dashboard */}
            <div className="space-y-6">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Landmark className="w-5 h-5 text-primary" />
                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Eternity Stabilization System</span>
                        </div>
                        <h2 className="text-4xl font-black tracking-tighter">The Eternity Reservoir</h2>
                    </div>
                    {isDepleted && (
                        <div className="flex items-center gap-2 text-xs font-bold text-destructive bg-destructive/10 px-3 py-1.5 rounded-lg border border-destructive/20 animate-pulse">
                            <AlertTriangle className="w-4 h-4" />
                            RESERVOIR EMPTY - ETERNITY COLLAPSING
                        </div>
                    )}
                </header>

                <Card className="border-2 border-primary/10 shadow-lg overflow-hidden bg-card/50 backdrop-blur-sm">
                    <div className="p-4 md:p-6 space-y-6">
                        <div className="flex flex-col items-center text-center space-y-6">
                            {/* Unified Info Area */}
                            <div className="space-y-4">
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

                                <div className="max-w-md mx-auto py-3 px-6 rounded-2xl bg-muted/30 border border-border/50 text-sm">
                                    <p className="text-muted-foreground leading-relaxed">
                                        You have <span className="text-foreground font-black">{formatNumber(treasuryIterons)}</span> Fragments infused,
                                        maintaining reality synchronization for the next <span className="text-primary font-black">{maintenanceRate.gt(0) ? formatTime(Math.floor(timeRemaining)) : "eternity"}</span>.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Infusion Controls (Compact) */}
                        <div className="pt-4 border-t border-border/30">
                            <div className="flex flex-col gap-3">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-center text-muted-foreground/50">Infusion Controls</span>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    <Button
                                        variant="outline"
                                        className="bg-background/50 border h-9 text-xs font-bold hover:bg-primary hover:text-primary-foreground"
                                        onClick={() => depositInTreasury(maintenanceRate.times(3600))}
                                        disabled={iterons.lt(maintenanceRate.times(3600)) || maintenanceRate.lte(0)}
                                    >
                                        1 Hour
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="bg-background/50 border h-9 text-xs font-bold hover:bg-primary hover:text-primary-foreground"
                                        onClick={() => depositInTreasury(maintenanceRate.times(3600 * 10))}
                                        disabled={iterons.lt(maintenanceRate.times(3600 * 10)) || maintenanceRate.lte(0)}
                                    >
                                        10 Hours
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="bg-background/50 border h-9 text-xs font-bold hover:bg-primary hover:text-primary-foreground"
                                        onClick={() => depositInTreasury(maintenanceRate.times(3600 * 24))}
                                        disabled={iterons.lt(maintenanceRate.times(3600 * 24)) || maintenanceRate.lte(0)}
                                    >
                                        24 Hours
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="bg-background/50 border-2 border-primary/30 h-9 text-xs font-black shadow-sm hover:bg-primary hover:text-primary-foreground text-primary"
                                        onClick={() => depositInTreasury('all')}
                                        disabled={iterons.lte(0)}
                                    >
                                        <ArrowBigUpDash className="w-4 h-4 mr-1.5" />
                                        INFUSE ALL
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Educational Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-24">
                <Card className="bg-muted/20 border-border/50">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            < Landmark className="w-4 h-4 text-primary" />
                            Reservoir Rules
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground space-y-3 leading-relaxed">
                        <p>To keep reality stable while you are away, the Void requires a steady flow of <strong>Eternity Fragments</strong>.</p>
                        <p>The base stabilization cost is only <strong>2% of the base production</strong> of each Generator. Use <strong>Reservoir Optimization</strong> research to reduce this value even further.</p>
                    </CardContent>
                </Card>

                <Card className="bg-muted/20 border-border/50">
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
