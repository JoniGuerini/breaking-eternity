import Decimal from 'break_eternity.js';
import { formatNumber } from '../utils/formatUtils';

export const MISSION_TYPES = {
    COLLECT_FRAGMENTS: 'collect_fragments',
    REACH_MILESTONES: 'reach_milestones',
    DEPOSIT_FRAGMENTS: 'deposit_fragments',
    OWN_GENERATOR: 'own_generator',
    BUY_RESEARCH: 'buy_research'
};

const generateMissions = () => {
    const missions = [];

    for (let rank = 1; rank <= 20; rank++) {
        const isTier2 = rank > 10;
        const count = isTier2 ? 16 : 12;

        for (let i = 0; i < count; i++) {
            const missionId = `r${rank}_m${i}`;
            let mission = {
                id: missionId,
                minRank: rank,
                reward: { type: 'insight', amount: new Decimal(rank * 2), label: `${formatNumber(rank * 2)} Insights` }
            };

            // Scale targets based on rank and mission index within rank
            const scale = Math.pow(1.5, rank) * (1 + i * 0.2);
            const fragmentScale = new Decimal(100).times(Decimal.pow(10, rank - 1)).times(1 + i);

            // Cycle through types to ensure variety
            const typeIndex = (rank + i) % 5;

            // Target multipliers to ensure variety even within the same type
            const targetMultiplier = 1 + (i * 0.25);

            if (typeIndex === 0) {
                mission.type = MISSION_TYPES.COLLECT_FRAGMENTS;
                const target = fragmentScale.times(1 + i * 0.5).round();
                mission.name = `Data Harvest ${rank}.${i}`;
                mission.target = target;
                mission.description = `Collect ${formatNumber(target)} Eternity Fragments.`;
                const rewardAmount = target.div(2).round();
                mission.reward = {
                    type: 'reservoir',
                    amount: rewardAmount,
                    label: `${formatNumber(rewardAmount)} Eternity Fragments`
                };
            } else if (typeIndex === 1) {
                mission.type = MISSION_TYPES.REACH_MILESTONES;
                const targetCount = Math.floor((rank * 2) + (i * 1.5) + 1);
                mission.name = `Complexity Goal ${rank}.${i}`;
                mission.target = new Decimal(targetCount);
                mission.description = `Reach a combined total of ${targetCount} Milestones.`;
            } else if (typeIndex === 2) {
                mission.type = MISSION_TYPES.DEPOSIT_FRAGMENTS;
                const amount = fragmentScale.div(5).times(1 + i * 0.3).ceil();
                mission.name = `Stability Fund ${rank}.${i}`;
                mission.target = amount;
                mission.description = `Deposit ${formatNumber(amount)} Eternity Fragments into the Reservoir.`;
            } else if (typeIndex === 3) {
                mission.type = MISSION_TYPES.OWN_GENERATOR;
                const genId = Math.min(Math.floor((rank - 1) / 2) + (i % 3), 4);
                const amount = new Decimal(10).times(Decimal.pow(1.5, i)).round();
                mission.genId = genId;
                mission.name = `Unit Deployment ${rank}.${i}`;
                mission.target = amount;
                mission.description = `Own ${formatNumber(amount)} Units of Generator ${genId + 1}.`;
            } else {
                mission.type = MISSION_TYPES.BUY_RESEARCH;
                const researchLevels = Math.floor(rank * 1.2 + i * 0.8) + 1;
                mission.name = `Lab Analysis ${rank}.${i}`;
                mission.target = new Decimal(researchLevels);
                mission.description = `Complete ${researchLevels} levels of Research.`;
            }

            // Specific Overrides for Rank 1 (Tutorial/Early Game calibration)
            if (rank === 1) {
                if (i === 0) {
                    mission.name = "Generator Startup";
                    mission.type = MISSION_TYPES.OWN_GENERATOR;
                    mission.genId = 0;
                    mission.target = new Decimal(10);
                    mission.description = "Own 10 Units of Generator 1.";
                    mission.reward = { type: 'insight', amount: new Decimal(5), label: `${formatNumber(5)} Insights` };
                } else if (i === 1) {
                    mission.name = "Expansion Protocol";
                    mission.type = MISSION_TYPES.OWN_GENERATOR;
                    mission.genId = 1;
                    mission.target = new Decimal(1);
                    mission.description = "Unlock and own 1 Unit of Generator 2.";
                    mission.reward = { type: 'insight', amount: new Decimal(10), label: `${formatNumber(10)} Insights` };
                } else if (i === 2) {
                    mission.name = "Energy Storage";
                    mission.type = MISSION_TYPES.COLLECT_FRAGMENTS;
                    mission.target = new Decimal(100);
                    mission.description = "Collect 100 Eternity Fragments.";
                    mission.reward = { type: 'reservoir', amount: new Decimal(200), label: `${formatNumber(200)} Eternity Fragments` };
                } else if (i === 3) {
                    mission.name = "Basic Research";
                    mission.type = MISSION_TYPES.BUY_RESEARCH;
                    mission.target = new Decimal(3);
                    mission.description = "Complete 3 levels of Research.";
                } else if (i === 4) {
                    mission.name = "Data Harvest 1.4";
                    mission.type = MISSION_TYPES.COLLECT_FRAGMENTS;
                    mission.target = new Decimal(500);
                    mission.description = "Collect 500 Eternity Fragments.";
                    mission.reward = { type: 'reservoir', amount: new Decimal(1000), label: `${formatNumber(1000)} Eternity Fragments` };
                } else if (i === 5) {
                    mission.name = "Complexity Goal 1.5";
                    mission.type = MISSION_TYPES.REACH_MILESTONES;
                    mission.target = new Decimal(3);
                    mission.description = "Reach a combined total of 3 Milestones.";
                } else if (i === 8) {
                    // Changed from 8 levels of research to 10k fragments at user request
                    mission.name = "Data Overload";
                    mission.type = MISSION_TYPES.COLLECT_FRAGMENTS;
                    mission.target = new Decimal(10000);
                    mission.description = "Collect 10,000 Eternity Fragments.";
                    mission.reward = { type: 'reservoir', amount: new Decimal(20000), label: `${formatNumber(20000)} Eternity Fragments` };
                } else if (i === 10) {
                    mission.name = "Complexity Goal 1.10";
                    mission.type = MISSION_TYPES.REACH_MILESTONES;
                    mission.target = new Decimal(10);
                    mission.description = "Reach a combined total of 10 Milestones.";
                }
            }

            missions.push(mission);
        }
    }

    return missions;
};

export const MISSIONS = generateMissions();

