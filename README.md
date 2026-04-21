# RouteMate 🚗

> Smart route-based ride-sharing platform for Indian daily commuters.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + TypeScript |
| Styling | Tailwind CSS + ShadCN UI |
| State | Zustand + TanStack Query |
| Auth | Supabase Auth |
| Database | Supabase PostgreSQL |
| Maps | Google Maps API |
| Payments | Razorpay (UPI) |
| Hosting | Vercel |

---

## Project Structure

```
routemate/
├── src/
│   ├── components/
│   │   └── layout/          # DashboardLayout, ProtectedRoute, RoleRoute
│   ├── pages/
│   │   ├── public/          # Landing, HowItWorks, Safety, Contact
│   │   ├── auth/            # Login, Register, ForgotPassword
│   │   ├── passenger/       # Dashboard, FindRide, RideDetails, TrackRider, Payment, History
│   │   ├── rider/           # Dashboard, RouteSetup, Requests, Earnings, Profile, History
│   │   └── admin/           # Dashboard, Users, Rides, Payments
│   ├── services/            # authService, routeService, bookingService, paymentService, locationService, riderService
│   ├── store/               # authStore (Zustand)
│   ├── types/               # TypeScript interfaces
│   └── lib/                 # supabase client
├── supabase/
│   └── migrations/          # SQL schema
├── .env.example
└── README.md
```

---

## Step 1 — Supabase Setup

1. Go to [supabase.com](https://supabase.com) → Create new project
2. Go to **SQL Editor** → Paste contents of `supabase/migrations/001_initial_schema.sql` → Run
3. Go to **Storage** → Create two buckets:
   - `avatars` (public)
   - `documents` (private)
4. Go to **Project Settings → API** → Copy:
   - Project URL → `VITE_SUPABASE_URL`
   - Anon public key → `VITE_SUPABASE_ANON_KEY`

---

## Step 2 — Google Maps API

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project → Enable these APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Directions API
3. Create API Key → Restrict to your domain
4. Copy key → `VITE_GOOGLE_MAPS_API_KEY`

> ⚠️ Also replace `%VITE_GOOGLE_MAPS_API_KEY%` in `index.html` with your actual key, OR use a Vite HTML plugin to inject it automatically.

---

## Step 3 — Razorpay Setup

1. Go to [razorpay.com](https://razorpay.com) → Create account
2. Go to **Settings → API Keys** → Generate Test Key
3. Copy Key ID → `VITE_RAZORPAY_KEY_ID`

> For production: Complete KYC and switch to Live keys.

---

## Step 4 — Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
VITE_APP_NAME=RouteMate
VITE_APP_URL=http://localhost:8080
```

---

## Step 5 — Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:8080](http://localhost:8080)

---

## Step 6 — Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables on Vercel dashboard:
# Project → Settings → Environment Variables
# Add all variables from .env
```

Or deploy via GitHub:
1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Import project
3. Add environment variables
4. Deploy

---

## Step 7 — Create Admin User

After deployment, run this SQL in Supabase SQL Editor to make a user admin:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your-admin@email.com';
```

---

## Google Maps in index.html

Replace the Maps script in `index.html` with your actual API key:

```html
<script
  src="https://maps.googleapis.com/maps/api/js?key=YOUR_ACTUAL_KEY&libraries=places&callback=initMap"
  async
  defer
></script>
```

---

## User Roles

| Role | Access |
|---|---|
| `passenger` | Find rides, book, pay, track |
| `rider` | Create routes, accept rides, earn |
| `admin` | Full platform management |

---

## Payment Flow

```
Passenger books ride
       ↓
Redirected to Payment Page
       ↓
Choose: Razorpay (recommended) OR Direct UPI
       ↓
Razorpay → UPI popup → Payment confirmed
       ↓
Booking status → confirmed
       ↓
Passenger can track rider live
```

---

## Live Tracking Flow

```
Rider accepts booking
       ↓
Rider opens app → GPS starts tracking
       ↓
Location sent to Supabase live_locations table every 3s
       ↓
Passenger's TrackRider page subscribes via Supabase Realtime
       ↓
Map updates rider position in real-time
```

---

## Support

- Email: support@routemate.in
- GitHub Issues: Open an issue on this repo

---

## License

MIT License — Free to use, modify and deploy.
