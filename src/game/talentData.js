import Decimal from 'break_eternity.js';

export const TALENT_DATA = [
    // --- REFINEMENT PATH ---
    {
        id: 'resonance_refinement',
        name: 'Resonance Refinement',
        description: 'Increases all generator production while online.',
        maxLevel: 20,
        position: { x: -2.0, y: 1 },
        getCost: () => 1,
        getEffect: (level) => new Decimal(1).add(new Decimal(0.12).times(level)), // +12% per level
        getEffectDisplay: (level) => `+${(level * 12).toFixed(0)}% Production`,
        icon: 'Zap'
    },
    {
        id: 'insight_yield',
        name: 'Insight Yield',
        description: 'Every milestone reached has a chance to grant an additional Insight.',
        maxLevel: 10,
        position: { x: -3.5, y: 2 },
        getCost: () => 1,
        getEffect: (level) => level * 0.05, // 5% chance per level
        getEffectDisplay: (level) => `${(level * 5).toFixed(0)}% Bonus Chance`,
        icon: 'Sparkles'
    },
    {
        id: 'milestone_efficiency',
        name: 'Milestone Efficiency',
        description: 'Reduces the number of generators required to reach the next milestone.',
        maxLevel: 15,
        position: { x: -2.0, y: 2 },
        getCost: () => 1,
        getEffect: (level) => 1 - (level * 0.02), // -2% requirement per level
        getEffectDisplay: (level) => `-${(level * 2).toFixed(0)}% Requirement`,
        icon: 'Target'
    },
    {
        id: 'precision_tuning',
        name: 'Precision Tuning',
        description: 'Generators produce fragments faster based on Scientist Rank.',
        maxLevel: 10,
        position: { x: -0.5, y: 2 },
        getCost: () => 1,
        getEffect: (level) => level * 0.02,
        getEffectDisplay: (level) => `+${(level * 2).toFixed(0)}% per Rank`,
        icon: 'Crosshair'
    },

    // --- STABILITY PATH ---
    {
        id: 'temporal_stasis',
        name: 'Temporal Stasis',
        description: 'Reduces the maintenance cost of the Eternity Reservoir.',
        maxLevel: 20,
        position: { x: 2.0, y: 1 },
        getCost: () => 1,
        getEffect: (level) => 1 - (level * 0.03), // -3% maintenance per level
        getEffectDisplay: (level) => `-${(level * 3).toFixed(0)}% Maintenance`,
        icon: 'Landmark'
    },
    {
        id: 'reservoir_expansion',
        name: 'Reservoir Expansion',
        description: 'Fragments infused in the reservoir are 20% more effective at maintaining stability.',
        maxLevel: 10,
        position: { x: 0.5, y: 2 },
        getCost: () => 1,
        getEffect: (level) => 1 + (level * 0.2), // +20% duration per level
        getEffectDisplay: (level) => `+${(level * 20).toFixed(0)}% Duration`,
        icon: 'Clock'
    },
    {
        id: 'offline_refinement',
        name: 'Offline Refinement',
        description: 'Generators produce more while the real-time connection is severed.',
        maxLevel: 15,
        position: { x: 2.0, y: 2 },
        getCost: () => 1,
        getEffect: (level) => 1 + (level * 0.1), // +10% offline production per level
        getEffectDisplay: (level) => `+${(level * 10).toFixed(0)}% Offline Prod`,
        icon: 'Moon'
    },
    {
        id: 'quality_control',
        name: 'Quality Control',
        description: 'Increases the chance of high-tier generator procs.',
        maxLevel: 10,
        position: { x: 3.5, y: 2 },
        getCost: () => 1,
        getEffect: (level) => 1 + (level * 0.15),
        getEffectDisplay: (level) => `+${(level * 15).toFixed(0)}% Proc Rate`,
        icon: 'Droplets'
    },

    // --- SHARED / HUB NODES ---
    {
        id: 'eternal_feedback',
        name: 'Eternal Feedback',
        description: 'Generator production is increased based on total fragments collected.',
        maxLevel: 10,
        position: { x: -1.0, y: 4 },
        getCost: () => 1,
        getEffect: (level) => level * 0.05,
        getEffectDisplay: (level) => `+${(level * 5).toFixed(0)}% Feedback`,
        icon: 'Repeat'
    },
    {
        id: 'reality_anchor',
        name: 'Reality Anchor',
        description: 'Total production bonus based on how many Talents are fully maxed.',
        maxLevel: 5,
        position: { x: 1.0, y: 4 },
        getCost: () => 1,
        getEffect: (level) => level * 0.02, // +2% per maxed talent per rank
        getEffectDisplay: (level) => `+${(level * 2).toFixed(0)}%/Maxed`,
        icon: 'Anchor'
    }
];

export const TALENT_TREE_EDGES = [
    { from: null, to: 'resonance_refinement' },
    { from: null, to: 'temporal_stasis' },

    // Active Path
    { from: 'resonance_refinement', to: 'insight_yield' },
    { from: 'resonance_refinement', to: 'milestone_efficiency' },
    { from: 'resonance_refinement', to: 'precision_tuning' },
    { from: 'milestone_efficiency', to: 'eternal_feedback' },

    // Stability Path
    { from: 'temporal_stasis', to: 'reservoir_expansion' },
    { from: 'temporal_stasis', to: 'offline_refinement' },
    { from: 'temporal_stasis', to: 'essence_harvest' },
    { from: 'offline_refinement', to: 'reality_anchor' },

    // Cross-path connections
    { from: 'eternal_feedback', to: 'reality_anchor' }
];
