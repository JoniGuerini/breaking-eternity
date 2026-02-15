import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import Decimal from 'break_eternity.js';
import { RESEARCH_DATA } from './researchData';
import { TALENT_DATA, TALENT_TREE_EDGES } from './talentData';
import { MISSIONS, MISSION_TYPES } from './missionData';
import { formatNumber } from '../utils/formatUtils';

const GameContext = createContext();

const INITIAL_STATE = {
    eternityFragments: new Decimal(0),
    insight: new Decimal(0),
    generators: Array.from({ length: 50 }, (_, i) => ({
        id: i,
        amount: new Decimal(0),
        bought: new Decimal(0),
        multiplier: new Decimal(1),
        costBase: new Decimal(1).times(new Decimal(10).pow(i)),
    })),
    lastTick: Date.now(),
    showFPS: true,
    research: {},
    reservoirEternityFragments: new Decimal(0),
    offlineGap: 0,
    isTimeShiftDismissed: false,
    activeTime: 0,
    talents: {},
    playtime: 0,
    talentPoints: 0,
    overclockActive: {},
    completedMissions: [],
    missionStats: {
        totalMilestones: 0,
        totalDeposited: new Decimal(0)
    },
    experimentRank: 1,
    experimentXP: 0
};

export const GameProvider = ({ children }) => {
    const [gameState, setGameState] = useState(INITIAL_STATE);
    const stateRef = useRef(gameState);

    // Sync ref with state
    stateRef.current = gameState;

    // --- SERIALIZATION ---
    const serializeState = (state) => JSON.stringify(state);

    const deserializeState = (json) => {
        const parsed = JSON.parse(json);
        parsed.eternityFragments = new Decimal(parsed.eternityFragments || parsed.iterons || 0);
        parsed.insight = parsed.insight ? new Decimal(parsed.insight) : new Decimal(0);
        parsed.generators = parsed.generators.map(g => ({
            ...g,
            amount: new Decimal(g.amount),
            bought: new Decimal(g.bought),
            multiplier: new Decimal(g.multiplier),
            costBase: new Decimal(g.costBase),
        }));
        parsed.reservoirEternityFragments = new Decimal(parsed.reservoirEternityFragments || parsed.treasuryEternityFragments || parsed.treasuryIterons || 0);
        parsed.talentPoints = parsed.talentPoints || 0;

        parsed.research = parsed.research || {};
        parsed.talents = parsed.talents || {};
        parsed.overclockActive = parsed.overclockActive || {};
        parsed.completedMissions = parsed.completedMissions || [];
        parsed.missionStats = parsed.missionStats || { totalMilestones: 0, totalDeposited: new Decimal(0) };
        parsed.missionStats.totalDeposited = new Decimal(parsed.missionStats.totalDeposited || 0);

        return parsed;
    };

    // --- BASIC HELPERS ---
    const getBaseProduction = useCallback((id) => new Decimal(0.01), []);

    const getXPRequired = useCallback((rank) => (rank <= 10 ? 10 : 12), []);

    const getNextMilestone = useCallback((amountDec) => {
        const effLevel = stateRef.current.talents?.['milestone_efficiency'] || 0;
        const effMult = 1 - (effLevel * 0.02);
        const milestones = [10, 25, 50, 100];
        if (amountDec.lt(new Decimal(10).times(effMult).ceil())) {
            return { next: new Decimal(10).times(effMult).ceil(), level: 0, prev: new Decimal(0) };
        }
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
        let milestone = new Decimal(100);
        let level = 4;
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

    const calculateMultiplier = useCallback((amountDec) => {
        return new Decimal(1);
    }, []);

    const countMaxedTalents = useCallback(() => {
        const talents = stateRef.current.talents || {};
        return TALENT_DATA.reduce((count, talent) => {
            const level = talents[talent.id] || 0;
            return level >= talent.maxLevel ? count + 1 : count;
        }, 0);
    }, []);

    // --- COMPLEX HELPERS ---
    const getEfficiencyMultiplier = useCallback((id) => {
        const state = stateRef.current || INITIAL_STATE;
        const research = state.research || {};
        const level = research[`gen${id + 1}_eff`] || 0;
        const refinementLevel = state.talents?.['resonance_refinement'] || 0;
        const refinementMult = 1 + (refinementLevel * 0.12);
        const anchorLevel = state.talents?.['reality_anchor'] || 0;
        const maxedCount = countMaxedTalents();
        const anchorMult = 1 + (anchorLevel * 0.02 * maxedCount);
        const tuningLevel = state.talents?.['precision_tuning'] || 0;
        const tuningMult = 1 + (tuningLevel * 0.02 * state.experimentRank);
        const feedbackLevel = state.talents?.['eternal_feedback'] || 0;
        // Simple feedback based on playtime/rank as proxy for "total Eternity Fragments" if we don't have a dedicated counter
        const feedbackMult = 1 + (feedbackLevel * 0.05);
        const nowTs = Date.now();
        const isOverclocked = state.overclockActive?.[id] && state.overclockActive[id] > nowTs && state.reservoirEternityFragments.gt(0);
        return new Decimal(1 + level).times(refinementMult).times(anchorMult).times(tuningMult).times(feedbackMult).times(isOverclocked ? 5 : 1);
    }, [countMaxedTalents]);

    const getGeneratorMaintenance = useCallback((id, stateOverride) => {
        const state = stateOverride || stateRef.current;
        const research = state.research || {};
        const gen = state.generators[id];
        if (!gen || gen.amount.lte(0)) return new Decimal(0);
        const rank = getNextMilestone(gen.amount).level;
        if (rank <= 0) return new Decimal(0);
        const tier = id;
        let cost = new Decimal((rank + tier) * 0.01);
        const speedLevel = research[`gen${id + 1}_speed`] || 0;
        const effLevel = research[`gen${id + 1}_eff`] || 0;
        const resonanceLevel = research[`gen${id + 1}_resonance`] || 0;
        const totalTaxedUpgrades = effLevel + resonanceLevel;
        cost = cost.add((tier + 1) * 0.01 * totalTaxedUpgrades);
        cost = cost.sub(speedLevel * 0.01).max(0);
        const nowTs = Date.now();
        if (state.overclockActive?.[id] && state.overclockActive[id] > nowTs) cost = cost.times(5);
        return cost;
    }, [getNextMilestone]);

    const getMaintenanceRate = useCallback((stateOverride) => {
        const state = stateOverride || stateRef.current;
        let totalCost = new Decimal(0);
        state.generators.forEach((gen, i) => {
            totalCost = totalCost.add(getGeneratorMaintenance(i, state));
        });
        const stasisLevel = state.talents?.['temporal_stasis'] || 0;
        const stasisMult = Math.max(0.1, 1 - (stasisLevel * 0.03));
        return totalCost.times(stasisMult);
    }, [getGeneratorMaintenance]);

    // --- GAMEPLAY STATS ---
    const calculateTotalEarnedInsights = useCallback((generators, research) => {
        let total = new Decimal(0);
        generators.forEach((gen, index) => {
            const { level } = getNextMilestone(gen.amount);
            if (level > 0) {
                const resonanceLevel = research?.[`gen${index + 1}_resonance`] || 0;
                total = total.add(new Decimal(index + 1).times(level).times(Math.pow(2, resonanceLevel)));
            }
        });
        return total;
    }, [getNextMilestone]);

    const calculateTotalSpentInsights = useCallback((research) => {
        let total = new Decimal(0);
        Object.entries(research).forEach(([id, level]) => {
            const item = RESEARCH_DATA.find(r => r.id === id);
            if (item) for (let i = 0; i < level; i++) total = total.add(item.getCost(i));
        });
        return total;
    }, []);

    const getGeneratorCost = useCallback((id) => {
        const gen = stateRef.current.generators[id];
        return gen.costBase.times(new Decimal(1.12).pow(gen.bought));
    }, []);

    const getGeneratorProduction = useCallback((id) => {
        const gen = stateRef.current.generators[id];
        if (gen.amount.eq(0)) return new Decimal(0);
        return gen.amount.times(gen.multiplier).times(getEfficiencyMultiplier(id)).times(getBaseProduction(id));
    }, [getEfficiencyMultiplier, getBaseProduction]);

    const calculateProduction = useCallback((stateOverride) => {
        const state = stateOverride || stateRef.current || INITIAL_STATE;
        const gen0 = state.generators[0];
        if (!gen0 || gen0.amount.lte(0)) return new Decimal(0);
        return gen0.amount.times(gen0.multiplier).times(getEfficiencyMultiplier(0)).times(getBaseProduction(0));
    }, [getEfficiencyMultiplier, getBaseProduction]);

    // --- CORE LOOP ---
    const processOfflineProduction = useCallback((loadedState) => {
        const now = Date.now();
        const gapSec = (now - loadedState.lastTick) / 1000;
        if (gapSec < 60) return loadedState;
        const rate = getMaintenanceRate(loadedState);
        let effectiveTime = gapSec;
        let reservoirUsed = new Decimal(0);
        if (rate.gt(0)) {
            const expansionLevel = loadedState.talents?.['reservoir_expansion'] || 0;
            const maxAffordable = loadedState.reservoirEternityFragments.div(rate).times(1 + (expansionLevel * 0.2));
            effectiveTime = Math.min(gapSec, maxAffordable.toNumber());
            reservoirUsed = rate.times(effectiveTime / (1 + (expansionLevel * 0.2)));
        } else {
            effectiveTime = 0;
        }
        const nextState = { ...loadedState };
        nextState.reservoirEternityFragments = nextState.reservoirEternityFragments.sub(reservoirUsed);
        nextState.playtime = (nextState.playtime || 0) + effectiveTime;
        const gens = nextState.generators.map(g => ({ ...g }));
        const offlineLevel = nextState.talents?.['offline_refinement'] || 0;
        const offlineMult = 1 + (offlineLevel * 0.1);

        if (gens[0].amount.gt(0)) {
            const payout = gens[0].amount.times(gens[0].multiplier).times(getEfficiencyMultiplier(0)).times(getBaseProduction(0)).times(effectiveTime).times(offlineMult);
            nextState.eternityFragments = nextState.eternityFragments.add(payout);
        }
        for (let i = 1; i < 50; i++) {
            if (gens[i].amount.gt(0)) {
                const prod = gens[i].amount.times(gens[i].multiplier).times(getEfficiencyMultiplier(i)).times(getBaseProduction(i)).times(effectiveTime).times(offlineMult);
                gens[i - 1].amount = gens[i - 1].amount.add(prod);
            }
        }
        nextState.generators = gens;
        nextState.offlineResults = { totalGap: gapSec, effectiveTime, reservoirUsed, depleted: effectiveTime < gapSec };
        return nextState;
    }, [getMaintenanceRate, getEfficiencyMultiplier, getBaseProduction]);

    const tick = useCallback((dt, shouldRender = true) => {
        const currentState = stateRef.current;
        const newGenerators = currentState.generators.map(g => ({ ...g }));
        const baseProb0 = getBaseProduction(0);
        const effMult0 = getEfficiencyMultiplier(0);
        const gen0Payout = newGenerators[0].amount.times(newGenerators[0].multiplier).times(effMult0).times(baseProb0).times(dt);

        for (let i = 1; i < 50; i++) {
            if (newGenerators[i].amount.gt(0)) {
                const prod = newGenerators[i].amount.times(newGenerators[i].multiplier).times(getEfficiencyMultiplier(i)).times(getBaseProduction(i)).times(dt);
                newGenerators[i - 1].amount = newGenerators[i - 1].amount.add(prod);
            }
        }

        stateRef.current = {
            ...currentState,
            generators: newGenerators,
            eternityFragments: currentState.eternityFragments.add(gen0Payout),
            lastTick: Date.now(),
            playtime: (currentState.playtime || 0) + dt,
            missionStats: {
                totalMilestones: newGenerators.reduce((sum, g) => sum + getNextMilestone(g.amount).level, 0),
                totalDeposited: currentState.missionStats.totalDeposited || new Decimal(0)
            }
        };

        const nowTs = Date.now();
        Object.keys(stateRef.current.overclockActive).forEach(id => {
            if (stateRef.current.overclockActive[id] < nowTs) delete stateRef.current.overclockActive[id];
        });

        if (shouldRender) {
            setGameState(prev => {
                const next = { ...prev, ...stateRef.current };
                const earned = calculateTotalEarnedInsights(next.generators, next.research);
                const spent = calculateTotalSpentInsights(next.research);
                const expected = earned.sub(spent);
                if (next.insight.lt(expected)) next.insight = expected;
                return next;
            });
        }
    }, [calculateTotalEarnedInsights, calculateTotalSpentInsights, getBaseProduction, getEfficiencyMultiplier, getNextMilestone]);

    // --- ACTIONS ---
    const saveGame = useCallback(() => {
        localStorage.setItem('breaking-infinity-save', serializeState(stateRef.current));
    }, []);

    const loadGame = useCallback(() => {
        // Try new key first
        let saved = localStorage.getItem('breaking-infinity-save');

        // Fallback to old key for migration
        if (!saved) {
            saved = localStorage.getItem('chronos-iteratio-save');
            if (saved) {
                console.log("Migrating legacy save to Breaking Infinity...");
                // Note: deserializeState handles the internal property renaming
            }
        }

        if (saved) {
            const loaded = processOfflineProduction(deserializeState(saved));
            setGameState(loaded);
            stateRef.current = loaded;
        }
    }, [processOfflineProduction]);

    const hardReset = useCallback(() => {
        localStorage.removeItem('breaking-infinity-save');
        localStorage.removeItem('chronos-iteratio-save'); // Clean up old save too
        setGameState(INITIAL_STATE);
        window.location.reload();
    }, []);

    const manualClick = useCallback(() => {
        setGameState(prev => {
            const next = { ...prev };
            next.eternityFragments = next.eternityFragments.add(1);
            const kineticLevel = next.talents?.['kinetic_clique'] || 0;
            if (kineticLevel > 0) next.eternityFragments = next.eternityFragments.add(calculateProduction(next).times(kineticLevel * 0.1));
            return next;
        });
    }, [calculateProduction]);

    const buyGenerator = useCallback((id) => {
        setGameState(prev => {
            const cost = getGeneratorCost(id);
            if (prev.eternityFragments.lt(cost)) return prev;
            const next = { ...prev, generators: prev.generators.map(g => ({ ...g })) };
            const gen = next.generators[id];
            const prevMilestone = getNextMilestone(gen.amount);
            next.eternityFragments = next.eternityFragments.sub(cost);
            gen.amount = gen.amount.add(1);
            gen.bought = gen.bought.add(1);
            const newMilestone = getNextMilestone(gen.amount);
            if (newMilestone.level > prevMilestone.level) {
                const resonanceMultiplier = Math.pow(2, next.research[`gen${id + 1}_resonance`] || 0);
                let reward = new Decimal(id + 1).times(newMilestone.level - prevMilestone.level).times(resonanceMultiplier);
                const yieldLevel = next.talents?.['insight_yield'] || 0;
                if (yieldLevel > 0 && Math.random() < yieldLevel * 0.05) reward = reward.add(1);
                next.insight = next.insight.add(reward);
            }
            return next;
        });
    }, [getGeneratorCost, getNextMilestone]);

    const buyResearch = useCallback((id) => {
        setGameState(prev => {
            const item = RESEARCH_DATA.find(r => r.id === id);
            const currentLevel = prev.research[id] || 0;
            if (!item || currentLevel >= item.maxLevel) return prev;
            const cost = item.getCost(currentLevel);
            if (prev.insight.lt(cost)) return prev;
            return { ...prev, insight: prev.insight.sub(cost), research: { ...prev.research, [id]: currentLevel + 1 } };
        });
    }, []);

    const buyTalent = useCallback((id) => {
        const talent = TALENT_DATA.find(t => t.id === id);
        if (!talent) return;
        setGameState(prev => {
            const currentLevel = prev.talents[id] || 0;
            if (currentLevel >= talent.maxLevel) return prev;
            if (prev.talentPoints < 1) return prev;
            const edges = TALENT_TREE_EDGES.filter(e => e.to === id);
            if (!edges.some(e => e.from === null) && !edges.some(e => (prev.talents[e.from] || 0) > 0)) return prev;
            return {
                ...prev,
                talentPoints: prev.talentPoints - 1,
                talents: { ...prev.talents, [id]: currentLevel + 1 }
            };
        });
    }, []);

    const respecTalents = useCallback(() => {
        setGameState(prev => {
            let totalSpent = 0;
            Object.entries(prev.talents).forEach(([id, level]) => {
                totalSpent += level;
            });
            return {
                ...prev,
                talentPoints: prev.talentPoints + totalSpent,
                talents: {}
            };
        });
    }, []);

    const claimMissionReward = useCallback((missionId) => {
        setGameState(prev => {
            if (prev.completedMissions.includes(missionId)) return prev;
            const mission = MISSIONS.find(m => m.id === missionId);
            if (!mission) return prev;
            const next = { ...prev, completedMissions: [...prev.completedMissions, missionId], experimentXP: prev.experimentXP + 1 };
            if (mission.reward.type === 'insight') next.insight = next.insight.add(mission.reward.amount);
            if (mission.reward.type === 'reservoir') next.eternityFragments = next.eternityFragments.add(mission.reward.amount);
            return next;
        });
    }, []);

    const rankUp = useCallback(() => {
        setGameState(prev => {
            const xpReq = getXPRequired(prev.experimentRank);
            if (prev.experimentXP < xpReq) return prev;
            return {
                ...prev,
                experimentRank: prev.experimentRank + 1,
                experimentXP: 0,
                talentPoints: prev.talentPoints + 1
            };
        });
    }, [getXPRequired]);

    const depositInReservoir = useCallback((amount) => {
        setGameState(prev => {
            const toDeposit = amount === 'all' ? prev.eternityFragments : Decimal.min(new Decimal(amount), prev.eternityFragments);
            if (toDeposit.lte(0)) return prev;
            return {
                ...prev,
                eternityFragments: prev.eternityFragments.sub(toDeposit),
                reservoirEternityFragments: prev.reservoirEternityFragments.add(toDeposit),
                missionStats: {
                    ...prev.missionStats,
                    totalDeposited: (prev.missionStats.totalDeposited || new Decimal(0)).add(toDeposit)
                }
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

    const activateOverclock = useCallback((id, durationMin) => {
        setGameState(prev => ({
            ...prev,
            overclockActive: { ...prev.overclockActive, [id]: Date.now() + (durationMin * 60 * 1000) }
        }));
    }, []);

    const deactivateOverclock = useCallback((id) => {
        setGameState(prev => {
            const next = { ...prev, overclockActive: { ...prev.overclockActive } };
            delete next.overclockActive[id];
            return next;
        });
    }, []);

    const toggleFPS = useCallback(() => setGameState(prev => ({ ...prev, showFPS: !prev.showFPS })), []);
    const dismissTimeShift = useCallback(() => setGameState(prev => ({ ...prev, isTimeShiftDismissed: true })), []);
    const restoreTimeShift = useCallback(() => setGameState(prev => ({ ...prev, isTimeShiftDismissed: false })), []);

    // --- EFFECTS ---
    useEffect(() => { loadGame(); }, [loadGame]);
    useEffect(() => {
        const interval = setInterval(() => saveGame(), 5000);
        return () => clearInterval(interval);
    }, [saveGame]);

    return (
        <GameContext.Provider value={{
            gameState, tick, manualClick, buyGenerator, getGeneratorCost,
            saveGame, loadGame, hardReset, getNextMilestone, getGeneratorProduction,
            calculateProduction, calculateMultiplier, toggleFPS, getBaseProduction, buyResearch,
            buyTalent, respecTalents, dismissOfflineResults, depositInReservoir,
            getMaintenanceRate, getGeneratorMaintenance, dismissTimeShift,
            restoreTimeShift, toggleOverclock: activateOverclock,
            activateOverclock, deactivateOverclock, claimMissionReward,
            getXPRequired, rankUp
        }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => useContext(GameContext);
