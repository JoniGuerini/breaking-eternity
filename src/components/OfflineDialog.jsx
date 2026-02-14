import React from 'react';
import { useGame } from '../game/gameState';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogAction,
} from "./ui/alert-dialog"
import { Clock } from 'lucide-react';
import { formatTime, formatNumber } from '../utils/formatUtils';

const OfflineDialog = () => {
    const { gameState, dismissOfflineResults } = useGame();
    const { offlineResults } = gameState;

    if (!offlineResults) return null;

    const { totalGap, effectiveTime, treasuryUsed, depleted } = offlineResults;

    return (
        <AlertDialog open={!!offlineResults}>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Reservoir Sync Report</span>
                    </div>
                    <AlertDialogTitle className="text-2xl font-black">Reality Re-synced!</AlertDialogTitle>
                    <AlertDialogDescription className="text-sm">
                        Total drift: <span className="text-foreground font-semibold">{formatTime(Math.floor(totalGap))}</span>.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="py-6 space-y-4">
                    <div className="bg-muted/50 border border-border/50 rounded-xl p-5 flex flex-col items-center justify-center text-center">
                        <span className="text-xs font-bold text-muted-foreground uppercase mb-2">Stabilized Time</span>
                        <span className="text-4xl font-mono font-black tracking-tighter text-primary">
                            {formatTime(Math.floor(effectiveTime))}
                        </span>
                        {depleted && (
                            <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-destructive bg-destructive/10 px-2 py-1 rounded-full uppercase">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
                                </span>
                                Reservoir Compounded
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-2 text-sm">
                        <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border/40">
                            <span className="text-muted-foreground line-clamp-1">Stabilization Cost</span>
                            <span className="font-mono font-bold">{formatNumber(treasuryUsed)} Fragments</span>
                        </div>
                    </div>
                </div>

                <AlertDialogFooter>
                    <AlertDialogAction
                        onClick={dismissOfflineResults}
                        className="w-full h-12 text-base font-bold rounded-xl"
                    >
                        Sync Reality
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default OfflineDialog;
