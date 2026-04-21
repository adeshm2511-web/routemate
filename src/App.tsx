import { useEffect } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/authService";

// Public Pages
import LandingPage from "@/pages/public/LandingPage";
import HowItWorks from "@/pages/public/HowItWorks";
import SafetyPage from "@/pages/public/SafetyPage";
import ContactPage from "@/pages/public/ContactPage";

// Auth Pages
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";

// Passenger Pages
import PassengerDashboard from "@/pages/passenger/Dashboard";
import FindRide from "@/pages/passenger/FindRide";
import RideDetails from "@/pages/passenger/RideDetails";
import TrackRider from "@/pages/passenger/TrackRider";
import PaymentPage from "@/pages/passenger/PaymentPage";
import PassengerHistory from "@/pages/passenger/RideHistory";

// Rider Pages
import RiderDashboard from "@/pages/rider/Dashboard";
import RouteSetup from "@/pages/rider/RouteSetup";
import RideRequests from "@/pages/rider/RideRequests";
import EarningsPage from "@/pages/rider/EarningsPage";
import RiderProfile from "@/pages/rider/RiderProfile";
import RiderHistory from "@/pages/rider/RideHistory";

// Admin Pages
import AdminDashboard from "@/pages/admin/Dashboard";
import UserManagement from "@/pages/admin/UserManagement";
import RideMonitoring from "@/pages/admin/RideMonitoring";
import PaymentsOverview from "@/pages/admin/PaymentsOverview";

// Layout
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import RoleRoute from "@/components/layout/RoleRoute";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
});

export default function App() {
  const { loadUser, setUser } = useAuthStore();

  useEffect(() => {
    loadUser();

    const {
      data: { subscription },
    } = authService.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") setUser(null);
      else if (session) loadUser();
    });

    return () => subscription.unsubscribe();
  }, [loadUser, setUser]);

  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/safety" element={<SafetyPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Passenger */}
          <Route element={<ProtectedRoute />}>
            <Route element={<RoleRoute role="passenger" />}>
              <Route path="/passenger/dashboard" element={<PassengerDashboard />} />
              <Route path="/passenger/find-ride" element={<FindRide />} />
              <Route path="/passenger/ride/:id" element={<RideDetails />} />
              <Route path="/passenger/track/:bookingId" element={<TrackRider />} />
              <Route path="/passenger/payment/:bookingId" element={<PaymentPage />} />
              <Route path="/passenger/history" element={<PassengerHistory />} />
            </Route>

            {/* Rider */}
            <Route element={<RoleRoute role="rider" />}>
              <Route path="/rider/dashboard" element={<RiderDashboard />} />
              <Route path="/rider/route-setup" element={<RouteSetup />} />
              <Route path="/rider/requests" element={<RideRequests />} />
              <Route path="/rider/earnings" element={<EarningsPage />} />
              <Route path="/rider/profile" element={<RiderProfile />} />
              <Route path="/rider/history" element={<RiderHistory />} />
            </Route>

            {/* Admin */}
            <Route element={<RoleRoute role="admin" />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/rides" element={<RideMonitoring />} />
              <Route path="/admin/payments" element={<PaymentsOverview />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>

      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}
