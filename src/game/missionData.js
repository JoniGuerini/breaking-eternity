import Decimal from 'break_eternity.js';

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
                reward: { type: 'insight', amount: new Decimal(rank * 2), label: `${rank * 2} Insights` }
            };

            // Scale targets based on rank and mission index within rank
            const scale = Math.pow(1.5, rank) * (1 + i * 0.2);
            const fragmentScale = new Decimal(100).times(Decimal.pow(10, rank - 1)).times(1 + i);

            // Cycle through types to ensure variety
            const typeIndex = (rank + i) % 5;

            if (typeIndex === 0) {
                mission.type = MISSION_TYPES.COLLECT_FRAGMENTS;
                mission.name = `Data Harvest ${rank}.${i}`;
                mission.target = fragmentScale;
                mission.description = `Collect ${fragmentScale.toNumber().toLocaleString()} Fragments.`;
                const rewardAmount = fragmentScale.div(2);
                mission.reward = {
                    type: 'reservoir',
                    amount: rewardAmount,
                    label: `${rewardAmount.toNumber().toLocaleString()} Fragments`
                };
            } else if (typeIndex === 1) {
                mission.type = MISSION_TYPES.REACH_MILESTONES;
                // Reduced scaling: rank * 2 instead of rank * 5
                const targetCount = rank * 2 + i * 1;
                mission.name = `Complexity Goal ${rank}.${i}`;
                mission.target = new Decimal(targetCount);
                mission.description = `Reach a combined total of ${targetCount} Milestones.`;
            } else if (typeIndex === 2) {
                mission.type = MISSION_TYPES.DEPOSIT_FRAGMENTS;
                const amount = fragmentScale.div(5).ceil();
                mission.name = `Stability Fund ${rank}.${i}`;
                mission.target = amount;
                mission.description = `Deposit ${amount.toNumber().toLocaleString()} Fragments into the Treasury.`;
            } else if (typeIndex === 3) {
                mission.type = MISSION_TYPES.OWN_GENERATOR;
                // Target a generator within reach (usually rank-related)
                const genId = Math.min(Math.floor((rank - 1) / 2) + (i % 3), 49);
                // Ensure target is a nice round number (e.g., 80 instead of 79.999)
                const amount = new Decimal(10).times(Decimal.pow(2, i % 4)).round();
                mission.genId = genId;
                mission.name = `Unit Deployment ${rank}.${i}`;
                mission.target = amount;
                mission.description = `Own ${amount.toNumber().toLocaleString()} Units of Generator ${genId + 1}.`;
            } else {
                mission.type = MISSION_TYPES.BUY_RESEARCH;
                // Slower scaling: rank * 1.2 instead of rank * 1.5
                const researchLevels = Math.floor(rank * 1.2 + i * 0.3);
                mission.name = `Lab Analysis ${rank}.${i}`;
                mission.target = new Decimal(researchLevels);
                mission.description = `Complete ${researchLevels} levels of Research.`;
            }

            // Specific Overrides for Rank 1 (to match user request)
            if (rank === 1) {
                if (i === 0) {
                    mission.name = "Generator Startup";
                    mission.type = MISSION_TYPES.OWN_GENERATOR;
                    mission.genId = 0;
                    mission.target = new Decimal(10);
                    mission.description = "Own 10 Units of Generator 1.";
                    mission.reward = { type: 'insight', amount: new Decimal(5), label: '5 Insights' };
                } else if (i === 1) {
                    mission.name = "Expansion Protocol";
                    mission.type = MISSION_TYPES.OWN_GENERATOR;
                    mission.genId = 1;
                    mission.target = new Decimal(1);
                    mission.description = "Unlock and own 1 Unit of Generator 2.";
                    mission.reward = { type: 'insight', amount: new Decimal(10), label: '10 Insights' };
                } else if (i === 2) {
                    mission.name = "Energy Storage";
                    mission.type = MISSION_TYPES.COLLECT_FRAGMENTS;
                    mission.target = new Decimal(100);
                    mission.description = "Collect 100 Eternity Fragments.";
                    mission.reward = { type: 'reservoir', amount: new Decimal(200), label: '200 Fragments' };
                } else if (i === 3) {
                    // Specific override for the one the user complained about
                    mission.name = "Lab Analysis 1.3";
                    mission.target = new Decimal(3);
                    mission.description = "Complete 3 levels of Research.";
                } else if (i === 4) {
                    mission.name = "Data Harvest 1.4";
                    mission.target = new Decimal(500);
                    mission.description = "Collect 500 Eternity Fragments.";
                    mission.reward = { type: 'reservoir', amount: new Decimal(1000), label: '1000 Fragments' };
                } else if (i === 5) {
                    // Complexity Goal 1.5
                    mission.target = new Decimal(3);
                    mission.description = "Reach a combined total of 3 Milestones.";
                } else if (i === 10) {
                    // Complexity Goal 1.10
                    mission.target = new Decimal(5);
                    mission.description = "Reach a combined total of 5 Milestones.";
                }
            }

            missions.push(mission);
        }
    }

    return missions;
};

export const MISSIONS = generateMissions();

