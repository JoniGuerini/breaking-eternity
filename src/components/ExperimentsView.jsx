import React, { useMemo } from 'react';
import { useGame } from '../game/gameState';
import { MISSIONS, MISSION_TYPES } from '../game/missionData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { formatNumber } from '../utils/formatUtils';
import { CheckCircle2, Circle, Trophy } from 'lucide-react';
import Decimal from 'break_eternity.js';

const ExperimentsView = () => {
    const { gameState, claimMissionReward, getXPRequired, rankUp } = useGame();
    if (!gameState) return null;
    const { completedMissions, missionStats, iterons, experimentRank, experimentXP } = gameState;

    const xpReq = getXPRequired(experimentRank);
    const xpPercent = (experimentXP / xpReq) * 100;
    const canRankUp = experimentXP >= xpReq;

    const missionList = useMemo(() => {
        // Show active missions ONLY from current rank
        // Show completed missions from ALL ranks
        const available = MISSIONS.filter(m => m.minRank === experimentRank || completedMissions.includes(m.id));
        const completed = available.filter(m => completedMissions.includes(m.id));
        const active = available.filter(m => !completedMissions.includes(m.id) && m.minRank === experimentRank);

        return [...active, ...completed]
            .map(mission => {
                const isCompleted = completedMissions.includes(mission.id);
                let progress = new Decimal(0);
                if (mission.type === MISSION_TYPES.REACH_MILESTONES) progress = new Decimal(missionStats.totalMilestones);
                if (mission.type === MISSION_TYPES.COLLECT_FRAGMENTS) progress = iterons;
                if (mission.type === MISSION_TYPES.DEPOSIT_FRAGMENTS) progress = missionStats.totalDeposited || new Decimal(0);
                if (mission.type === MISSION_TYPES.OWN_GENERATOR) progress = gameState.generators[mission.genId].amount;
                if (mission.type === MISSION_TYPES.BUY_RESEARCH) {
                    const totalLevels = Object.values(gameState.research || {}).reduce((sum, lvl) => sum + lvl, 0);
                    progress = new Decimal(totalLevels);
                }

                const canClaim = !isCompleted && progress.gte(mission.target);
                const progressPercent = Math.min(100, progress.div(mission.target).toNumber() * 100);

                return { ...mission, isCompleted, canClaim, progress, progressPercent };
            })
            .sort((a, b) => {
                if (a.isCompleted && !b.isCompleted) return 1;
                if (!a.isCompleted && b.isCompleted) return -1;
                return b.minRank - a.minRank;
            });
    }, [completedMissions, missionStats, iterons, experimentRank, gameState.generators, gameState.research]);

    return (
        <div className="w-full h-full flex flex-col gap-4">
            {/* Rank Progress Bar / Level Up Button */}
            <div
                className={`relative flex items-center gap-4 bg-card border rounded-xl px-4 py-3 shadow-sm transition-all duration-300 ${canRankUp
                    ? 'border-primary ring-2 ring-primary/20 cursor-pointer hover:bg-primary/5'
                    : 'border-border'
                    }`}
                onClick={() => canRankUp && rankUp()}
            >
                <div className="flex flex-col min-w-[100px]">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/70 leading-none mb-1">
                        {canRankUp ? 'Promotion Ready' : 'Scientist Rank'}
                    </span>
                    <span className="text-base font-black leading-none text-foreground tracking-tighter">Level {experimentRank}</span>
                </div>

                <div className="flex-1 space-y-1.5">
                    <div className="flex justify-between items-end text-[10px] font-mono font-bold tracking-tight">
                        <span className="text-muted-foreground uppercase opacity-50 tracking-widest">
                            {canRankUp ? 'CLICK HERE TO ADVANCE SCIENTIST RANK' : 'Curiosity Growth'}
                        </span>
                        <span className="text-primary/90">{experimentXP} / {xpReq} XP</span>
                    </div>
                    <Progress
                        value={xpPercent}
                        className={`h-2 ${canRankUp ? 'bg-primary/30' : 'bg-primary/10'}`}
                        indicatorClassName={`${canRankUp ? 'bg-primary animate-pulse' : 'bg-primary'} shadow-[0_0_10px_rgba(var(--primary),0.3)]`}
                    />
                </div>

                {canRankUp && (
                    <div className="absolute inset-0 bg-primary/5 animate-pulse pointer-events-none rounded-xl" />
                )}
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pr-2 pb-8">
                {missionList.map((mission) => (
                    <Card
                        key={mission.id}
                        className={`relative border transition-all duration-300 overflow-hidden flex flex-col justify-between min-h-[160px] ${mission.isCompleted
                            ? 'bg-muted/20 border-border opacity-60 px-4 py-3'
                            : mission.canClaim
                                ? 'bg-emerald-500/10 border-emerald-500/40 cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.1)] p-4'
                                : 'bg-card border-border hover:bg-accent/5 shadow-sm p-4'
                            }`}
                        onClick={() => mission.canClaim && claimMissionReward(mission.id)}
                    >
                        <div className="flex justify-between items-start mb-3 gap-4">
                            <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <h3 className={`text-base font-bold leading-none truncate ${mission.isCompleted ? 'text-muted-foreground' : mission.canClaim ? 'text-emerald-400' : 'text-foreground'}`}>
                                        {mission.name}
                                    </h3>
                                    {mission.isCompleted && <CheckCircle2 size={13} className="text-emerald-500/50" />}
                                </div>
                                <p className={`text-xs leading-normal line-clamp-2 ${mission.isCompleted ? 'text-muted-foreground/50' : 'text-muted-foreground opacity-90'}`}>
                                    {mission.description}
                                </p>
                            </div>
                            <Badge
                                variant="outline"
                                className={`text-[10px] uppercase font-bold tracking-wider px-2 h-5 shrink-0 ${mission.isCompleted
                                    ? 'bg-muted/10 text-muted-foreground/40 border-border/50'
                                    : mission.canClaim
                                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                        : 'bg-muted/20 text-foreground border-border'
                                    }`}
                            >
                                {mission.reward.label}
                            </Badge>
                        </div>

                        <div className="mt-auto space-y-2">
                            {mission.isCompleted ? (
                                <div className="flex items-center gap-2 py-1.5 px-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                                    <CheckCircle2 size={11} className="text-emerald-500/60" />
                                    <span className="text-[10px] uppercase font-black text-emerald-500/60 tracking-[0.25em]">Record Documented</span>
                                </div>
                            ) : (
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-end text-xs font-mono font-bold tracking-tight px-0.5">
                                        <span className={`uppercase opacity-50 ${mission.canClaim ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                                            {mission.canClaim ? 'Ready to Claim' : 'Syncing Data...'}
                                        </span>
                                        <span className={mission.canClaim ? 'text-emerald-400' : 'text-foreground/90'}>
                                            {formatNumber(mission.progress)} / {formatNumber(mission.target)}
                                        </span>
                                    </div>
                                    <Progress
                                        value={mission.progressPercent}
                                        className={`h-1 ${mission.canClaim ? 'bg-emerald-500/20' : 'bg-primary/10'}`}
                                        indicatorClassName={mission.canClaim ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-primary/60'}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Subtle Pulse Effect for claimable state */}
                        {!mission.isCompleted && mission.canClaim && (
                            <div className="absolute inset-0 bg-emerald-500/5 animate-pulse pointer-events-none" />
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default ExperimentsView;
