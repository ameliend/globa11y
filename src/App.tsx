import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Header } from "@/components/Header";
import { AIChat } from "@/components/AIChat";
import Auth from "./pages/Auth";
import EntitiesNew from "./pages/EntitiesNew";
import Entity from "./pages/Entity";
import Site from "./pages/Site";
import NewReportSite from "./pages/NewReportSite";
import AuditNew from "./pages/AuditNew";
import ResultsNew from "./pages/ResultsNew";
import MyAccount from "./pages/MyAccount";
import RolesUsers from "./pages/RolesUsers";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen w-full">
                    <Header />
                    <Routes>
                      <Route path="/" element={<EntitiesNew />} />
                      <Route path="/entity/:entityId" element={<Entity />} />
                      <Route path="/site/:siteId" element={<Site />} />
                      <Route path="/site/:siteId/new-report" element={<NewReportSite />} />
                      <Route path="/audit/:reportId" element={<AuditNew />} />
                      <Route path="/results/:reportId" element={<ResultsNew />} />
                      <Route path="/my-account" element={<MyAccount />} />
                      <Route path="/roles-users" element={<RolesUsers />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                    <AIChat />
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
