import Decimal from 'break_eternity.js';
import { formatTime } from '../utils/formatUtils';

export const RESEARCH_DATA = Array.from({ length: 50 }, (_, i) => {
    const genIndex = i;
    const genNum = i + 1;

    // Logistics Research (Maintenance Buffer)
    const speedItem = {
        id: `gen${genNum}_speed`,
        name: `Logistics Buffer ${genNum}`,
        target: `Generator ${genNum}`,
        type: 'Logistics',
        maxLevel: 20,
        getCost: (level) => new Decimal(Math.pow(genNum, 2)).times(new Decimal(2).pow(level)),
        getValue: (level) => level * 0.01,
        baseDescription: "Reduces maintenance by 0.01/s",
        getEffectValues: (level) => {
            const current = level * 0.01;
            const next = (level + 1) * 0.01;
            return {
                current: `-${current.toFixed(2)}/s`,
                next: `-${next.toFixed(2)}/s`
            };
        },
        getEffectDisplay: (level) => {
            const val = level * 0.01;
            return `-${val.toFixed(2)} maintenance`;
        },
        condition: (gameState) => {
            const gen = gameState.generators[genIndex];
            return gen && gen.amount.gt(0);
        }
    };

    // Efficiency Research (Yield Optimization)
    const effItem = {
        id: `gen${genNum}_eff`,
        name: `Fragment Refinement ${genNum}`,
        target: `Generator ${genNum}`,
        type: 'Efficiency',
        maxLevel: 100, // Efficiency can be much higher
        // Efficiency costs 5x more than Speed base
        getCost: (level) => new Decimal(Math.pow(genNum, 2) * 5).times(new Decimal(2.5).pow(level)),
        getValue: (level) => 1 + level,
        baseDescription: "Increases fragment yield by 100%",
        getEffectValues: (level) => {
            return {
                current: `x${level + 1}`,
                next: `x${level + 2}`
            };
        },
        getEffectDisplay: (level) => `x${level + 1}`,
        condition: (gameState) => {
            const gen = gameState.generators[genIndex];
            return gen && gen.amount.gt(0);
        }
    };

    // Resonance Research (Insight Multiplier)
    const resonanceItem = {
        id: `gen${genNum}_resonance`,
        name: `Eternity Resonance ${genNum}`,
        target: `Generator ${genNum}`,
        type: 'Resonance',
        maxLevel: 10, // Multiplier caps at x1024 (2^10)
        // High cost multiplier (4x base, 3x growth)
        getCost: (level) => new Decimal(Math.pow(genNum, 2) * 20).times(new Decimal(3.5).pow(level)),
        getValue: (level) => Math.pow(2, level),
        baseDescription: "Doubles Insight results from milestones",
        getEffectValues: (level) => {
            return {
                current: `x${Math.pow(2, level)}`,
                next: `x${Math.pow(2, level + 1)}`
            };
        },
        getEffectDisplay: (level) => `x${Math.pow(2, level)}`,
        condition: (gameState) => {
            const gen = gameState.generators[genIndex];
            return gen && gen.amount.gt(0);
        }
    };

    return [speedItem, effItem, resonanceItem];
}).flat();
