import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import Decimal from 'break_eternity.js';
import { RESEARCH_DATA } from './researchData';
import { TALENT_DATA, TALENT_TREE_EDGES } from './talentData';
import { MISSIONS, MISSION_TYPES } from './missionData';
import { formatNumber } from '../utils/formatUtils';

const GameContext = createContext();

const INITIAL_STATE = {
    iterons: new Decimal(0),
    insight: new Decimal(0),
    generators: Array.from({ length: 50 }, (_, i) => ({
        id: i,
        amount: new Decimal(0),
        bought: new Decimal(0),
        multiplier: new Decimal(1),
        costBase: new Decimal(1).times(new Decimal(10).pow(i)),
    })),
    lastTick: Date.now(),
    showFPS: true, // FPS counter enabled by default
    research: {}, // Map of unlocked research IDs to Levels { 'gen1_speed': 1 }
    // Treasury System (Offline)
    treasuryIterons: new Decimal(0),
    offlineGap: 0, // Seconds since last session (not claimed yet)
    isTimeShiftDismissed: false,
    activeTime: 0, // Counter for active energy gain
    talents: {}, // { talent_id: level }
    playtime: 0, // Total seconds played
    activeEnergy: new Decimal(0), // Earned while online
    stabilityEssence: new Decimal(0), // Earned from stable offline time
    focus: new Decimal(0), // Legacy support
    flux: new Decimal(0), // Legacy support
    overclockActive: {}, // { genId: boolean }
    completedMissions: [], // [id1, id2]
    missionStats: {
        totalMilestones: 0,
        consecutiveStableTime: 0
    }
};

