# HIDDEN INDIA — Master Project Plan

> **Discover the India you weren't told about.**  
> A searchable discovery database of India's hidden, forgotten, unusual, historical, cultural, natural, and lesser-known places combined with a practical trip-planning engine.

---

## 1. Project Objectives & Core Principles

### Core Objectives
- Transition a visitor seamlessly: **DISCOVER → LEARN → PLAN → CALCULATE → NAVIGATE → SAVE → RETURN** (and eventually **BOOK → EARN**).
- Prioritize practical usefulness, editorial integrity, and high performance over decorative fluff.
- Serve travelers looking for authentic, uncommercialized historical and natural exploration in India.

### Non-Negotiable Product Rules
1. **Rule 1 — Do Not Fabricate Information**: Never invent historical claims, entry fees, petrol prices, travel times, coordinates, sources, or reviews. If data is unverified or unknown, label it explicitly.
2. **Rule 2 — Strict Fact vs. Legend Separation**: Content must be classified into:
   - `DOCUMENTED`: Backed by archaeological, governmental, academic, or archival sources.
   - `LOCAL TRADITION`: Folklore, oral traditions, and religious or local beliefs.
   - `DISPUTED`: Conflicting claims between credible sources.
   - `UNKNOWN`: Insufficient reliable evidence.
3. **Rule 3 — Zero Fake Social Proof**: No fake reviews, synthetic ratings, fake testimonials, or artificial trip counters.
4. **Rule 4 — Modular & Resilient Engineering**: Modular components, strict typing, independent testability, graceful degradation for APIs.

---

## 2. Target Market & Content Milestones

### Geographic Focus (Initial Target)
- **Chandigarh** (Union Territory)
- **Punjab**
- **Haryana**
- **Himachal Pradesh**
- **Delhi** (National Capital Territory)

### Content Targets
- **Milestone 1**: 20 thoroughly researched, fully sourced, verified destinations.
- **Milestone 2**: Expand to 50 destinations + 15 foundational road-trip and discovery blog guides.
- **Milestone 3**: 100 destinations across Northern and Central India.
- **Milestone 4**: 250 → 500+ destinations nationwide.

---

## 3. Phased Implementation Roadmap

```
Phase 1: Architecture & Foundation (Current)
Phase 2: Destination CMS & Data Engine
Phase 3: Discovery Engine & Interactive Map
Phase 4: Practical Trip & Fuel Calculation Engine
Phase 5: User Accounts, Saved Places & Trip Planner
Phase 6: Editorial Blog & SEO Acquisition Layer
Phase 7: SEO Optimization, Schema & Web Performance
Phase 8: Monetization & Ethical Affiliate Architecture
```

### Phase 1: Architecture & Foundation (Completed)
- [x] Repository inspection and technical stack selection (Next.js 14 App Router, TypeScript Strict Mode, Vanilla CSS design tokens, PostgreSQL / Drizzle ORM).
- [x] Create project blueprint: `PROJECT_PLAN.md`, `TECHNICAL_ARCHITECTURE.md`, `.env.example`, `README.md`.
- [x] Initialize repository structure with strict linting (`npm run lint`), typechecking (`npm run typecheck`), and production build (`npm run build`).
- [x] Implement foundational Vanilla CSS design system (`variables.css`, `reset.css`, `typography.css`, `layout.css`, `components.css`, `globals.css`).
- [x] Define database models and schema migrations with Drizzle ORM (`destinations`, `destination_sources`, `destination_images`, editorial/evidence enums).
- [x] Implement reusable baseline UI primitives: `Header`, `Footer`, `Navigation`, `Button`, `FactBadge`, `Disclaimer`, `LoadingState`, `EmptyState`, `Container`, `Section`.
- [x] Implement lightweight Homepage foundation with zero fabricated data adhering strictly to Rule 1.
- [x] Implement clean modular service/adapter interfaces for future APIs (routing, fuel pricing, geocoding, search, and privacy-first location).

### Phase 2: Destination CMS & Data Engine (Completed)
- [x] Schema & architecture audit: cleanly separated permanent editorial facts, changing visit information, and dynamic calculations.
- [x] Normalized Category Architecture (`categories` & `destination_categories` many-to-many bridge).
- [x] Rapidly changing visit information model (`destination_visit_info` with verification timestamps and source tracking).
- [x] Structured Fact vs. Legend Segregation (`destination_evidence_items` with `DOCUMENTED`, `LOCAL_TRADITION`, `DISPUTED`, and `UNKNOWN` classifications).
- [x] Strict Bibliographic Citations (`destination_sources` supporting `GOVERNMENT`, `ARCHAEOLOGICAL`, `ACADEMIC`, `MUSEUM`, `OFFICIAL_TOURISM`, `ARCHIVAL`, `NEWS`, `OTHER`).
- [x] Strict Validation Layer (`src/lib/validation/destination.ts` validating slugs, coordinates, required names, URLs, fees, and enum values).
- [x] Seed mechanism (`src/lib/db/seed.ts`) with standard taxonomy and non-public `TEST_DESTINATION_ONLY` draft fixture.
- [x] Destination Data Service (`src/lib/services/destination-service.ts`) with publication status enforcement and relationship joining.
- [x] Production-quality public Destination page (`/destinations/[slug]`):
  - Hero header with breadcrumbs, evidence badges, and verified primary media
  - Quick facts card (filtering out empty labels)
  - "The Story" factual editorial narrative
  - "What We Know" documented archaeological evidence
  - "Local Stories & Legends" explicitly separated folklore section
  - "Visit & Access Guidelines" with verified timestamps and fee notes
  - Attributed photographic gallery with licenses and credits
  - Sources & References list with safe external links
  - Rich SEO metadata and schema (`BreadcrumbList` & `TouristAttraction` with no fake reviews)
  - Strict publication gate (unpublished drafts return 404 unless authenticated preview token provided)
