import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { supabase } from "@/lib/supabase";
import { riderService } from "@/services/riderService";
import { toast } from "sonner";
import { Users, CheckCircle, XCircle, Loader2 } from "lucide-react";

async function fetchAllUsers() {
  const { data } = await supabase.from("users").select("*").order("created_at", { ascending: false });
  return data || [];
}

async function fetchPendingRiders() {
  const { data } = await supabase.from("riders").select("*, user:users(*)").eq("is_approved", false);
  return data || [];
}

export default function UserManagement() {
  const qc = useQueryClient();
  const { data: users, isLoading } = useQuery({ queryKey: ["admin-users"], queryFn: fetchAllUsers });
  const { data: pending } = useQuery({ queryKey: ["pending-riders"], queryFn: fetchPendingRiders });

  const approveMutation = useMutation({
    mutationFn: (riderId: string) => riderService.approveRider(riderId),
    onSuccess: () => { toast.success("Rider approved!"); qc.invalidateQueries({ queryKey: ["pending-riders"] }); },
  });

  const roleColors: Record<string, string> = {
    passenger: "text-blue-400 bg-blue-400/10",
    rider: "text-green-400 bg-green-400/10",
    admin: "text-purple-400 bg-purple-400/10",
  };

  return (
    <DashboardLayout title="User Management">
      <div className="space-y-6 max-w-5xl mx-auto">
        {pending && pending.length > 0 && (
          <div className="bg-[#0F172A] border border-yellow-500/20 rounded-2xl p-6">
            <h3 className="text-yellow-400 font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" /> Pending Rider Approvals ({pending.length})
            </h3>
            <div className="space-y-3">
              {pending.map((r: any) => (
                <div key={r.id} className="flex items-center justify-between gap-4 bg-white/5 rounded-xl p-4 flex-wrap">
                  <div>
                    <p className="text-white font-medium">{r.user?.full_name}</p>
                    <p className="text-[#94A3B8] text-sm">{r.user?.email} · {r.vehicle_model} ({r.vehicle_number})</p>
                    <p className="text-[#94A3B8] text-xs">UPI: {r.upi_id}</p>
                  </div>
                  <button onClick={() => approveMutation.mutate(r.id)} disabled={approveMutation.isPending} className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-sm font-medium hover:bg-green-500/20 transition-all">
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-5">All Users ({users?.length || 0})</h3>
          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-purple-400" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    {["Name", "Email", "Phone", "Role", "Verified", "Joined"].map(h => (
                      <th key={h} className="text-left text-[#94A3B8] font-medium pb-3 pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(users || []).map((u: any) => (
                    <tr key={u.id}>
                      <td className="py-3 pr-4 text-white font-medium">{u.full_name}</td>
                      <td className="py-3 pr-4 text-[#94A3B8]">{u.email}</td>
                      <td className="py-3 pr-4 text-[#94A3B8]">{u.phone}</td>
                      <td className="py-3 pr-4"><span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${roleColors[u.role]}`}>{u.role}</span></td>
                      <td className="py-3 pr-4">{u.is_verified ? <CheckCircle className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-[#94A3B8]" />}</td>
                      <td className="py-3 text-[#94A3B8]">{new Date(u.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
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
