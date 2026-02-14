import React from 'react';
import { useGame } from '../game/gameState';
import GeneratorRow from './GeneratorRow';
import { ScrollArea } from "@/components/ui/scroll-area";

const GeneratorList = () => {
    const {
        gameState,
        getGeneratorCost,
        buyGenerator,
        calculateMultiplier,
        getNextMilestone,
        getGeneratorProduction,
        activateOverclock,
        deactivateOverclock,
        getMaintenanceRate
    } = useGame();

    return (
        <div className="w-full h-full flex flex-col pb-4">
            <h2 className="text-2xl font-bold bg-background text-foreground mb-4 tracking-tight shrink-0">Generators</h2>

            <ScrollArea className="flex-1 w-full [&_[data-orientation=vertical]]:hidden">
                <div className="space-y-4">
                    {/* Logic: Show all owned generators + the next one in the sequence */}
                    {(() => {
                        const maxOwnedId = gameState.generators.reduce((max, gen) => {
                            return gen.amount.gt(0) && gen.id > max ? gen.id : max;
                        }, -1); // Default to -1 if none are owned

                        return gameState.generators.filter(gen => gen.id <= maxOwnedId + 1).map((gen) => {
                            const cost = getGeneratorCost(gen.id);
                            const canAfford = gameState.iterons.gte(cost);
                            const multiplier = calculateMultiplier(gen.amount);
                            const nextMilestone = getNextMilestone(gen.amount);
                            const productionPerSecond = getGeneratorProduction(gen.id);

                            return (
                                <GeneratorRow
                                    key={gen.id}
                                    generator={gen}
                                    cost={cost}
                                    canAfford={canAfford}
                                    multiplier={multiplier}
                                    nextMilestone={nextMilestone}
                                    productionPerSecond={productionPerSecond}
                                    buyGenerator={buyGenerator}
                                    research={gameState.research || {}}
                                    isOverclocked={gameState.overclockActive?.[gen.id]}
                                    activateOverclock={activateOverclock}
                                    deactivateOverclock={deactivateOverclock}
                                    getMaintenanceRate={getMaintenanceRate}
                                    reservoirFragments={gameState.treasuryIterons}
                                />
                            );
                        });
                    })()}
                </div>
            </ScrollArea>
        </div>
    );
};

export default GeneratorList;
