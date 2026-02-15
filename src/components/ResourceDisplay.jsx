import React from 'react';
import { useGame } from '../game/gameState';
import { Button } from "@/components/ui/button";

import { formatNumber } from '../utils/formatUtils';

const ResourceDisplay = () => {
    const { gameState, manualClick } = useGame();

    const showButton = gameState.generators[0].amount.lte(0) && gameState.eternityFragments.lt(1);

    if (!showButton) return null;

    return (
        <div className="text-center flex flex-col items-center gap-4">
            <div className="pointer-events-auto">
                <Button
                    onClick={manualClick}
                    size="lg"
                    className="font-bold text-base px-8 py-6 rounded-full shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_40px_rgba(var(--primary),0.5)] transition-all duration-300 hover:scale-105 active:scale-95"
                >
                    Claim 1 Eternity Fragment
                </Button>
            </div>
        </div>
    );
};

export default ResourceDisplay;
