# HIDDEN INDIA — Technical Architecture Specification

## 1. System Overview

HIDDEN INDIA is architected as an editorial-grade web application built for speed, SEO discoverability, and high-utility trip planning.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Next.js App Router Layer                        │
│   (Server Components, Static Site Generation ISR, Server Actions, API) │
├────────────────────────────────────────────────────────────────────────┤
│                       Modern Vanilla CSS Design                        │
│         (CSS Variables, Responsive Grids, Fluid Typography)            │
├────────────────────────────────────────────────────────────────────────┤
│                 Core Application & Calculation Engine                  │
│    Trip Calculator  │  Fuel Engine  │  Geospatial Utility  │ Search    │
├────────────────────────────────────────────────────────────────────────┤
│                 Data Persistence & Authentication Layer                │
│    PostgreSQL (Supabase/Local)  │  Drizzle ORM  │  Supabase Auth       │
├────────────────────────────────────────────────────────────────────────┤
│                         External Integrations                          │
│   Google Maps Platform  │  Leaflet/OSM  │  Fuel Rate Feed  │ Webhooks  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

| Layer | Selected Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | **Next.js 14/15 (App Router, TypeScript)** | High performance, Server-Side Rendering (SSR), Incremental Static Regeneration (ISR) for fast destination indexing, built-in metadata API. |
| **Language** | **TypeScript 5.x (Strict Mode)** | Complete end-to-end type safety across database schemas, calculation engine, and UI components. |
| **Styling** | **Vanilla CSS + Modern CSS Variables** | Adheres strictly to design constraints. Zero runtime overhead, full control over typography, spacing, and dark/light themes. No bloated CSS dependencies. |
| **Database** | **PostgreSQL (via Supabase or standard PG)** | Relational integrity for destinations, sources, and trip models with geospatial coordinate indexing (`point` or PostGIS). |
| **ORM & Migrations** | **Drizzle ORM** | Type-safe, zero overhead, fast SQL queries without bloated query builders, seamless migration tooling. |
| **Authentication** | **Supabase Auth** | Standardized, battle-tested authentication (email OTP/magic links, OAuth) without custom password storage vulnerabilities. |
| **Interactive Map** | **Leaflet / React-Leaflet (OpenStreetMap tiles)** | Lightweight, cost-effective client-side map rendering with marker clustering (`leaflet.markercluster`). |
| **Routing / Distance**| **Google Maps Platform (Routes API) + Fallback** | Official distance matrix and travel time calculation with graceful fallback to OSRM / Haversine distance engine. |
| **Icons & Typography**| **Lucide Icons + Google Fonts (Inter / Outfit)** | High-legibility editorial typefaces and clean SVG icon vectors. |

---

## 3. Directory Structure

