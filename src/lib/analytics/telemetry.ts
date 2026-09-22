/**
 * Hidden India — Privacy-Conscious Telemetry & Analytics Helper
 * 
 * Strict Privacy Standards:
 * - NO personal identifiable information (PII) collected
 * - NO silent or continuous GPS tracking
 * - NO cross-site tracking or third-party advertising cookies
 * - Measures only macro engagement: views, search filters, calculator usage, external map outbound clicks
 */

export type AnalyticsEvent =
  | { type: 'destination_view'; slug: string; state: string }
  | { type: 'collection_view'; slug: string }
  | { type: 'search_query'; termLength: number; hasCategoryFilter: boolean; resultCount: number }
  | { type: 'map_interaction'; action: 'marker_click' | 'filter_state' | 'reset_view'; label?: string }
  | { type: 'calculator_usage'; destinationSlug: string; isRoundTrip: boolean }
  | { type: 'gmaps_outbound_click'; destinationSlug: string }
  | { type: 'destination_saved'; destinationSlug: string }
  | { type: 'trip_created'; waypointCount: number };

export function trackEvent(event: AnalyticsEvent): void {
  // Client-side guard
  if (typeof window === 'undefined') return;

  // In production, this can send to a privacy-first collector (e.g. self-hosted Umami / Plausible)
  // or trigger window.plausible / window.va if configured.
  if (process.env.NODE_ENV === 'development') {
    // Helpful debug telemetry in local dev
    // console.debug('[Telemetry]', event.type, event);
  }

  try {
    // Custom window event dispatch for optional local telemetry observers
    window.dispatchEvent(new CustomEvent('hi_analytics', { detail: event }));
  } catch {
    // Fail silently without disrupting user experience
  }
}
