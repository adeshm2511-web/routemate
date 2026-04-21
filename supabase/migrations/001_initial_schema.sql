-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── USERS ───────────────────────────────────────────────────────────────────
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('passenger', 'rider', 'admin')),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all users" ON users FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- ─── RIDERS ──────────────────────────────────────────────────────────────────
CREATE TABLE riders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  vehicle_type TEXT NOT NULL,
  vehicle_number TEXT NOT NULL,
  vehicle_model TEXT NOT NULL,
  id_proof_url TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  total_rides INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  upi_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE riders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view approved riders" ON riders FOR SELECT USING (is_approved = TRUE);
CREATE POLICY "Riders can update own profile" ON riders FOR UPDATE USING (
  auth.uid() = user_id
);
CREATE POLICY "Riders can insert own profile" ON riders FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

-- ─── ROUTES ──────────────────────────────────────────────────────────────────
CREATE TABLE routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rider_id UUID REFERENCES riders(id) ON DELETE CASCADE,
  start_location TEXT NOT NULL,
  start_lat DECIMAL(10, 8) NOT NULL,
  start_lng DECIMAL(11, 8) NOT NULL,
  end_location TEXT NOT NULL,
  end_lat DECIMAL(10, 8) NOT NULL,
  end_lng DECIMAL(11, 8) NOT NULL,
  departure_time TIMESTAMPTZ NOT NULL,
  available_seats INTEGER NOT NULL CHECK (available_seats >= 0),
  price_per_seat DECIMAL(10, 2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active routes" ON routes FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Riders can manage own routes" ON routes FOR ALL USING (
  rider_id IN (SELECT id FROM riders WHERE user_id = auth.uid())
);

-- ─── BOOKINGS ────────────────────────────────────────────────────────────────
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_id UUID REFERENCES routes(id),
  passenger_id UUID REFERENCES users(id),
  rider_id UUID REFERENCES riders(id),
  seats_booked INTEGER NOT NULL DEFAULT 1,
  pickup_location TEXT NOT NULL,
  pickup_lat DECIMAL(10, 8),
  pickup_lng DECIMAL(11, 8),
  drop_location TEXT NOT NULL,
  drop_lat DECIMAL(10, 8),
  drop_lng DECIMAL(11, 8),
  total_fare DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Passengers can view own bookings" ON bookings FOR SELECT USING (
  auth.uid() = passenger_id
);
CREATE POLICY "Riders can view their bookings" ON bookings FOR SELECT USING (
  rider_id IN (SELECT id FROM riders WHERE user_id = auth.uid())
);
CREATE POLICY "Passengers can create bookings" ON bookings FOR INSERT WITH CHECK (
  auth.uid() = passenger_id
);
CREATE POLICY "Both can update bookings" ON bookings FOR UPDATE USING (
  auth.uid() = passenger_id OR rider_id IN (SELECT id FROM riders WHERE user_id = auth.uid())
);

-- ─── PAYMENTS ────────────────────────────────────────────────────────────────
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id),
  passenger_id UUID REFERENCES users(id),
  rider_id UUID REFERENCES riders(id),
  amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('googlepay', 'phonepe', 'paytm', 'bhim', 'upi')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  upi_transaction_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (
  auth.uid() = passenger_id OR rider_id IN (SELECT id FROM riders WHERE user_id = auth.uid())
);
CREATE POLICY "System can insert payments" ON payments FOR INSERT WITH CHECK (
  auth.uid() = passenger_id
);
CREATE POLICY "System can update payments" ON payments FOR UPDATE USING (
  auth.uid() = passenger_id
);

-- ─── LIVE LOCATIONS ──────────────────────────────────────────────────────────
CREATE TABLE live_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rider_id UUID REFERENCES riders(id),
  booking_id UUID REFERENCES bookings(id) UNIQUE,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE live_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Booking users can view location" ON live_locations FOR SELECT USING (
  booking_id IN (
    SELECT id FROM bookings WHERE passenger_id = auth.uid()
    OR rider_id IN (SELECT id FROM riders WHERE user_id = auth.uid())
  )
);
CREATE POLICY "Riders can update location" ON live_locations FOR ALL USING (
  rider_id IN (SELECT id FROM riders WHERE user_id = auth.uid())
);

-- ─── RIDE STATUS ─────────────────────────────────────────────────────────────
CREATE TABLE ride_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) UNIQUE,
  status TEXT NOT NULL DEFAULT 'waiting',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ride_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone in booking can view status" ON ride_status FOR SELECT USING (
  booking_id IN (
    SELECT id FROM bookings WHERE passenger_id = auth.uid()
    OR rider_id IN (SELECT id FROM riders WHERE user_id = auth.uid())
  )
);
CREATE POLICY "Riders can update status" ON ride_status FOR ALL USING (
  booking_id IN (
    SELECT id FROM bookings WHERE rider_id IN (SELECT id FROM riders WHERE user_id = auth.uid())
  )
);

-- ─── RATINGS ─────────────────────────────────────────────────────────────────
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) UNIQUE,
  passenger_id UUID REFERENCES users(id),
  rider_id UUID REFERENCES riders(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view ratings" ON ratings FOR SELECT USING (TRUE);
CREATE POLICY "Passengers can insert ratings" ON ratings FOR INSERT WITH CHECK (
  auth.uid() = passenger_id
);

-- ─── FUNCTIONS ───────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION decrease_seats(route_id UUID, seats INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE routes SET available_seats = available_seats - seats WHERE id = route_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_rider_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE riders SET total_rides = total_rides + 1 WHERE id = NEW.rider_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_booking_completed
  AFTER UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_rider_stats();

-- ─── REALTIME ────────────────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE live_locations;
ALTER PUBLICATION supabase_realtime ADD TABLE ride_status;
ALTER PUBLICATION supabase_realtime ADD TABLE payments;
