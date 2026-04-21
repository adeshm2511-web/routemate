import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuthStore } from "@/store/authStore";
import { riderService } from "@/services/riderService";
import { bookingService } from "@/services/bookingService";
import { paymentService } from "@/services/paymentService";
import { DollarSign, Users, Star, Route, ArrowRight, Bell, Loader2, Car, CheckCircle } from "lucide-react";

export default function RiderDashboard() {
  const { user } = useAuthStore();

  const { data: rider } = useQuery({
    queryKey: ["rider-profile", user?.id],
    queryFn: () => riderService.getRiderByUserId(user!.id),
    enabled: !!user?.id,
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["rider-stats", rider?.id],
    queryFn: () => riderService.getRiderStats(rider!.id),
    enabled: !!rider?.id,
  });

  const { data: earnings } = useQuery({
    queryKey: ["rider-earnings", rider?.id],
    queryFn: () => paymentService.getRiderEarnings(rider!.id),
    enabled: !!rider?.id,
  });

  const { data: pending } = useQuery({
    queryKey: ["pending-bookings", rider?.id],
    queryFn: () => bookingService.getPendingRiderBookings(rider!.id),
    enabled: !!rider?.id,
  });

  if (!rider) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="max-w-lg mx-auto text-center py-20">
          <div className="w-20 h-20 bg-yellow-500/10 border border-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Car className="w-10 h-10 text-yellow-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Complete Your Rider Profile</h2>
          <p className="text-[#94A3B8] mb-6 text-sm">Set up your vehicle details and UPI ID to start accepting rides.</p>
          <Link
            to="/rider/profile"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity shadow-lg shadow-green-500/20"
          >
            Complete Profile
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  if (!rider.is_approved) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="max-w-lg mx-auto text-center py-20">
          <div className="w-20 h-20 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Profile Under Review</h2>
          <p className="text-[#94A3B8] text-sm">Your profile is being verified. You'll be notified once approved (usually within 24 hours).</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Rider Dashboard">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/10 border border-green-500/20 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">Hello, {user?.full_name?.split(" ")[0]}! 🚗</h2>
            <p className="text-[#94A3B8] text-sm mt-1">
              {pending && pending.length > 0 ? `You have ${pending.length} pending ride request${pending.length > 1 ? "s" : ""}` : "No pending requests right now"}
            </p>
          </div>
          <Link
            to="/rider/route-setup"
            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity shadow-lg shadow-green-500/20"
          >
            <Route className="w-4 h-4" /> Add Route
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Rides", value: stats?.totalRides || 0, icon: Car, color: "blue" },
          { label: "Passengers", value: stats?.totalPassengers || 0, icon: Users, color: "cyan" },
          { label: "Total Earned", value: `₹${(stats?.totalEarnings || 0).toFixed(0)}`, icon: DollarSign, color: "green" },
          { label: "Avg Rating", value: stats?.avgRating || "New", icon: Star, color: "yellow" },
        ].map((stat) => {
          const colorMap: Record<string, string> = {
            blue: "bg-blue-500/10 text-blue-400",
            cyan: "bg-cyan-500/10 text-cyan-400",
            green: "bg-green-500/10 text-green-400",
            yellow: "bg-yellow-500/10 text-yellow-400",
          };
          return (
            <div key={stat.label} className="bg-[#0F172A] border border-white/10 rounded-2xl p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colorMap[stat.color]}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-[#94A3B8] mt-1">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Today's Earnings */}
      <div className="grid md:grid-cols-2 gap-5 mb-6">
        <div className="bg-gradient-to-br from-green-600/20 to-green-600/5 border border-green-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[#94A3B8] text-sm">Today's Earnings</span>
            <DollarSign className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white">₹{(earnings?.today || 0).toFixed(0)}</div>
          <Link to="/rider/earnings" className="text-green-400 text-xs mt-3 flex items-center gap-1 hover:text-green-300">
            View details <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[#94A3B8] text-sm">Pending Requests</span>
            <Bell className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white">{pending?.length || 0}</div>
          <Link to="/rider/requests" className="text-blue-400 text-xs mt-3 flex items-center gap-1 hover:text-blue-300">
            View requests <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Pending Requests Preview */}
      {pending && pending.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Pending Ride Requests</h3>
            <Link to="/rider/requests" className="text-sm text-green-400 hover:text-green-300 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {pending.slice(0, 3).map((booking: any) => (
              <div key={booking.id} className="bg-[#0F172A] border border-white/10 rounded-2xl p-5">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                      {booking.passenger?.full_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{booking.passenger?.full_name}</p>
                      <p className="text-[#94A3B8] text-xs">{booking.seats_booked} seat{booking.seats_booked > 1 ? "s" : ""} · ₹{booking.total_fare}</p>
                    </div>
                  </div>
                  <Link
                    to="/rider/requests"
                    className="flex items-center gap-1.5 px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-xs font-medium hover:bg-green-500/20 transition-all"
                  >
                    Review
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
