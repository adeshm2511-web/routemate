import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { routeService } from "@/services/routeService";
import type { Route, SearchParams } from "@/types";
import { Search, MapPin, Clock, Users, Star, Navigation, Loader2, Car } from "lucide-react";

const schema = z.object({
  pickup: z.string().min(3, "Enter pickup location"),
  destination: z.string().min(3, "Enter destination"),
  departure_time: z.string().min(1, "Select departure time"),
  seats_needed: z.number().min(1).max(6),
});

type FormData = z.infer<typeof schema>;

export default function FindRide() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
  const [pickupCoords, setPickupCoords] = useState({ lat: 0, lng: 0 });
  const [destCoords, setDestCoords] = useState({ lat: 0, lng: 0 });
  const pickupRef = useRef<HTMLInputElement>(null);
  const destRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { seats_needed: 1 },
  });

  // Google Maps Autocomplete
  useEffect(() => {
    if (!window.google) return;
    const pickupAC = new window.google.maps.places.Autocomplete(pickupRef.current!, {
      componentRestrictions: { country: "in" },
    });
    pickupAC.addListener("place_changed", () => {
      const place = pickupAC.getPlace();
      if (place.geometry?.location) {
        setPickupCoords({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
        setValue("pickup", place.formatted_address || place.name || "");
      }
    });

    const destAC = new window.google.maps.places.Autocomplete(destRef.current!, {
      componentRestrictions: { country: "in" },
    });
    destAC.addListener("place_changed", () => {
      const place = destAC.getPlace();
      if (place.geometry?.location) {
        setDestCoords({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
        setValue("destination", place.formatted_address || place.name || "");
      }
    });
  }, []);

  const { data: routes, isLoading, refetch } = useQuery({
    queryKey: ["search-routes", searchParams],
    queryFn: () => routeService.searchRoutes(searchParams!),
    enabled: !!searchParams,
  });

  const onSubmit = (data: FormData) => {
    if (!pickupCoords.lat || !destCoords.lat) {
      toast.error("Please select locations from the dropdown suggestions");
      return;
    }
    setSearchParams({
      pickup: data.pickup,
      pickup_lat: pickupCoords.lat,
      pickup_lng: pickupCoords.lng,
      destination: data.destination,
      destination_lat: destCoords.lat,
      destination_lng: destCoords.lng,
      departure_time: data.departure_time,
      seats_needed: data.seats_needed,
    });
  };

  return (
    <DashboardLayout title="Find a Ride">
      <div className="max-w-4xl mx-auto">
        {/* Search Form */}
        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-6 mb-6">
          <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-400" /> Search Available Rides
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#E5E7EB] mb-2">Pickup Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" />
                  <input
                    ref={pickupRef}
                    {...register("pickup")}
                    placeholder="Enter pickup location"
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-[#94A3B8] rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                </div>
                {errors.pickup && <p className="text-red-400 text-xs mt-1">{errors.pickup.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#E5E7EB] mb-2">Destination</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />
                  <input
                    ref={destRef}
                    {...register("destination")}
                    placeholder="Enter destination"
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-[#94A3B8] rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                </div>
                {errors.destination && <p className="text-red-400 text-xs mt-1">{errors.destination.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#E5E7EB] mb-2">Departure Time</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                  <input
                    {...register("departure_time")}
                    type="datetime-local"
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                </div>
                {errors.departure_time && <p className="text-red-400 text-xs mt-1">{errors.departure_time.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#E5E7EB] mb-2">Seats Needed</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                  <select
                    {...register("seats_needed", { valueAsNumber: true })}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none"
                  >
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n} className="bg-[#0F172A]">{n} seat{n > 1 ? "s" : ""}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/20"
            >
              <Search className="w-4 h-4" /> Search Rides
            </button>
          </form>
        </div>

        {/* Results */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-3" />
              <p className="text-[#94A3B8] text-sm">Finding rides on your route...</p>
            </div>
          </div>
        )}

        {routes && (
          <div>
            <p className="text-[#94A3B8] text-sm mb-4">
              {routes.length} ride{routes.length !== 1 ? "s" : ""} found on your route
            </p>

            {routes.length === 0 ? (
              <div className="text-center py-16 bg-[#0F172A] border border-white/10 rounded-2xl">
                <Car className="w-12 h-12 text-[#94A3B8] mx-auto mb-4" />
                <p className="text-white font-medium mb-2">No rides found</p>
                <p className="text-[#94A3B8] text-sm">Try adjusting your pickup time or location</p>
              </div>
            ) : (
              <div className="space-y-4">
                {routes.map((route) => (
                  <RouteCard key={route.id} route={route} onSelect={() => navigate(`/passenger/ride/${route.id}`)} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function RouteCard({ route, onSelect }: { route: Route; onSelect: () => void }) {
  const rider = route.rider;
  const user = rider?.user;
  const depTime = new Date(route.departure_time);

  return (
    <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        {/* Rider Info */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
            {user?.full_name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <p className="text-white font-semibold">{user?.full_name}</p>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1 text-yellow-400 text-xs">
                <Star className="w-3 h-3 fill-current" />
                <span>{rider?.average_rating?.toFixed(1) || "New"}</span>
              </div>
              <span className="text-[#94A3B8] text-xs">·</span>
              <span className="text-[#94A3B8] text-xs">{rider?.total_rides || 0} rides</span>
              <span className="text-[#94A3B8] text-xs">·</span>
              <span className="text-[#94A3B8] text-xs">{rider?.vehicle_model}</span>
            </div>
          </div>
        </div>

        {/* Price & Action */}
        <div className="flex flex-col items-end gap-3">
          <div className="text-right">
            <div className="text-2xl font-bold text-white">₹{route.price_per_seat}</div>
            <div className="text-xs text-[#94A3B8]">per seat</div>
          </div>
          <button
            onClick={onSelect}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/20"
          >
            <Navigation className="w-4 h-4" /> Book Ride
          </button>
        </div>
      </div>

      {/* Route Details */}
      <div className="mt-5 pt-4 border-t border-white/5 grid sm:grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-[#94A3B8] mb-1">From</p>
          <p className="text-sm text-[#E5E7EB] truncate">{route.start_location}</p>
        </div>
        <div>
          <p className="text-xs text-[#94A3B8] mb-1">To</p>
          <p className="text-sm text-[#E5E7EB] truncate">{route.end_location}</p>
        </div>
        <div>
          <p className="text-xs text-[#94A3B8] mb-1">Departure</p>
          <p className="text-sm text-[#E5E7EB]">
            {depTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            {" · "}
            {depTime.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
          <Users className="w-3 h-3" />
          <span>{route.available_seats} seats left</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
          <Car className="w-3 h-3" />
          <span>{rider?.vehicle_number}</span>
        </div>
      </div>
    </div>
  );
}
