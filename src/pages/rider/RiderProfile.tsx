import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { riderService } from "@/services/riderService";
import { useAuthStore } from "@/store/authStore";
import { Shield, Upload, Loader2, CheckCircle } from "lucide-react";

const schema = z.object({
  vehicle_type: z.string().min(1),
  vehicle_number: z.string().regex(/^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/, "Invalid vehicle number (e.g. MH01AB1234)"),
  vehicle_model: z.string().min(2),
  upi_id: z.string().regex(/^[\w.\-]+@[\w]+$/, "Invalid UPI ID (e.g. name@upi)"),
});
type FormData = z.infer<typeof schema>;

export default function RiderProfile() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [idFile, setIdFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: rider } = useQuery({
    queryKey: ["rider-profile", user?.id],
    queryFn: () => riderService.getRiderByUserId(user!.id),
    enabled: !!user?.id,
  });

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: rider ? {
      vehicle_type: rider.vehicle_type,
      vehicle_number: rider.vehicle_number,
      vehicle_model: rider.vehicle_model,
      upi_id: rider.upi_id,
    } : {},
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData & { id_proof_url?: string }) => {
      if (rider) return riderService.updateRiderProfile(rider.id, data);
      return riderService.createRiderProfile({ ...data, user_id: user!.id });
    },
    onSuccess: () => { toast.success("Profile saved!"); queryClient.invalidateQueries({ queryKey: ["rider-profile"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const onSubmit = async (data: FormData) => {
    setUploading(true);
    let idProofUrl = rider?.id_proof_url || "";
    try {
      if (idFile) idProofUrl = await riderService.uploadIdProof(idFile, user!.id);
      await createMutation.mutateAsync({ ...data, id_proof_url: idProofUrl });
    } finally { setUploading(false); }
  };

  return (
    <DashboardLayout title="Profile & Verification">
      <div className="max-w-lg mx-auto">
        {rider?.is_approved && (
          <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-2xl p-4 mb-6">
            <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
            <p className="text-green-400 text-sm font-medium">Your profile is verified and approved!</p>
          </div>
        )}

        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-blue-400" />
            <h2 className="text-white font-semibold">Rider Verification Details</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#E5E7EB] mb-2">Vehicle Type</label>
              <select {...register("vehicle_type")} className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none">
                <option value="" className="bg-[#0F172A]">Select vehicle type</option>
                {["Car", "SUV", "Auto", "Bike", "Van"].map(v => <option key={v} value={v} className="bg-[#0F172A]">{v}</option>)}
              </select>
              {errors.vehicle_type && <p className="text-red-400 text-xs mt-1">Required</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#E5E7EB] mb-2">Vehicle Number</label>
              <input {...register("vehicle_number")} placeholder="MH01AB1234" className="w-full bg-white/5 border border-white/10 text-white placeholder-[#94A3B8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all uppercase" />
              {errors.vehicle_number && <p className="text-red-400 text-xs mt-1">{errors.vehicle_number.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#E5E7EB] mb-2">Vehicle Model</label>
              <input {...register("vehicle_model")} placeholder="e.g. Maruti Swift 2022" className="w-full bg-white/5 border border-white/10 text-white placeholder-[#94A3B8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
              {errors.vehicle_model && <p className="text-red-400 text-xs mt-1">Required</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#E5E7EB] mb-2">UPI ID</label>
              <input {...register("upi_id")} placeholder="yourname@upi" className="w-full bg-white/5 border border-white/10 text-white placeholder-[#94A3B8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
              {errors.upi_id && <p className="text-red-400 text-xs mt-1">{errors.upi_id.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#E5E7EB] mb-2">Government ID Proof</label>
              <div className="border border-dashed border-white/20 rounded-xl p-6 text-center hover:border-white/40 transition-colors cursor-pointer" onClick={() => document.getElementById("id-upload")?.click()}>
                <Upload className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" />
                <p className="text-sm text-[#94A3B8]">{idFile ? idFile.name : "Upload Aadhaar / Driving License"}</p>
                <p className="text-xs text-[#94A3B8] mt-1">JPG, PNG or PDF up to 5MB</p>
                <input id="id-upload" type="file" accept="image/*,.pdf" className="hidden" onChange={e => setIdFile(e.target.files?.[0] || null)} />
              </div>
              {rider?.id_proof_url && !idFile && <p className="text-green-400 text-xs mt-1">✓ ID proof already uploaded</p>}
            </div>

            <button type="submit" disabled={createMutation.isPending || uploading} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 shadow-lg shadow-blue-500/20">
              {(createMutation.isPending || uploading) ? <Loader2 className="w-4 h-4 animate-spin" /> : (rider ? "Update Profile" : "Submit for Verification")}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