- [x] Protected Admin CMS interface (`/admin`, `/admin/destinations`, `/admin/destinations/new`) with workflow status management.

### Phase 3: Discovery Engine & Interactive Map (Completed)
- [x] Single source of truth: Centralized `DiscoveryService` (`src/lib/services/discovery-service.ts`) enforcing `editorial_status = 'published'` across all discovery surfaces.
- [x] Server-driven Search Engine (`/search`):
  - Query parameters for shareability, browser history, and SEO (`/search?q=...&state=...&category=...&difficulty=...`).
  - Search across name, locality, district, state, short description, and historical period with case-insensitive ILIKE matching.
  - Reusable `DestinationCard` showing verified info (name, locality, state, categories, description, evidence badge; zero fake social proof).
  - Multi-select and select filters (State, Category, Difficulty).
  - Scalable pagination preserving filter parameters across page clicks.
  - Empty state with guidance when no published records match.
- [x] Dedicated Category Portals (`/categories/[category]`):
  - Normalized database categories with titles, descriptions, breadcrumbs, and published destination listings.
  - Returns 404 for invalid category slugs.
- [x] Dedicated Regional State Portals (`/states/[state]`):
  - Covered initial launch states: Punjab, Haryana, Himachal Pradesh, Chandigarh, and Delhi.
  - State descriptions, published discovery counts, category filter pills, and deep link into map.
  - Returns 404 for invalid state slugs.
- [x] Database-Driven Homepage (`/`):
  - Hero search wired to `/search`.
  - Category cards wired to database categories (`/categories/[category]`).
  - Featured Discoveries and Latest Discoveries querying live published destinations with intentional empty states if unpopulated.
- [x] Production Interactive Map (`/map`):
  - Leaflet-based client with abstracted tile layer configuration (`NEXT_PUBLIC_MAP_TILE_URL` & `NEXT_PUBLIC_MAP_ATTRIBUTION`).
  - Lightweight marker payloads (coordinates, title, slug, primary image, evidence badge).
  - Compact preview card with straight-line distance calculation and direct link to destination page.
  - Filters for State, Category, and Difficulty.
  - Privacy-first "Use my location" button (explicit user interaction only).
  - Accessible Table/List View alternative toggle for keyboard navigation, screen-readers, and mobile usability.

### Phase 4: Practical Trip & Fuel Calculation Engine
- [ ] Pure functional trip calculation library (`calculateTripCost`):
  - One-way and round-trip distances
  - Travel time estimation
  - Vehicle types: Petrol Car, Diesel Car, CNG Car, Motorcycle, EV
  - Custom vehicle efficiency input with labeled fallback estimates
  - Toll and parking estimation models
  - Clear cost itemization with disclaimers
- [ ] Fuel price management service:
  - Schema for city/state fuel rates with `verified_at` timestamps and source tracking
  - Manual price adjustment toggle for user accuracy
- [ ] Official route integration:
  - Google Maps Directions / Routes API integration with fallback to local geospatial routing
  - "Open in Google Maps" direct navigation URL generation
  - Privacy guard: Coordinates never stored without user intent

### Phase 5: User Accounts, Saved Places & Trip Planner
- [ ] Supabase Auth integration (email magic link / passwordless / secure OAuth).
- [ ] Anonymous session save fallback (Local Storage) transitioning to authenticated cloud sync.
- [ ] Saved Places dashboard (`/saved`).
- [ ] Multi-destination Trip Builder (`/trips`):
  - Itinerary sequence calculation
  - Aggregate fuel, tolls, and entry fee breakdowns
  - Explicit opt-in Trip Sharing URLs (`/trips/share/[id]`).

### Phase 6: Editorial Blog & SEO Acquisition Layer
- [ ] Blog engine with Markdown / rich text support (`/blog`, `/blog/[slug]`).
- [ ] High-intent keyword categories:
  - Discovery searches ("forgotten forts near Chandigarh")
  - Practical queries ("how to reach [destination]")
  - Historical explorations ("documented timeline of [site]")
- [ ] Bi-directional linking: Destination pages automatically cite related articles and vice versa.

### Phase 7: SEO Optimization, Schema & Performance
- [ ] Dynamic XML sitemap generator (`/sitemap.xml`) and `robots.txt`.
- [ ] Rich Structured Data (JSON-LD):
  - `TouristAttraction` for verified destinations
  - `Article` for editorial blog posts
  - `BreadcrumbList` for hierarchical navigation
  - Strictly no synthetic reviews/ratings markup.
- [ ] Static generation (SSG) with On-Demand Incremental Static Regeneration (ISR).
- [ ] Next/Image optimization and WebP delivery.

### Phase 8: Ethical Monetization & Travel Partnerships
- [ ] Pluggable affiliate module (hotels, eco-stays, travel gear, vehicle rentals).
- [ ] Clear affiliate disclosure on every monetized link.
- [ ] Strict editorial independence: recommendations never influenced by commission.

---

## 4. What Is NOT Being Built Yet (Out of Scope)
- ❌ Direct in-app booking engines or payment gateways (planned for Phase 8).
- ❌ Native turn-by-turn navigation (handled via official Google Maps deep linking).
- ❌ User-generated reviews, comments, and public rating stars (violates Rule 3 until reliable verification mechanisms exist).
- ❌ Blanket nationwide destination scraping (all records must pass manual source verification).
- ❌ Automatic background geolocation polling (violates Rule 1 and privacy guidelines).
