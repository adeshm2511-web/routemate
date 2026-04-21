import { supabase } from "@/lib/supabase";
import type { Payment, PaymentStatus, PaymentMethod } from "@/types";

declare global {
  interface Window {
    Razorpay: any;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) return resolve(true);
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export const paymentService = {
  async initiateRazorpayPayment(params: {
    bookingId: string;
    amount: number;
    passengerId: string;
    riderId: string;
    passengerName: string;
    passengerEmail: string;
    passengerPhone: string;
    riderUpiId: string;
  }): Promise<{ success: boolean; paymentId?: string }> {
    const loaded = await loadRazorpayScript();
    if (!loaded) throw new Error("Razorpay SDK failed to load");

    // Create payment record
    const { data: payment, error } = await supabase
      .from("payments")
      .insert({
        booking_id: params.bookingId,
        passenger_id: params.passengerId,
        rider_id: params.riderId,
        amount: params.amount,
        payment_status: "pending",
      })
      .select()
      .single();

    if (error) throw error;

    return new Promise((resolve, reject) => {
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: params.amount * 100, // paise
        currency: "INR",
        name: "RouteMate",
        description: "Ride Payment",
        image: "/logo.png",
        handler: async (response: any) => {
          await paymentService.confirmPayment(
            payment.id,
            params.bookingId,
            response.razorpay_payment_id,
            "upi"
          );
          resolve({ success: true, paymentId: response.razorpay_payment_id });
        },
        prefill: {
          name: params.passengerName,
          email: params.passengerEmail,
          contact: params.passengerPhone,
          method: "upi",
        },
        config: {
          display: {
            blocks: {
              utib: { name: "Pay via UPI", instruments: [{ method: "upi" }] },
            },
            sequence: ["block.utib"],
            preferences: { show_default_blocks: false },
          },
        },
        theme: { color: "#2563EB" },
        modal: {
          ondismiss: () => resolve({ success: false }),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", async (response: any) => {
        await paymentService.updatePaymentStatus(payment.id, "failed");
        reject(new Error(response.error.description));
      });
      rzp.open();
    });
  },

  generateUpiLink(upiId: string, amount: number, name: string, note: string): string {
    return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
  },

  generateGpayLink(upiId: string, amount: number, name: string): string {
    return `tez://upi/pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR`;
  },

  generatePhonePeLink(upiId: string, amount: number): string {
    return `phonepe://pay?transactionId=TXN${Date.now()}&amount=${amount}&pa=${upiId}`;
  },

  async confirmPayment(
    paymentId: string,
    bookingId: string,
    razorpayPaymentId: string,
    method: PaymentMethod
  ) {
    const { error } = await supabase
      .from("payments")
      .update({
        payment_status: "paid",
        razorpay_payment_id: razorpayPaymentId,
        payment_method: method,
      })
      .eq("id", paymentId);
    if (error) throw error;

    await supabase
      .from("bookings")
      .update({ status: "confirmed" })
      .eq("id", bookingId);
  },

  async updatePaymentStatus(paymentId: string, status: PaymentStatus) {
    const { error } = await supabase
      .from("payments")
      .update({ payment_status: status })
      .eq("id", paymentId);
    if (error) throw error;
  },

  async getPaymentByBooking(bookingId: string): Promise<Payment | null> {
    const { data } = await supabase
      .from("payments")
      .select("*")
      .eq("booking_id", bookingId)
      .single();
    return data;
  },

  async getRiderEarnings(riderId: string) {
    const { data, error } = await supabase
      .from("payments")
      .select(`*, booking:bookings(*, route:routes(*))`)
      .eq("rider_id", riderId)
      .eq("payment_status", "paid")
      .order("created_at", { ascending: false });
    if (error) throw error;

    const total = (data || []).reduce((sum: number, p: Payment) => sum + p.amount, 0);
    const today = (data || [])
      .filter((p: Payment) => new Date(p.created_at).toDateString() === new Date().toDateString())
      .reduce((sum: number, p: Payment) => sum + p.amount, 0);

    return { payments: data, total, today };
  },
};
