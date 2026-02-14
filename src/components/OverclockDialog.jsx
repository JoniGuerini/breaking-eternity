import React, { useState, useMemo } from 'react';
import {
    AlertDialog as Dialog,
    AlertDialogContent as DialogContent,
    AlertDialogHeader as DialogHeader,
    AlertDialogTitle as DialogTitle,
    AlertDialogDescription as DialogDescription,
    AlertDialogFooter as DialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Zap, AlertTriangle, Clock, Droplet } from 'lucide-react';
import { formatNumber } from '../utils/formatUtils';
import Decimal from 'break_eternity.js';

const OverclockDialog = ({
    isOpen,
    onClose,
    onConfirm,
    generator,
    baseMaintenanceRate,
    reservoirFragments
}) => {
    const [duration, setDuration] = useState(5); // Default 5 minutes

    // Calculate cost: (BaseRate * 20 penalty) * seconds
    // baseMaintenanceRate is already per-second maintenance for this generator
    const projectedCost = useMemo(() => {
        const ratePerSec = baseMaintenanceRate.times(20);
        return ratePerSec.times(duration * 60);
    }, [baseMaintenanceRate, duration]);

    const canAfford = reservoirFragments.gte(projectedCost);
    const costPercentage = reservoirFragments.gt(0)
        ? projectedCost.div(reservoirFragments).times(100).toNumber()
        : 100;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.1)]">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-500/10 rounded-lg">
                            <Zap className="text-red-500" size={24} />
                        </div>
                        <DialogTitle className="text-xl font-bold text-white tracking-tight">Experimental Overclock</DialogTitle>
                    </div>
                    <DialogDescription className="text-zinc-400 text-sm leading-relaxed">
                        Configure the temporal force for <span className="text-white font-bold">Generator {generator.id + 1}</span>.
                        This increases production by <span className="text-emerald-400 font-bold">5x</span> but consumes stability <span className="text-red-500 font-bold">20x faster</span>.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 space-y-8">
                    {/* Duration Slider */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
                                <Clock size={14} />
                                Duration
                            </div>
                            <span className="text-2xl font-mono font-bold text-white">
                                {duration} <span className="text-sm font-normal text-zinc-500">min</span>
                            </span>
                        </div>
                        <Slider
                            value={[duration]}
                            onValueChange={(vals) => setDuration(vals[0])}
                            max={60}
                            min={1}
                            step={1}
                            className="[&_[role=slider]]:bg-red-500"
                        />
                    </div>

                    {/* Cost Estimation Card */}
                    <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-4">
                        <div className="flex justify-between items-center text-xs uppercase font-bold tracking-widest text-zinc-500">
                            <div className="flex items-center gap-2">
                                <Droplet size={14} className="text-sky-400" />
                                Est. Stability Cost
                            </div>
                            {costPercentage > 50 && (
                                <Badge variant="outline" className="text-[9px] bg-red-500/10 text-red-500 border-red-500/20">
                                    High Impact
                                </Badge>
                            )}
                        </div>

                        <div className="flex items-baseline gap-2">
                            <span className={`text-2xl font-mono font-bold ${canAfford ? 'text-white' : 'text-red-500'}`}>
                                {formatNumber(projectedCost)}
                            </span>
                            <span className="text-xs text-zinc-500 uppercase font-bold">Fragments</span>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between text-[10px] uppercase font-bold tracking-tighter text-zinc-600">
                                <span>Reservoir Impact</span>
                                <span>{costPercentage.toFixed(1)}%</span>
                            </div>
                            <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-500 ${canAfford ? 'bg-red-500/50' : 'bg-red-600'}`}
                                    style={{ width: `${Math.min(100, costPercentage)}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {!canAfford && (
                        <div className="flex gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/20 items-start">
                            <AlertTriangle className="text-red-500 shrink-0" size={18} />
                            <p className="text-[11px] text-red-400 leading-normal">
                                <span className="font-bold uppercase tracking-tighter">Warning:</span> Insufficient stability in the Reservoir.
                                Overclocking will terminate prematurely once fragments reach zero.
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={onClose} className="text-zinc-500 hover:text-white">
                        Cancel
                    </Button>
                    <Button
                        onClick={() => onConfirm(duration)}
                        className="bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-widest text-xs h-10 px-8 shadow-[0_0_20px_rgba(220,38,38,0.2)]"
                    >
                        Initiate Overclock
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default OverclockDialog;
