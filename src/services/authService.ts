import { supabase } from "@/lib/supabase";
import type { UserRole } from "@/types";

function getSupabase() {
  if (!supabase) {
    throw new Error("Supabase environment variables are missing.");
  }
  return supabase;
}

export const authService = {
  async signUp(
    email: string,
    password: string,
    fullName: string,
    phone: string,
    role: UserRole
  ) {
    const client = getSupabase();

    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone, role },
      },
    });
    if (error) throw error;

    if (data.user) {
      const { error: profileError } = await client.from("users").insert({
        id: data.user.id,
        email,
        full_name: fullName,
        phone,
        role,
        is_verified: false,
      });
      if (profileError) throw profileError;
    }

    return data;
  },

  async signIn(email: string, password: string) {
    const client = getSupabase();
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    if (!supabase) return null;
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async getCurrentUser() {
    if (!supabase) return null;

    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    if (!data.user) return null;

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (profileError) throw profileError;

    return profile;
  },

  async resetPassword(email: string) {
    const client = getSupabase();
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/routemate/#/reset-password`,
    });
    if (error) throw error;
  },

  async updatePassword(newPassword: string) {
    const client = getSupabase();
    const { error } = await client.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    if (!supabase) {
      return {
        data: {
          subscription: {
            unsubscribe: () => {},
          },
        },
      };
    }

    return supabase.auth.onAuthStateChange(callback);
  },
};
