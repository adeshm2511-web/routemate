// ─── User & Auth ─────────────────────────────────────────────────────────────
export type UserRole = "passenger" | "rider" | "admin";

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  avatar_url?: string;
  role: UserRole;
  is_verified: boolean;
  created_at: string;
}

// ─── Rider ───────────────────────────────────────────────────────────────────
export interface Rider {
  id: string;
  user_id: string;
  vehicle_type: string;
  vehicle_number: string;
  vehicle_model: string;
  id_proof_url: string;
  is_approved: boolean;
  total_rides: number;
  average_rating: number;
  upi_id: string;
  user?: User;
}

// ─── Route ───────────────────────────────────────────────────────────────────
export interface Route {
  id: string;
  rider_id: string;
  start_location: string;
  start_lat: number;
  start_lng: number;
  end_location: string;
  end_lat: number;
  end_lng: number;
  departure_time: string;
  available_seats: number;
  price_per_seat: number;
  is_active: boolean;
  created_at: string;
  rider?: Rider;
}

// ─── Booking ─────────────────────────────────────────────────────────────────
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface Booking {
  id: string;
  route_id: string;
  passenger_id: string;
  rider_id: string;
  seats_booked: number;
  pickup_location: string;
  pickup_lat: number;
  pickup_lng: number;
  drop_location: string;
  drop_lat: number;
  drop_lng: number;
  total_fare: number;
  status: BookingStatus;
  created_at: string;
  route?: Route;
  passenger?: User;
  rider?: Rider;
  payment?: Payment;
}

// ─── Payment ─────────────────────────────────────────────────────────────────
export type PaymentStatus = "pending" | "paid" | "failed";
export type PaymentMethod = "googlepay" | "phonepe" | "paytm" | "bhim" | "upi";

export interface Payment {
  id: string;
  booking_id: string;
  passenger_id: string;
  rider_id: string;
  amount: number;
  payment_method?: PaymentMethod;
  payment_status: PaymentStatus;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  upi_transaction_id?: string;
  created_at: string;
}

// ─── Location ────────────────────────────────────────────────────────────────
export interface LiveLocation {
  id: string;
  rider_id: string;
  booking_id: string;
  lat: number;
  lng: number;
  updated_at: string;
}

// ─── Rating ──────────────────────────────────────────────────────────────────
export interface Rating {
  id: string;
  booking_id: string;
  passenger_id: string;
  rider_id: string;
  rating: number;
  review?: string;
  created_at: string;
}

// ─── Ride Status ─────────────────────────────────────────────────────────────
export type RideStatus =
  | "waiting"
  | "rider_on_the_way"
  | "rider_arrived"
  | "trip_started"
  | "trip_completed";

export interface RideStatusUpdate {
  booking_id: string;
  status: RideStatus;
  updated_at: string;
}

// ─── Admin ───────────────────────────────────────────────────────────────────
export interface AdminStats {
  total_users: number;
  total_riders: number;
  total_rides: number;
  total_revenue: number;
  active_rides: number;
  pending_verifications: number;
}

// ─── Search ──────────────────────────────────────────────────────────────────
export interface SearchParams {
  pickup: string;
  pickup_lat: number;
  pickup_lng: number;
  destination: string;
  destination_lat: number;
  destination_lng: number;
  departure_time: string;
  seats_needed: number;
}