```text
d:/travel website/
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.js
├── README.md
├── PROJECT_PLAN.md
├── TECHNICAL_ARCHITECTURE.md
├── public/
│   ├── favicon.ico
│   ├── robots.txt
│   ├── images/
│   │   ├── hero/
│   │   ├── destinations/
│   │   └── blog/
│   └── icons/
├── src/
│   ├── app/                               # Next.js App Router
│   │   ├── layout.tsx                     # Global layout, fonts, header, footer
│   │   ├── page.tsx                       # Homepage (Search, Categories, Highlights)
│   │   ├── explore/page.tsx               # Discovery catalog & filters
│   │   ├── map/page.tsx                   # Interactive fullscreen map
│   │   ├── destinations/
│   │   │   ├── page.tsx                   # Filterable destinations list
│   │   │   └── [slug]/page.tsx            # Full destination detail page
│   │   ├── states/
│   │   │   └── [state]/page.tsx           # State-specific discovery portal
│   │   ├── categories/
│   │   │   └── [category]/page.tsx        # Category-specific archive
│   │   ├── blog/
│   │   │   ├── page.tsx                   # Blog index
│   │   │   └── [slug]/page.tsx            # Long-form article with citations
│   │   ├── trips/
│   │   │   ├── page.tsx                   # Trip planning engine & itinerary builder
│   │   │   └── share/[id]/page.tsx        # Public shared trip view
│   │   ├── saved/page.tsx                 # Saved destinations dashboard
│   │   ├── search/page.tsx                # Site-wide search results
│   │   ├── about/page.tsx                 # Editorial philosophy, fact-checking policy
│   │   ├── contact/page.tsx               # Contact & correction submission
│   │   ├── privacy/page.tsx               # Privacy policy & location disclosure
│   │   ├── terms/page.tsx                 # Terms of service
│   │   ├── admin/                         # Protected admin management
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                   # Admin metrics & content overview
│   │   │   ├── destinations/page.tsx      # Destination CRUD
│   │   │   └── blog/page.tsx              # Article authoring
│   │   ├── api/                           # Route handlers
│   │   │   ├── calculate/route.ts         # Server-side trip calculator
│   │   │   ├── search/route.ts            # Dynamic search query endpoint
│   │   │   ├── fuel-prices/route.ts       # Verified fuel price queries
│   │   │   └── destinations/route.ts      # GeoJSON / marker clustering feed
│   │   └── sitemap.ts                     # Dynamic XML sitemap
│   ├── components/                        # Reusable modular components
│   │   ├── common/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Navigation.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── FactBadge.tsx              # Documented / Tradition / Disputed indicator
│   │   │   └── Disclaimer.tsx
│   │   ├── destination/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── QuickFacts.tsx
│   │   │   ├── EvidenceBreakdown.tsx      # Fact vs Legend layout
│   │   │   ├── SourcesList.tsx            # Verified references
│   │   │   └── TripPlannerCard.tsx        # Embedded route/cost widget
│   │   ├── map/
│   │   │   ├── InteractiveMap.tsx         # Leaflet wrapper (dynamic import SSR: false)
│   │   │   └── MarkerPopup.tsx
│   │   ├── calculator/
│   │   │   ├── RouteForm.tsx              # Origin selector + vehicle inputs
│   │   │   ├── CostBreakdown.tsx          # Itemized fuel, toll, fee table
│   │   │   └── GoogleMapsButton.tsx       # External navigation deep link
│   │   └── blog/
│   │       ├── ArticleCard.tsx
│   │       └── RelatedDestinations.tsx
│   ├── lib/                               # Core business logic & utilities
│   │   ├── db/                            # Database connection & Drizzle schemas
│   │   │   ├── index.ts
│   │   │   ├── schema.ts
│   │   │   └── migrations/
│   │   ├── calculator/
│   │   │   ├── tripEngine.ts              # Mathematical models & cost formulas
│   │   │   ├── vehicleSpecs.ts            # Default vehicle configurations
│   │   │   └── fuelService.ts             # Fuel price lookup with verification tracking
│   │   ├── geo/
│   │   │   ├── distance.ts                # Haversine distance & coordinate math
│   │   │   └── routing.ts                 # Google Routes API integration & fallback
│   │   ├── auth/
│   │   │   └── client.ts                  # Supabase auth helpers
│   │   └── utils/
│   │       ├── formatters.ts              # Currency (₹ INR), distance (km), duration
│   │       ├── seo.ts                     # JSON-LD Schema generators
│   │       └── slugify.ts
│   └── styles/                            # Pure Vanilla CSS Design System
│       ├── variables.css                  # Color palette, spacing, typography scale
│       ├── reset.css                      # Modern CSS reset
│       ├── typography.css                 # Editorial font rules
│       ├── components.css                 # Buttons, cards, badges, inputs
│       └── utilities.css                  # Responsive layout grids & containers
```

---

## 4. Relational Database Schema (PostgreSQL / Drizzle ORM)

