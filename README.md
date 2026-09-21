# HIDDEN INDIA

> **Discover the India you weren't told about.**  
> A searchable discovery database of India's hidden, forgotten, unusual, historical, cultural, natural, and lesser-known places combined with a practical trip-planning engine.

---

## 🏛️ Core Product Philosophy

Hidden India is not a generic travel blog or social media aggregator. It is an editorial-grade, verified discovery platform engineered to help travelers transition through the complete discovery lifecycle:

$$\text{DISCOVER} \longrightarrow \text{LEARN} \longrightarrow \text{PLAN} \longrightarrow \text{CALCULATE} \longrightarrow \text{NAVIGATE} \longrightarrow \text{SAVE} \longrightarrow \text{RETURN}$$

### Key Editorial & Technical Principles
1. **Zero Information Fabrication**: Opening hours, historical facts, entry fees, coordinates, and fuel rates are never invented. When data is unverified or unknown, it is explicitly indicated.
2. **Fact vs. Legend Distinction**: Content explicitly separates `DOCUMENTED` facts, `LOCAL TRADITION`, `DISPUTED` assertions, and `UNKNOWN` status.
3. **Zero Manufactured Social Proof**: No fake reviews, synthetic ratings, or artificial user activity.
4. **Utility-First Design**: Built with clean, responsive Vanilla CSS, rich editorial typography, and high-performance server-rendered layouts.
5. **Privacy First**: User geolocation is never collected silently. It is requested explicitly only for route calculation and never stored without consent.

---

## 🗺️ Initial Geographic Scope

To guarantee depth and accuracy, initial releases focus on high-quality editorial coverage across:
- **Chandigarh** (Union Territory)
- **Punjab**
- **Haryana**
- **Himachal Pradesh**
- **Delhi** (NCT)

---

## 💻 Tech Stack (Phase 1 Foundation)

