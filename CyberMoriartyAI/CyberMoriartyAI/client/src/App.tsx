import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import VulnerabilitySearch from "@/pages/vulnerability-search";
import RiskAssessment from "@/pages/risk-assessment";
import TestEnvironment from "@/pages/test-environment";
import Reports from "@/pages/reports";
import ExploitDevelopment from "@/pages/exploit-development";
import NotFound from "@/pages/not-found";
import Sidebar from "@/components/layout/sidebar";

function Router() {
  return (
    <div className="flex h-screen overflow-hidden bg-dark-900">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/vulnerability-search" component={VulnerabilitySearch} />
          <Route path="/risk-assessment" component={RiskAssessment} />
          <Route path="/test-environment" component={TestEnvironment} />
          <Route path="/exploit-development" component={ExploitDevelopment} />
          <Route path="/reports" component={Reports} />
          <Route component={NotFound} />
        </Switch>
      </div>
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
