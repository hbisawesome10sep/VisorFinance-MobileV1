import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/common/theme-provider";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { DesktopNavigation } from "@/components/layout/navigation";
import { MobileNavigation } from "@/components/layout/mobile-nav";

import Dashboard from "@/pages/dashboard";
import Transactions from "@/pages/transactions";
import Insights from "@/pages/insights";
import Investments from "@/pages/investments";
import Settings from "@/pages/new-settings";
import AuthDemo from "@/pages/auth-demo";
import Landing from "@/pages/auth/landing";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import NotFound from "@/pages/not-found";

function AuthenticatedApp() {
  return (
    <>
      <DesktopNavigation />
      <main className="lg:pl-64 pb-20 lg:pb-0">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/transactions" component={Transactions} />
          <Route path="/insights" component={Insights} />
          <Route path="/investments" component={Investments} />
          <Route path="/settings" component={Settings} />
          <Route path="/auth-demo" component={AuthDemo} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <MobileNavigation />
    </>
  );
}

function UnauthenticatedApp() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/auth-demo" component={AuthDemo} />
      <Route path="/api/logout">
        {() => {
          // Redirect to home if someone accidentally navigates to logout URL
          window.location.href = '/';
          return null;
        }}
      </Route>
      <Route component={Landing} />
    </Switch>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <AuthenticatedApp /> : <UnauthenticatedApp />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AuthProvider>
            <div className="min-h-screen bg-background">
              <AppContent />
              <Toaster />
            </div>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
