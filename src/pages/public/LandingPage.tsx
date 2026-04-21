import { Link } from "react-router-dom";
import { Navigation, Shield, Zap, MapPin, Star, ArrowRight, Users, Route, CreditCard } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-[#E5E7EB]" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Navigation className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">RouteMate</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link to="/how-it-works" className="text-sm text-[#94A3B8] hover:text-white transition-colors">How It Works</Link>
            <Link to="/safety" className="text-sm text-[#94A3B8] hover:text-white transition-colors">Safety</Link>
            <Link to="/contact" className="text-sm text-[#94A3B8] hover:text-white transition-colors">Contact</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-[#94A3B8] hover:text-white px-4 py-2 rounded-lg transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="text-sm font-medium bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-5 py-2 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/20">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-900/5 rounded-full blur-3xl" />
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "50px 50px"
        }} />

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium mb-8">
            <Zap className="w-4 h-4" />
            Smart Route-Based Ride Sharing for India
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
            Share Your Route,
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Save Together
            </span>
          </h1>

          <p className="text-lg md:text-xl text-[#94A3B8] max-w-2xl mx-auto mb-10 leading-relaxed">
            Connect with daily commuters on your exact route. Book affordable rides, track your driver live, and pay securely via UPI.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              to="/register"
              className="group flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-2xl hover:opacity-90 transition-all shadow-2xl shadow-blue-500/25 text-base"
            >
              Find a Ride
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/register"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-2xl hover:bg-white/10 transition-all text-base"
            >
              Become a Rider
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {[
              { value: "10K+", label: "Daily Rides" },
              { value: "4.9★", label: "Avg Rating" },
              { value: "₹0", label: "Booking Fee" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-[#94A3B8] mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Why Choose RouteMate?</h2>
            <p className="text-[#94A3B8] text-lg max-w-xl mx-auto">Built for Indian daily commuters with safety, affordability, and convenience at its core.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: MapPin,
                color: "blue",
                title: "Route-Based Matching",
                desc: "Get matched with riders on your exact daily route — office, college, or anywhere you commute regularly.",
              },
              {
                icon: Shield,
                color: "green",
                title: "Verified Riders",
                desc: "Every rider is ID-verified. See their profile, vehicle details, ratings, and ride history before booking.",
              },
              {
                icon: CreditCard,
                color: "cyan",
                title: "UPI Payments",
                desc: "Pay securely via Google Pay, PhonePe, Paytm, or any UPI app. No cash, no hassle.",
              },
              {
                icon: Navigation,
                color: "purple",
                title: "Live Tracking",
                desc: "Track your rider in real-time on the map. Know exactly when they'll arrive and follow the trip live.",
              },
              {
                icon: Star,
                color: "yellow",
                title: "Rate & Review",
                desc: "Rate your rider after every trip. Our community ratings keep the platform safe and reliable.",
              },
              {
                icon: Users,
                color: "pink",
                title: "For Commuters",
                desc: "Whether you're a student or office worker — RouteMate is designed for your daily fixed-route journey.",
              },
            ].map((feature) => {
              const colorMap: Record<string, string> = {
                blue: "from-blue-500/20 to-blue-500/5 border-blue-500/20 text-blue-400",
                green: "from-green-500/20 to-green-500/5 border-green-500/20 text-green-400",
                cyan: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/20 text-cyan-400",
                purple: "from-purple-500/20 to-purple-500/5 border-purple-500/20 text-purple-400",
                yellow: "from-yellow-500/20 to-yellow-500/5 border-yellow-500/20 text-yellow-400",
                pink: "from-pink-500/20 to-pink-500/5 border-pink-500/20 text-pink-400",
              };
              return (
                <div key={feature.title} className={`bg-gradient-to-br ${colorMap[feature.color]} border rounded-2xl p-6 hover:scale-[1.02] transition-transform`}>
                  <feature.icon className="w-8 h-8 mb-4" />
                  <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-[#94A3B8] text-sm leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-[#0F172A]/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Book in 3 Simple Steps</h2>
          <p className="text-[#94A3B8] mb-16">Start your ride-sharing journey in minutes.</p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Search Your Route", desc: "Enter your pickup, destination, and travel time. We'll find matching riders.", icon: Search },
              { step: "02", title: "Book & Pay via UPI", desc: "Select your rider, confirm the booking, and pay instantly using any UPI app.", icon: CreditCard },
              { step: "03", title: "Track & Travel", desc: "Track your rider live on the map, get picked up, and reach your destination.", icon: Navigation },
            ].map((s) => (
              <div key={s.step} className="relative">
                <div className="text-6xl font-black text-white/5 mb-4">{s.step}</div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
                  <s.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-[#94A3B8] text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/10 border border-blue-500/20 rounded-3xl p-12">
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Ride Smarter?</h2>
            <p className="text-[#94A3B8] mb-8 text-lg">Join thousands of commuters saving money on their daily route.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-2xl hover:opacity-90 transition-opacity shadow-xl shadow-blue-500/20"
              >
                Sign Up Free
              </Link>
              <Link
                to="/how-it-works"
                className="px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-2xl hover:bg-white/10 transition-all"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
              <Navigation className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold">RouteMate</span>
          </div>
          <div className="flex gap-6 text-sm text-[#94A3B8]">
            <Link to="/safety" className="hover:text-white transition-colors">Safety</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            <Link to="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="#" className="hover:text-white transition-colors">Terms</Link>
          </div>
          <p className="text-sm text-[#94A3B8]">© 2025 RouteMate. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function Search(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}
