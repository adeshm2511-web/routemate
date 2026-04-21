import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuthStore } from "@/store/authStore";
import { bookingService } from "@/services/bookingService";
import { Search, MapPin, Clock, CheckCircle, XCircle, Loader2, ArrowRight, Navigation } from "lucide-react";

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Pending", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20", icon: Clock },
  confirmed: { label: "Confirmed", color: "text-blue-400 bg-blue-400/10 border-blue-400/20", icon: Navigation },
  completed: { label: "Completed", color: "text-green-400 bg-green-400/10 border-green-400/20", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "text-red-400 bg-red-400/10 border-red-400/20", icon: XCircle },
};

export default function PassengerDashboard() {
  const { user } = useAuthStore();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["passenger-bookings", user?.id],
    queryFn: () => bookingService.getPassengerBookings(user!.id),
    enabled: !!user?.id,
  });

  const active = bookings?.filter((b) => ["pending", "confirmed"].includes(b.status)) || [];
  const completed = bookings?.filter((b) => b.status === "completed").length || 0;
  const totalSpent = bookings?.filter((b) => b.status === "completed").reduce((s, b) => s + b.total_fare, 0) || 0;

  return (
    <DashboardLayout title="Dashboard">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/10 border border-blue-500/20 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">Good day, {user?.full_name?.split(" ")[0]}! 👋</h2>
            <p className="text-[#94A3B8] text-sm mt-1">Ready for your daily commute?</p>
          </div>
          <Link
            to="/passenger/find-ride"
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/20"
          >
            <Search className="w-4 h-4" /> Find a Ride
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Rides", value: bookings?.length || 0, icon: Navigation, color: "blue" },
          { label: "Completed", value: completed, icon: CheckCircle, color: "green" },
          { label: "Total Spent", value: `₹${totalSpent.toFixed(0)}`, icon: MapPin, color: "cyan" },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#0F172A] border border-white/10 rounded-2xl p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
              stat.color === "blue" ? "bg-blue-500/10 text-blue-400" :
              stat.color === "green" ? "bg-green-500/10 text-green-400" :
              "bg-cyan-500/10 text-cyan-400"
            }`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-sm text-[#94A3B8] mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Active Rides */}
      {active.length > 0 && (
        <div className="mb-6">
          <h3 className="text-white font-semibold mb-4">Active Rides</h3>
          <div className="space-y-3">
            {active.map((booking) => {
              const cfg = statusConfig[booking.status];
              return (
                <div key={booking.id} className="bg-[#0F172A] border border-white/10 rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>
                          <cfg.icon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
                          <span className="text-[#94A3B8] truncate">{booking.pickup_location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                          <span className="text-[#94A3B8] truncate">{booking.drop_location}</span>
                        </div>
                      </div>
                      <div className="mt-3 text-sm text-white font-medium">
                        ₹{booking.total_fare} · {booking.seats_booked} seat{booking.seats_booked > 1 ? "s" : ""}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {booking.status === "confirmed" && (
                        <Link
                          to={`/passenger/track/${booking.id}`}
                          className="flex items-center gap-1.5 px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl text-xs font-medium hover:bg-blue-500/20 transition-all"
                        >
                          <Navigation className="w-3 h-3" /> Track Rider
                        </Link>
                      )}
                      {booking.status === "pending" && !booking.payment && (
                        <Link
                          to={`/passenger/payment/${booking.id}`}
                          className="flex items-center gap-1.5 px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-xs font-medium hover:bg-green-500/20 transition-all"
                        >
                          Pay Now
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Rides */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Recent Rides</h3>
          <Link to="/passenger/history" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
          </div>
        ) : bookings && bookings.length > 0 ? (
          <div className="space-y-3">
            {bookings.slice(0, 5).map((booking) => {
              const cfg = statusConfig[booking.status];
              return (
                <Link
                  key={booking.id}
                  to={`/passenger/ride/${booking.id}`}
                  className="block bg-[#0F172A] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all group"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}>
                          {cfg.label}
                        </span>
                        <span className="text-xs text-[#94A3B8]">
                          {new Date(booking.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                      <div className="text-sm text-[#E5E7EB] truncate">
                        {booking.pickup_location} → {booking.drop_location}
                      </div>
                      <div className="text-sm text-[#94A3B8] mt-1">
                        {booking.route?.rider?.user?.full_name || "Rider"} · ₹{booking.total_fare}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#94A3B8] group-hover:text-white group-hover:translate-x-1 transition-all shrink-0" />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-[#0F172A] border border-white/10 rounded-2xl">
            <MapPin className="w-10 h-10 text-[#94A3B8] mx-auto mb-3" />
            <p className="text-white font-medium mb-1">No rides yet</p>
            <p className="text-[#94A3B8] text-sm mb-6">Book your first ride and start commuting smarter</p>
            <Link
              to="/passenger/find-ride"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
              <Search className="w-4 h-4" /> Find a Ride
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
