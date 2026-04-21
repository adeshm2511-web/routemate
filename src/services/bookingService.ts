import { supabase } from "@/lib/supabase";
import type { Booking, BookingStatus } from "@/types";

export const bookingService = {
  async createBooking(bookingData: Partial<Booking>) {
    const { data, error } = await supabase
      .from("bookings")
      .insert(bookingData)
      .select()
      .single();
    if (error) throw error;

    // Decrease available seats
    await supabase.rpc("decrease_seats", {
      route_id: bookingData.route_id,
      seats: bookingData.seats_booked,
    });

    return data;
  },

  async getPassengerBookings(passengerId: string) {
    const { data, error } = await supabase
      .from("bookings")
      .select(`*, route:routes(*, rider:riders(*, user:users(*))), payment:payments(*)`)
      .eq("passenger_id", passengerId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async getRiderBookings(riderId: string) {
    const { data, error } = await supabase
      .from("bookings")
      .select(`*, route:routes(*), passenger:users(*), payment:payments(*)`)
      .eq("rider_id", riderId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async updateBookingStatus(bookingId: string, status: BookingStatus) {
    const { data, error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", bookingId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getBookingById(bookingId: string) {
    const { data, error } = await supabase
      .from("bookings")
      .select(`*, route:routes(*, rider:riders(*, user:users(*))), passenger:users(*), payment:payments(*)`)
      .eq("id", bookingId)
      .single();
    if (error) throw error;
    return data;
  },

  async getPendingRiderBookings(riderId: string) {
    const { data, error } = await supabase
      .from("bookings")
      .select(`*, route:routes(*), passenger:users(*)`)
      .eq("rider_id", riderId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  subscribeToBooking(bookingId: string, callback: (booking: Booking) => void) {
    return supabase
      .channel(`booking:${bookingId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "bookings", filter: `id=eq.${bookingId}` },
        (payload) => callback(payload.new as Booking)
      )
      .subscribe();
  },
};
