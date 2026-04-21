// ─── RideRequests.tsx ────────────────────────────────────────────────────────
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { bookingService } from "@/services/bookingService";
import { locationService } from "@/services/locationService";
import { riderService } from "@/services/riderService";
import { useAuthStore } from "@/store/authStore";
import { CheckCircle, XCircle, Navigation, Users, Loader2, Bell } from "lucide-react";

export default function RideRequests() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: rider } = useQuery({ queryKey: ["rider-profile", user?.id], queryFn: () => riderService.getRiderByUserId(user!.id), enabled: !!user?.id });
  const { data: bookings, isLoading } = useQuery({ queryKey: ["pending-bookings", rider?.id], queryFn: () => bookingService.getPendingRiderBookings(rider!.id), enabled: !!rider?.id });

  const acceptMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      await bookingService.updateBookingStatus(bookingId, "confirmed");
      await locationService.updateRideStatus(bookingId, "rider_on_the_way");
    },
    onSuccess: () => { toast.success("Ride accepted!"); queryClient.invalidateQueries({ queryKey: ["pending-bookings"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const rejectMutation = useMutation({
    mutationFn: (bookingId: string) => bookingService.updateBookingStatus(bookingId, "cancelled"),
    onSuccess: () => { toast.success("Ride rejected"); queryClient.invalidateQueries({ queryKey: ["pending-bookings"] }); },
  });

  return (
    <DashboardLayout title="Ride Requests">
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-green-400" /></div>
      ) : bookings && bookings.length > 0 ? (
        <div className="max-w-2xl mx-auto space-y-4">
          {bookings.map((b: any) => (
            <div key={b.id} className="bg-[#0F172A] border border-white/10 rounded-2xl p-6">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {b.passenger?.full_name?.charAt(0)}
                </div>
                <div>
                  <p className="text-white font-semibold">{b.passenger?.full_name}</p>
                  <p className="text-[#94A3B8] text-sm">{b.passenger?.phone}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-[#94A3B8] flex items-center gap-1"><Users className="w-3 h-3" />{b.seats_booked} seat{b.seats_booked > 1 ? "s" : ""}</span>
                    <span className="text-xs font-bold text-green-400">₹{b.total_fare}</span>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 mb-5 space-y-2">
                <div className="flex items-center gap-2 text-sm"><div className="w-2 h-2 rounded-full bg-green-400 shrink-0" /><span className="text-[#94A3B8] truncate">{b.pickup_location}</span></div>
                <div className="flex items-center gap-2 text-sm"><div className="w-2 h-2 rounded-full bg-red-400 shrink-0" /><span className="text-[#94A3B8] truncate">{b.drop_location}</span></div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => rejectMutation.mutate(b.id)} disabled={rejectMutation.isPending} className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium hover:bg-red-500/20 transition-all">
                  <XCircle className="w-4 h-4" /> Decline
                </button>
                <button onClick={() => acceptMutation.mutate(b.id)} disabled={acceptMutation.isPending} className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-green-500/20">
                  {acceptMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4" /> Accept</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Bell className="w-12 h-12 text-[#94A3B8] mx-auto mb-4" />
          <p className="text-white font-medium mb-2">No pending requests</p>
          <p className="text-[#94A3B8] text-sm">New ride requests will appear here</p>
        </div>
      )}
    </DashboardLayout>
  );
}
