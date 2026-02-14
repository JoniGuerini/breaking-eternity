import React, { useMemo } from 'react';
import { useGame } from '../game/gameState';
import { MISSIONS, MISSION_TYPES } from '../game/missionData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatNumber } from '../utils/formatUtils';
import { CheckCircle2, Circle, Trophy, Terminal } from 'lucide-react';
import Decimal from 'break_eternity.js';

const ExperimentsView = () => {
    const { gameState, claimMissionReward } = useGame();
    const { completedMissions, missionStats, iterons } = gameState;

    const missionList = useMemo(() => {
        return MISSIONS.map(mission => {
            const isCompleted = completedMissions.includes(mission.id);

            let progress = new Decimal(0);
            if (mission.type === MISSION_TYPES.REACH_MILESTONES) progress = new Decimal(missionStats.totalMilestones);
            if (mission.type === MISSION_TYPES.COLLECT_FRAGMENTS) progress = iterons;
            if (mission.type === MISSION_TYPES.STABILITY_TIME) progress = new Decimal(missionStats.consecutiveStableTime);

            const canClaim = !isCompleted && progress.gte(mission.target);
            const progressPercent = Math.min(100, progress.div(mission.target).toNumber() * 100);

            return { ...mission, isCompleted, canClaim, progress, progressPercent };
        });
    }, [completedMissions, missionStats, iterons]);

    return (
        <div className="w-full h-full flex flex-col gap-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white">Sync Experiments</h2>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1">
                        High-priority research objectives for rapid expansion.
                    </p>
                </div>
                <div className="flex gap-4">
                    <Badge variant="outline" className="h-10 px-4 border-zinc-800 bg-zinc-950/50 flex gap-2 items-center">
                        <Terminal size={14} className="text-emerald-400" />
                        <span className="text-[10px] uppercase font-bold text-zinc-400">Status: Operational</span>
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pr-2 pb-8">
                {missionList.map((mission) => (
                    <Card
                        key={mission.id}
                        className={`relative border transition-all duration-300 ${mission.isCompleted
                                ? 'bg-zinc-900/20 border-zinc-800/50 opacity-60'
                                : mission.canClaim
                                    ? 'bg-emerald-500/5 border-emerald-500/30 ring-1 ring-emerald-500/20'
                                    : 'bg-card border-border/50 hover:border-primary/30'
                            }`}
                    >
                        <CardHeader className="p-4 pb-2">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <CardTitle className={`text-sm font-bold ${mission.isCompleted ? 'text-zinc-500' : 'text-white'}`}>
                                            {mission.name}
                                        </CardTitle>
                                        {mission.isCompleted && (
                                            <CheckCircle2 size={14} className="text-emerald-500" />
                                        )}
                                    </div>
                                    <CardDescription className="text-xs leading-relaxed max-w-[240px]">
                                        {mission.description}
                                    </CardDescription>
                                </div>
                                <Badge
                                    variant="outline"
                                    className={`text-[9px] uppercase font-bold ${mission.isCompleted ? 'bg-zinc-900 text-zinc-500 border-zinc-800' : 'bg-zinc-900 text-primary border-primary/20'
                                        }`}
                                >
                                    {mission.reward.label}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                            <div className="space-y-3">
                                <div className="flex justify-between items-end text-[10px] font-mono">
                                    <span className="text-muted-foreground uppercase tracking-widest">Efficiency Progress</span>
                                    <span className={mission.canClaim ? 'text-emerald-400 font-bold' : 'text-zinc-400'}>
                                        {mission.isCompleted ? '100%' : `${formatNumber(mission.progress)} / ${formatNumber(mission.target)}`}
                                    </span>
                                </div>
                                <Progress
                                    value={mission.isCompleted ? 100 : mission.progressPercent}
                                    className={`h-1.5 ${mission.canClaim ? 'bg-emerald-950' : ''}`}
                                    indicatorClassName={mission.isCompleted ? 'bg-zinc-700' : mission.canClaim ? 'bg-emerald-500' : 'bg-primary'}
                                />

                                {mission.canClaim && (
                                    <Button
                                        className="w-full h-8 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-widest text-[10px] shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse"
                                        onClick={() => claimMissionReward(mission.id)}
                                    >
                                        Extract Reward
                                    </Button>
                                )}

                                {mission.isCompleted ? (
                                    <div className="w-full h-8 flex items-center justify-center border border-zinc-800 rounded bg-zinc-900/50">
                                        <span className="text-[10px] uppercase font-bold text-zinc-600 tracking-widest">Research Documented</span>
                                    </div>
                                ) : !mission.canClaim && (
                                    <div className="w-full h-8 flex items-center justify-center border border-zinc-800/30 rounded bg-zinc-900/20">
                                        <span className="text-[10px] uppercase font-bold text-zinc-500/50 tracking-widest italic">Syncing Data...</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default ExperimentsView;
