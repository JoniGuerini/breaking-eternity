
import React from 'react';
import { Button } from "@/components/ui/button";
import { Settings, Zap, FlaskConical, BookOpen, BarChart3, Clock, Sparkles, Binary } from 'lucide-react'; // Icons for tabs

const GameNavigation = ({ activeView, setView }) => {
    const tabs = [
        { id: 'generators', label: 'Generators', icon: Zap },
        { id: 'research', label: 'Research', icon: FlaskConical },
        { id: 'experiments', label: 'Experiments', icon: Binary },
        { id: 'talents', label: 'Talents', icon: Sparkles },
        { id: 'chronos', label: 'Reservoir', icon: Clock },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="w-full mb-6">
            <div className="bg-muted/30 p-1 rounded-xl grid grid-cols-6 gap-1 w-full">
                {tabs.map((tab) => {
                    const isActive = activeView === tab.id;
                    const Icon = tab.icon;

                    return (
                        <Button
                            key={tab.id}
                            variant={isActive ? "default" : "ghost"}
                            size="sm"
                            onClick={() => !tab.disabled && setView(tab.id)}
                            disabled={tab.disabled}
                            className={`
                                relative h-10 rounded-lg transition-all duration-200 w-full
                                ${isActive ? 'shadow-sm bg-background text-foreground hover:text-foreground hover:bg-background' : 'hover:bg-background/50 text-muted-foreground'}
                                ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                        >
                            <div className="flex items-center gap-2">
                                <Icon size={16} />
                                <span className="hidden md:inline">{tab.label}</span>
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
