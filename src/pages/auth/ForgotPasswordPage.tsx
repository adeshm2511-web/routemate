// ForgotPasswordPage.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import { Navigation, Loader2, CheckCircle } from "lucide-react";

const schema = z.object({ email: z.string().email() });

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email }: { email: string }) => {
    setLoading(true);
    try { await authService.resetPassword(email); setSent(true); }
    catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4" style={{ fontFamily: "'Poppins',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center"><Navigation className="w-5 h-5 text-white" /></div>
            <span className="text-white font-bold text-xl">RouteMate</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Reset Password</h1>
          <p className="text-[#94A3B8] mt-1 text-sm">We'll send you a reset link</p>
        </div>
        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-8">
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <p className="text-white font-semibold mb-2">Check your email!</p>
              <p className="text-[#94A3B8] text-sm mb-6">We've sent a password reset link to your email address.</p>
              <Link to="/login" className="text-blue-400 hover:text-blue-300 text-sm">Back to login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#E5E7EB] mb-2">Email Address</label>
                <input {...register("email")} type="email" placeholder="you@example.com" className="w-full bg-white/5 border border-white/10 text-white placeholder-[#94A3B8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
                {errors.email && <p className="text-red-400 text-xs mt-1">Enter a valid email</p>}
              </div>
              <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 shadow-lg shadow-blue-500/20">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Reset Link"}
              </button>
              <p className="text-center text-sm text-[#94A3B8]"><Link to="/login" className="text-blue-400 hover:text-blue-300">Back to login</Link></p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
