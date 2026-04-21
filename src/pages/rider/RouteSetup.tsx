import { useRef, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { routeService } from "@/services/routeService";
import { riderService } from "@/services/riderService";
import { useAuthStore } from "@/store/authStore";
import { MapPin, Clock, Users, DollarSign, Loader2, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

const schema = z.object({
  start_location: z.string().min(3),
  end_location: z.string().min(3),
  departure_time: z.string().min(1),
  available_seats: z.number().min(1).max(6),
  price_per_seat: z.number().min(1),
});
type FormData = z.infer<typeof schema>;

export default function RouteSetup() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);
  const [startCoords, setStartCoords] = useState({ lat: 0, lng: 0 });
  const [endCoords, setEndCoords] = useState({ lat: 0, lng: 0 });

  const { data: rider } = useQuery({
    queryKey: ["rider-profile", user?.id],
    queryFn: () => riderService.getRiderByUserId(user!.id),
    enabled: !!user?.id,
  });

  const { data: routes, isLoading } = useQuery({
    queryKey: ["rider-routes", rider?.id],
    queryFn: () => routeService.getRiderRoutes(rider!.id),
    enabled: !!rider?.id,
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { available_seats: 2, price_per_seat: 50 },
  });

  useEffect(() => {
    if (!window.google) return;
    const sAC = new window.google.maps.places.Autocomplete(startRef.current!, { componentRestrictions: { country: "in" } });
    sAC.addListener("place_changed", () => {
      const p = sAC.getPlace();
      if (p.geometry?.location) { setStartCoords({ lat: p.geometry.location.lat(), lng: p.geometry.location.lng() }); setValue("start_location", p.formatted_address || ""); }
    });
    const eAC = new window.google.maps.places.Autocomplete(endRef.current!, { componentRestrictions: { country: "in" } });
    eAC.addListener("place_changed", () => {
      const p = eAC.getPlace();
      if (p.geometry?.location) { setEndCoords({ lat: p.geometry.location.lat(), lng: p.geometry.location.lng() }); setValue("end_location", p.formatted_address || ""); }
    });
  }, []);

  const createMutation = useMutation({
    mutationFn: (data: FormData) => routeService.createRoute({
      ...data,
      rider_id: rider!.id,
      start_lat: startCoords.lat,
      start_lng: startCoords.lng,
      end_lat: endCoords.lat,
      end_lng: endCoords.lng,
      is_active: true,
    }),
    onSuccess: () => {
      toast.success("Route created!");
      reset();
      queryClient.invalidateQueries({ queryKey: ["rider-routes"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => routeService.updateRoute(id, { is_active: active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rider-routes"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => routeService.deleteRoute(id),
    onSuccess: () => { toast.success("Route deleted"); queryClient.invalidateQueries({ queryKey: ["rider-routes"] }); },
  });

  const onSubmit = (data: FormData) => {
    if (!startCoords.lat || !endCoords.lat) { toast.error("Select locations from dropdown"); return; }
    createMutation.mutate(data);
  };

  return (
    <DashboardLayout title="My Routes">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Add Route Form */}
        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-5">Add New Route</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#E5E7EB] mb-2">Start Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" />
                  <input ref={startRef} {...register("start_location")} placeholder="Starting point" className="w-full bg-white/5 border border-white/10 text-white placeholder-[#94A3B8] rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all" />
                </div>
                {errors.start_location && <p className="text-red-400 text-xs mt-1">Required</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#E5E7EB] mb-2">End Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />
                  <input ref={endRef} {...register("end_location")} placeholder="Destination" className="w-full bg-white/5 border border-white/10 text-white placeholder-[#94A3B8] rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all" />
                </div>
                {errors.end_location && <p className="text-red-400 text-xs mt-1">Required</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#E5E7EB] mb-2">Departure Time</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                  <input {...register("departure_time")} type="datetime-local" min={new Date().toISOString().slice(0, 16)} className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#E5E7EB] mb-2">Available Seats</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                  <select {...register("available_seats", { valueAsNumber: true })} className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all appearance-none">
                    {[1,2,3,4,5,6].map(n => <option key={n} value={n} className="bg-[#0F172A]">{n} seat{n>1?"s":""}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#E5E7EB] mb-2">Price Per Seat (₹)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                  <input {...register("price_per_seat", { valueAsNumber: true })} type="number" min="1" placeholder="50" className="w-full bg-white/5 border border-white/10 text-white placeholder-[#94A3B8] rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all" />
                </div>
              </div>
            </div>
            <button type="submit" disabled={createMutation.isPending} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 shadow-lg shadow-green-500/20">
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Route"}
            </button>
          </form>
        </div>

        {/* Existing Routes */}
        <div>
          <h3 className="text-white font-semibold mb-4">My Routes ({routes?.length || 0})</h3>
          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-green-400" /></div>
          ) : routes && routes.length > 0 ? (
            <div className="space-y-3">
              {routes.map((route: any) => (
                <div key={route.id} className="bg-[#0F172A] border border-white/10 rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${route.is_active ? "text-green-400 bg-green-400/10 border-green-400/20" : "text-[#94A3B8] bg-white/5 border-white/10"}`}>
                          {route.is_active ? "Active" : "Inactive"}
                        </span>
                        <span className="text-xs text-[#94A3B8]">{route.available_seats} seats · ₹{route.price_per_seat}/seat</span>
                      </div>
                      <p className="text-white text-sm font-medium truncate">{route.start_location}</p>
                      <p className="text-[#94A3B8] text-sm truncate">→ {route.end_location}</p>
                      <p className="text-xs text-[#94A3B8] mt-1">{new Date(route.departure_time).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleMutation.mutate({ id: route.id, active: !route.is_active })} className="text-[#94A3B8] hover:text-white transition-colors">
                        {route.is_active ? <ToggleRight className="w-6 h-6 text-green-400" /> : <ToggleLeft className="w-6 h-6" />}
                      </button>
                      <button onClick={() => deleteMutation.mutate(route.id)} className="text-[#94A3B8] hover:text-red-400 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-[#0F172A] border border-white/10 rounded-2xl">
              <MapPin className="w-10 h-10 text-[#94A3B8] mx-auto mb-3" />
              <p className="text-white font-medium mb-1">No routes yet</p>
              <p className="text-[#94A3B8] text-sm">Add your first route above to start accepting passengers</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
