import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

import ForBrandsPage from "./pages/ForBrands";
import ForAthletesPage from "./pages/ForAthletes";
import InitiativesPage from "./pages/Initiatives";

import HolaHousesPage from "./pages/HOLAHouses";
import SoccerPage from "./pages/Soccer";
import InfluencerStaffersPage from "./pages/InfluencerStaffers";
import UniversityPartnershipsPage from "./pages/UniversityPartnerships";
import WorkWithUsPage from "./pages/WorkWithUs";
import PackagesPage from "./pages/Packages";
import AdminDashboard from "./pages/AdminDashboard";
import AthleteDashboard from "./pages/AthleteDashboard";
import BrandDashboard from "./pages/BrandDashboard";
import ScrollToTop from "./components/ScrollToTop";
import ResetPassword from "./pages/ResetPassword";
import CommunityNetwork from "./pages/CommunityNetwork";
import CommunityMemberDashboard from "./pages/CommunityMemberDashboard";
import FamilyFriendDashboard from "./pages/FamilyFriendDashboard";
import HighSchoolAthleteDashboard from "./pages/HighSchoolAthleteDashboard";
import AlumniDashboard from "./pages/AlumniDashboard";
import AuthVerify from "./pages/AuthVerify";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          
          <Route path="/for-brands" element={<ForBrandsPage />} />
          <Route path="/for-athletes" element={<ForAthletesPage />} />
          {/* Packages tab hidden - route disabled, keep for future use */}
          {/* <Route path="/packages" element={<PackagesPage />} /> */}
          <Route path="/initiatives" element={<InitiativesPage />} />
          {/* <Route path="/initiatives/collective" element={<CollectivePage />} /> */}
          <Route path="/initiatives/hola-houses" element={<HolaHousesPage />} />
          <Route path="/initiatives/soccer" element={<SoccerPage />} />
          <Route path="/initiatives/influencer-staffers" element={<InfluencerStaffersPage />} />
          <Route path="/initiatives/university-partnerships" element={<UniversityPartnershipsPage />} />
          <Route path="/work-with-us" element={<WorkWithUsPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/athlete/dashboard" element={<AthleteDashboard />} />
          <Route path="/brand/dashboard" element={<BrandDashboard />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/community/network" element={<CommunityNetwork />} />
          <Route path="/community/member" element={<CommunityMemberDashboard />} />
          <Route path="/family/dashboard" element={<FamilyFriendDashboard />} />
          <Route path="/highschool/dashboard" element={<HighSchoolAthleteDashboard />} />
          <Route path="/alumni/dashboard" element={<AlumniDashboard />} />
          <Route path="/auth/verify" element={<AuthVerify />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
