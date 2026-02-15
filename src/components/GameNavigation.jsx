
import React from 'react';
import { Button } from "@/components/ui/button";
import { Settings, Zap, FlaskConical, BookOpen, BarChart3, Clock, Sparkles, Binary } from 'lucide-react'; // Icons for tabs
import { useGame } from '../game/gameState';
import { RESEARCH_DATA } from '../game/researchData';
import { motion } from 'framer-motion';

const GameNavigation = ({ activeView, setView }) => {
    const { gameState } = useGame();

    // Calculate affordable research
    const availableResearchCount = React.useMemo(() => {
        return RESEARCH_DATA.filter(r => {
            // Must meet unlock condition (if any)
            if (r.condition && !r.condition(gameState)) return false;

            const currentLevel = gameState.research[r.id] || 0;
            // Must not be maxed
            if (currentLevel >= r.maxLevel) return false;

            // Must be affordable
            const cost = r.getCost(currentLevel);
            return gameState.insight.gte(cost);
        }).length;
    }, [gameState]);

    const tabs = [
        { id: 'generators', label: 'Generators', icon: Zap },
        { id: 'research', label: 'Research', icon: FlaskConical, badge: availableResearchCount },
        { id: 'experiments', label: 'Experiments', icon: Binary },
        { id: 'talents', label: 'Talents', icon: Sparkles },
        { id: 'chronos', label: 'Reservoir', icon: Clock },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="w-full">
            <div className="bg-card/40 border border-border/40 p-1.5 rounded-xl grid grid-cols-6 gap-2 w-full shadow-sm backdrop-blur-sm">
                {tabs.map((tab) => {
                    const isActive = activeView === tab.id;
                    const Icon = tab.icon;

                    return (
                        <Button
                            key={tab.id}
                            variant="ghost"
                            size="sm"
                            onClick={() => !tab.disabled && setView(tab.id)}
                            disabled={tab.disabled}
                            className={`
                                relative h-10 rounded-lg transition-all duration-300 w-full overflow-hidden
                                ${isActive
                                    ? 'bg-primary/10 text-primary shadow-inner border border-primary/20 hover:bg-primary/15'
                                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground opacity-70 hover:opacity-100'}
                                ${tab.disabled ? 'opacity-30 cursor-not-allowed' : ''}
                                font-bold uppercase tracking-[0.1em] text-xs
                            `}
                        >
                            <div className="flex items-center justify-center gap-3">
                                <Icon size={14} className={`${isActive ? 'opacity-100 animate-pulse' : 'opacity-60'}`} />
                                <span className="hidden md:inline">{tab.label}</span>
                                {tab.badge > 0 && (
                                    <span className="flex h-4 min-w-[1rem] px-1.5 items-center justify-center bg-purple-600 text-[10px] font-black text-white rounded-sm">
                                        {tab.badge}
                                    </span>
                                )}
                            </div>

                            {tab.disabled && (
                                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-500 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-600"></span>
                                </span>
                            )}
                        </Button>
                    );
                })}
            </div>
        </div>
    );
};

export default GameNavigation;
