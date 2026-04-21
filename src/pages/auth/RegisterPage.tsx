import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { Navigation, Eye, EyeOff, Loader2, User, Car } from "lucide-react";

const schema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter valid 10-digit mobile number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["passenger", "rider"]),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { signUp, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: "passenger" },
  });

  const role = watch("role");

  const onSubmit = async (data: FormData) => {
    try {
      await signUp(data.email, data.password, data.full_name, data.phone, data.role);
      toast.success("Account created! Please check your email to verify.");
      navigate("/login");
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4 py-12" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Navigation className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl">RouteMate</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-[#94A3B8] mt-1 text-sm">Join thousands of daily commuters</p>
        </div>

        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-8">
          {/* Role Toggle */}
          <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => setValue("role", "passenger")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                role === "passenger"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-[#94A3B8] hover:text-white"
              }`}
            >
              <User className="w-4 h-4" /> Passenger
            </button>
            <button
              type="button"
              onClick={() => setValue("role", "rider")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                role === "rider"
                  ? "bg-green-600 text-white shadow-lg"
                  : "text-[#94A3B8] hover:text-white"
              }`}
            >
              <Car className="w-4 h-4" /> Rider
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#E5E7EB] mb-2">Full Name</label>
              <input
                {...register("full_name")}
                placeholder="Rahul Sharma"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-[#94A3B8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
              {errors.full_name && <p className="text-red-400 text-xs mt-1">{errors.full_name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#E5E7EB] mb-2">Email Address</label>
              <input
                {...register("email")}
                type="email"
                placeholder="you@example.com"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-[#94A3B8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#E5E7EB] mb-2">Mobile Number</label>
              <div className="flex">
                <span className="flex items-center px-3 bg-white/5 border border-r-0 border-white/10 rounded-l-xl text-[#94A3B8] text-sm">+91</span>
                <input
                  {...register("phone")}
                  placeholder="9876543210"
                  className="flex-1 bg-white/5 border border-white/10 text-white placeholder-[#94A3B8] rounded-r-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>
              {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#E5E7EB] mb-2">Password</label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 8 characters"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-[#94A3B8] rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 shadow-lg mt-2 ${
                role === "rider"
                  ? "bg-gradient-to-r from-green-600 to-emerald-500 shadow-green-500/20"
                  : "bg-gradient-to-r from-blue-600 to-cyan-500 shadow-blue-500/20"
              }`}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : `Create ${role === "rider" ? "Rider" : "Passenger"} Account`}
            </button>
          </form>

          <p className="text-center text-sm text-[#94A3B8] mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
