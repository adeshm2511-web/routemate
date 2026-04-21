import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { routeService } from "@/services/routeService";
import { bookingService } from "@/services/bookingService";
import { useAuthStore } from "@/store/authStore";
import { MapPin, Star, Car, Users, Clock, Shield, Loader2, ArrowLeft } from "lucide-react";

export default function RideDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [seats, setSeats] = useState(1);
  const [booking, setBooking] = useState(false);

  const { data: route, isLoading } = useQuery({
    queryKey: ["route", id],
    queryFn: () => routeService.getRouteById(id!),
    enabled: !!id,
  });

  const handleBook = async () => {
    if (!route || !user) return;
    setBooking(true);
    try {
      const newBooking = await bookingService.createBooking({
        route_id: route.id,
        passenger_id: user.id,
        rider_id: route.rider_id,
        seats_booked: seats,
        pickup_location: route.start_location,
        pickup_lat: route.start_lat,
        pickup_lng: route.start_lng,
        drop_location: route.end_location,
        drop_lat: route.end_lat,
        drop_lng: route.end_lng,
        total_fare: route.price_per_seat * seats,
        status: "pending",
      });
      toast.success("Ride booked! Complete your payment.");
      navigate(`/passenger/payment/${newBooking.id}`);
    } catch (err: any) {
      toast.error(err.message || "Booking failed");
    } finally {
      setBooking(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Ride Details">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      </DashboardLayout>
    );
  }

  if (!route) return <DashboardLayout title="Not Found"><p className="text-[#94A3B8]">Route not found.</p></DashboardLayout>;

  const rider = route.rider;
  const riderUser = rider?.user;
  const depTime = new Date(route.departure_time);
  const totalFare = route.price_per_seat * seats;

  return (
    <DashboardLayout title="Ride Details">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#94A3B8] hover:text-white mb-6 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to results
        </button>

        {/* Rider Profile */}
        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-6 mb-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-2xl">
              {riderUser?.full_name?.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{riderUser?.full_name}</h2>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <div className="flex items-center gap-1 text-yellow-400 text-sm">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-medium">{rider?.average_rating?.toFixed(1) || "New"}</span>
                </div>
                <span className="text-[#94A3B8] text-sm">{rider?.total_rides} completed rides</span>
                {rider?.is_approved && (
                  <span className="flex items-center gap-1 text-green-400 text-xs bg-green-400/10 border border-green-400/20 px-2 py-0.5 rounded-full">
                    <Shield className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-xl p-4">
              <Car className="w-5 h-5 text-blue-400 mb-2" />
              <p className="text-xs text-[#94A3B8]">Vehicle</p>
              <p className="text-white font-medium text-sm mt-1">{rider?.vehicle_model}</p>
              <p className="text-[#94A3B8] text-xs">{rider?.vehicle_number}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <Users className="w-5 h-5 text-cyan-400 mb-2" />
              <p className="text-xs text-[#94A3B8]">Available Seats</p>
              <p className="text-white font-medium text-sm mt-1">{route.available_seats} seats</p>
              <p className="text-[#94A3B8] text-xs">{rider?.vehicle_type}</p>
            </div>
          </div>
        </div>

        {/* Route Info */}
        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-6 mb-4">
          <h3 className="text-white font-semibold mb-4">Route Details</h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-green-400 mt-1" />
                <div className="w-0.5 h-12 bg-gradient-to-b from-green-400 to-red-400 my-1" />
                <div className="w-3 h-3 rounded-full bg-red-400" />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-xs text-[#94A3B8]">Pickup</p>
                  <p className="text-white font-medium">{route.start_location}</p>
                </div>
                <div>
                  <p className="text-xs text-[#94A3B8]">Drop</p>
                  <p className="text-white font-medium">{route.end_location}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#94A3B8] pt-2 border-t border-white/5">
              <Clock className="w-4 h-4" />
              <span>
                {depTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                {" · "}
                {depTime.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
              </span>
            </div>
          </div>
        </div>

        {/* Booking */}
        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">Book Your Seat</h3>

          <div className="flex items-center justify-between mb-6">
            <span className="text-[#94A3B8] text-sm">Number of seats</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSeats(Math.max(1, seats - 1))}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex items-center justify-center"
              >−</button>
              <span className="text-white font-bold text-lg w-6 text-center">{seats}</span>
              <button
                onClick={() => setSeats(Math.min(route.available_seats, seats + 1))}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex items-center justify-center"
              >+</button>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 mb-5 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#94A3B8]">₹{route.price_per_seat} × {seats} seat{seats > 1 ? "s" : ""}</span>
              <span className="text-white">₹{totalFare}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#94A3B8]">Platform fee</span>
              <span className="text-green-400">Free</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t border-white/10 pt-2 mt-2">
              <span className="text-white">Total</span>
              <span className="text-white">₹{totalFare}</span>
            </div>
          </div>

          <button
            onClick={handleBook}
            disabled={booking}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 shadow-lg shadow-blue-500/20"
          >
            {booking ? <Loader2 className="w-5 h-5 animate-spin" /> : `Confirm & Pay ₹${totalFare}`}
          </button>

          <p className="text-center text-xs text-[#94A3B8] mt-3">
            You'll be redirected to payment after confirmation
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
