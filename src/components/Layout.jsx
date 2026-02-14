import React from 'react';
import { useGame } from '../game/gameState';
import { Button } from "@/components/ui/button";
import { formatNumber, formatTime } from '../utils/formatUtils';

import FPSCounter from './FPSCounter';

const SaveControls = () => {
    const game = useGame();

    // Graceful fallback if context isn't available
    if (!game) return null;

    const { saveGame, hardReset } = game;

    return (
        <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={saveGame} className="border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300">
                Save
            </Button>
            <Button variant="destructive" size="sm" onClick={hardReset} className="opacity-80 hover:opacity-100">
                Reset
            </Button>
        </div>
    );
};

const HeaderResourceDisplay = () => {
    const game = useGame();
    if (!game) return null;
    const { gameState, calculateProduction } = game;

    // Calculate production per second for display
    const productionPerSecond = calculateProduction();

    return (
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none flex items-center gap-2 md:gap-6 w-[calc(100%-20px)] md:w-auto justify-center">
            {/* Main Integer Display (Iterons) */}
            <div className="flex items-center gap-1.5 md:gap-3">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground drop-shadow-md font-mono">
                    {formatNumber(gameState.iterons, { growthRate: productionPerSecond })}
                </h1>

                {/* Velocity / Rate Display */}
                <div className="flex flex-col items-start leading-none opacity-80">
                    <div className="text-[11px] md:text-sm font-bold text-primary">
                        +{formatNumber(productionPerSecond)}/s
                    </div>
                    <div className="text-[9px] md:text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                        Eternity Fragments
                    </div>
                </div>
            </div>

            {/* Secondary Display (Insights) */}
            {(gameState.insight.gt(0) || gameState.generators[0].amount.gte(10)) && (
                <div className="flex items-center gap-1 md:gap-2 border-l border-border/30 pl-2 md:pl-6">
                    <div className="flex flex-col items-end leading-none">
                        <span className="text-base md:text-xl font-bold text-purple-400 font-mono">
                            {formatNumber(gameState.insight)}
                        </span>
                        <span className="text-[8px] md:text-[9px] text-purple-400 font-bold uppercase tracking-widest">
                            Insights
                        </span>
                    </div>
                </div>
            )}

            {/* Talent Points Display */}
            {(gameState.talentPoints > 0 || gameState.experimentRank > 1) && (
                <div className="flex items-center gap-1 md:gap-2 border-l border-border/30 pl-2 md:pl-6">
                    <div className="flex flex-col items-end leading-none">
                        <span className="text-base md:text-xl font-black text-emerald-400 font-mono">
                            {gameState.talentPoints}
                        </span>
                        <span className="text-[8px] md:text-[9px] text-emerald-400 font-bold uppercase tracking-widest leading-none">
                            Talent Points
                        </span>
                    </div>
                </div>
            )}

            {/* Stability Reservoir Remaining Time */}
            {(gameState.treasuryIterons.gt(0) || gameState.generators.some(g => g.amount.gt(0))) && (
                <div className="flex items-center gap-1 md:gap-2 border-l border-border/30 pl-2 md:pl-6">
                    <div className="flex flex-col items-end leading-none">
                        <span className={`text-base md:text-xl font-bold font-mono ${gameState.treasuryIterons.lte(0) ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`}>
                            {(() => {
                                const maintenanceRate = game.getMaintenanceRate();
                                const expansionLevel = gameState.talents?.['reservoir_expansion'] || 0;
                                const expansionMult = 1 + (expansionLevel * 0.2);
                                const timeRemaining = maintenanceRate.gt(0)
                                    ? gameState.treasuryIterons.div(maintenanceRate).toNumber() * expansionMult
                                    : 0;

                                return maintenanceRate.gt(0) ? formatTime(Math.floor(timeRemaining)) : "∞";
                            })()}
                        </span>
                        <span className="text-[8px] md:text-[9px] text-muted-foreground font-bold uppercase tracking-widest leading-none">
                            Stability
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

const Layout = ({ children }) => {
    return (
        <div className="h-screen w-screen bg-background text-foreground font-sans flex flex-col relative overflow-hidden">
            {/* Header - Fixed */}
            <header className="flex-none w-full px-4 md:px-8 py-3 md:py-4 flex justify-between items-center z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
                <div className="text-left z-10">
                    <h1 className="text-lg md:text-xl font-extrabold tracking-tight text-primary select-none hidden sm:block">
                        Breaking Eternity
                    </h1>
                </div>

                {/* Center Display */}
                <HeaderResourceDisplay />

                {/* Desktop Controls: Top Right */}
                <div className="hidden md:flex z-10 w-[200px] justify-end items-center">
                    <FPSCounter />
                </div>
            </header>

            {/* Main Content - Full Screen */}
            {/* Main Content - Takes remaining space */}
            <div className="flex-1 w-full relative z-10 overflow-hidden">
                <main className="h-full w-full">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
