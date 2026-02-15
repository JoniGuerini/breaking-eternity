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

const OverclockDialog = ({
    isOpen,
    onClose,
    onConfirm,
    generator,
    baseMaintenanceRate,
    reservoirEternityFragments
}) => {
    const [duration, setDuration] = useState(5); // Default 5 minutes

    // Calculate cost: (BaseRate * 20 penalty) * seconds
    // baseMaintenanceRate is already per-second maintenance for this generator
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
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Zap className="text-primary h-6 w-6" />
                        </div>
                        <DialogTitle>Experimental Overclock</DialogTitle>
                    </div>
                    <DialogDescription>
                        Configure the temporal force for <span className="font-semibold text-foreground">Generator {generator.id + 1}</span>.
                        This increases production by <span className="font-semibold text-foreground">5x</span> but consumes stability <span className="font-semibold text-foreground">20x faster</span>.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-6">
                    {/* Duration Slider */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                <Clock className="h-3.5 w-3.5" />
                                Duration
                            </div>
                            <span className="text-2xl font-mono font-bold">
                                {duration} <span className="text-sm font-normal text-muted-foreground">min</span>
                            </span>
                        </div>
                        <Slider
                            value={[duration]}
                            onValueChange={(vals) => setDuration(vals[0])}
                            max={60}
                            min={1}
                            step={1}
                        />
                    </div>

                    {/* Cost Estimation Card */}
                    <Card>
                        <CardContent className="p-4 space-y-4">
                            <div className="flex justify-between items-center text-xs uppercase font-semibold tracking-wider text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Droplet className="h-3.5 w-3.5 text-primary" />
                                    Est. Stability Cost
                                </div>
                                {costPercentage > 50 && (
                                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                                        High Impact
                                    </Badge>
                                )}
                            </div>

                            <div className="flex items-baseline gap-2">
                                <span className={`text-2xl font-mono font-bold ${canAfford ? 'text-foreground' : 'text-destructive'}`}>
                                    {formatNumber(projectedCost)}
                                </span>
                                <span className="text-xs text-muted-foreground uppercase font-semibold">Eternity Fragments</span>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] uppercase font-semibold tracking-tight text-muted-foreground">
                                    <span>Reservoir Impact</span>
                                    <span>{costPercentage.toFixed(1)}%</span>
                                </div>
                                <Progress
                                    value={Math.min(100, costPercentage)}
                                    className="h-1.5"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {!canAfford && (
                        <div className="flex gap-3 p-3 rounded-lg bg-muted text-muted-foreground items-start">
                            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                            <p className="text-xs leading-normal">
                                <span className="font-bold">Warning:</span> Insufficient stability in the Reservoir.
                                Overclocking will terminate prematurely once Eternity Fragments reach zero.
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <DialogCancel onClick={onClose}>Cancel</DialogCancel>
                    <Button
                        variant="destructive"
                        onClick={() => onConfirm(duration)}
                        className="font-semibold uppercase tracking-wider text-xs"
                    >
                        Initiate Overclock
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default OverclockDialog;
