import React from 'react';
import { useGame } from '../game/gameState';
import { Button } from './ui/button';

const IntroView = () => {
    const { completeIntro } = useGame();
    const [isExiting, setIsExiting] = React.useState(false);

    const handleClaim = () => {
        setIsExiting(true);
        setTimeout(() => {
            completeIntro();
        }, 500);
    };

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md transition-all duration-500 ${isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <div className={`bg-card border border-border text-card-foreground rounded-xl shadow-2xl max-w-md w-full p-8 relative mx-4 transition-all duration-500 ${isExiting ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
                <div className="space-y-6">
                    <div className="space-y-2 text-center">
                        <h2 className="text-2xl font-black tracking-tighter">
                            Breaking Eternity
                        </h2>
                    </div>

                    <div className="space-y-4 text-sm leading-relaxed">
                        <p className="text-foreground/90 font-medium">
                            Welcome, Scientist. You are entering a realm where local logic ceases to function.
                        </p>

                        <div className="space-y-3 text-muted-foreground bg-muted/20 p-5 rounded-lg border border-border/50">
                            <p>
                                Your objective is to reach the fundamental limits of numeric representation.
                            </p>
                            <p>
                                Using the <code className="text-primary font-bold">break_eternity.js</code> engine, you will construct technical layers to ascend beyond conventional infinities.
                            </p>
                            <p>
                                Reality starts at <span className="text-foreground font-black">0</span>. It is your task to expand it.
                            </p>
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button
                            onClick={handleClaim}
                            className="w-full h-12 font-bold uppercase tracking-wider"
                        >
                            Claim 1 Eternity Fragment
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IntroView;
