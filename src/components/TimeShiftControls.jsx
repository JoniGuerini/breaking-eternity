import React from 'react';
import { useGame } from '../game/gameState';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Card, CardContent } from './ui/card';
import { Play, Pause, Clock, X } from 'lucide-react';
import { formatTime, formatNumber } from '../utils/formatUtils';
import { motion, AnimatePresence } from 'framer-motion';

// Reusable Panel component for both view and overlay
export const TimeShiftPanel = ({ isOverlay = false }) => {
    const { gameState, toggleTimeWarp, setWarpSpeed, dismissTimeShift } = useGame();
    const { storedTime, isWarping, warpSpeed } = gameState;

    return (
        <Card className={`${isOverlay ? 'shadow-lg border-2' : 'border shadow-none bg-background/50'}`}>
            <CardContent className="p-6">
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-muted-foreground" />
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-tight">Time Warp</h3>
                                <p className="text-[10px] text-muted-foreground italic">Temporal Siphon Active</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant={isWarping ? "destructive" : "default"}
                                onClick={toggleTimeWarp}
                                disabled={storedTime <= 0 && !isWarping}
                                className="min-w-[120px]"
                            >
                                {isWarping ? (
                                    <><Pause className="w-4 h-4 mr-2" /> Stop</>
                                ) : (
                                    <><Play className="w-4 h-4 mr-2" /> Activate</>
                                )}
                            </Button>
                            {isOverlay && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={dismissTimeShift}
                                    className="h-10 w-10 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Speed Controls with Logarithmic Logic */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-xs font-medium">
                            <div className="flex flex-col">
                                <span className="text-muted-foreground uppercase text-[9px] tracking-widest">Magnitude</span>
                                <span className="font-mono text-lg font-black text-primary">x{formatNumber(warpSpeed)}</span>
                            </div>
                            {isWarping && (
                                <div className="text-right">
                                    <span className="text-muted-foreground uppercase text-[9px] tracking-widest block">Exhaustion In</span>
                                    <span className="font-mono text-zinc-400">{formatTime(storedTime / (warpSpeed - 1))}</span>
                                </div>
                            )}
                        </div>

                        {/* 
                            Logarithmic Slider Mapping:
                            We want a slider from 0 to 100.
                            Speed = 2 * (5000 ^ (val / 100))
                            Alternatively, a simpler step-based approach:
                            [2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000]
                        */}
                        <Slider
                            value={[Math.log10(warpSpeed / 2) / Math.log10(5000) * 100]}
                            max={100}
                            min={0}
                            step={1}
                            onValueChange={(vals) => {
                                const speed = 2 * Math.pow(5000, vals[0] / 100);
                                setWarpSpeed(Math.round(speed));
                            }}
                        />
                        <div className="flex justify-between text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">
                            <span>2x</span>
                            <span>100x</span>
                            <span>1000x</span>
                            <span>10000x</span>
                        </div>
                    </div>

                    {/* Temporal Reservoir Section */}
                    <div className="pt-4 border-t border-white/5">
                        <div className="flex justify-between items-end mb-3">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Temporal Reservoir</span>
                                <span className="text-sm font-mono text-zinc-500 font-bold">{Math.round((storedTime / (gameState.maxStoredTime || 1)) * 100)}% Available</span>
                            </div>
                            <span className="text-xl font-mono font-bold tracking-tighter text-white">
                                {formatTime(storedTime)}
                            </span>
                        </div>

                        {/* Reservoir Bar */}
                        <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5 relative">
                            <motion.div
                                className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 absolute left-0 top-0 shadow-[0_0_10px_rgba(37,99,235,0.5)]"
                                initial={{ width: 0 }}
                                animate={{ width: `${(storedTime / (gameState.maxStoredTime || 1)) * 100}%` }}
                                transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
                            />
                        </div>

                        <p className="text-[10px] text-muted-foreground/50 mt-4 text-center italic">
                            Drain the temporal reservoir to bypass the entropy of the void.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const TimeShiftControls = () => {
    const { gameState } = useGame();
    const { storedTime, isWarping, isTimeShiftDismissed } = gameState;

    // Show the controls if there's stored time OR we are currently warping, AND it hasn't been dismissed
    const showControls = (storedTime > 0 || isWarping) && !isTimeShiftDismissed;

    if (!showControls) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 w-full max-w-lg px-4"
            >
                <TimeShiftPanel isOverlay />
            </motion.div>
        </AnimatePresence>
    );
};

export default TimeShiftControls;
