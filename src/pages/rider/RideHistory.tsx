import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { bookingService } from "@/services/bookingService";
import { riderService } from "@/services/riderService";
import { useAuthStore } from "@/store/authStore";
import { History, CheckCircle, XCircle, Clock, Navigation, Loader2 } from "lucide-react";

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Pending", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20", icon: Clock },
  confirmed: { label: "Confirmed", color: "text-blue-400 bg-blue-400/10 border-blue-400/20", icon: Navigation },
  completed: { label: "Completed", color: "text-green-400 bg-green-400/10 border-green-400/20", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "text-red-400 bg-red-400/10 border-red-400/20", icon: XCircle },
};

// Passenger History
export function PassengerRideHistory() {
  const { user } = useAuthStore();
  const { data: bookings, isLoading } = useQuery({
    queryKey: ["passenger-bookings", user?.id],
    queryFn: () => bookingService.getPassengerBookings(user!.id),
    enabled: !!user?.id,
  });

  return (
    <DashboardLayout title="Ride History">
      <div className="max-w-3xl mx-auto">
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-400" /></div>
        ) : bookings && bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((b: any) => {
              const cfg = statusConfig[b.status];
              return (
                <div key={b.id} className="bg-[#0F172A] border border-white/10 rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>
                          <cfg.icon className="w-3 h-3" />{cfg.label}
                        </span>
                        <span className="text-xs text-[#94A3B8]">{new Date(b.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      </div>
                      <p className="text-white font-medium text-sm truncate">{b.pickup_location} → {b.drop_location}</p>
                      <p className="text-[#94A3B8] text-sm mt-1">Rider: {b.route?.rider?.user?.full_name || "N/A"} · {b.seats_booked} seat{b.seats_booked > 1 ? "s" : ""}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">₹{b.total_fare}</p>
                      <p className="text-xs text-[#94A3B8] mt-1">{b.payment?.payment_status === "paid" ? "✓ Paid" : "Unpaid"}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <History className="w-12 h-12 text-[#94A3B8] mx-auto mb-4" />
            <p className="text-white font-medium mb-2">No ride history</p>
            <p className="text-[#94A3B8] text-sm">Your completed rides will appear here</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// Rider History
export default function RiderRideHistory() {
  const { user } = useAuthStore();
  const { data: rider } = useQuery({ queryKey: ["rider-profile", user?.id], queryFn: () => riderService.getRiderByUserId(user!.id), enabled: !!user?.id });
  const { data: bookings, isLoading } = useQuery({
    queryKey: ["rider-bookings", rider?.id],
    queryFn: () => bookingService.getRiderBookings(rider!.id),
    enabled: !!rider?.id,
  });

  return (
    <DashboardLayout title="Ride History">
      <div className="max-w-3xl mx-auto">
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-green-400" /></div>
        ) : bookings && bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((b: any) => {
              const cfg = statusConfig[b.status];
              return (
                <div key={b.id} className="bg-[#0F172A] border border-white/10 rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>
                          <cfg.icon className="w-3 h-3" />{cfg.label}
                        </span>
                        <span className="text-xs text-[#94A3B8]">{new Date(b.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      </div>
                      <p className="text-white font-medium text-sm truncate">{b.pickup_location} → {b.drop_location}</p>
                      <p className="text-[#94A3B8] text-sm mt-1">Passenger: {b.passenger?.full_name} · {b.seats_booked} seat{b.seats_booked > 1 ? "s" : ""}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-bold">₹{b.total_fare}</p>
                      <p className="text-xs text-[#94A3B8] mt-1">{b.payment?.payment_status === "paid" ? "✓ Received" : "Pending"}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <History className="w-12 h-12 text-[#94A3B8] mx-auto mb-4" />
            <p className="text-white font-medium mb-2">No ride history</p>
            <p className="text-[#94A3B8] text-sm">Your accepted rides will appear here</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
