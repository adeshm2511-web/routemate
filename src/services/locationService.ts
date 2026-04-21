import { supabase } from "@/lib/supabase";
import type { LiveLocation } from "@/types";

export const locationService = {
  watchId: null as number | null,

  async updateRiderLocation(riderId: string, bookingId: string, lat: number, lng: number) {
    const { error } = await supabase.from("live_locations").upsert(
      { rider_id: riderId, booking_id: bookingId, lat, lng, updated_at: new Date().toISOString() },
      { onConflict: "booking_id" }
    );
    if (error) throw error;
  },

  async getRiderLocation(bookingId: string): Promise<LiveLocation | null> {
    const { data } = await supabase
      .from("live_locations")
      .select("*")
      .eq("booking_id", bookingId)
      .single();
    return data;
  },

  startTracking(riderId: string, bookingId: string) {
    if (!navigator.geolocation) throw new Error("Geolocation not supported");

    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        locationService.updateRiderLocation(
          riderId,
          bookingId,
          pos.coords.latitude,
          pos.coords.longitude
        );
      },
      (err) => console.error("GPS Error:", err),
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 5000 }
    );
  },

  stopTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  },

  subscribeToRiderLocation(bookingId: string, callback: (location: LiveLocation) => void) {
    return supabase
      .channel(`location:${bookingId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "live_locations",
          filter: `booking_id=eq.${bookingId}`,
        },
        (payload) => callback(payload.new as LiveLocation)
      )
      .subscribe();
  },

  async updateRideStatus(bookingId: string, status: string) {
    const { error } = await supabase
      .from("ride_status")
      .upsert(
        { booking_id: bookingId, status, updated_at: new Date().toISOString() },
        { onConflict: "booking_id" }
      );
    if (error) throw error;
  },

  subscribeToRideStatus(bookingId: string, callback: (status: string) => void) {
    return supabase
      .channel(`ride_status:${bookingId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ride_status",
          filter: `booking_id=eq.${bookingId}`,
        },
        (payload) => callback((payload.new as any).status)
      )
      .subscribe();
  },

  getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) reject(new Error("Geolocation not supported"));
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
      });
    });
  },
};
