import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { supabase } from "@/lib/supabase";
import { Users, Car, CreditCard, Activity, Loader2, TrendingUp } from "lucide-react";

async function fetchAdminStats() {
  const [users, riders, bookings, payments] = await Promise.all([
    supabase.from("users").select("id", { count: "exact" }),
    supabase.from("riders").select("id", { count: "exact" }),
    supabase.from("bookings").select("id,status", { count: "exact" }),
    supabase.from("payments").select("amount,payment_status"),
  ]);

  const totalRevenue = (payments.data || [])
    .filter((p: any) => p.payment_status === "paid")
    .reduce((sum: number, p: any) => sum + p.amount, 0);

  const activeRides = (bookings.data || []).filter((b: any) => b.status === "confirmed").length;

  return {
    totalUsers: users.count || 0,
    totalRiders: riders.count || 0,
    totalBookings: bookings.count || 0,
    totalRevenue,
    activeRides,
  };
}

async function fetchRecentBookings() {
  const { data } = await supabase
    .from("bookings")
    .select("*, passenger:users(full_name), route:routes(start_location, end_location)")
    .order("created_at", { ascending: false })
    .limit(10);
  return data || [];
}

const statusColors: Record<string, string> = {
  pending: "text-yellow-400 bg-yellow-400/10",
  confirmed: "text-blue-400 bg-blue-400/10",
  completed: "text-green-400 bg-green-400/10",
  cancelled: "text-red-400 bg-red-400/10",
};

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({ queryKey: ["admin-stats"], queryFn: fetchAdminStats });
  const { data: bookings } = useQuery({ queryKey: ["admin-bookings"], queryFn: fetchRecentBookings });

  return (
    <DashboardLayout title="Admin Dashboard">
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-purple-400" /></div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: "Total Users", value: stats?.totalUsers, icon: Users, color: "blue" },
              { label: "Total Riders", value: stats?.totalRiders, icon: Car, color: "green" },
              { label: "Total Bookings", value: stats?.totalBookings, icon: Activity, color: "cyan" },
              { label: "Active Rides", value: stats?.activeRides, icon: TrendingUp, color: "yellow" },
              { label: "Revenue", value: `₹${(stats?.totalRevenue || 0).toFixed(0)}`, icon: CreditCard, color: "purple" },
            ].map((s) => {
              const colorMap: Record<string, string> = {
                blue: "bg-blue-500/10 text-blue-400",
                green: "bg-green-500/10 text-green-400",
                cyan: "bg-cyan-500/10 text-cyan-400",
                yellow: "bg-yellow-500/10 text-yellow-400",
                purple: "bg-purple-500/10 text-purple-400",
              };
              return (
                <div key={s.label} className="bg-[#0F172A] border border-white/10 rounded-2xl p-5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colorMap[s.color]}`}>
                    <s.icon className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-bold text-white">{s.value}</div>
                  <div className="text-sm text-[#94A3B8] mt-1">{s.label}</div>
                </div>
              );
            })}
          </div>

          <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-5">Recent Bookings</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    {["Passenger", "Route", "Fare", "Status", "Date"].map(h => (
                      <th key={h} className="text-left text-[#94A3B8] font-medium pb-3 pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(bookings || []).map((b: any) => (
                    <tr key={b.id}>
                      <td className="py-3 pr-4 text-white">{b.passenger?.full_name || "—"}</td>
                      <td className="py-3 pr-4 text-[#94A3B8] max-w-[200px] truncate">
                        {b.route?.start_location?.split(",")[0]} → {b.route?.end_location?.split(",")[0]}
                      </td>
                      <td className="py-3 pr-4 text-white font-medium">₹{b.total_fare}</td>
                      <td className="py-3 pr-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[b.status]}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3 text-[#94A3B8]">
                        {new Date(b.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
