import React, { useState, useMemo } from 'react';
import {
    AlertDialog as Dialog,
    AlertDialogContent as DialogContent,
    AlertDialogHeader as DialogHeader,
    AlertDialogTitle as DialogTitle,
    AlertDialogDescription as DialogDescription,
    AlertDialogFooter as DialogFooter,
    AlertDialogCancel as DialogCancel,
    AlertDialogAction as DialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Zap, AlertTriangle, Clock, Droplet } from 'lucide-react';
import { formatNumber } from '../utils/formatUtils';
import { GENERATOR_NAMES } from '../game/generatorData';

const OverclockDialog = ({
    isOpen,
    onClose,
    onConfirm,
    generator,
    baseMaintenanceRate,
    reservoirEternityFragments
}) => {
    const [duration, setDuration] = useState(5); // Default 5 minutes

    const projectedCost = useMemo(() => {
        const ratePerSec = baseMaintenanceRate.times(20);
        return ratePerSec.times(duration * 60);
    }, [baseMaintenanceRate, duration]);

    const canAfford = reservoirEternityFragments.gte(projectedCost);
    const costPercentage = reservoirEternityFragments.gt(0)
        ? projectedCost.div(reservoirEternityFragments).times(100).toNumber()
        : 100;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-card border-border text-card-foreground p-6 rounded-xl shadow-lg">
                <DialogHeader className="mb-6 text-left">
                    <DialogTitle className="text-2xl font-bold tracking-tight">Experimental Overclock</DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground mt-2">
                        Configure the temporal force for <span className="font-semibold text-foreground tracking-tight">{GENERATOR_NAMES[generator.id]}</span>.
                        Production increases by <span className="text-emerald-500 font-bold">5x</span> with a <span className="text-red-500 font-bold">20x</span> stability penalty.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-8">
                    {/* Duration Slider */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Duration</span>
                            <span className="text-2xl font-mono font-bold leading-none">
                                {duration}<span className="text-xs font-normal text-muted-foreground ml-1">min</span>
                            </span>
                        </div>
                        <Slider
                            value={[duration]}
                            onValueChange={(vals) => setDuration(vals[0])}
                            max={60}
                            min={1}
                            step={1}
                            className="py-2"
                        />
                    </div>

                    {/* Cost Estimation */}
                    <div className="p-4 rounded-lg border border-border/40 bg-muted/20 space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Est. Stability Cost</span>
                            {costPercentage > 50 && (
                                <Badge variant="destructive" className="text-[10px] h-5 px-2 uppercase tracking-tight">
                                    High Impact
                                </Badge>
                            )}
                        </div>

                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-mono font-bold text-foreground">
                                {formatNumber(projectedCost)}
                            </span>
                            <span className="text-xs text-muted-foreground uppercase font-bold tracking-tight">Eternity Fragments</span>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs uppercase font-bold tracking-tight text-muted-foreground/80">
                                <span>Reservoir Impact</span>
                                <span className={costPercentage > 80 ? 'text-red-500' : ''}>{costPercentage.toFixed(1)}%</span>
                            </div>
                            <Progress
                                value={Math.min(100, costPercentage)}
                                className={`h-1.5 ${costPercentage > 80 ? '[&>div]:bg-red-500' : ''}`}
                            />
                        </div>
                    </div>

                    {!canAfford && (
                        <div className="flex gap-3 p-4 rounded-lg bg-muted/40 border border-border/50 text-foreground items-start">
                            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-orange-500" />
                            <p className="text-sm leading-tight">
                                <span className="font-bold">Warning:</span> Insufficient stability.
                                Overclocking will terminate if Eternity Fragments reach zero.
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter className="mt-8 gap-3 sm:gap-2">
                    <DialogCancel onClick={onClose} className="h-10 px-6 font-semibold border-border/50 text-xs uppercase tracking-wider">
                        Cancel
                    </DialogCancel>
                    <Button
                        variant="destructive"
                        onClick={() => onConfirm(duration)}
                        className="h-10 px-6 font-semibold text-xs uppercase tracking-wider"
                    >
                        Initiate Overclock
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default OverclockDialog;
