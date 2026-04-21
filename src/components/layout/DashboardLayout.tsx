import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import {
  LayoutDashboard, Search, MapPin, CreditCard, History,
  Navigation, Route, Users, DollarSign, LogOut, Menu, X,
  Bell, ChevronRight, Shield
} from "lucide-react";

interface NavItem {
  icon: React.ComponentType<any>;
  label: string;
  href: string;
}

const passengerNav: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/passenger/dashboard" },
  { icon: Search, label: "Find Ride", href: "/passenger/find-ride" },
  { icon: History, label: "My Rides", href: "/passenger/history" },
];

const riderNav: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/rider/dashboard" },
  { icon: Route, label: "My Routes", href: "/rider/route-setup" },
  { icon: Users, label: "Ride Requests", href: "/rider/requests" },
  { icon: DollarSign, label: "Earnings", href: "/rider/earnings" },
  { icon: History, label: "Ride History", href: "/rider/history" },
];

const adminNav: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: Navigation, label: "Rides", href: "/admin/rides" },
  { icon: CreditCard, label: "Payments", href: "/admin/payments" },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { user, signOut } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems =
    user?.role === "rider" ? riderNav :
    user?.role === "admin" ? adminNav :
    passengerNav;

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  const roleColor = user?.role === "rider" ? "text-green-400" : user?.role === "admin" ? "text-purple-400" : "text-blue-400";
  const roleBg = user?.role === "rider" ? "bg-green-400/10" : user?.role === "admin" ? "bg-purple-400/10" : "bg-blue-400/10";

  return (
    <div className="min-h-screen bg-[#020617] flex">
      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-[#0F172A] border-r border-white/5 z-30 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Navigation className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">RouteMate</span>
          </Link>
          <button className="lg:hidden text-[#94A3B8]" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-white/5">
          <div className={`flex items-center gap-3 p-3 rounded-xl ${roleBg}`}>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
              {user?.full_name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.full_name}</p>
              <p className={`text-xs font-medium capitalize ${roleColor}`}>{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="p-4 space-y-1 flex-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/20"
                    : "text-[#94A3B8] hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="w-3 h-3" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-white/5 space-y-1">
          {user?.role === "rider" && (
            <Link
              to="/rider/profile"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-[#94A3B8] hover:bg-white/5 hover:text-white transition-all"
            >
              <Shield className="w-4 h-4" />
              <span>Profile & Verification</span>
            </Link>
          )}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-400/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-[#94A3B8] hover:text-white"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            {title && <h1 className="text-white font-semibold text-lg">{title}</h1>}
          </div>
          <button className="relative text-[#94A3B8] hover:text-white p-2 rounded-lg hover:bg-white/5 transition-all">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
          </button>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