export const GameProvider = ({ children }) => {
    const [gameState, setGameState] = useState(INITIAL_STATE);
    const stateRef = useRef(gameState); // Use ref for the game loop to avoid closure staleness

    // Sync ref with state
    stateRef.current = gameState;

    // Serialization helper
    const serializeState = (state) => {
        return JSON.stringify(state);
    };

    // Deserialization helper
    const deserializeState = (json) => {
        const parsed = JSON.parse(json);

        // Re-instantiate Decimals
        parsed.iterons = new Decimal(parsed.iterons);
        parsed.insight = parsed.insight ? new Decimal(parsed.insight) : new Decimal(0); // Migration for old saves
        parsed.generators = parsed.generators.map(g => ({
            ...g,
            amount: new Decimal(g.amount),
            bought: new Decimal(g.bought),
            multiplier: new Decimal(g.multiplier),
            costBase: new Decimal(g.costBase),
            costGrowth: new Decimal(g.costGrowth),
        }));

        parsed.treasuryIterons = new Decimal(parsed.treasuryIterons || 0);
        parsed.playtime = parsed.playtime || 0;


        // Migration: Convert Array to Object if needed
        if (Array.isArray(parsed.research)) {
            const oldResearch = parsed.research;
            parsed.research = {};
            // Map old boolean upgrades to Level 5 (half speed)
            if (oldResearch.includes('gen1_speed_1')) parsed.research['gen1_speed'] = 5;
            if (oldResearch.includes('gen2_speed_1')) parsed.research['gen2_speed'] = 5;
        }
        parsed.research = parsed.research || {};

        // Ensure legacy saves or missing fields don't break things (basic migration)
        if (!parsed.lastTick) parsed.lastTick = Date.now();
        // Removed .floor() to allow for pure decimal accumulation

        parsed.storedTime = parsed.storedTime || 0;
        parsed.maxStoredTime = parsed.maxStoredTime || parsed.storedTime || 0;
        parsed.isWarping = false; // Never start warping on load
        parsed.warpSpeed = parsed.warpSpeed || 20;
        parsed.isTimeShiftDismissed = parsed.isTimeShiftDismissed || false;

        // Talents (Pre-Rebranding Migration)
        parsed.activeEnergy = new Decimal(parsed.activeEnergy || parsed.focus || 0);
        parsed.stabilityEssence = new Decimal(parsed.stabilityEssence || parsed.flux || 0);
        parsed.activeTime = parsed.activeTime || 0;
        parsed.talents = parsed.talents || {};
        parsed.overclockActive = parsed.overclockActive || {};
        parsed.completedMissions = parsed.completedMissions || [];
        parsed.missionStats = parsed.missionStats || { totalMilestones: 0, consecutiveStableTime: 0 };

        return parsed;
    };

    const saveGame = useCallback(() => {
        try {
            const serialized = serializeState(stateRef.current);
            localStorage.setItem('chronos-iteratio-save', serialized);
            console.log('Game Saved');
        } catch (e) {
            console.error('Failed to save game:', e);
        }
    }, []);

    // --- HELPERS & LOGIC ---

    const getBaseProduction = useCallback((id) => {
        // Every generator starts producing 0.01/s of the previous tier
        // Speed upgrades were removed in favor of Maintenance Logistics
        return new Decimal(0.01);
    }, []);

    const countMaxedTalents = useCallback(() => {
        const talents = stateRef.current.talents || {};
        return TALENT_DATA.reduce((count, talent) => {
            const level = talents[talent.id] || 0;
            return level >= talent.maxLevel ? count + 1 : count;
        }, 0);
    }, []);

    const getEfficiencyMultiplier = useCallback((id) => {
        const state = stateRef.current || INITIAL_STATE;
        const research = state.research || {};
        const level = research[`gen${id + 1}_eff`] || 0;

        const refinementLevel = state.talents?.['resonance_refinement'] || 0;
        const refinementMult = 1 + (refinementLevel * 0.12);

        // Reality Anchor: +2% per maxed talent per level
        const anchorLevel = state.talents?.['reality_anchor'] || 0;
        const maxedCount = countMaxedTalents();
        const anchorMult = 1 + (anchorLevel * 0.02 * maxedCount);

        // Precision Tuning: +1% per energy per level
        const tuningLevel = state.talents?.['precision_tuning'] || 0;
        const energyCount = state.activeEnergy.toNumber();
        const tuningMult = 1 + (tuningLevel * 0.01 * energyCount);

        const nowTs = Date.now();
        const isOverclocked = state.overclockActive?.[id] && state.overclockActive[id] > nowTs && state.treasuryIterons.gt(0);
        const overclockMult = isOverclocked ? 5 : 1;

        return new Decimal(1 + level).times(refinementMult).times(anchorMult).times(tuningMult).times(overclockMult);
    }, [countMaxedTalents]);

    const getMaintenanceRate = useCallback((stateOverride) => {
        const state = stateOverride || stateRef.current;
        const research = state.research || {};
        let totalCost = new Decimal(0);

        state.generators.forEach((gen, i) => {
            if (gen.amount.gt(0)) {
                // Base Maintenance: 2% (0.02) of base production
                const baseProd = getBaseProduction(i);
                let cost = baseProd.times(gen.amount).times(0.02);

                // Overclock Penalty: 20x cost for this specific generator
                const nowTs = Date.now();
                if (state.overclockActive?.[i] && state.overclockActive[i] > nowTs) {
                    cost = cost.times(20);
                }

                // Apply Logistics reduction (10% per level multiplicative)
                const logisticsLevel = research[`gen${i + 1}_speed`] || 0;
                if (logisticsLevel > 0) {
                    const reduction = Math.pow(0.9, logisticsLevel);
                    cost = cost.times(reduction);
                }

                totalCost = totalCost.add(cost);
            }
        });

        const stasisLevel = state.talents?.['temporal_stasis'] || 0;
        const stasisMult = Math.max(0.1, 1 - (stasisLevel * 0.03));
        return totalCost.times(stasisMult);
    }, [getBaseProduction]);

    const processOfflineProduction = useCallback((loadedState) => {
        const now = Date.now();
        const gapMs = now - loadedState.lastTick;
        const gapSec = gapMs / 1000;

        if (gapSec < 60) return loadedState; // Use 60s as threshold

        const rate = getMaintenanceRate(loadedState);
        let effectiveTime = gapSec;
        let treasuryUsed = new Decimal(0);

        if (rate.gt(0)) {
            const expansionLevel = loadedState.talents?.['reservoir_expansion'] || 0;
            const expansionMult = 1 + (expansionLevel * 0.2);
            const maxAffordable = loadedState.treasuryIterons.div(rate).times(expansionMult);
            effectiveTime = Math.min(gapSec, maxAffordable.toNumber());
            treasuryUsed = rate.times(effectiveTime / expansionMult);
        } else {
            effectiveTime = 0;
        }

        const nextState = { ...loadedState };
        nextState.treasuryIterons = nextState.treasuryIterons.sub(treasuryUsed);
        nextState.playtime = (nextState.playtime || 0) + effectiveTime;

        // Award Stability Essence (1 per hour of stable time, or similar scale)
        const harvestLevel = nextState.talents?.['essence_harvest'] || 0;
        const harvestMult = 1 + (harvestLevel * 0.15);
        const essenceGained = new Decimal(effectiveTime).div(3600).times(harvestMult);
        nextState.stabilityEssence = nextState.stabilityEssence.add(essenceGained);

        const gens = nextState.generators.map(g => ({ ...g }));
        const offlineLevel = nextState.talents?.['offline_refinement'] || 0;
        const offlineMult = 1 + (offlineLevel * 0.1);

        const gen0 = gens[0];
        if (gen0.amount.gt(0)) {
            const baseProd = getBaseProduction(0);
            const effMult = getEfficiencyMultiplier(0);
            const payout = gen0.amount.times(gen0.multiplier).times(effMult).times(baseProd).times(effectiveTime).times(offlineMult);
            nextState.iterons = nextState.iterons.add(payout);
        }

        for (let i = 1; i < 50; i++) {
            const gen = gens[i];
            if (gen.amount.gt(0)) {
                const baseProd = getBaseProduction(i);
                const effMult = getEfficiencyMultiplier(i);
                const production = gen.amount.times(gen.multiplier).times(effMult).times(baseProd).times(effectiveTime).times(offlineMult);
                gens[i - 1].amount = gens[i - 1].amount.add(production);
            }
        }

        nextState.generators = gens;
        nextState.offlineResults = {
            totalGap: gapSec,
            effectiveTime: effectiveTime,
            treasuryUsed: treasuryUsed,
            depleted: effectiveTime < gapSec
        };

        return nextState;
    }, [getMaintenanceRate, getEfficiencyMultiplier, getBaseProduction]);

    const loadGame = useCallback(() => {
        try {
            const saved = localStorage.getItem('chronos-iteratio-save');
            if (saved) {
                const loadedState = deserializeState(saved);
                const stateAfterOffline = processOfflineProduction(loadedState);
                setGameState(stateAfterOffline);
                stateRef.current = stateAfterOffline;
                return stateAfterOffline;
            }
        } catch (e) {
            console.error('Failed to load game:', e);
        }
        return null;
    }, [processOfflineProduction]);

    const hardReset = useCallback(() => {
        localStorage.removeItem('chronos-iteratio-save');
        setGameState(INITIAL_STATE);
        window.location.reload(); // Reload to ensure clean slate
    }, []);

    // Auto-save loop
    useEffect(() => {
        const interval = setInterval(() => {
            saveGame();
        }, 5000); // 5 seconds
        return () => clearInterval(interval);
    }, [saveGame]);

    // Milestone Leveling Logic
    const calculateMultiplier = useCallback((amountDec) => {
        // Obsolete: Milestones now grant Insights, not production multipliers.
        return new Decimal(1);
    }, []);

    // --- GAME ACTIONS ---
    const getNextMilestone = useCallback((amountDec) => {
        const effLevel = stateRef.current.talents?.['milestone_efficiency'] || 0;
        const effMult = 1 - (effLevel * 0.02);

        const milestones = [10, 25, 50, 100];

        let milestone = new Decimal(10);
        let level = 0;
        let prev = new Decimal(0);

        if (amountDec.lt(new Decimal(10).times(effMult).ceil())) {
            return { next: new Decimal(10).times(effMult).ceil(), level: 0, prev: new Decimal(0) };
        }

        // Check static thresholds
        for (let i = 0; i < milestones.length; i++) {
            const currentM = new Decimal(milestones[i]).times(effMult).ceil();
            if (amountDec.lt(currentM)) {
                return {
                    next: currentM,
                    level: i,
                    prev: i === 0 ? new Decimal(0) : new Decimal(milestones[i - 1]).times(effMult).ceil()
                };
            }
        }

        // Doubling logic for >= 100 base
        milestone = new Decimal(100);
        level = 4;
        while (amountDec.gte(milestone.times(effMult).ceil())) {
            milestone = milestone.times(2);
            level++;
        }

        return {
            next: milestone.times(effMult).ceil(),
            level: level - 1,
            prev: milestone.div(2).times(effMult).ceil()
        };
    }, []);

    // Helper: Calculate Total Insights Earned based on current generator amounts
    const calculateTotalEarnedInsights = useCallback((generators, research) => {
        let total = new Decimal(0);
        generators.forEach((gen, index) => {
            const { level } = getNextMilestone(gen.amount);
            if (level > 0) {
                // Tier Reward = (index + 1) * Level
                const resonanceLevel = research?.[`gen${index + 1}_resonance`] || 0;
                const multiplier = Math.pow(2, resonanceLevel);

                const tierReward = new Decimal(index + 1).times(level).times(multiplier);
                total = total.add(tierReward);
            }
        });
        return total;
    }, [getNextMilestone]);

    // Helper: Calculate Total Insights Spent on Research
    const calculateTotalSpentInsights = useCallback((research) => {
        let total = new Decimal(0);
        Object.entries(research).forEach(([id, level]) => {
            const item = RESEARCH_DATA.find(r => r.id === id);
            if (item) {
                // Sum cost for all levels bought
                for (let i = 0; i < level; i++) {
                    total = total.add(item.getCost(i));
                }
            }
        });
        return total;
    }, []);



    const tick = useCallback((dt, shouldRender = true) => {
        const currentState = stateRef.current;
        let generatedIterons = new Decimal(0);

        const newGenerators = currentState.generators.map(g => ({ ...g }));

        // 1. Generator 0 produces Iterons
        const gen0 = newGenerators[0];
        if (gen0.amount.gt(0)) {
            const baseProd = getBaseProduction(0);
            const effMult = getEfficiencyMultiplier(0);
            // Amount * Multiplier * Efficiency * BaseProdPerSec * DT
            const payout = gen0.amount.times(gen0.multiplier).times(effMult).times(baseProd).times(dt);
            generatedIterons = payout;
        }

        // 2. Higher tiers produce lower tiers
        for (let i = 1; i < 50; i++) {
            const gen = newGenerators[i];
            if (gen.amount.gt(0)) {
                const baseProd = getBaseProduction(i);
                const effMult = getEfficiencyMultiplier(i);
                const production = gen.amount.times(gen.multiplier).times(effMult).times(baseProd).times(dt);

                // Add to target (i-1)
                newGenerators[i - 1].amount = newGenerators[i - 1].amount.add(production);
            }
        }

        // Update the ref
        stateRef.current = {
            ...currentState,
            generators: newGenerators,
            iterons: currentState.iterons.add(generatedIterons),
            lastTick: Date.now(),
            activeTime: (currentState.activeTime || 0) + dt,
            playtime: (currentState.playtime || 0) + dt,
            missionStats: {
                ...currentState.missionStats,
                totalMilestones: currentState.generators.reduce((sum, g) => sum + getNextMilestone(g.amount).level, 0),
                consecutiveStableTime: currentState.treasuryIterons.gt(0)
                    ? (currentState.missionStats.consecutiveStableTime || 0) + dt
                    : 0
            }
        };

        // --- OVERCLOCK EXPIRATION ---
        const nowTs = Date.now();
        Object.keys(stateRef.current.overclockActive).forEach(id => {
            if (stateRef.current.overclockActive[id] < nowTs) {
                delete stateRef.current.overclockActive[id];
            }
        });

        // --- MISSION CHECK ---
        MISSIONS.forEach(mission => {
            if (currentState.completedMissions.includes(mission.id)) return;

            let progress = new Decimal(0);
            if (mission.type === MISSION_TYPES.REACH_MILESTONES) progress = new Decimal(stateRef.current.missionStats.totalMilestones);
            if (mission.type === MISSION_TYPES.COLLECT_FRAGMENTS) progress = stateRef.current.iterons;
            if (mission.type === MISSION_TYPES.STABILITY_TIME) progress = new Decimal(stateRef.current.missionStats.consecutiveStableTime);

            if (progress.gte(mission.target)) {
                // Auto-trigger notification or just mark as ready to claim?
                // For now, let's keep it simple: player must claim in UI.
            }
        });

        // --- TALENT: Focus Gain ---
        const focusLevel = currentState.talents?.['milestone_efficiency'] || 0;
        const focusInterval = 60 - (focusLevel * 5);
        if (stateRef.current.activeTime >= focusInterval) {
            const feedbackLevel = currentState.talents?.['eternal_feedback'] || 0;
            const feedbackMult = 1 + (feedbackLevel * 0.05);
            stateRef.current.activeEnergy = stateRef.current.activeEnergy.add(feedbackMult);
            stateRef.current.activeTime -= focusInterval;
        }

        if (shouldRender) {
            setGameState(prevState => {
                let nextState = { ...prevState, ...stateRef.current };
                nextState.activeEnergy = stateRef.current.activeEnergy;
                nextState.activeTime = stateRef.current.activeTime;

                const earned = calculateTotalEarnedInsights(nextState.generators, nextState.research);
                const spent = calculateTotalSpentInsights(nextState.research);
                const expectedBalance = earned.sub(spent);

                if (nextState.insight.lt(expectedBalance)) {
                    nextState.insight = expectedBalance;
                }

                return nextState;
            });
        }
    }, [calculateTotalEarnedInsights, calculateTotalSpentInsights, getBaseProduction, getEfficiencyMultiplier]);

    const manualClick = useCallback(() => {
        setGameState((prevState) => {
            const newState = { ...prevState };
            newState.iterons = newState.iterons.add(1);

            // --- TALENT: Kinetic Link ---
            const kineticLevel = newState.talents?.['kinetic_clique'] || 0;
            if (kineticLevel > 0) {
                const bonusSeconds = kineticLevel * 0.1;
                const prod = calculateProduction(newState);
                newState.iterons = newState.iterons.add(prod.times(bonusSeconds));
            }

            return newState;
        });
    }, []);

    const buyGenerator = useCallback((id) => {
        setGameState((prevState) => {
            const newState = { ...prevState };

            // Create a deep copy of the generators array to avoid mutation
            const newGenerators = newState.generators.map(g => ({ ...g }));
            const gen = newGenerators[id];

            // Unified cost calculation to prevent UI/Logic mismatch
            const cost = getGeneratorCost(id);

            if (newState.iterons.gte(cost)) {
                // Check milestone level BEFORE purchase
                const prevMilestone = getNextMilestone(gen.amount);

                newState.iterons = newState.iterons.sub(cost);
                gen.amount = gen.amount.add(1);
                gen.bought = gen.bought.add(1);

                // Check milestone level AFTER purchase
                const newMilestone = getNextMilestone(gen.amount);

                // Award Insights if level increased
                if (newMilestone.level > prevMilestone.level) {
                    const tierReward = new Decimal(id + 1);
                    const levelsGained = new Decimal(newMilestone.level - prevMilestone.level);
                    let totalReward = tierReward.times(levelsGained);

                    // Insight Yield Talent: 5% chance per level
                    const yieldLevel = newState.talents?.['insight_yield'] || 0;
                    if (yieldLevel > 0 && Math.random() < yieldLevel * 0.05) {
                        totalReward = totalReward.add(1);
                    }

                    newState.insight = newState.insight.add(totalReward);
                }

                newGenerators[id] = gen;
                newState.generators = newGenerators;
            }

            return newState;
        });
    }, [getNextMilestone]);

    const getGeneratorCost = useCallback((id) => {
        const gen = stateRef.current.generators[id];
        // Exponential formula: Base * (1.12 ^ bought)
        return gen.costBase.times(new Decimal(1.12).pow(gen.bought));
    }, []);

    const buyResearch = useCallback((id) => {
        setGameState((prevState) => {
            const newState = { ...prevState };

            const researchItem = RESEARCH_DATA.find(r => r.id === id);
            if (!researchItem) return prevState;

            const currentLevel = newState.research[id] || 0;
            if (currentLevel >= researchItem.maxLevel) return prevState; // Maxed out

            const cost = researchItem.getCost(currentLevel);

            if (newState.insight.gte(cost)) {
                newState.insight = newState.insight.sub(cost);
                newState.research = {
                    ...newState.research,
                    [id]: currentLevel + 1
                };
            }

            return newState;
        });
    }, []);

    const getGeneratorProduction = useCallback((id) => {
        const gen = stateRef.current.generators[id];
        if (gen.amount.eq(0)) return new Decimal(0);

        const effMult = getEfficiencyMultiplier(id);
        const baseProd = getBaseProduction(id);

        return gen.amount.times(gen.multiplier).times(effMult).times(baseProd);
    }, []);

    const calculateProduction = useCallback((stateOverride) => {
        const state = stateOverride || stateRef.current || INITIAL_STATE;
        const gen0 = state.generators[0];

        if (!gen0 || !gen0.amount || gen0.amount.lte(0)) return new Decimal(0);

        const effMult = getEfficiencyMultiplier(0);
        const baseProd = getBaseProduction(0);
        return gen0.amount.times(gen0.multiplier).times(effMult).times(baseProd);
    }, [getEfficiencyMultiplier, getBaseProduction]);

    // Load on mount
    useEffect(() => {
        loadGame();
    }, []); // Empty dependency array to run ONCE on mount

    const toggleFPS = useCallback(() => {
        setGameState(prev => ({
            ...prev,
            showFPS: !prev.showFPS
        }));
    }, []);


    const depositInTreasury = useCallback((amount) => {
        setGameState(prev => {
            let toDeposit = amount;
            if (amount === 'all') toDeposit = prev.iterons;
            else toDeposit = new Decimal(amount);

            // Cap by available iterons
            toDeposit = Decimal.min(toDeposit, prev.iterons);

            if (toDeposit.lte(0)) return prev;

            return {
                ...prev,
                iterons: prev.iterons.sub(toDeposit),
                treasuryIterons: prev.treasuryIterons.add(toDeposit)
            };
        });
    }, []);


    const buyTalent = useCallback((id) => {
        const talent = TALENT_DATA.find(t => t.id === id);
        if (!talent) return;

        setGameState(prev => {
            const currentLevel = prev.talents[id] || 0;
            if (currentLevel >= talent.maxLevel) return prev; // Maxed out

            // Recalculate cost inside the setter to ensure latest state is used (though closure captures logic)
            // Ideally we use stateRef if we needed perfect sync, but prev is fine for atomic updates.
            // CAUTION: talent.getCost(level) is deterministic.
            const cost = talent.getCost(currentLevel);
            const currency = talent.path; // 'activeEnergy' or 'stabilityEssence'

            // Safe check: currency balance might be missing or not a Decimal if state is corrupted,
            // but we trust deserializeState.
            // --- PREREQUISITE CHECK ---
            const edges = TALENT_TREE_EDGES.filter(e => e.to === id);
            const isRoot = edges.some(e => e.from === null);

            if (!isRoot) {
                const hasParentUnlocked = edges.some(e => (prev.talents[e.from] || 0) > 0);
                if (!hasParentUnlocked) {
                    console.log(`Talent ${id} is locked. Prerequisites not met.`);
                    return prev;
                }
            }

            return {
                ...prev,
                [currency]: prev[currency].sub(cost),
                talents: {
                    ...prev.talents,
                    [id]: currentLevel + 1
                }
            };
        });
    }, []);

    const respecTalents = useCallback(() => {
        setGameState(prev => {
            let refundFocus = new Decimal(0);
            let refundFlux = new Decimal(0);
            const newTalents = {};

            // Calculate refunds
            Object.entries(prev.talents).forEach(([id, level]) => {
                const talent = TALENT_DATA.find(t => t.id === id);
                if (talent && level > 0) {
                    let totalCost = new Decimal(0);
                    // Sum cost for levels 0 to level-1
                    for (let i = 0; i < level; i++) {
                        totalCost = totalCost.add(talent.getCost(i));
                    }

                    if (talent.path === 'focus' || talent.path === 'activeEnergy') {
                        refundFocus = refundFocus.add(totalCost);
                    } else if (talent.path === 'flux' || talent.path === 'stabilityEssence') {
                        refundFlux = refundFlux.add(totalCost);
                    }
                }
            });

            console.log(`Respec: Refunding ${formatNumber(refundFocus)} Active Energy and ${formatNumber(refundFlux)} Stability Essence.`);

            return {
                ...prev,
                activeEnergy: prev.activeEnergy.add(refundFocus),
                stabilityEssence: prev.stabilityEssence.add(refundFlux),
                talents: {} // Wipe all levels
            };
        });
    }, []);

    const dismissOfflineResults = useCallback(() => {
        setGameState(prev => {
            const next = { ...prev };
            delete next.offlineResults;
            return next;
        });
    }, []);

    const claimMissionReward = useCallback((missionId) => {
        const mission = MISSIONS.find(m => m.id === missionId);
        if (!mission) return;

        setGameState(prev => {
            if (prev.completedMissions.includes(missionId)) return prev;

            const next = {
                ...prev,
                completedMissions: [...prev.completedMissions, missionId]
            };

            const reward = mission.reward;
            if (reward.type === 'insight') next.insight = next.insight.add(reward.amount);
            if (reward.type === 'reservoir') next.treasuryIterons = next.treasuryIterons.add(reward.amount);
            if (reward.type === 'activeEnergy') next.activeEnergy = next.activeEnergy.add(reward.amount);

            return next;
        });
    }, []);

    const dismissTimeShift = useCallback(() => {
        setGameState(prev => ({ ...prev, isTimeShiftDismissed: true }));
    }, []);

    const activateOverclock = useCallback((id, durationMinutes) => {
        const expiry = Date.now() + (durationMinutes * 60 * 1000);
        setGameState(prev => ({
            ...prev,
            overclockActive: {
                ...prev.overclockActive,
                [id]: expiry
            }
        }));
    }, []);

    const deactivateOverclock = useCallback((id) => {
        setGameState(prev => {
            const next = { ...prev, overclockActive: { ...prev.overclockActive } };
            delete next.overclockActive[id];
            return next;
        });
    }, []);

    const restoreTimeShift = useCallback(() => {
        setGameState(prev => ({ ...prev, isTimeShiftDismissed: false }));
    }, []);

    return (
        <GameContext.Provider value={{
            gameState, tick, manualClick, buyGenerator, getGeneratorCost,
            saveGame, hardReset, calculateMultiplier, getNextMilestone,
            getGeneratorProduction, calculateProduction, toggleFPS,
            getBaseProduction, buyResearch, buyTalent, respecTalents,
            dismissOfflineResults, depositInTreasury, getMaintenanceRate,
            dismissTimeShift, restoreTimeShift, toggleOverclock: activateOverclock,
            activateOverclock, deactivateOverclock, claimMissionReward
        }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => useContext(GameContext);