- **Framework**: Next.js 14.2.15 (App Router, Server Components, TypeScript Strict Mode)
- **Styling**: Pure Vanilla CSS with centralized design tokens (`variables.css`, `reset.css`, `typography.css`, `layout.css`, `components.css`)
- **Database & ORM**: PostgreSQL via `postgres.js` and [Drizzle ORM](https://orm.drizzle.team/) with Drizzle Kit migrations
- **Fonts**: Self-hosted Google Fonts via `next/font` (Playfair Display for editorial serif headings, Inter for high-legibility UI text)
- **Architecture**: Modular Service/Adapter patterns for routing, fuel pricing, geocoding, search, and location privacy

---

## 📁 Repository Structure (Phase 1)

```text
d:/travel website/
├── .env.example                # Documented configuration template
├── .gitignore                  # Git ignore rules for Next.js, nodes, env files
├── package.json                # Project dependencies & scripts
├── tsconfig.json               # TypeScript strict configuration
├── next.config.js              # Next.js production & image configuration
├── drizzle.config.ts           # Drizzle ORM migration configuration
├── PROJECT_PLAN.md             # Master phased roadmap and feature scope
├── TECHNICAL_ARCHITECTURE.md   # System architecture, database schemas, and math models
├── README.md                   # Development guide & system status
└── src/
    ├── app/
    │   ├── layout.tsx          # Root layout (Metadata, Google Fonts, Header, Footer)
    │   └── page.tsx            # Lightweight Homepage Foundation
    ├── components/
    │   └── common/
    │       ├── Button.tsx      # Primary, Secondary, Ghost, Destructive variants
    │       ├── Container.tsx   # Responsive container wrapper
    │       ├── Disclaimer.tsx  # Reusable travel caveat & notice component
    │       ├── EmptyState.tsx  # Accessible empty state container
    │       ├── FactBadge.tsx   # Verified fact & evidence classification badge
    │       ├── Footer.tsx      # Multi-column semantic footer
    │       ├── Header.tsx      # Responsive header with brand wordmark
    │       ├── LoadingState.tsx# Accessible shimmer skeleton loader
    │       ├── Navigation.tsx  # Desktop links + accessible mobile toggle menu
    │       └── Section.tsx     # Semantic section wrapper with subtle/dark variants
    ├── lib/
    │   ├── db/
    │   │   ├── index.ts        # Database connection singleton
    │   │   ├── schema.ts       # Drizzle schema (destinations, sources, images, enums)
    │   │   └── migrations/     # Generated SQL migrations (0000_brave_sleepwalker.sql)
    │   ├── env.ts              # Environment variable validation
    │   ├── fuel/
    │   │   ├── types.ts        # Fuel price interfaces and verification timestamps
    │   │   └── fuel-provider.ts# Fuel provider adapter with verified regional rates
    │   ├── geocoding/
    │   │   ├── types.ts        # Geocoding interfaces
    │   │   └── geocoding-provider.ts # Local regional hub geocoder (zero cost/offline)
    │   ├── location/
    │   │   ├── types.ts        # Explicit location permission & coordinate types
    │   │   └── location-service.ts # Explicit user-initiated geolocation client
    │   ├── routing/
    │   │   ├── types.ts        # Routing request & estimate interfaces
    │   │   └── routing-provider.ts # Route adapter with Haversine road factor fallback
    │   ├── search/
    │   │   ├── types.ts        # Multi-attribute search query & result types
    │   │   └── search-service.ts   # Database-ready search service skeleton
    │   └── types/
    │       └── enums.ts        # Editorial & evidence classification enums
    └── styles/
        ├── variables.css       # Centralized design tokens (heritage colors, spacing, typography)
        ├── reset.css           # Modern, clean CSS reset
        ├── typography.css      # Editorial font scale & hierarchy
        ├── layout.css          # Responsive containers, gutters, section variants
        ├── components.css      # Buttons, badges, cards, search bar, header/footer styles
        └── globals.css         # Global stylesheet entry point
```

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js**: v18.18.0 or v20+ (tested on v20.18.0)
- **npm**: 10+
- PostgreSQL database (optional for static UI build; required for live DB queries)

### 1. Clone & Setup Environment
```bash
# Copy example environment configuration
cp .env.example .env.local
```

### 2. Available Scripts
```bash
# Install dependencies
npm install

# Start Next.js development server
npm run dev

# Run TypeScript strict type-check
npm run typecheck

# Run ESLint validation
npm run lint

# Generate database migrations via Drizzle Kit
npm run db:generate

# Push schema directly to database
npm run db:push

# Build optimized production bundle
npm run build

# Start production server
npm run start
```

---

## 📊 Phase 1 Implementation Status

- [x] Clean Next.js 14 App Router + TypeScript Strict Mode setup
- [x] Zero-Tailwind, high-performance Vanilla CSS design system with heritage-inspired tokens
- [x] Foundational Drizzle ORM schema for `destinations`, `destination_sources`, and `destination_images`
- [x] Strongly typed enums for editorial workflows and evidence classifications (`DOCUMENTED`, `LOCAL_TRADITION`, `DISPUTED`, `UNKNOWN`)
- [x] Initial SQL migration generated via `drizzle-kit generate`
- [x] Accessible Base UI primitives (`Header`, `Footer`, `Navigation`, `Button`, `FactBadge`, `Disclaimer`, `LoadingState`, `EmptyState`, `Container`, `Section`)
- [x] Lightweight homepage with zero fabricated data, adhering strictly to Rule 1
- [x] Modular service/adapter contracts for routing, fuel prices, geocoding, search, and privacy-first location
- [x] 100% clean verification: `npm run lint`, `npm run typecheck`, and `npm run build` all pass with 0 errors

---

## 🔜 Remaining for Phase 2 (Destination CMS & Data Engine)
1. Destination CRUD & Editorial CMS backend with role-based access.
2. Verified destination research pipeline for the first 20 target destinations (Chandigarh, Punjab, Haryana, Himachal Pradesh, Delhi).
3. Dynamic destination page template (`/destinations/[slug]`) featuring:
   - Hero section with verified facts & save trigger
   - Quick facts card (duration, era, season, difficulty, verified entry fee)
   - "The Story" editorial narrative
   - Evidence breakdown ("What We Know" vs. "Local Stories & Legends")
   - Sources & citations drawer with verified links
4. Database connection & seeding with verified destination records.
