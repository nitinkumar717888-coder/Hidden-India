-- =============================================================================
-- HIDDEN INDIA — SUPABASE ROW LEVEL SECURITY (RLS) POLICIES
-- Phase 5: User Accounts, Saved Places & My Trips
-- =============================================================================

-- 1. Enable Row Level Security on all user-owned tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_destinations ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 2. PROFILES TABLE POLICIES
-- -----------------------------------------------------------------------------
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can insert their own profile on signup
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile (name, marketing opt-in)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- 3. SAVED DESTINATIONS POLICIES (My Hidden India)
-- -----------------------------------------------------------------------------
-- Users can view only their own saved destinations
CREATE POLICY "Users can view own saved destinations"
  ON saved_destinations FOR SELECT
  USING (auth.uid() = user_id);

-- Users can save destinations to their own account
CREATE POLICY "Users can insert own saved destinations"
  ON saved_destinations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can remove destinations from their own account
CREATE POLICY "Users can delete own saved destinations"
  ON saved_destinations FOR DELETE
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 4. TRIPS TABLE POLICIES
-- -----------------------------------------------------------------------------
-- Users can view their own trips OR public shared trips
CREATE POLICY "Users can view own or shared trips"
  ON trips FOR SELECT
  USING (auth.uid() = user_id OR is_shared = true);

-- Users can create trips under their own account
CREATE POLICY "Users can insert own trips"
  ON trips FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update only their own trips
CREATE POLICY "Users can update own trips"
  ON trips FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete only their own trips
CREATE POLICY "Users can delete own trips"
  ON trips FOR DELETE
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 5. TRIP DESTINATIONS TABLE POLICIES (Waypoints)
-- -----------------------------------------------------------------------------
-- Users can view waypoints for trips they own or for shared trips
CREATE POLICY "Users can view waypoints of own or shared trips"
  ON trip_destinations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_destinations.trip_id
        AND (trips.user_id = auth.uid() OR trips.is_shared = true)
    )
  );

-- Users can insert waypoints only into trips they own
CREATE POLICY "Users can insert waypoints to own trips"
  ON trip_destinations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_destinations.trip_id
        AND trips.user_id = auth.uid()
    )
  );

-- Users can update waypoints only in trips they own
CREATE POLICY "Users can update waypoints in own trips"
  ON trip_destinations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_destinations.trip_id
        AND trips.user_id = auth.uid()
    )
  );

-- Users can delete waypoints only from trips they own
CREATE POLICY "Users can delete waypoints from own trips"
  ON trip_destinations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_destinations.trip_id
        AND trips.user_id = auth.uid()
    )
  );
