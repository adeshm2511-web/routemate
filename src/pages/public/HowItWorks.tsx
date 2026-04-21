import { Link } from "react-router-dom";
import { Navigation, Shield, MapPin, CreditCard, Users, Phone, Mail } from "lucide-react";

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center"><Navigation className="w-5 h-5 text-white" /></div>
          <span className="text-white font-bold text-xl">RouteMate</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-[#94A3B8] hover:text-white px-4 py-2 rounded-lg transition-colors">Sign In</Link>
          <Link to="/register" className="text-sm font-medium bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-5 py-2 rounded-xl hover:opacity-90 transition-opacity">Get Started</Link>
        </div>
      </div>
    </nav>
  );
}

export function HowItWorks() {
  return (
    <div className="min-h-screen bg-[#020617] text-[#E5E7EB] pt-20" style={{ fontFamily: "'Poppins',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-white mb-4">How RouteMate Works</h1>
          <p className="text-[#94A3B8] text-lg">Simple, safe, and affordable daily commuting</p>
        </div>
        <div className="space-y-8">
          {[
            { step: "01", icon: Users, title: "Create Your Account", desc: "Sign up as a passenger or rider. Fill in your details and verify your account via email.", color: "blue" },
            { step: "02", icon: MapPin, title: "Set Your Route", desc: "Passengers search for rides on their daily route. Riders add their daily routes, timings, available seats and price.", color: "cyan" },
            { step: "03", icon: Navigation, title: "Match & Book", desc: "Our algorithm matches passengers with riders on the same route within 5km proximity. Confirm your booking in seconds.", color: "green" },
            { step: "04", icon: CreditCard, title: "Pay via UPI", desc: "Pay instantly using Google Pay, PhonePe, Paytm, BHIM UPI or any UPI app via secure Razorpay integration.", color: "purple" },
            { step: "05", icon: Shield, title: "Track & Travel", desc: "Track your rider's live location on the map. Get picked up and travel to your destination safely.", color: "yellow" },
          ].map((item) => {
            const colorMap: Record<string, string> = {
              blue: "from-blue-500/20 to-blue-500/5 border-blue-500/20 text-blue-400",
              cyan: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/20 text-cyan-400",
              green: "from-green-500/20 to-green-500/5 border-green-500/20 text-green-400",
              purple: "from-purple-500/20 to-purple-500/5 border-purple-500/20 text-purple-400",
              yellow: "from-yellow-500/20 to-yellow-500/5 border-yellow-500/20 text-yellow-400",
            };
            return (
              <div key={item.step} className={`flex gap-6 bg-gradient-to-br ${colorMap[item.color]} border rounded-2xl p-6`}>
                <div className="text-5xl font-black text-white/10 shrink-0 leading-none">{item.step}</div>
                <div className="flex-1">
                  <item.icon className="w-6 h-6 mb-3" />
                  <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-[#94A3B8] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="text-center mt-16">
          <Link to="/register" className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold px-8 py-4 rounded-2xl hover:opacity-90 transition-opacity shadow-xl shadow-blue-500/20">
            Get Started for Free
          </Link>
        </div>
      </div>
    </div>
  );
}

export function SafetyPage() {
  const features = [
    { icon: Shield, title: "ID Verification", desc: "Every rider undergoes ID verification (Aadhaar/Driving License) before being approved on our platform." },
    { icon: Users, title: "Community Ratings", desc: "Passengers rate riders after every trip. Riders with low ratings are automatically flagged for review." },
    { icon: MapPin, title: "Live Tracking", desc: "Passengers can track their rider's live GPS location throughout the trip, from pickup to drop." },
    { icon: Navigation, title: "Trip Sharing", desc: "Share your live trip status with friends and family for added safety during your commute." },
    { icon: CreditCard, title: "Secure Payments", desc: "All payments go through Razorpay's secure gateway. No cash involved, full digital trail." },
    { icon: Phone, title: "Emergency Support", desc: "Contact our support team anytime through the app. Ride logs are stored for 90 days for any disputes." },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-[#E5E7EB] pt-20" style={{ fontFamily: "'Poppins',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6"><Shield className="w-8 h-8 text-green-400" /></div>
          <h1 className="text-4xl font-bold text-white mb-4">Safety First, Always</h1>
          <p className="text-[#94A3B8] text-lg max-w-xl mx-auto">Your safety is our top priority. Here's how RouteMate keeps every commute secure.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          {features.map((f) => (
            <div key={f.title} className="bg-[#0F172A] border border-white/10 rounded-2xl p-6">
              <f.icon className="w-6 h-6 text-green-400 mb-3" />
              <h3 className="text-white font-semibold mb-2">{f.title}</h3>
              <p className="text-[#94A3B8] text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ContactPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-[#E5E7EB] pt-20" style={{ fontFamily: "'Poppins',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Contact Us</h1>
          <p className="text-[#94A3B8]">We're here to help. Reach out any time.</p>
        </div>
        <div className="grid gap-4 mb-8">
          {[
            { icon: Mail, label: "Email", value: "support@routemate.in" },
            { icon: Phone, label: "Phone", value: "+91 98765 43210" },
          ].map((c) => (
            <div key={c.label} className="flex items-center gap-4 bg-[#0F172A] border border-white/10 rounded-2xl p-5">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center"><c.icon className="w-5 h-5 text-blue-400" /></div>
              <div><p className="text-[#94A3B8] text-xs">{c.label}</p><p className="text-white font-medium">{c.value}</p></div>
            </div>
          ))}
        </div>
        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-5">Send a Message</h3>
          <div className="space-y-4">
            <input placeholder="Your name" className="w-full bg-white/5 border border-white/10 text-white placeholder-[#94A3B8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
            <input placeholder="Your email" type="email" className="w-full bg-white/5 border border-white/10 text-white placeholder-[#94A3B8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
            <textarea placeholder="Your message" rows={4} className="w-full bg-white/5 border border-white/10 text-white placeholder-[#94A3B8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none" />
            <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/20">Send Message</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HowItWorks;