```sql
-- Enums
CREATE TYPE destination_status AS ENUM ('draft', 'researching', 'verified', 'published', 'needs_review', 'archived');
CREATE TYPE source_type AS ENUM ('government', 'archaeological', 'academic', 'museum', 'official_tourism', 'historical_publication', 'reputable_journalism', 'other');
CREATE TYPE evidence_type AS ENUM ('documented', 'local_tradition', 'disputed', 'unknown');
CREATE TYPE vehicle_type AS ENUM ('petrol_car', 'diesel_car', 'cng_car', 'motorcycle', 'ev');
CREATE TYPE difficulty_level AS ENUM ('easy', 'moderate', 'challenging', 'strenuous');

-- 1. Destinations Table
CREATE TABLE destinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    short_description TEXT NOT NULL,
    long_description TEXT NOT NULL,
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    category VARCHAR(100) NOT NULL,
    subcategories TEXT[] DEFAULT '{}',
    historical_period VARCHAR(100),
    estimated_visit_duration VARCHAR(50) NOT NULL,
    best_time_to_visit VARCHAR(100) NOT NULL,
    difficulty difficulty_level DEFAULT 'easy',
    accessibility TEXT,
    opening_hours TEXT,
    entry_fee_inr NUMERIC(10, 2),
    entry_fee_verified BOOLEAN DEFAULT FALSE,
    contact_information TEXT,
    official_website TEXT,
    hero_image_url TEXT,
    gallery_images TEXT[] DEFAULT '{}',
    status destination_status DEFAULT 'draft',
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spatial index on coordinates
CREATE INDEX idx_destinations_lat_long ON destinations (latitude, longitude);
CREATE INDEX idx_destinations_state ON destinations (state);
CREATE INDEX idx_destinations_category ON destinations (category);
CREATE INDEX idx_destinations_slug ON destinations (slug);

-- 2. Evidence Sections Table (Fact vs Legend)
CREATE TABLE destination_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    section_title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    classification evidence_type NOT NULL,
    notes TEXT,
    display_order INT DEFAULT 0
);

-- 3. Sources & Citations Table
CREATE TABLE destination_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    url TEXT,
    publisher VARCHAR(255) NOT NULL,
    source_type source_type NOT NULL,
    publication_date VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Fuel Prices Table
CREATE TABLE fuel_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100),
    fuel_type vehicle_type NOT NULL,
    price_per_unit NUMERIC(8, 2) NOT NULL,
    unit VARCHAR(10) DEFAULT 'litre', -- litre, kg for CNG, kWh for EV
    currency VARCHAR(10) DEFAULT 'INR',
    source VARCHAR(255) NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. User Profiles Table (Supabase Auth reference)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'user', -- 'user', 'editor', 'admin'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Saved Destinations Table
CREATE TABLE saved_destinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, destination_id)
);

-- 7. Trips Table
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    start_city VARCHAR(100) NOT NULL,
    start_lat DOUBLE PRECISION,
    start_lng DOUBLE PRECISION,
    vehicle_type vehicle_type DEFAULT 'petrol_car',
    vehicle_efficiency NUMERIC(6, 2),
    destinations_order JSONB NOT NULL, -- Array of destination IDs in order
    total_distance_km NUMERIC(10, 2),
    estimated_travel_time_minutes INT,
    estimated_fuel_cost_inr NUMERIC(10, 2),
    estimated_toll_cost_inr NUMERIC(10, 2),
    estimated_entry_cost_inr NUMERIC(10, 2),
    is_public BOOLEAN DEFAULT FALSE,
    share_token VARCHAR(64) UNIQUE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Blog Posts Table
CREATE TABLE blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    featured_image_url TEXT,
    author_id UUID REFERENCES profiles(id),
    category VARCHAR(100) NOT NULL,
    tags TEXT[] DEFAULT '{}',
    sources JSONB DEFAULT '[]',
    seo_title VARCHAR(255),
    seo_description VARCHAR(500),
    canonical_url TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 5. Trip Calculation Engine Architecture

### Mathematical Model
1. **Distance Metrics**:
   - `one_way_distance`: Calculated via Google Maps Routes API (or Haversine formula $\times$ 1.25 road winding factor fallback).
   - `round_trip_distance = one_way_distance \times 2`

2. **Fuel Consumption & Costs**:
   - **Petrol / Diesel Car / Motorcycle**:
     $$\text{fuel\_required (litres)} = \frac{\text{round\_trip\_distance (km)}}{\text{efficiency (km/L)}}$$
     $$\text{fuel\_cost (INR)} = \text{fuel\_required} \times \text{fuel\_price\_per\_litre}$$
   - **CNG Car**:
     $$\text{cng\_required (kg)} = \frac{\text{round\_trip\_distance (km)}}{\text{efficiency (km/kg)}}$$
     $$\text{cng\_cost (INR)} = \text{cng\_required} \times \text{cng\_price\_per\_kg}$$
   - **Electric Vehicle (EV)**:
     $$\text{energy\_required (kWh)} = \frac{\text{round\_trip\_distance (km)}}{\text{efficiency (km/kWh)}}$$
     $$\text{charging\_cost (INR)} = \text{energy\_required} \times \text{electricity\_rate\_per\_kWh}$$

3. **Total Estimated Cost**:
   $$\text{total\_cost} = \text{fuel\_cost} + \text{estimated\_tolls} + \text{estimated\_parking} + \text{verified\_entry\_fees}$$

### Default Baseline Efficiency Matrix (Labeled as Estimates)
- **Petrol Car**: 15.0 km/L
- **Diesel Car**: 18.0 km/L
- **CNG Car**: 22.0 km/kg
- **Motorcycle**: 38.0 km/L
- **Electric Car (EV)**: 6.5 km/kWh

---

## 6. External Third-Party APIs & Fallback Strategy

| API / Service | Purpose | Required / Optional | Fallback Strategy |
| :--- | :--- | :--- | :--- |
| **Google Maps Routes API** | Precise driving distance and estimated duration | Optional (Paid beyond free tier) | **Fallback**: Haversine geographic calculation with road topology coefficient (1.25x - 1.35x based on terrain). |
| **Google Maps Geocoding API**| Translating city/area/PIN code to coordinates | Optional | **Fallback**: Internal Indian district coordinate database (lat/long mapping for all North Indian districts). |
| **OpenStreetMap / Leaflet** | Tile layer and marker clustering | Free & Open Source | Statically bundled tiles or CartoDB Positron / OSM standard tiles. |
| **Supabase Auth** | User authentication and session management | Free Tier Available | Local session storage fallback for non-authenticated destination saves. |
| **Fuel Price API / Feed** | Daily state/district fuel updates | Optional | Curated and manually verified database table with visible `verified_at` badge and user manual override. |

---

## 7. Privacy, Security & Compliance Guardrails

1. **Location Privacy**:
   - Browser geolocation is **never triggered automatically**.
   - Explicit prompt explaining: *"We use your location only to estimate your route and travel cost."*
   - Precise GPS coordinates are kept client-side during the calculation session and discarded immediately unless saved to a user's trip.
2. **Environment Variables & Secrets**:
   - All secret keys (`SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `GOOGLE_MAPS_SERVER_KEY`) reside exclusively in server-side Next.js environment files.
   - Client keys (`NEXT_PUBLIC_...`) are strictly restricted in Google Cloud Console via HTTP referrer restrictions.
3. **No Synthetic / Fabricated Data**:
   - Every destination has an explicit status (`verified`, `researching`, etc.).
   - If an entry fee or toll estimate is unknown, the UI explicitly prints *"Fee unverified / check at counter"* rather than fabricating ₹0 or a guessed amount.
