import React from 'react';
import { useGame } from '../game/gameState';
import { BarChart3, Clock } from 'lucide-react';
import Decimal from 'break_eternity.js';
import { RESEARCH_DATA } from '../game/researchData';
import { formatNumber, formatTime } from '../utils/formatUtils';

const StatisticsView = () => {
    const { gameState, getNextMilestone } = useGame();

    // Calculate Insights Stats
    const calculateStats = () => {
        let earned = new Decimal(0);
        gameState.generators.forEach((gen, index) => {
            const { level } = getNextMilestone(gen.amount);
            if (level > 0) {
                const tierReward = new Decimal(index + 1).times(level);
                earned = earned.add(tierReward);
            }
        });

        let spent = new Decimal(0);
        Object.entries(gameState.research).forEach(([id, level]) => {
            const item = RESEARCH_DATA.find(r => r.id === id);
            if (item) {
                for (let i = 0; i < level; i++) {
                    spent = spent.add(item.getCost(i));
                }
            }
        });

        return { earned, spent };
    };

    const { earned, spent } = calculateStats();

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8 pb-20 fade-in-animation">
            <div className="flex items-center gap-4 mb-2">
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                    <BarChart3 size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Statistics</h2>
                    <p className="text-muted-foreground text-sm">
                        Detailed tracking of your chronological progress.
                    </p>
                </div>
            </div>

            {/* Primary Stat: Playtime (Simple & Compact) */}
            <div className="bg-card/30 rounded-xl border border-primary/20 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Clock size={20} />
                    </div>
                    <div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">
                            Total Save Duration
                        </div>
                        <div className="text-2xl font-mono font-black tracking-tighter text-foreground">
                            {formatTime(Math.floor(gameState.playtime || 0))}
                        </div>
                    </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500/50"></span>
                    Reality Synchronized
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-card rounded-xl border p-6 shadow-sm hover:border-primary/50 transition-colors">
                    <div className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-2">Total Insights Earned</div>
                    <div className="text-3xl font-mono font-bold text-purple-400">{formatNumber(earned)}</div>
                    <p className="text-[10px] text-muted-foreground mt-2 italic">Calculated from all tier milestones</p>
                </div>

                <div className="bg-card rounded-xl border p-6 shadow-sm hover:border-primary/50 transition-colors">
                    <div className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-2">Total Insights Spent</div>
                    <div className="text-3xl font-mono font-bold text-red-400">{formatNumber(spent)}</div>
                    <p className="text-[10px] text-muted-foreground mt-2 italic">Invested in Laboratory research</p>
                </div>

                <div className="bg-card rounded-xl border p-6 shadow-sm hover:border-primary/50 transition-colors">
                    <div className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-2">Available Balance</div>
                    <div className="text-3xl font-mono font-bold text-foreground">{formatNumber(gameState.insight)}</div>
                    <p className="text-[10px] text-muted-foreground mt-2 italic">Current chronological leverage</p>
                </div>

                <div className="bg-card rounded-xl border p-6 shadow-sm hover:border-primary/50 transition-colors md:col-span-2 lg:col-span-3">
                    <div className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-4">Core Generator Inventory</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {gameState.generators.slice(0, 8).map((gen, i) => (
                            <div key={i} className="bg-muted/30 p-3 rounded-lg flex flex-col items-center">
                                <span className="text-[10px] text-muted-foreground uppercase mb-1">Gen {i + 1}</span>
                                <span className="text-lg font-mono font-bold">{formatNumber(gen.amount)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatisticsView;
