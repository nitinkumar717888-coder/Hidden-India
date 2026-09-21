'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import type { MapDestinationMarker } from '@/lib/services/discovery-service';
import type { Category } from '@/lib/db/schema';
import type { UserCoordinates } from '@/lib/location/types';
import { locationService } from '@/lib/location/location-service';
import { FactBadge } from '@/components/common/FactBadge';
import { Container } from '@/components/common/Container';

// Dynamically import Leaflet with SSR disabled
const LeafletMapClient = dynamic(() => import('./LeafletMapClient'), {
  ssr: false,
  loading: () => (
    <div className="map-loading-placeholder">
      <div className="skeleton" style={{ width: '100%', height: '100%' }} />
      <span className="loading-map-text">Initializing interactive map...</span>
    </div>
  ),
});

interface MapContainerProps {
  initialMarkers: MapDestinationMarker[];
  categories: Category[];
  initialStateFilter?: string;
}

/**
 * Calculates straight-line distance (km) using the Haversine formula.
 */
function calculateHaversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export const MapContainer: React.FC<MapContainerProps> = ({
  initialMarkers,
  categories,
  initialStateFilter = '',
}) => {
  const [selectedState, setSelectedState] = useState<string>(initialStateFilter);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDest, setSelectedDest] = useState<MapDestinationMarker | null>(null);
  const [activeView, setActiveView] = useState<'map' | 'list'>('map');

  // Explicit User Location State
  const [userLocation, setUserLocation] = useState<UserCoordinates | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Client-side filtering of published markers
  const filteredMarkers = useMemo(() => {
    return initialMarkers.filter((dest) => {
      // 1. State filter
      if (selectedState && dest.state.toLowerCase() !== selectedState.toLowerCase()) {
        return false;
      }
      // 2. Category filter
      if (
        selectedCategory &&
        !dest.categoryNames.some((c) => c.toLowerCase() === selectedCategory.toLowerCase())
      ) {
        return false;
      }
      // 3. Difficulty filter
      if (selectedDifficulty && dest.difficulty !== selectedDifficulty) {
        return false;
      }
      // 4. Keyword search
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          dest.name.toLowerCase().includes(q) ||
          dest.district.toLowerCase().includes(q) ||
          dest.state.toLowerCase().includes(q) ||
          (dest.locality && dest.locality.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }, [initialMarkers, selectedState, selectedCategory, selectedDifficulty, searchQuery]);

  // Request browser geolocation explicitly on user click
  async function handleLocateMe() {
    setIsLocating(true);
    setLocationError(null);
    try {
      const coords = await locationService.requestCurrentLocation();
      setUserLocation(coords);
    } catch (err: any) {
      setLocationError(err.message || 'Unable to obtain your location.');
    } finally {
      setIsLocating(false);
    }
  }

  return (
    <div className="map-page-wrapper">
      {/* Top Filter & Control Toolbar */}
      <div className="map-toolbar">
        <Container size="wide">
          <div className="toolbar-inner">
            {/* Filter Controls Row */}
            <div className="toolbar-filters">
              <input
                type="search"
                placeholder="Filter map by name or town..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-text map-search-input"
                aria-label="Filter map destinations"
              />

              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="input-text map-filter-select"
                aria-label="Filter by state"
              >
                <option value="">All States</option>
                <option value="Punjab">Punjab</option>
                <option value="Haryana">Haryana</option>
                <option value="Himachal Pradesh">Himachal Pradesh</option>
                <option value="Chandigarh">Chandigarh</option>
                <option value="Delhi">Delhi</option>
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-text map-filter-select"
                aria-label="Filter by category"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="input-text map-filter-select"
                aria-label="Filter by difficulty"
              >
                <option value="">Any Difficulty</option>
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="challenging">Challenging</option>
                <option value="strenuous">Strenuous</option>
              </select>
            </div>

            {/* Actions: Locate Me & View Toggle */}
            <div className="toolbar-actions">
              <button
                type="button"
                onClick={handleLocateMe}
                disabled={isLocating}
                className="btn btn-secondary btn-sm"
                title="Uses browser location solely in your browser to calculate straight-line distances"
              >
                <span>📍</span>
                <span>{isLocating ? 'Locating...' : 'Use my location'}</span>
              </button>

              {/* View Toggle: Map vs Accessible List View */}
              <div className="view-mode-toggle" role="group" aria-label="View representation">
                <button
                  type="button"
                  onClick={() => setActiveView('map')}
                  className={`btn btn-sm ${activeView === 'map' ? 'btn-primary' : 'btn-ghost'}`}
                  aria-pressed={activeView === 'map'}
                >
                  Map View
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView('list')}
                  className={`btn btn-sm ${activeView === 'list' ? 'btn-primary' : 'btn-ghost'}`}
                  aria-pressed={activeView === 'list'}
                >
                  Accessible List View
                </button>
              </div>
            </div>
          </div>

          {locationError && (
            <div className="location-notice-bar" role="alert">
              <span>{locationError}</span>
            </div>
          )}
        </Container>
      </div>

      {/* Main Display Area */}
      <div className="map-view-container">
        {activeView === 'map' ? (
          <div className="map-canvas-layout">
            <LeafletMapClient
              destinations={filteredMarkers}
              selectedDestination={selectedDest}
              onSelectDestination={setSelectedDest}
              userCoordinates={userLocation}
            />

            {/* Compact Marker Popup Card */}
            {selectedDest && (
              <aside className="map-destination-drawer" role="dialog" aria-label={selectedDest.name}>
                <button
                  type="button"
                  onClick={() => setSelectedDest(null)}
                  className="close-drawer-btn"
                  aria-label="Close destination details"
                >
                  ✕
                </button>

                <div className="drawer-body">
                  {selectedDest.primaryImage && (
                    <div className="drawer-image-box">
                      <Image
                        src={selectedDest.primaryImage.url}
                        alt={selectedDest.primaryImage.altText}
                        fill
                        className="drawer-img"
                      />
                    </div>
                  )}

                  <div className="drawer-text-content">
                    <div className="drawer-badge-row">
                      <FactBadge
                        label={selectedDest.evidenceClassification.replace('_', ' ')}
                        variant="evidence"
                        evidenceType={selectedDest.evidenceClassification as any}
                      />
                      <span className="location-crumb">
                        {selectedDest.district}, {selectedDest.state}
                      </span>
                    </div>

                    <h3 className="drawer-title text-h4">{selectedDest.name}</h3>
                    <p className="drawer-desc text-small">{selectedDest.shortDescription}</p>

                    {/* Straight-line distance calculation if user location is granted */}
                    {userLocation && (
                      <div className="straight-line-distance-badge">
                        <span>Approx. </span>
                        <strong>
                          {calculateHaversineKm(
                            userLocation.latitude,
                            userLocation.longitude,
                            selectedDest.latitude,
                            selectedDest.longitude
                          )}{' '}
                          km away
                        </strong>
                        <span className="dist-note"> (straight-line distance)</span>
                      </div>
                    )}

                    <div className="drawer-actions">
                      <Link
                        href={`/destinations/${selectedDest.slug}`}
                        className="btn btn-primary btn-sm"
                      >
                        Explore Destination &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              </aside>
            )}

            {/* Map Counter Badge */}
            <div className="map-floating-counter">
              <span>
                <strong>{filteredMarkers.length}</strong> published{' '}
                {filteredMarkers.length === 1 ? 'place' : 'places'} on map
              </span>
            </div>
          </div>
        ) : (
          /* Accessible List Alternative */
          <div className="accessible-list-view">
            <Container size="wide">
              <div className="list-view-header">
                <h2 className="text-h3">Published Destinations (Accessible Table)</h2>
                <p className="text-small" style={{ color: 'var(--color-text-secondary)' }}>
                  Screen-reader and keyboard accessible directory of map markers.
                </p>
              </div>

              {filteredMarkers.length === 0 ? (
                <p style={{ marginTop: '2rem', color: 'var(--color-text-muted)' }}>
                  No published destinations match the active filter criteria.
                </p>
              ) : (
                <div className="admin-table-container" style={{ marginTop: '1.5rem' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Destination</th>
                        <th>Location</th>
                        <th>Evidence</th>
                        <th>Difficulty</th>
                        {userLocation && <th>Calculated Distance</th>}
                        <th style={{ textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMarkers.map((dest) => (
                        <tr key={dest.id}>
                          <td>
                            <strong>{dest.name}</strong>
                          </td>
                          <td>
                            {[dest.locality, dest.district, dest.state].filter(Boolean).join(', ')}
                          </td>
                          <td>
                            <FactBadge
                              label={dest.evidenceClassification.replace('_', ' ')}
                              variant="evidence"
                              evidenceType={dest.evidenceClassification as any}
                            />
                          </td>
                          <td style={{ textTransform: 'capitalize' }}>{dest.difficulty}</td>
                          {userLocation && (
                            <td>
                              Approx.{' '}
                              {calculateHaversineKm(
                                userLocation.latitude,
                                userLocation.longitude,
                                dest.latitude,
                                dest.longitude
                              )}{' '}
                              km (straight-line)
                            </td>
                          )}
                          <td style={{ textAlign: 'right' }}>
                            <Link
                              href={`/destinations/${dest.slug}`}
                              className="btn btn-secondary btn-sm"
                            >
                              Explore &rarr;
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Container>
          </div>
        )}
      </div>
    </div>
  );
};
