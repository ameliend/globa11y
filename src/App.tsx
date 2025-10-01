import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AppProvider } from "@/contexts/AppContext";
import Entities from "./pages/Entities";
import EntityDashboard from "./pages/EntityDashboard";
import NewReport from "./pages/NewReport";
import Audit from "./pages/Audit";
import Results from "./pages/Results";
import Reports from "./pages/Reports";
import Audits from "./pages/Audits";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              <AppSidebar />
              <main className="flex-1">
                <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
                  <div className="flex h-14 items-center px-4">
                    <SidebarTrigger />
                  </div>
                </div>
                <Routes>
                  <Route path="/" element={<Entities />} />
                  <Route path="/entity/:entityId" element={<EntityDashboard />} />
                  <Route path="/entity/:entityId/new-report" element={<NewReport />} />
                  <Route path="/audit/:reportId" element={<Audit />} />
                  <Route path="/results/:reportId" element={<Results />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/audits" element={<Audits />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
