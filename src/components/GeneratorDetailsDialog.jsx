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
    const totalUpgradeTax = (efficiencyLevel + resonanceLevel) * (genNum * 0.01);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[550px] bg-card border-border text-card-foreground p-6 rounded-xl shadow-lg">
                <DialogHeader className="mb-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <DialogTitle className="text-2xl font-bold">Generator {genNum}</DialogTitle>
                            <DialogDescription className="text-muted-foreground">
                                Detailed performance and stability metrics.
                            </DialogDescription>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <Badge variant="secondary" className="px-3 py-1 font-semibold text-sm">
                                Rank {rank}
                            </Badge>
                            {isActive && (
                                <Badge variant="destructive" className="px-2 py-0 text-[10px] uppercase font-bold tracking-wider">
                                    Overclocked
                                </Badge>
                            )}
                        </div>
                    </div>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* OPERATION COLUMN */}
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Operation</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-sm text-muted-foreground">Total Production</span>
                                    <span className="text-lg font-mono font-bold leading-none">
                                        {formatNumber(productionPerSecond)}<span className="text-xs font-normal ml-1">/s</span>
                                    </span>
                                </div>
                                <div className="flex justify-between items-end border-t border-border pt-2">
                                    <span className="text-sm text-muted-foreground">Unit Efficiency</span>
                                    <span className="text-base font-mono font-bold text-emerald-500 leading-none">
                                        {formatNumber(productionPerSecond.div(generator.amount.max(1)), { precision: 2 })}
                                    </span>
                                </div>
                                <div className="flex justify-between items-end border-t border-border pt-2">
                                    <span className="text-sm text-muted-foreground">Units Owned</span>
                                    <span className="text-base font-mono font-bold leading-none">
                                        {formatNumber(generator.amount)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-2">
                            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Stability</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-sm text-muted-foreground">Maintenance</span>
                                    <span className="text-base font-mono font-bold text-red-500 leading-none">
                                        -{formatNumber(baseMaintenanceRate.times(isActive ? 5 : 1))}<span className="text-xs font-normal ml-1">/s</span>
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1 border-l-2 border-border pl-2">
                                    <div className="flex justify-between items-center text-[11px] font-medium text-muted-foreground">
                                        <span>Rank Maintenance</span>
                                        <span>-{baseRankCost.toFixed(2)}/s</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[11px] font-medium text-muted-foreground">
                                        <span>Upgrade Tax</span>
                                        <span>-{totalUpgradeTax.toFixed(2)}/s</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ENHANCEMENTS COLUMN */}
                    <div className="space-y-6">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Technical Ranks</h4>
                        <div className="grid gap-3">
                            <div className="flex justify-between items-center p-3 rounded-lg border border-border bg-muted/30">
                                <span className="text-xs font-medium">Production Yield</span>
                                <span className="font-bold text-sm">Rank {efficiencyLevel}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-lg border border-border bg-muted/30">
                                <span className="text-xs font-medium">Resonance Level</span>
                                <span className="font-bold text-sm">Rank {resonanceLevel}</span>
                            </div>
                        </div>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    );
};

export default GeneratorDetailsDialog;
