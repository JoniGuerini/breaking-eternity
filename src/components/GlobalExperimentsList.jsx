import React, { useMemo } from 'react';
import { useGame } from '../game/gameState';
import { MISSIONS, MISSION_TYPES } from '../game/missionData';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatNumber } from '../utils/formatUtils';
import Decimal from 'break_eternity.js';

const GlobalExperimentCard = ({ mission, onClaim }) => {
    return (
        <Card
            className={`relative border transition-all duration-300 p-4 h-full flex flex-col justify-between group overflow-hidden min-h-[140px] ${mission.canClaim
                ? 'bg-emerald-500/10 border-emerald-500/40 cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                : 'bg-card border-border opacity-90'
                }`}
            onClick={() => mission.canClaim && onClaim(mission.id)}
        >
            <div className="flex justify-between items-start mb-3 gap-3">
                <div className="flex flex-col min-w-0">
                    <h3 className={`text-sm font-bold leading-tight truncate mb-1.5 ${mission.canClaim ? 'text-emerald-400' : 'text-foreground'}`}>
                        {mission.name}
                    </h3>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-snug opacity-80">
                        {mission.description}
                    </p>
                </div>
                <Badge variant="outline" className={`h-4 px-1.5 text-[9px] whitespace-nowrap shrink-0 font-bold uppercase tracking-wider ${mission.canClaim ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-muted/40 border-border text-muted-foreground'}`}>
                    {mission.reward.label}
                </Badge>
            </div>

            <div className="space-y-1.5 mt-auto">
                <div className="flex justify-between items-end text-[10px] font-mono font-bold tracking-tight px-0.5">
                    <span className={`uppercase opacity-50 ${mission.canClaim ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                        {mission.canClaim ? 'Ready to Claim' : 'Syncing...'}
                    </span>
                    <span className={mission.canClaim ? 'text-emerald-400' : 'text-foreground/90'}>
                        {formatNumber(mission.progress)} / {formatNumber(mission.target)}
                    </span>
                </div>
                <Progress
                    value={mission.progressPercent}
                    className={`h-1 ${mission.canClaim ? 'bg-emerald-500/20' : 'bg-primary/10'}`}
                    indicatorClassName={mission.canClaim ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-primary/60'}
                />
            </div>

            {/* Subtle Pulse Effect for claimable state */}
            {mission.canClaim && (
                <div className="absolute inset-0 bg-emerald-500/5 animate-pulse pointer-events-none" />
            )}
        </Card>
    );
};

const GlobalExperimentsList = () => {
    const { gameState, claimMissionReward, getXPRequired, rankUp } = useGame();
    if (!gameState) return null;
    const { completedMissions, missionStats, iterons, experimentRank, experimentXP } = gameState;

    const xpReq = getXPRequired(experimentRank);
    const xpPercent = (experimentXP / xpReq) * 100;
    const canRankUp = experimentXP >= xpReq;

    const activeMissions = useMemo(() => {
        // Only show missions from the CURRENT rank that aren't completed
        return MISSIONS
            .filter(m => !completedMissions.includes(m.id) && m.minRank === experimentRank)
            .map(mission => {
                let progress = new Decimal(0);
                if (mission.type === MISSION_TYPES.REACH_MILESTONES) progress = new Decimal(missionStats.totalMilestones);
                if (mission.type === MISSION_TYPES.COLLECT_FRAGMENTS) progress = iterons;
                if (mission.type === MISSION_TYPES.STABILITY_TIME) progress = new Decimal(missionStats.consecutiveStableTime);
                if (mission.type === MISSION_TYPES.OWN_GENERATOR) progress = gameState.generators[mission.genId].amount;
                if (mission.type === MISSION_TYPES.BUY_RESEARCH) {
                    const totalLevels = Object.values(gameState.research || {}).reduce((sum, lvl) => sum + lvl, 0);
                    progress = new Decimal(totalLevels);
                }

                const canClaim = progress.gte(mission.target);
                const progressPercent = Math.min(100, progress.div(mission.target).toNumber() * 100);

                return { ...mission, canClaim, progress, progressPercent };
            })
            .slice(0, 5);
    }, [completedMissions, missionStats, iterons, experimentRank, gameState.generators, gameState.research]);

    if (activeMissions.length === 0 && experimentRank === 1 && experimentXP === 0) return null;

    return (
        <div className="w-full space-y-4">
            {/* Rank Progress Bar / Level Up Button */}
            <div
                className={`relative flex items-center gap-4 bg-card border rounded-xl px-4 py-3 shadow-sm transition-all duration-300 ${canRankUp
                        ? 'border-primary ring-2 ring-primary/20 cursor-pointer hover:bg-primary/5'
                        : 'border-border hover:bg-accent/10'
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
                            {canRankUp ? 'CLICK TO ADVANCE RANK' : 'Growth Progress'}
                        </span>
                        <span className="text-primary/90">{experimentXP} / {xpReq} XP</span>
                    </div>
                    <Progress
                        value={xpPercent}
                        className={`h-1.5 ${canRankUp ? 'bg-primary/30' : 'bg-primary/10'}`}
                        indicatorClassName={`${canRankUp ? 'bg-primary animate-pulse' : 'bg-primary'} shadow-[0_0_10px_rgba(var(--primary),0.3)]`}
                    />
                </div>

                {canRankUp && (
                    <div className="absolute inset-0 bg-primary/5 animate-pulse pointer-events-none rounded-xl" />
                )}
            </div>

            {/* Mission Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {activeMissions.map(mission => (
                    <GlobalExperimentCard
                        key={mission.id}
                        mission={mission}
                        onClaim={claimMissionReward}
                    />
                ))}
            </div>
        </div>
    );
};

export default GlobalExperimentsList;
