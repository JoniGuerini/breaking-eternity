import React from 'react';
import { useGame } from '../game/gameState';
import { Button } from "@/components/ui/button";

import { formatNumber } from '../utils/formatUtils';

const ResourceDisplay = () => {
    const { gameState, manualClick } = useGame();

    return (
        <div className="mb-8 text-center flex flex-col items-center gap-4">
            {/* Button - Re-enable pointer events for the button */}
            {gameState.generators[0].amount.lte(0) && gameState.iterons.lt(1) && (
                <div className="pointer-events-auto">
                    <Button
                        onClick={manualClick}
                        size="lg"
                        className="font-bold text-base px-8 py-6 rounded-full shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_40px_rgba(var(--primary),0.5)] transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                        Claim 1 Fragment
                    </Button>
                </div>
            )}
        </div>
    );
};

export default ResourceDisplay;
