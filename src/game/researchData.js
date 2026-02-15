import Decimal from 'break_eternity.js';
import { formatTime, formatNumber } from '../utils/formatUtils';
import { GENERATOR_NAMES } from './generatorData';

export const RESEARCH_DATA = Array.from({ length: 50 }, (_, i) => {
    const genIndex = i;
    const genNum = i + 1;

    // Logistics Research (Maintenance Buffer)
    const speedItem = {
        id: `gen${genNum}_speed`,
        name: `Logistics Buffer`,
        target: GENERATOR_NAMES[genIndex],
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
        name: `Fragment Refinement`,
        target: GENERATOR_NAMES[genIndex],
        type: 'Efficiency',
        maxLevel: 100, // Efficiency can be much higher
        // Efficiency costs 2x base, 1.5x growth (was 5x, 2.5x)
        getCost: (level) => new Decimal(Math.pow(genNum, 2) * 2).times(new Decimal(1.5).pow(level)),
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
        name: `Eternity Resonance`,
        target: GENERATOR_NAMES[genIndex],
        type: 'Resonance',
        maxLevel: 100, // Expanded from 10 to 100
        // Lower cost multiplier (10x base, 2x growth)
        getCost: (level) => new Decimal(Math.pow(genNum, 2) * 10).times(new Decimal(2.0).pow(level)),
        getValue: (level) => Decimal.pow(2, level),
        baseDescription: "Doubles Insight results from milestones",
        getEffectValues: (level) => {
            return {
                current: `x${formatNumber(Decimal.pow(2, level))}`,
                next: `x${formatNumber(Decimal.pow(2, level + 1))}`
            };
        },
        getEffectDisplay: (level) => `x${formatNumber(Decimal.pow(2, level))}`,
        condition: (gameState) => {
            const gen = gameState.generators[genIndex];
            return gen && gen.amount.gt(0);
        }
    };

    return [effItem, resonanceItem];
}).flat();
