import Decimal from 'break_eternity.js';

export const MISSION_TYPES = {
    COLLECT_FRAGMENTS: 'collect_fragments',
    REACH_MILESTONES: 'reach_milestones',
    STABILITY_TIME: 'stability_time'
};

export const MISSIONS = [
    {
        id: 'first_steps',
        name: 'Initial Synchronization',
        type: MISSION_TYPES.REACH_MILESTONES,
        description: 'Reach a combined total of 25 Milestones across all generators.',
        target: new Decimal(25),
        reward: {
            type: 'insight',
            amount: new Decimal(5),
            label: '5 Insights'
        }
    },
    {
        id: 'fragment_hoarder',
        name: 'Fragment Accumulation',
        type: MISSION_TYPES.COLLECT_FRAGMENTS,
        description: 'Collect a total of 1.00e12 Eternity Fragments.',
        target: new Decimal(1e12),
        reward: {
            type: 'reservoir',
            amount: new Decimal(1e11),
            label: 'Instant 100B Infusion'
        }
    },
    {
        id: 'stable_existence',
        name: 'Stable existence',
        type: MISSION_TYPES.STABILITY_TIME,
        description: 'Maintain a stable real-time connection for 10 consecutive minutes.',
        target: new Decimal(600), // Seconds
        reward: {
            type: 'activeEnergy',
            amount: new Decimal(10),
            label: '10 Active Energy'
        }
    },
    {
        id: 'deep_sync',
        name: 'Deep Synchronization',
        type: MISSION_TYPES.REACH_MILESTONES,
        description: 'Reach 100 combined Milestones.',
        target: new Decimal(100),
        reward: {
            type: 'insight',
            amount: new Decimal(20),
            label: '20 Insights'
        }
    }
];
