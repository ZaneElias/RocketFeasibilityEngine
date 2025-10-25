import { Switch, Route, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { History, Home as HomeIcon } from "lucide-react";
import Home from "@/pages/Home";
import AnalysisHistory from "@/pages/AnalysisHistory";
import AnalysisDetail from "@/pages/AnalysisDetail";
import NotFound from "@/pages/not-found";
import { ThemeToggle } from "@/components/ThemeToggle";

function Router() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="lg" className="font-bold" data-testid="button-nav-home">
              <HomeIcon className="h-5 w-5 mr-2" />
              Rocket Feasibility Analyzer
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/history">
              <Button variant="ghost" data-testid="button-nav-history">
                <History className="h-4 w-4 mr-2" />
                History
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <Switch>
        <Route path="/" component={Home} />
        <Route path="/history" component={AnalysisHistory} />
        <Route path="/analysis/:id" component={AnalysisDetail} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
