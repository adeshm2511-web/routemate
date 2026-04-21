import { supabase } from "@/lib/supabase";
import type { Route, SearchParams } from "@/types";

const RADIUS_KM = 5; // Match routes within 5km radius

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const routeService = {
  async searchRoutes(params: SearchParams): Promise<Route[]> {
    const { data, error } = await supabase
      .from("routes")
      .select(`*, rider:riders(*, user:users(*))`)
      .eq("is_active", true)
      .gte("available_seats", params.seats_needed)
      .gte("departure_time", new Date(params.departure_time).toISOString());

    if (error) throw error;

    // Filter by proximity using Haversine
    return (data || []).filter((route: Route) => {
      const startDist = haversineDistance(
        params.pickup_lat,
        params.pickup_lng,
        route.start_lat,
        route.start_lng
      );
      const endDist = haversineDistance(
        params.destination_lat,
        params.destination_lng,
        route.end_lat,
        route.end_lng
      );
      return startDist <= RADIUS_KM && endDist <= RADIUS_KM;
    });
  },

  async createRoute(routeData: Partial<Route>) {
    const { data, error } = await supabase
      .from("routes")
      .insert(routeData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getRiderRoutes(riderId: string) {
    const { data, error } = await supabase
      .from("routes")
      .select("*")
      .eq("rider_id", riderId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async updateRoute(routeId: string, updates: Partial<Route>) {
    const { data, error } = await supabase
      .from("routes")
      .update(updates)
      .eq("id", routeId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteRoute(routeId: string) {
    const { error } = await supabase.from("routes").delete().eq("id", routeId);
    if (error) throw error;
  },

  async getRouteById(routeId: string) {
    const { data, error } = await supabase
      .from("routes")
      .select(`*, rider:riders(*, user:users(*))`)
      .eq("id", routeId)
      .single();
    if (error) throw error;
    return data;
  },
};
