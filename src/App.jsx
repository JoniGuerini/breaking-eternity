import React, { useState } from 'react';
import { GameProvider, useGame } from './game/gameState';
import { useGameLoop } from './hooks/useGameLoop';
import Layout from './components/Layout';
import GeneratorList from './components/GeneratorList';
import ResearchList from './components/ResearchList';
import GameNavigation from './components/GameNavigation';
import ConfirmationDialog from './components/ConfirmationDialog';
import StatisticsView from './components/StatisticsView';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Settings, BarChart3 } from 'lucide-react';
import OfflineDialog from './components/OfflineDialog';
import ChronosView from './components/ChronosView';
import TalentsView from './components/TalentsView';
import ExperimentsView from './components/ExperimentsView';
import GlobalExperimentsList from './components/GlobalExperimentsList';
import IntroView from './components/IntroView';

import Decimal from 'break_eternity.js';
import { RESEARCH_DATA } from './game/researchData';

// Settings View Component
const SettingsView = () => {
  const { saveGame, hardReset, gameState, toggleFPS } = useGame();
  const [activeTab, setActiveTab] = useState('general');
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const subTabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'stats', label: 'Statistics', icon: BarChart3 },
  ];

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto w-full">
      {/* Settings Sub-Nav */}
      <div className="flex-none px-6 py-2 flex justify-center border-b border-border/30 mb-6">
        <div className="bg-muted/50 p-1 rounded-lg flex gap-1">
          {subTabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <Button
                key={tab.id}
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 h-8 px-4 text-xs font-bold transition-all ${isActive ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
              >
                <tab.icon size={14} />
                {tab.label}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-20 custom-scrollbar">
        {activeTab === 'general' && (
          <div className="space-y-8 fade-in-animation">
            <div className="bg-card rounded-xl border p-6">
              <h2 className="text-xl font-bold mb-4">Game Data</h2>
              <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">
                  Your game saves automatically every 5 seconds.
                </p>
                <div className="flex gap-4">
                  <Button onClick={saveGame} variant="outline" className="w-full">
                    Force Save
                  </Button>
                  <Button onClick={() => setIsResetDialogOpen(true)} variant="destructive" className="w-full">
                    Hard Reset
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border p-6">
              <h2 className="text-xl font-bold mb-4">Visuals</h2>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Show FPS Counter</h3>
                    <p className="text-sm text-muted-foreground">
                      Display the current frames per second.
                    </p>
                  </div>
                  <Switch
                    checked={gameState.showFPS}
                    onCheckedChange={toggleFPS}
                  />
                </div>
              </div>
            </div>

            <div className="text-center text-xs text-muted-foreground mt-8">
              Breaking Eternity v0.1.3-beta
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="fade-in-animation">
            <StatisticsView />
          </div>
        )}
      </div>

      <ConfirmationDialog
        isOpen={isResetDialogOpen}
        onClose={() => setIsResetDialogOpen(false)}
        onConfirm={hardReset}
        title="Hard Reset"
        message="Are you sure you want to completely wipe your save? This action cannot be undone."
      />
    </div>
  );
};

function GameContent() {
  useGameLoop();
  const [view, setView] = useState('generators');

  const { gameState } = useGame();

  return (
    <>
      {!gameState.isIntroCompleted && <IntroView />}
      <Layout>
        <div className="h-full w-full flex flex-col px-4 md:px-6 lg:px-8 pt-4 pb-0 space-y-4">
          {/* Fixed Top Section: Resources + Experiments + Nav */}
          <div className="flex-none space-y-4">
            <GlobalExperimentsList />
            <GameNavigation activeView={view} setView={setView} />
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 min-h-0 pb-4">
            {view === 'generators' && (
              <div className="h-full fade-in-animation">
                <GeneratorList />
              </div>
            )}

            {view === 'settings' && (
              <div className="h-full fade-in-animation">
                <SettingsView />
              </div>
            )}

            {view === 'research' && (
              <div className="h-full fade-in-animation">
                <ResearchList />
              </div>
            )}

            {view === 'experiments' && (
              <div className="h-full fade-in-animation">
                <ExperimentsView />
              </div>
            )}

            {view === 'talents' && (
              <div className="h-full fade-in-animation">
                <TalentsView />
              </div>
            )}

            {view === 'chronos' && (
              <div className="h-full fade-in-animation">
                <ChronosView />
              </div>
            )}
          </div>
        </div>
        <OfflineDialog />
      </Layout>
    </>
  );
}

function App() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}

export default App;
