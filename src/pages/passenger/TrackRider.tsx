import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { bookingService } from "@/services/bookingService";
import { locationService } from "@/services/locationService";
import type { LiveLocation } from "@/types";
import { Navigation, Clock, MapPin, CheckCircle, Car, Loader2 } from "lucide-react";

const STATUS_STEPS = [
  { key: "waiting", label: "Booking Confirmed", icon: CheckCircle },
  { key: "rider_on_the_way", label: "Rider On the Way", icon: Car },
  { key: "rider_arrived", label: "Rider Arrived", icon: MapPin },
  { key: "trip_started", label: "Trip Started", icon: Navigation },
  { key: "trip_completed", label: "Trip Completed", icon: CheckCircle },
];

export default function TrackRider() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const riderMarker = useRef<google.maps.Marker | null>(null);
  const [rideStatus, setRideStatus] = useState("waiting");
  const [riderLocation, setRiderLocation] = useState<LiveLocation | null>(null);

  const { data: booking } = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => bookingService.getBookingById(bookingId!),
    enabled: !!bookingId,
  });

  // Init Google Map
  useEffect(() => {
    if (!mapRef.current || !window.google) return;
    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      zoom: 14,
      center: { lat: 19.076, lng: 72.8777 }, // Mumbai default
      styles: [
        { elementType: "geometry", stylers: [{ color: "#0f172a" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#0f172a" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
        { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#1e3a5f" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#020617" }] },
      ],
    });

    // Add pickup marker
    if (booking) {
      new window.google.maps.Marker({
        position: { lat: booking.pickup_lat, lng: booking.pickup_lng },
        map: mapInstance.current,
        title: "Your Pickup",
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: "#22C55E",
          fillOpacity: 1,
          strokeColor: "#fff",
          strokeWeight: 2,
        },
      });

      new window.google.maps.Marker({
        position: { lat: booking.drop_lat, lng: booking.drop_lng },
        map: mapInstance.current,
        title: "Drop Location",
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: "#EF4444",
          fillOpacity: 1,
          strokeColor: "#fff",
          strokeWeight: 2,
        },
      });

      mapInstance.current.setCenter({ lat: booking.pickup_lat, lng: booking.pickup_lng });
    }
  }, [booking]);

  // Update rider marker
  useEffect(() => {
    if (!mapInstance.current || !riderLocation) return;
    const pos = { lat: riderLocation.lat, lng: riderLocation.lng };

    if (!riderMarker.current) {
      riderMarker.current = new window.google.maps.Marker({
        position: pos,
        map: mapInstance.current,
        title: "Your Rider",
        icon: {
          url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
          scaledSize: new window.google.maps.Size(40, 40),
        },
        animation: window.google.maps.Animation.BOUNCE,
      });
    } else {
      riderMarker.current.setPosition(pos);
    }
    mapInstance.current.panTo(pos);
  }, [riderLocation]);

  // Subscribe to live location
  useEffect(() => {
    if (!bookingId) return;
    const channel = locationService.subscribeToRiderLocation(bookingId, (loc) => {
      setRiderLocation(loc);
    });

    const statusChannel = locationService.subscribeToRideStatus(bookingId, (status) => {
      setRideStatus(status);
    });

    // Initial fetch
    locationService.getRiderLocation(bookingId).then((loc) => {
      if (loc) setRiderLocation(loc);
    });

    return () => {
      channel.unsubscribe();
      statusChannel.unsubscribe();
    };
  }, [bookingId]);

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === rideStatus);

  return (
    <DashboardLayout title="Track Your Rider">
      <div className="grid lg:grid-cols-3 gap-5 h-[calc(100vh-140px)]">
        {/* Map */}
        <div className="lg:col-span-2 bg-[#0F172A] border border-white/10 rounded-2xl overflow-hidden relative">
          <div ref={mapRef} className="w-full h-full min-h-[400px]" />
          {!window.google && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-3" />
                <p className="text-[#94A3B8] text-sm">Loading map...</p>
              </div>
            </div>
          )}
          {/* Map overlay info */}
          <div className="absolute top-4 left-4 right-4">
            <div className="bg-[#0F172A]/90 backdrop-blur border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white text-sm font-medium">
                {STATUS_STEPS[currentStepIndex]?.label || "Tracking..."}
              </span>
            </div>
          </div>
        </div>

        {/* Status Panel */}
        <div className="space-y-4 overflow-y-auto">
          {/* Rider Info */}
          {booking && (
            <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xl">
                  {booking.route?.rider?.user?.full_name?.charAt(0)}
                </div>
                <div>
                  <p className="text-white font-semibold">{booking.route?.rider?.user?.full_name}</p>
                  <p className="text-[#94A3B8] text-xs">{booking.route?.rider?.vehicle_model}</p>
                  <p className="text-[#94A3B8] text-xs">{booking.route?.rider?.vehicle_number}</p>
                </div>
              </div>

              {riderLocation && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-3 py-2 flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-blue-400 animate-pulse" />
                  <span className="text-blue-400 text-xs font-medium">Live location active</span>
                </div>
              )}
            </div>
          )}

          {/* Progress */}
          <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-5">
            <h3 className="text-white font-semibold mb-5">Ride Progress</h3>
            <div className="space-y-1">
              {STATUS_STEPS.map((step, index) => {
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const isPending = index > currentStepIndex;
                return (
                  <div key={step.key} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                        isCompleted ? "bg-green-500/20 border border-green-500/40" :
                        isCurrent ? "bg-blue-500/20 border border-blue-500/40 animate-pulse" :
                        "bg-white/5 border border-white/10"
                      }`}>
                        <step.icon className={`w-4 h-4 ${
                          isCompleted ? "text-green-400" :
                          isCurrent ? "text-blue-400" :
                          "text-[#94A3B8]"
                        }`} />
                      </div>
                      {index < STATUS_STEPS.length - 1 && (
                        <div className={`w-0.5 h-8 my-1 ${isCompleted ? "bg-green-500/40" : "bg-white/10"}`} />
                      )}
                    </div>
                    <div className="pt-1.5 pb-4">
                      <p className={`text-sm font-medium ${
                        isCompleted ? "text-green-400" :
                        isCurrent ? "text-white" :
                        "text-[#94A3B8]"
                      }`}>{step.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Route */}
          {booking && (
            <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-5">
              <h3 className="text-white font-semibold mb-4">Your Route</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-400 mt-1 shrink-0" />
                  <div>
                    <p className="text-xs text-[#94A3B8]">Pickup</p>
                    <p className="text-sm text-white">{booking.pickup_location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-400 mt-1 shrink-0" />
                  <div>
                    <p className="text-xs text-[#94A3B8]">Drop</p>
                    <p className="text-sm text-white">{booking.drop_location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                  <Clock className="w-4 h-4 text-[#94A3B8]" />
                  <span className="text-sm text-[#94A3B8]">Fare: ₹{booking.total_fare}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
