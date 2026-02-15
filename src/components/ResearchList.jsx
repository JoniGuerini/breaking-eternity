import React from 'react';
import { useGame } from '../game/gameState';
import { RESEARCH_DATA } from '../game/researchData';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { formatNumber } from '../utils/formatUtils';
import Decimal from 'break_eternity.js';

const ResearchCard = ({ research, gameState, buyResearch }) => {
    const currentLevel = gameState.research[research.id] || 0;
    const isMaxed = currentLevel >= research.maxLevel;
    const cost = isMaxed ? new Decimal(0) : research.getCost(currentLevel);
    const canAfford = !isMaxed && gameState.insight.gte(cost);

    // Calculate progress pct
    let progress = 0;
    if (!isMaxed) {
        if (gameState.insight.gte(cost)) {
            progress = 100;
        } else {
            progress = gameState.insight.div(cost).times(100).toNumber();
        }
    } else {
        progress = 100;
    }

    return (
        <Card className={`relative overflow-hidden transition-all duration-300 ${isMaxed ? 'bg-muted/30 border-border opacity-70' : 'bg-card border-border hover:bg-accent/50 hover:border-border/80 shadow-sm'}`}>
            <div className="p-5 flex flex-col h-full justify-between gap-4">
                <div>
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex flex-col">
                            {/* Removed redundant type label */}
                            <h3 className={`font-bold text-lg leading-none tracking-tight uppercase ${isMaxed ? 'text-muted-foreground' : 'text-foreground'}`}>
                                {research.type}
                            </h3>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                            {isMaxed && (
                                <Badge variant="secondary" className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-700 uppercase font-bold tracking-wider mb-1">
                                    MAXED
                                </Badge>
                            )}
                            <span className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded border border-border/50">
                                Rank {currentLevel} <span className="text-zinc-600">/</span> {research.maxLevel}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {research.baseDescription || research.name}
                        </p>

                        {isMaxed ? (
                            <div className="text-xs font-mono bg-primary/5 text-primary/80 border border-primary/10 p-2 rounded flex items-center justify-between">
                                <span className="uppercase tracking-wider font-bold text-xs">Effect</span>
                                <span className="font-bold">{research.getEffectDisplay(currentLevel)}</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between text-xs font-mono bg-muted/30 p-2 rounded border border-border/50">
                                <div className="flex flex-col">
                                    <span className="text-xs uppercase text-muted-foreground tracking-wider mb-0.5">Current</span>
                                    <span className="text-zinc-300 font-semibold">
                                        {research.getEffectValues(currentLevel).current}
                                    </span>
                                </div>
                                <div className="text-muted-foreground/50">➔</div>
                                <div className="flex flex-col items-end">
                                    <span className="text-xs uppercase text-purple-400/70 tracking-wider mb-0.5">Next</span>
                                    <span className="text-purple-400 font-bold">
                                        {research.getEffectValues(currentLevel).next}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {!isMaxed && (
                    <div className="space-y-3 mt-2">
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                                <span>Cost</span>
                                <span>
                                    {formatNumber(gameState.insight)} / {formatNumber(cost)}
                                </span>
                            </div>
                            <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden border border-border/50">
                                <div
                                    className={`h-full transition-all duration-500 ease-out ${canAfford ? 'bg-purple-500' : 'bg-purple-500/30'}`}
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>

                        <Button
                            className={`w-full font-bold tracking-wide transition-all h-9 ${canAfford ? 'bg-purple-600 hover:bg-purple-500 text-white' : 'bg-muted text-muted-foreground'}`}
                            disabled={!canAfford}
                            onClick={() => buyResearch(research.id)}
                        >
                            {canAfford ? "UPGRADE" : "LOCKED"}
                        </Button>
                    </div>
                )}
            </div>
        </Card>
    );
};

const ResearchList = () => {
    const { gameState, buyResearch } = useGame();

    // Group items by target (Generator Name)
    const groupedResearch = RESEARCH_DATA.filter(r => r.condition ? r.condition(gameState) : true).reduce((acc, curr) => {
        const key = curr.target || "General";
        if (!acc[key]) acc[key] = [];
        acc[key].push(curr);
        return acc;
    }, {});

    return (
        <div className="w-full h-full flex flex-col pb-4 text-foreground">
            <ScrollArea className="flex-1 w-full pr-4">
                <div className="flex flex-col gap-10">
                    {Object.entries(groupedResearch).map(([target, items]) => (
                        <div key={target} className="space-y-4">
                            <div className="flex items-center gap-4">
                                <h3 className="text-sm uppercase font-black tracking-widest text-primary/70 whitespace-nowrap">
                                    {target} Upgrades
                                </h3>
                                <Separator className="flex-1 opacity-20" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {items.map((research) => (
                                    <ResearchCard
                                        key={research.id}
                                        research={research}
                                        gameState={gameState}
                                        buyResearch={buyResearch}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
};

export default ResearchList;
