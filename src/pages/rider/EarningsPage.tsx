import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { paymentService } from "@/services/paymentService";
import { riderService } from "@/services/riderService";
import { useAuthStore } from "@/store/authStore";
import { DollarSign, Calendar, Loader2 } from "lucide-react";

export default function EarningsPage() {
  const { user } = useAuthStore();
  const { data: rider } = useQuery({
    queryKey: ["rider-profile", user?.id],
    queryFn: () => riderService.getRiderByUserId(user!.id),
    enabled: !!user?.id,
  });
  const { data: earnings, isLoading } = useQuery({
    queryKey: ["rider-earnings", rider?.id],
    queryFn: () => paymentService.getRiderEarnings(rider!.id),
    enabled: !!rider?.id,
  });

  return (
    <DashboardLayout title="Earnings">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-green-600/20 to-green-600/5 border border-green-500/20 rounded-2xl p-6">
            <DollarSign className="w-6 h-6 text-green-400 mb-3" />
            <div className="text-3xl font-bold text-white">₹{(earnings?.total || 0).toFixed(0)}</div>
            <div className="text-sm text-[#94A3B8] mt-1">Total Earnings</div>
          </div>
          <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-6">
            <Calendar className="w-6 h-6 text-blue-400 mb-3" />
            <div className="text-3xl font-bold text-white">₹{(earnings?.today || 0).toFixed(0)}</div>
            <div className="text-sm text-[#94A3B8] mt-1">Today's Earnings</div>
          </div>
        </div>

        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-5">Payment History</h3>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-green-400" /></div>
          ) : earnings?.payments && earnings.payments.length > 0 ? (
            <div className="space-y-3">
              {earnings.payments.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                  <div>
                    <p className="text-white text-sm font-medium">{p.booking?.route?.start_location?.split(",")[0]} → {p.booking?.route?.end_location?.split(",")[0]}</p>
                    <p className="text-[#94A3B8] text-xs mt-0.5">{new Date(p.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-bold">₹{p.amount}</p>
                    <p className="text-xs text-[#94A3B8] capitalize">{p.payment_method || "UPI"}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <DollarSign className="w-10 h-10 text-[#94A3B8] mx-auto mb-3" />
              <p className="text-[#94A3B8] text-sm">No earnings yet. Accept rides to start earning!</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
