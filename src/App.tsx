import { useState } from "react"
import { GameProvider } from "@/components/game-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { GeneratorsPage } from "@/pages/GeneratorsPage"
import { OptionsPage } from "@/pages/OptionsPage"

function App() {
  const [activeTab, setActiveTab] = useState("generators")

  return (
    <ThemeProvider defaultTheme="dark" storageKey="breaking-eternity-theme">
      <TooltipProvider delayDuration={300}>
        <GameProvider>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex min-h-screen flex-col gap-0 bg-background text-foreground"
          >
            <Header />
            <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <TabsContent
                value="generators"
                className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden outline-none"
              >
                <GeneratorsPage />
              </TabsContent>
              <TabsContent
                value="options"
                className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden outline-none"
              >
                <OptionsPage />
              </TabsContent>
            </main>
            <Footer />
          </Tabs>
        </GameProvider>
      </TooltipProvider>
    </ThemeProvider>
  )
}

export default App
