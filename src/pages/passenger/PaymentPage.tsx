import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { bookingService } from "@/services/bookingService";
import { paymentService } from "@/services/paymentService";
import { useAuthStore } from "@/store/authStore";
import { CreditCard, Smartphone, QrCode, CheckCircle, Loader2, ArrowLeft } from "lucide-react";

const UPI_APPS = [
  { id: "googlepay", name: "Google Pay", color: "from-blue-500 to-green-500", icon: "G" },
  { id: "phonepe", name: "PhonePe", color: "from-purple-600 to-indigo-600", icon: "P" },
  { id: "paytm", name: "Paytm", color: "from-blue-400 to-cyan-500", icon: "₹" },
  { id: "bhim", name: "BHIM UPI", color: "from-orange-500 to-red-500", icon: "B" },
];

export default function PaymentPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [tab, setTab] = useState<"razorpay" | "upi">("razorpay");

  const { data: booking, isLoading } = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => bookingService.getBookingById(bookingId!),
    enabled: !!bookingId,
  });

  const handleRazorpay = async () => {
    if (!booking || !user) return;
    setPaying(true);
    try {
      const result = await paymentService.initiateRazorpayPayment({
        bookingId: booking.id,
        amount: booking.total_fare,
        passengerId: user.id,
        riderId: booking.rider_id,
        passengerName: user.full_name,
        passengerEmail: user.email,
        passengerPhone: user.phone,
        riderUpiId: booking.route?.rider?.upi_id || "",
      });
      if (result.success) {
        setPaid(true);
        toast.success("Payment successful! 🎉");
        setTimeout(() => navigate(`/passenger/track/${bookingId}`), 2000);
      }
    } catch (err: any) {
      toast.error(err.message || "Payment failed");
    } finally {
      setPaying(false);
    }
  };

  const openUpiApp = (appId: string) => {
    if (!booking) return;
    const rider = booking.route?.rider;
    const upiId = rider?.upi_id || "";
    let link = "";

    if (appId === "googlepay") link = paymentService.generateGpayLink(upiId, booking.total_fare, rider?.user?.full_name || "");
    else if (appId === "phonepe") link = paymentService.generatePhonePeLink(upiId, booking.total_fare);
    else link = paymentService.generateUpiLink(upiId, booking.total_fare, rider?.user?.full_name || "", `RouteMate ride payment`);

    window.location.href = link;
  };

  if (isLoading) return (
    <DashboardLayout title="Payment">
      <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-blue-400" /></div>
    </DashboardLayout>
  );

  if (!booking) return null;

  if (paid) {
    return (
      <DashboardLayout title="Payment">
        <div className="max-w-md mx-auto text-center py-20">
          <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
          <p className="text-[#94A3B8] mb-6">Your ride is confirmed. Redirecting to tracking...</p>
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </DashboardLayout>
    );
  }

  const rider = booking.route?.rider;

  return (
    <DashboardLayout title="Complete Payment">
      <div className="max-w-lg mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#94A3B8] hover:text-white mb-6 text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Summary */}
        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-6 mb-5">
          <h3 className="text-white font-semibold mb-4">Ride Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Rider</span>
              <span className="text-white">{rider?.user?.full_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">From</span>
              <span className="text-white text-right max-w-[60%] truncate">{booking.pickup_location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">To</span>
              <span className="text-white text-right max-w-[60%] truncate">{booking.drop_location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Seats</span>
              <span className="text-white">{booking.seats_booked}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t border-white/10 pt-3">
              <span className="text-white">Total Amount</span>
              <span className="text-green-400">₹{booking.total_fare}</span>
            </div>
          </div>
        </div>

        {/* Payment Options */}
        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-5">Choose Payment Method</h3>

          {/* Tabs */}
          <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 mb-5">
            <button
              onClick={() => setTab("razorpay")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === "razorpay" ? "bg-blue-600 text-white" : "text-[#94A3B8]"}`}
            >
              <CreditCard className="w-4 h-4" /> Razorpay (UPI)
            </button>
            <button
              onClick={() => setTab("upi")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === "upi" ? "bg-blue-600 text-white" : "text-[#94A3B8]"}`}
            >
              <Smartphone className="w-4 h-4" /> Direct UPI
            </button>
          </div>

          {tab === "razorpay" && (
            <div className="space-y-4">
              <p className="text-[#94A3B8] text-sm text-center">Pay securely via Razorpay. Supports all UPI apps, cards, and net banking.</p>
              <button
                onClick={handleRazorpay}
                disabled={paying}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 shadow-lg shadow-blue-500/20 text-lg"
              >
                {paying ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CreditCard className="w-5 h-5" /> Pay ₹{booking.total_fare}</>}
              </button>
            </div>
          )}

          {tab === "upi" && (
            <div className="space-y-4">
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <p className="text-xs text-[#94A3B8] mb-2">Rider's UPI ID</p>
                <p className="text-white font-bold text-lg">{rider?.upi_id}</p>
                <p className="text-[#94A3B8] text-xs mt-1">Amount: ₹{booking.total_fare}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {UPI_APPS.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => openUpiApp(app.id)}
                    className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
                  >
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${app.color} flex items-center justify-center text-white font-bold text-sm`}>
                      {app.icon}
                    </div>
                    <span className="text-white text-sm font-medium">{app.name}</span>
                  </button>
                ))}
              </div>

              <p className="text-xs text-[#94A3B8] text-center">After payment, your booking will be confirmed automatically.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
