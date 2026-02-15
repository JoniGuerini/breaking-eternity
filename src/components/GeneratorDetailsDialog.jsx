import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatNumber } from '../utils/formatUtils';
import { GENERATOR_NAMES } from '../game/generatorData';

const GeneratorDetailsDialog = ({
    isOpen,
    onClose,
    generator,
    productionPerSecond,
    baseMaintenanceRate,
    nextMilestone,
    isActive,
    research = {}
}) => {
    const genNum = generator.id + 1;
    const tier = generator.id;
    const rank = nextMilestone.level;
    const researchLevels = {
        eff: research[`gen${genNum}_eff`] || 0,
        resonance: research[`gen${genNum}_resonance`] || 0
    };

    const { eff: efficiencyLevel, resonance: resonanceLevel } = researchLevels;

    const baseRankCost = rank * (genNum * 0.01);
    const effTax = efficiencyLevel * (genNum * 0.01);
    const resonanceTax = resonanceLevel * (genNum * 0.01);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent hideClose={true} className="sm:max-w-[450px] bg-card border-border text-card-foreground p-6 rounded-xl shadow-lg">
                <DialogHeader className="mb-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <DialogTitle className="text-2xl font-bold">{GENERATOR_NAMES[generator.id]}</DialogTitle>
                            <DialogDescription className="text-muted-foreground">
                                Detailed performance and stability metrics.
                            </DialogDescription>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <Badge variant="secondary" className="px-3 py-1 font-semibold text-sm">
                                Rank {rank}
                            </Badge>
                            {isActive && (
                                <Badge variant="destructive" className="px-2 py-0.5 text-xs uppercase font-bold tracking-wider">
                                    Overclocked
                                </Badge>
                            )}
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-8">
                    {/* OPERATION COLUMN */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Operation</h4>
                        <div className="space-y-3">
                            <div className="flex flex-col gap-1.5 border-l-2 border-border pl-3">
                                <div className="flex justify-between items-center text-xs font-medium text-muted-foreground/80">
                                    <span>Units Owned</span>
                                    <span className="font-mono font-bold">{formatNumber(generator.amount)}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs font-medium text-muted-foreground/80">
                                    <span>Generator Efficiency</span>
                                    <span className="font-mono font-bold text-emerald-500">
                                        {formatNumber(productionPerSecond.div(generator.amount.max(1)), { precision: 2 })}
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t border-border/50">
                                <span className="text-xs font-bold uppercase tracking-tight text-muted-foreground">Total Yield</span>
                                <span className="text-xl font-mono font-bold leading-none">
                                    {formatNumber(productionPerSecond)}<span className="text-xs font-normal ml-1">/s</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <Separator className="bg-border/20" />

                    {/* STABILITY COLUMN */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Stability</h4>
                        <div className="space-y-3">
                            <div className="flex flex-col gap-1.5 border-l-2 border-border pl-3">
                                <div className="flex justify-between items-center text-xs font-medium text-muted-foreground/80">
                                    <span>Rank Maintenance</span>
                                    <span className="font-mono">-{baseRankCost.toFixed(2)}/s</span>
                                </div>
                                <div className="flex justify-between items-center text-xs font-medium text-muted-foreground/80">
                                    <span>Efficiency Tax</span>
                                    <span className="font-mono">-{effTax.toFixed(2)}/s</span>
                                </div>
                                <div className="flex justify-between items-center text-xs font-medium text-muted-foreground/80">
                                    <span>Resonance Tax</span>
                                    <span className="font-mono">-{resonanceTax.toFixed(2)}/s</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t border-border/50">
                                <span className="text-xs font-bold uppercase tracking-tight text-muted-foreground">Total Consumption</span>
                                <span className="text-xl font-mono font-bold text-red-500 leading-none">
                                    -{formatNumber(baseMaintenanceRate.times(isActive ? 5 : 1))}<span className="text-xs font-normal ml-1">/s</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog >
    );
};

export default GeneratorDetailsDialog;
