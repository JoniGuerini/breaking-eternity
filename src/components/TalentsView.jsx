import React, { useMemo, useRef, useEffect, memo } from 'react';
import { useGame } from '../game/gameState';
import { TALENT_DATA, TALENT_CURRENCIES, TALENT_TREE_EDGES } from '../game/talentData';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from '../utils/formatUtils';
import * as Icons from 'lucide-react';
import { motion } from 'framer-motion';
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
    const isFocus = currency === TALENT_CURRENCIES.FOCUS;

    // Calculate cost for tooltip only
    const cost = !isMaxed ? talent.getCost(level) : null;

    // --- Layout Logic (Vertical Rotation) ---
    const cx = CENTER_X + (talent.position.x * X_GAP);
    const cy = START_Y - (talent.position.y * Y_GAP);

    const color = isFocus ? 'blue' : 'amber';
    const ringColor = isFocus ? 'ring-blue-400' : 'ring-amber-400';
    const textColor = isFocus ? 'text-blue-400' : 'text-amber-400';

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
                                className={`${isFocus ? 'fill-blue-500' : 'fill-amber-500'} opacity-30`}
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
                                    {formatNumber(cost)} {currency}
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
                ? (color === 'blue' ? 'stroke-blue-400' : 'stroke-amber-400')
                : (color === 'blue' ? 'stroke-blue-500/10' : 'stroke-amber-500/10')
                }`}
            strokeDasharray={isActive ? "0" : "4"}
        />
    );
});

const HeaderStats = ({ type, balance, activeTime, nextPointTime }) => {
    const isFocus = type === TALENT_CURRENCIES.FOCUS;
    const color = isFocus ? 'text-blue-400' : 'text-amber-400';
    const bg = isFocus ? 'bg-blue-500' : 'bg-amber-500';

    return (
        <div className="flex flex-col gap-2 min-w-[200px]">
            <div className="flex justify-between items-baseline">
                <span className={`text-xs font-black uppercase tracking-widest ${color}`}>{type}</span>
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
                <div className="flex items-center gap-2 text-[10px] uppercase text-amber-500/50 font-bold tracking-widest">
                    <span className="animate-pulse">●</span> Offline Gen
                </div>
            )}
        </div>
    );
};

const TalentsView = () => {
    const { gameState, buyTalent, respecTalents } = useGame();
    const focusLevel = gameState.talents['focus_mastery'] || 0;
    const focusInterval = 60 - (focusLevel * 5);
    const [dragConstraints, setDragConstraints] = React.useState({ left: 0, right: 0, top: 0, bottom: 0 });
    const dragControls = useRef({ x: 0, y: 0 });

    // Calculate constraints based on window/container size
    useEffect(() => {
        const updateConstraints = () => {
            if (scrollContainerRef.current) {
                const { clientWidth, clientHeight } = scrollContainerRef.current;
                setDragConstraints({
                    left: -(CANVAS_WIDTH - clientWidth),
                    right: 100, // Small buffer
                    top: -(CANVAS_HEIGHT - clientHeight),
                    bottom: 100 // Small buffer
                });
            }
        };

        updateConstraints();
        window.addEventListener('resize', updateConstraints);
        return () => window.removeEventListener('resize', updateConstraints);
    }, []);

    // Initial position: center horizontally and show bottom vertically
    const initialX = useMemo(() => {
        if (typeof window === 'undefined') return 0;
        const containerWidth = window.innerWidth; // Approximate
        return -(CENTER_X - containerWidth / 2);
    }, []);

    const initialY = -(CANVAS_HEIGHT - 600); // Approximate bottom view

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
    const getColorById = (id) => (TALENT_DATA.find((t) => t.id === id)?.path === TALENT_CURRENCIES.FOCUS ? 'blue' : 'amber');
    const originCoords = { x: CENTER_X, y: START_Y };

    // --- MEMOIZED RENDER DATA ---
    // We pre-calculate all the derived data for the tree to avoid doing it
    // on every render cycle. This drastically improves performance during ticks.
    const treeData = useMemo(() => {
        // Prepare nodes with their specific states
        const nodes = TALENT_DATA.map(talent => {
            const level = gameState.talents[talent.id] || 0;
            const isMaxed = level >= talent.maxLevel;
            const currency = talent.path;
            const canAfford = !isMaxed && gameState[currency].gte(talent.getCost(level));

            // Prerequisite check
            const edgesToNode = TALENT_TREE_EDGES.filter(e => e.to === talent.id);
            const isRoot = edgesToNode.some(e => e.from === null);
            const isPurchasable = isRoot || edgesToNode.some(e => (gameState.talents[e.from] || 0) > 0);

            return {
                talent,
                level,
                isPurchasable,
                canAfford
            };
        });

        // Prepare edges with their active states
        const edges = TALENT_TREE_EDGES.map((edge, i) => {
            const start = getCoordsById(edge.from);
            const end = getCoordsById(edge.to);
            const color = getColorById(edge.to);
            const isActive = edge.from === null || (gameState.talents[edge.from] || 0) > 0;

            return {
                key: i,
                from: edge.from,
                start,
                end,
                color,
                isActive
            };
        });

        return { nodes, edges };
    }, [gameState.talents, gameState.focus, gameState.flux]); // Only re-calc when relevant state changes

    return (
        <div className="h-full w-full flex flex-col relative overflow-hidden">
            {/* Header */}
            <div className="flex-none p-6 pb-2 flex justify-between items-start z-10 bg-gradient-to-b from-background to-transparent pointer-events-none">
                <div className="pointer-events-auto flex items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Talents</h2>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1">Hover for details • Click to upgrade</p>
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
                        type={TALENT_CURRENCIES.FOCUS}
                        balance={gameState.focus}
                        activeTime={gameState.activeTime}
                        nextPointTime={focusInterval}
                    />
                    <HeaderStats
                        type={TALENT_CURRENCIES.FLUX}
                        balance={gameState.flux}
                    />
                </div>
            </div>

            <div
                ref={scrollContainerRef}
                className="flex-1 relative overflow-hidden p-0 cursor-grab active:cursor-grabbing touch-none"
            >
                <motion.div
                    drag
                    dragConstraints={dragConstraints}
                    dragElastic={0.05}
                    dragMomentum={true}
                    initial={{ x: initialX, y: initialY }}
                    className="w-fit h-fit"
                >
                    <svg
                        width={CANVAS_WIDTH}
                        height={CANVAS_HEIGHT}
                        viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
                        className="overflow-visible pointer-events-none"
                    >
                        {/* --- BACKGROUND LINES --- */}
                        {treeData.edges.map(edge => (
                            edge.from === null ? (
                                <line
                                    key={edge.key}
                                    x1={edge.start.x} y1={edge.start.y} x2={edge.end.x} y2={edge.end.y}
                                    className={`transition-opacity duration-700 ${edge.color === 'blue' ? 'stroke-blue-500/40' : 'stroke-amber-500/40'} stroke-2`}
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

                        {/* --- INTERACTIVE NODES --- */}
                        {/* Origin Node */}
                        <circle cx={originCoords.x} cy={originCoords.y} r={10} className="fill-white animate-pulse" />

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
                </motion.div>
            </div>
        </div>
    );
};

export default TalentsView;
