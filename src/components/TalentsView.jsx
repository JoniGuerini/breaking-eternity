import React, { useMemo, useRef, useEffect, memo } from 'react';
import { useGame } from '../game/gameState';
import { TALENT_DATA, TALENT_CURRENCIES, TALENT_TREE_EDGES } from '../game/talentData';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from '../utils/formatUtils';
import * as Icons from 'lucide-react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

// --- Visual Constants (Vertical Layout) ---
const NODE_SIZE = 50;
const X_GAP = 180; // Increased horizontal spread
const Y_GAP = 140; // Vertical spacing between tiers
const CANVAS_WIDTH = 1200; // Reduced to fit screen better
const CANVAS_HEIGHT = 1600;
const START_Y = CANVAS_HEIGHT - 40; // Base closer to bottom
const CENTER_X = CANVAS_WIDTH / 2;

const TalentNode = memo(({
    talent,
    level,
    isPurchasable,
    canAfford,
    buyTalent
}) => {
    const isUnlocked = level > 0;
    const isMaxed = level >= talent.maxLevel;
    const Icon = Icons[talent.icon] || Icons.HelpCircle;

    const currency = talent.path;
    const isFocus = currency === TALENT_CURRENCIES.ACTIVE;

    // Calculate cost for tooltip only
    const cost = !isMaxed ? talent.getCost(level) : null;

    // --- Layout Logic (Vertical Rotation) ---
    const cx = CENTER_X + (talent.position.x * X_GAP);
    const cy = START_Y - (talent.position.y * Y_GAP);

    const color = isFocus ? 'violet' : 'orange';
    const ringColor = isFocus ? 'ring-violet-400' : 'ring-orange-400';
    const textColor = isFocus ? 'text-violet-400' : 'text-orange-400';

    const handleBuy = (e) => {
        e.stopPropagation();
        if (isPurchasable && canAfford && !isMaxed) {
            buyTalent(talent.id);
        }
    };

    return (
        <TooltipProvider>
            <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                    <motion.g
                        onClick={handleBuy}
                        className={`group ${!isPurchasable ? 'grayscale opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${!canAfford && !isMaxed ? 'opacity-80 hover:opacity-100' : ''} ${isMaxed ? 'opacity-100' : ''}`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        {/* Affordable Glow */}
                        {canAfford && !isMaxed && (
                            <circle cx={cx} cy={cy} r={NODE_SIZE / 2 + 5} className={`fill-none stroke-2 ${ringColor} opacity-30 animate-pulse`} />
                        )}

                        {/* Node Background */}
                        <circle
                            cx={cx}
                            cy={cy}
                            r={NODE_SIZE / 2}
                            className={`transition-colors duration-300 ${isUnlocked ? `fill-zinc-900 stroke-2 stroke-${color}-500` : 'fill-zinc-950 stroke-zinc-800 stroke-2'}`}
                        />

                        {/* Inner Fill (Progress Level) */}
                        {level > 0 && (
                            <circle
                                cx={cx}
                                cy={cy}
                                r={(NODE_SIZE / 2) * (Math.min(level, talent.maxLevel) / talent.maxLevel)}
                                className={`${isFocus ? 'fill-violet-500' : 'fill-orange-500'} opacity-30`}
                            />
                        )}

                        {/* Icon */}
                        <foreignObject x={cx - 12} y={cy - 12} width={24} height={24}>
                            <div className={`flex items-center justify-center w-full h-full ${isUnlocked ? `text-${color}-400` : 'text-zinc-600'}`}>
                                <Icon size={24} />
                            </div>
                        </foreignObject>

                        {/* Level Label */}
                        <text x={cx} y={cy + NODE_SIZE / 2 + 20} textAnchor="middle" className="fill-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                            {level}/{talent.maxLevel}
                        </text>
                    </motion.g>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={20} className="bg-zinc-950/95 border-zinc-800 p-4 max-w-[300px] backdrop-blur-md shadow-2xl z-50">
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                            <h4 className={`font-bold text-sm ${textColor}`}>{talent.name}</h4>
                            <div className="flex gap-1">
                                {!isPurchasable && (
                                    <Badge variant="destructive" className="text-[8px] h-5 px-1 uppercase font-black">
                                        Locked
                                    </Badge>
                                )}
                                <Badge variant="outline" className="text-[9px] h-5 border-zinc-700 bg-zinc-900">
                                    Lvl {level} <span className="text-zinc-600 px-1">/</span> {talent.maxLevel}
                                </Badge>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{talent.description}</p>

                        <Separator className="bg-white/10 my-2" />

                        <div className="grid grid-cols-1 gap-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Current Effect</span>
                                <span className="font-mono text-zinc-300 font-bold">{talent.getEffectDisplay(level)}</span>
                            </div>
                            {!isMaxed && (
                                <div className="flex justify-between">
                                    <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Next Level</span>
                                    <span className={`font-mono font-bold ${textColor}`}>{talent.getEffectDisplay(level + 1)}</span>
                                </div>
                            )}
                        </div>

                        {!isMaxed ? (
                            <div className="mt-3 bg-zinc-900 rounded p-2 flex justify-between items-center border border-white/5">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Upgrade Cost</span>
                                <span className={`font-mono font-bold ${canAfford ? 'text-white' : 'text-red-400'}`}>
                                    {formatNumber(cost)} {isFocus ? 'Energy' : 'Essence'}
                                </span>
                            </div>
                        ) : (
                            <div className="mt-3 bg-zinc-900 rounded p-2 text-center border border-emerald-500/20">
                                <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">Maxed Out</span>
                            </div>
                        )}

                        {!isMaxed && (
                            <div className="text-[9px] text-muted-foreground/40 italic text-center mt-1">
                                Click Node to Upgrade
                            </div>
                        )}
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
});

const ConnectionLine = memo(({ start, end, color, isActive }) => {
    return (
        <line
            x1={start.x}
            y1={start.y}
            x2={end.x}
            y2={end.y}
            className={`stroke-2 transition-all duration-700 ${isActive
                ? (color === 'violet' ? 'stroke-violet-400' : 'stroke-orange-400')
                : (color === 'violet' ? 'stroke-violet-500/10' : 'stroke-orange-500/10')
                }`}
            strokeDasharray={isActive ? "0" : "4"}
        />
    );
});

const HeaderStats = ({ type, balance, activeTime, nextPointTime }) => {
    const isFocus = type === TALENT_CURRENCIES.ACTIVE;
    const color = isFocus ? 'text-violet-400' : 'text-orange-400';
    const bg = isFocus ? 'bg-violet-500' : 'bg-orange-500';
    const label = isFocus ? 'Active Energy' : 'Stability Essence';

    return (
        <div className="flex flex-col gap-2 min-w-[200px]">
            <div className="flex justify-between items-baseline">
                <span className={`text-[10px] font-black uppercase tracking-widest ${color}`}>{label}</span>
                <span className="text-xl font-bold font-mono">{formatNumber(balance)}</span>
            </div>
            {isFocus ? (
                <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${bg}`}
                        style={{
                            width: `${(activeTime / nextPointTime) * 100}%`,
                            transition: (activeTime / nextPointTime) < 0.01 ? 'none' : 'width 0.3s linear'
                        }}
                    />
                </div>
            ) : (
                <div className="flex items-center gap-2 text-[10px] uppercase text-orange-500/50 font-bold tracking-widest">
                    <span className="animate-pulse">●</span> Offline Stability
                </div>
            )}
        </div>
    );
};

const TalentsView = () => {
    const { gameState, buyTalent, respecTalents } = useGame();
    const scrollContainerRef = useRef(null);
    const [isReady, setIsReady] = React.useState(false);

    const focusLevel = gameState.talents['milestone_efficiency'] || 0; // Updated from legacy 'focus_mastery'
    const focusInterval = 60 - (focusLevel * 5);

    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const [dragConstraints, setDragConstraints] = React.useState({ left: 0, right: 0, top: 0, bottom: 0 });

    // Initial setup with a slight delay to ensure accurate DOM measurements
    useEffect(() => {
        const setupView = () => {
            if (scrollContainerRef.current) {
                const { clientWidth, clientHeight } = scrollContainerRef.current;

                // Centering math
                const initX = -(CENTER_X - clientWidth / 2);
                const initY = -(CANVAS_HEIGHT - clientHeight); // Bottom

                x.set(initX);
                y.set(initY);
                setIsReady(true);
            }
        };

        const timer = setTimeout(setupView, 100);

        const handleResize = () => {
            // We don't necessarily want to force centering on every resize
            // but we could update constraints if we were using the object method.
            // Since we'll use the ref method, we don't need to do much here.
        };

        window.addEventListener('resize', handleResize);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', handleResize);
        };
    }, [x, y]);

    // Tree Rendering Helpers
    const getCoords = (talent) => ({
        x: CENTER_X + (talent.position.x * X_GAP),
        y: START_Y - (talent.position.y * Y_GAP)
    });
    const getCoordsById = (id) => {
        if (!id) return { x: CENTER_X, y: START_Y };
        const t = TALENT_DATA.find((x) => x.id === id);
        return t ? getCoords(t) : { x: CENTER_X, y: START_Y };
    };
    const getColorById = (id) => (TALENT_DATA.find((t) => t.id === id)?.path === TALENT_CURRENCIES.ACTIVE ? 'violet' : 'orange');
    const originCoords = { x: CENTER_X, y: START_Y };

    // --- MEMOIZED RENDER DATA ---
    const treeData = useMemo(() => {
        const nodes = TALENT_DATA.map(talent => {
            const level = gameState.talents[talent.id] || 0;
            const isMaxed = level >= talent.maxLevel;
            const currency = talent.path;
            const canAfford = !isMaxed && gameState[currency].gte(talent.getCost(level));

            const edgesToNode = TALENT_TREE_EDGES.filter(e => e.to === talent.id);
            const isRoot = edgesToNode.some(e => e.from === null);
            const isPurchasable = isRoot || edgesToNode.some(e => (gameState.talents[e.from] || 0) > 0);

            return { talent, level, isPurchasable, canAfford };
        });

        const edges = TALENT_TREE_EDGES.map((edge, i) => {
            const start = getCoordsById(edge.from);
            const end = getCoordsById(edge.to);
            const color = getColorById(edge.to);
            const isActive = edge.from === null || (gameState.talents[edge.from] || 0) > 0;

            return { key: i, from: edge.from, start, end, color, isActive };
        });

        return { nodes, edges };
    }, [gameState.talents, gameState.activeEnergy, gameState.stabilityEssence]);

    return (
        <div className="h-full w-full flex flex-col relative overflow-hidden bg-zinc-950">
            {/* Header */}
            <div className="flex-none p-6 pb-2 flex justify-between items-start z-10 bg-gradient-to-b from-zinc-950 to-transparent pointer-events-none">
                <div className="pointer-events-auto flex items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-white">Talents</h2>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1">Drag to pan • Click to upgrade</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground/50 hover:text-red-400 hover:bg-red-900/10"
                        title="Respec Talents (Refund All)"
                        onClick={respecTalents}
                    >
                        <Icons.RotateCcw size={16} />
                    </Button>
                </div>
                <div className="flex gap-12 pointer-events-auto">
                    <HeaderStats
                        type={TALENT_CURRENCIES.ACTIVE}
                        balance={gameState.activeEnergy}
                        activeTime={gameState.activeTime}
                        nextPointTime={focusInterval}
                    />
                    <HeaderStats
                        type={TALENT_CURRENCIES.STABILITY}
                        balance={gameState.stabilityEssence}
                    />
                </div>
            </div>

            {/* Viewport */}
            <div
                ref={scrollContainerRef}
                className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing touch-none select-none"
            >
                {/* Draggable Canvas (Only renders when ready to prevent jumping) */}
                <motion.div
                    drag
                    dragConstraints={scrollContainerRef}
                    dragMomentum={true}
                    dragElastic={0}
                    style={{ x, y }}
                    className="absolute"
                >
                    <div style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
                        <svg
                            width={CANVAS_WIDTH}
                            height={CANVAS_HEIGHT}
                            viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
                            className="overflow-visible pointer-events-none"
                        >
                            {/* --- CONNECTION LINES --- */}
                            {treeData.edges.map(edge => (
                                edge.from === null ? (
                                    <line
                                        key={edge.key}
                                        x1={edge.start.x} y1={edge.start.y} x2={edge.end.x} y2={edge.end.y}
                                        className={`transition-opacity duration-700 ${edge.color === 'violet' ? 'stroke-violet-500/40' : 'stroke-orange-500/40'} stroke-2`}
                                    />
                                ) : (
                                    <ConnectionLine
                                        key={edge.key}
                                        start={edge.start}
                                        end={edge.end}
                                        color={edge.color}
                                        isActive={edge.isActive}
                                    />
                                )
                            ))}

                            {/* --- ROOT POINT --- */}
                            <circle cx={originCoords.x} cy={originCoords.y} r={10} className="fill-white animate-pulse" />

                            {/* --- TALENT NODES --- */}
                            {treeData.nodes.map(node => (
                                <g key={node.talent.id} className="pointer-events-auto">
                                    <TalentNode
                                        talent={node.talent}
                                        level={node.level}
                                        isPurchasable={node.isPurchasable}
                                        canAfford={node.canAfford}
                                        buyTalent={buyTalent}
                                    />
                                </g>
                            ))}
                        </svg>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default TalentsView;
