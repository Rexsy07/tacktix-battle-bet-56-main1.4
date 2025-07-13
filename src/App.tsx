
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import ProfileSetup from "./pages/ProfileSetup";
import Matchmaking from "./pages/Matchmaking";
import JoinMatch from "./pages/JoinMatch";
import FeatureMatchDetails from "./pages/FeatureMatchDetails";
import SubmitResult from "./pages/SubmitResult";
import Wallet from "./pages/Wallet";
import History from "./pages/History";
import Leaderboards from "./pages/Leaderboards";
import HowItWorks from "./pages/HowItWorks";
import VipDashboard from "./pages/VipDashboard";
import DuelChallenge from "./pages/DuelChallenge";
import Spectate from "./pages/Spectate";
import ModeratorPanel from "./pages/ModeratorPanel";
import Forum from "./pages/Forum";
import Announcements from "./pages/Announcements";
import Tournaments from "./pages/Tournaments";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="/matchmaking" element={<Matchmaking />} />
            <Route path="/join-match/:matchId" element={<JoinMatch />} />
            <Route path="/featured-match/:matchId" element={<FeatureMatchDetails />} />
            <Route path="/match-details/:matchId" element={<FeatureMatchDetails />} />
            <Route path="/submit-result/:matchId" element={<SubmitResult />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/history" element={<History />} />
            <Route path="/leaderboards" element={<Leaderboards />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/vip" element={<VipDashboard />} />
            <Route path="/vip-dashboard" element={<VipDashboard />} />
            <Route path="/duel-challenge" element={<DuelChallenge />} />
            <Route path="/spectate" element={<Spectate />} />
            <Route path="/moderator" element={<ModeratorPanel />} />
            <Route path="/moderator-panel" element={<ModeratorPanel />} />
            <Route path="/forum" element={<Forum />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/tournaments" element={<Tournaments />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
