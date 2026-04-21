import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { supabase } from "@/lib/supabase";
import { Activity, CreditCard, Loader2 } from "lucide-react";

async function fetchAllBookings() {
  const { data } = await supabase
    .from("bookings")
    .select("*, passenger:users(full_name), route:routes(start_location, end_location, rider:riders(user:users(full_name)))")
    .order("created_at", { ascending: false });
  return data || [];
}

async function fetchAllPayments() {
  const { data } = await supabase
    .from("payments")
    .select("*, passenger:users(full_name), booking:bookings(total_fare)")
    .order("created_at", { ascending: false });
  return data || [];
}

const statusColors: Record<string, string> = {
  pending: "text-yellow-400 bg-yellow-400/10",
  confirmed: "text-blue-400 bg-blue-400/10",
  completed: "text-green-400 bg-green-400/10",
  cancelled: "text-red-400 bg-red-400/10",
  paid: "text-green-400 bg-green-400/10",
  failed: "text-red-400 bg-red-400/10",
};

export function RideMonitoring() {
  const { data: bookings, isLoading } = useQuery({ queryKey: ["admin-all-bookings"], queryFn: fetchAllBookings });

  return (
    <DashboardLayout title="Ride Monitoring">
      <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-5">
          <Activity className="w-5 h-5 text-cyan-400" />
          <h3 className="text-white font-semibold">All Rides ({bookings?.length || 0})</h3>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-cyan-400" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {["Passenger", "Rider", "Route", "Seats", "Fare", "Status", "Date"].map(h => (
                    <th key={h} className="text-left text-[#94A3B8] font-medium pb-3 pr-4 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {bookings?.map((b: any) => (
                  <tr key={b.id}>
                    <td className="py-3 pr-4 text-white whitespace-nowrap">{b.passenger?.full_name || "—"}</td>
                    <td className="py-3 pr-4 text-[#94A3B8] whitespace-nowrap">{b.route?.rider?.user?.full_name || "—"}</td>
                    <td className="py-3 pr-4 text-[#94A3B8] max-w-[180px] truncate">{b.route?.start_location?.split(",")[0]} → {b.route?.end_location?.split(",")[0]}</td>
                    <td className="py-3 pr-4 text-[#94A3B8]">{b.seats_booked}</td>
                    <td className="py-3 pr-4 text-white font-medium">₹{b.total_fare}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[b.status]}`}>{b.status}</span>
                    </td>
                    <td className="py-3 text-[#94A3B8] whitespace-nowrap">
                      {new Date(b.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export function PaymentsOverview() {
  const { data: payments, isLoading } = useQuery({ queryKey: ["admin-all-payments"], queryFn: fetchAllPayments });
  const totalRevenue = (payments || []).filter((p: any) => p.payment_status === "paid").reduce((s: number, p: any) => s + p.amount, 0);

  return (
    <DashboardLayout title="Payments Overview">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-5">
            <p className="text-[#94A3B8] text-sm mb-1">Total Transactions</p>
            <p className="text-2xl font-bold text-white">{payments?.length || 0}</p>
          </div>
          <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-5">
            <p className="text-[#94A3B8] text-sm mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-green-400">₹{totalRevenue.toFixed(0)}</p>
          </div>
          <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-5">
            <p className="text-[#94A3B8] text-sm mb-1">Success Rate</p>
            <p className="text-2xl font-bold text-white">
              {payments?.length ? Math.round(((payments || []).filter((p: any) => p.payment_status === "paid").length / payments.length) * 100) : 0}%
            </p>
          </div>
        </div>

        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <CreditCard className="w-5 h-5 text-green-400" />
            <h3 className="text-white font-semibold">Payment Records</h3>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-green-400" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    {["Passenger", "Amount", "Method", "Status", "Date"].map(h => (
                      <th key={h} className="text-left text-[#94A3B8] font-medium pb-3 pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {payments?.map((p: any) => (
                    <tr key={p.id}>
                      <td className="py-3 pr-4 text-white">{p.passenger?.full_name || "—"}</td>
                      <td className="py-3 pr-4 text-white font-medium">₹{p.amount}</td>
                      <td className="py-3 pr-4 text-[#94A3B8] capitalize">{p.payment_method || "UPI"}</td>
                      <td className="py-3 pr-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[p.payment_status]}`}>{p.payment_status}</span>
                      </td>
                      <td className="py-3 text-[#94A3B8]">{new Date(p.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default RideMonitoring;
