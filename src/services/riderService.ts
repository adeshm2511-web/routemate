import { supabase } from "@/lib/supabase";
import type { Rider } from "@/types";

export const riderService = {
  async createRiderProfile(riderData: Partial<Rider>) {
    const { data, error } = await supabase
      .from("riders")
      .insert(riderData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getRiderByUserId(userId: string) {
    const { data, error } = await supabase
      .from("riders")
      .select(`*, user:users(*)`)
      .eq("user_id", userId)
      .single();
    if (error) return null;
    return data;
  },

  async getRiderById(riderId: string) {
    const { data, error } = await supabase
      .from("riders")
      .select(`*, user:users(*)`)
      .eq("id", riderId)
      .single();
    if (error) throw error;
    return data;
  },

  async updateRiderProfile(riderId: string, updates: Partial<Rider>) {
    const { data, error } = await supabase
      .from("riders")
      .update(updates)
      .eq("id", riderId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getRiderStats(riderId: string) {
    const { data: bookings } = await supabase
      .from("bookings")
      .select("*, payment:payments(*)")
      .eq("rider_id", riderId)
      .eq("status", "completed");

    const totalRides = bookings?.length || 0;
    const totalPassengers = bookings?.reduce((sum: number, b: any) => sum + b.seats_booked, 0) || 0;
    const totalEarnings = bookings?.reduce(
      (sum: number, b: any) => sum + (b.payment?.amount || 0),
      0
    ) || 0;

    const { data: ratings } = await supabase
      .from("ratings")
      .select("rating")
      .eq("rider_id", riderId);

    const avgRating =
      ratings && ratings.length > 0
        ? ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length
        : 0;

    return { totalRides, totalPassengers, totalEarnings, avgRating: avgRating.toFixed(1) };
  },

  async uploadIdProof(file: File, userId: string): Promise<string> {
    const ext = file.name.split(".").pop();
    const path = `id-proofs/${userId}.${ext}`;
    const { error } = await supabase.storage.from("documents").upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from("documents").getPublicUrl(path);
    return data.publicUrl;
  },

  async uploadAvatar(file: File, userId: string): Promise<string> {
    const ext = file.name.split(".").pop();
    const path = `avatars/${userId}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    return data.publicUrl;
  },

  async getAllRiders() {
    const { data, error } = await supabase
      .from("riders")
      .select(`*, user:users(*)`)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async approveRider(riderId: string) {
    const { error } = await supabase
      .from("riders")
      .update({ is_approved: true })
      .eq("id", riderId);
    if (error) throw error;
  },
};
