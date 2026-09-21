'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trip, Destination, DestinationVisitInfo, DestinationImage } from '@/lib/db/schema';
import { VEHICLE_PROFILES, VehicleCategory } from '@/lib/calculator/types';
import { MultiStopItineraryResult } from '@/lib/calculator/multiStopCalculator';

export interface WaypointData {
  id: string;
  sequence: number;
  notes: string | null;
  destination: Destination;
  visitInfo: DestinationVisitInfo | null;
  primaryImage: DestinationImage | null;
}

interface TripDetailClientProps {
  initialTrip: Trip;
  initialWaypoints: WaypointData[];
  availableDestinations: { id: string; name: string; state: string; district: string }[];
}

export const TripDetailClient: React.FC<TripDetailClientProps> = ({
  initialTrip,
  initialWaypoints,
  availableDestinations,
}) => {
  const router = useRouter();

  const [trip, setTrip] = useState<Trip>(initialTrip);
  const [waypoints, setWaypoints] = useState<WaypointData[]>(initialWaypoints);

  // Edit Metadata State
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [tripName, setTripName] = useState(trip.name);
  const [vehicleType, setVehicleType] = useState<VehicleCategory>(trip.vehicleType as VehicleCategory);
  const [startLocation, setStartLocation] = useState(trip.startLocation || 'Chandigarh');
  const [tripNotes, setTripNotes] = useState(trip.notes || '');
  const [isSavingMeta, setIsSavingMeta] = useState(false);

  // Sharing State
  const [isShared, setIsShared] = useState(trip.isShared);
  const [shareToken, setShareToken] = useState(trip.shareToken);
  const [isCopying, setIsCopying] = useState(false);

  // Add Destination State
  const [selectedDestToAdd, setSelectedDestToAdd] = useState('');
  const [isAddingDest, setIsAddingDest] = useState(false);

  // Delete State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Multi-Stop Calculation State
  const [isRoundTrip, setIsRoundTrip] = useState(true);
  const [itineraryResult, setItineraryResult] = useState<MultiStopItineraryResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcError, setCalcError] = useState<string | null>(null);

  // Execute multi-stop calculation
  const calculateItinerary = useCallback(async () => {
    if (waypoints.length === 0) {
      setItineraryResult(null);
      return;
    }

    setIsCalculating(true);
    setCalcError(null);

    try {
      const payload = {
        startLocation: {
          latitude: trip.startLatitude || 30.7333,
          longitude: trip.startLongitude || 76.7794,
        },
        startLocationLabel: trip.startLocationLabel || trip.startLocation || 'Chandigarh',
        waypoints: waypoints.map((w) => ({
          destinationId: w.destination.id,
          name: w.destination.name,
          coordinates: {
            latitude: w.destination.latitude,
            longitude: w.destination.longitude,
          },
          visitInfo: w.visitInfo,
        })),
        vehicleType,
        isRoundTrip,
      };

      const res = await fetch('/api/trips/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to calculate multi-stop itinerary.');
      }

      setItineraryResult(data.result);
    } catch (err) {
      setCalcError(err instanceof Error ? err.message : 'Calculation error');
    } finally {
      setIsCalculating(false);
    }
  }, [waypoints, trip, vehicleType, isRoundTrip]);

  useEffect(() => {
    calculateItinerary();
  }, [calculateItinerary]);

  // Handle Metadata Update
  const handleSaveMetadata = async () => {
    setIsSavingMeta(true);
    try {
      const res = await fetch(`/api/trips/${trip.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: {
            name: tripName.trim(),
            vehicleType,
            startLocation: startLocation.trim(),
            startLocationLabel: startLocation.trim(),
            notes: tripNotes.trim() || null,
          },
        }),
      });

      const data = await res.json();
      if (data.success && data.trip) {
        setTrip(data.trip.trip);
        setIsEditingMetadata(false);
      }
    } catch (err) {
      console.error('Failed to update trip metadata:', err);
    } finally {
      setIsSavingMeta(false);
    }
  };

  // Add Destination to Itinerary
  const handleAddDestination = async () => {
    if (!selectedDestToAdd) return;
    setIsAddingDest(true);

    try {
      const res = await fetch(`/api/trips/${trip.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_destination',
          destinationId: selectedDestToAdd,
        }),
      });

      const data = await res.json();
      if (data.success && data.trip) {
        setWaypoints(data.trip.waypoints);
        setSelectedDestToAdd('');
      }
    } catch (err) {
      console.error('Failed to add destination:', err);
    } finally {
      setIsAddingDest(false);
    }
  };

  // Remove Destination from Itinerary
  const handleRemoveDestination = async (destinationId: string) => {
    try {
      const res = await fetch(`/api/trips/${trip.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'remove_destination',
          destinationId,
        }),
      });

      const data = await res.json();
      if (data.success && data.trip) {
        setWaypoints(data.trip.waypoints);
      }
    } catch (err) {
      console.error('Failed to remove destination:', err);
    }
  };

  // Move Waypoint Up / Down
  const handleMoveWaypoint = async (currentIndex: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= waypoints.length) return;

    const reordered = [...waypoints];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    const reorderedIds = reordered.map((w) => w.destination.id);

    try {
      const res = await fetch(`/api/trips/${trip.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reorder_destinations',
          destinationIds: reorderedIds,
        }),
      });

      const data = await res.json();
      if (data.success && data.trip) {
        setWaypoints(data.trip.waypoints);
      }
    } catch (err) {
      console.error('Failed to reorder waypoints:', err);
    }
  };

  // Toggle Sharing
  const handleToggleSharing = async () => {
    const nextShare = !isShared;
    try {
      const res = await fetch(`/api/trips/${trip.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_sharing',
          isShared: nextShare,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsShared(data.isShared);
        setShareToken(data.shareToken);
      }
    } catch (err) {
      console.error('Failed to toggle sharing:', err);
    }
  };

  // Copy Share Link
  const handleCopyShareLink = () => {
    if (!shareToken) return;
    const url = `${window.location.origin}/trips/shared/${shareToken}`;
    navigator.clipboard.writeText(url);
    setIsCopying(true);
    setTimeout(() => setIsCopying(false), 2500);
  };

  // Delete Trip
  const handleDeleteTrip = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/trips/${trip.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.push('/trips');
      }
    } catch (err) {
      console.error('Failed to delete trip:', err);
      setIsDeleting(false);
    }
  };

  return (
    <div className="trip-detail-layout">
      {/* 1. Trip Header Bar */}
      <div className="trip-header-card">
        <div className="trip-header-main">
          <Link href="/trips" className="back-link">
            ← All Road Trips
          </Link>
          <div className="trip-title-row">
            <h1 className="text-h1">{trip.name}</h1>
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={() => setIsEditingMetadata(!isEditingMetadata)}
            >
              {isEditingMetadata ? 'Cancel' : 'Edit Parameters'}
            </button>
          </div>

          <div className="trip-quick-meta">
            <span>📍 Start: <strong>{trip.startLocationLabel || trip.startLocation || 'Chandigarh'}</strong></span>
            <span>🚗 Vehicle: <strong>{VEHICLE_PROFILES[vehicleType]?.label || vehicleType}</strong></span>
            <span>🏛️ Stops: <strong>{waypoints.length}</strong></span>
            {trip.tripStartDate && <span>📅 Dates: <strong>{trip.tripStartDate}</strong></span>}
          </div>

          {trip.notes && !isEditingMetadata && (
            <p className="trip-notes-display">
              📝 <strong>Notes:</strong> {trip.notes}
            </p>
          )}
        </div>

        {/* Sharing Controls (Section 20) */}
        <div className="trip-share-box">
          <div className="share-status-row">
            <span className="share-label">Public Itinerary Sharing:</span>
            <button
              type="button"
              className={`btn btn-sm ${isShared ? 'btn-danger' : 'btn-secondary'}`}
              onClick={handleToggleSharing}
            >
              {isShared ? 'Disable Sharing' : 'Enable Share Link'}
            </button>
          </div>

          {isShared && shareToken && (
            <div className="share-link-wrapper">
              <input
                type="text"
                readOnly
                className="input-field share-url-input"
                value={typeof window !== 'undefined' ? `${window.location.origin}/trips/shared/${shareToken}` : ''}
              />
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={handleCopyShareLink}
              >
                {isCopying ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          )}
          <p className="share-privacy-disclaimer">
            🔒 Shared link displays the ordered route and destinations. Your private notes and home GPS coordinates are redacted.
          </p>
        </div>
      </div>

      {/* Quick Edit Metadata Panel */}
      {isEditingMetadata && (
        <div className="edit-metadata-panel">
          <h2 className="text-h3" style={{ marginBottom: '1rem' }}>Edit Trip Parameters</h2>
          <div className="control-group-row">
            <div className="control-group" style={{ flex: 1 }}>
              <label className="control-label">Trip Name</label>
              <input
                type="text"
                className="input-field"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
              />
            </div>
            <div className="control-group" style={{ flex: 1 }}>
              <label className="control-label">Starting Location</label>
              <input
                type="text"
                className="input-field"
                value={startLocation}
                onChange={(e) => setStartLocation(e.target.value)}
              />
            </div>
          </div>

          <div className="control-group" style={{ marginTop: '1rem' }}>
            <label className="control-label">Vehicle Model</label>
            <div className="vehicle-selector-grid">
              {(Object.keys(VEHICLE_PROFILES) as VehicleCategory[]).map((vKey) => (
                <button
                  key={vKey}
                  type="button"
                  className={`vehicle-card-btn ${vehicleType === vKey ? 'selected' : ''}`}
                  onClick={() => setVehicleType(vKey)}
                >
                  <span className="vehicle-title">{VEHICLE_PROFILES[vKey].label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="control-group" style={{ marginTop: '1rem' }}>
            <label className="control-label">Private Notes</label>
            <textarea
              className="input-field"
              rows={2}
              value={tripNotes}
              onChange={(e) => setTripNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleSaveMetadata}
              disabled={isSavingMeta}
            >
              {isSavingMeta ? 'Saving...' : 'Save Parameters'}
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsEditingMetadata(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* 2. Main Two-Column Layout: Waypoints List & Multi-Stop Calculator */}
      <div className="itinerary-grid">
        {/* Left Column: Ordered Itinerary Waypoints */}
        <div className="itinerary-waypoints-column">
          <div className="column-header">
            <h2 className="text-h3">Ordered Route Waypoints</h2>
            <span className="text-caption" style={{ color: 'var(--color-text-muted)' }}>
              Execution sequence from starting point to destinations
            </span>
          </div>

          {/* Starting Location Banner */}
          <div className="waypoint-origin-item">
            <div className="origin-marker-dot">🏁</div>
            <div className="origin-text">
              <span className="origin-label">Trip Start Point</span>
              <span className="origin-name">{trip.startLocationLabel || trip.startLocation || 'Chandigarh'}</span>
            </div>
          </div>

          {/* Destination Waypoints List */}
          <div className="waypoints-list">
            {waypoints.length === 0 ? (
              <div className="empty-waypoints-notice">
                <span>No destinations added to this trip yet.</span>
                <p className="text-small" style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                  Use the selector below to add stops to your itinerary.
                </p>
              </div>
            ) : (
              waypoints.map((wp, idx) => (
                <div key={wp.id} className="waypoint-card">
                  <div className="waypoint-sequence-badge">
                    <span>{idx + 1}</span>
                  </div>

                  <div className="waypoint-details">
                    <h3 className="waypoint-title">
                      <Link href={`/destinations/${wp.destination.slug}`} target="_blank">
                        {wp.destination.name} ↗
                      </Link>
                    </h3>
                    <span className="waypoint-location">
                      📍 {wp.destination.locality ? `${wp.destination.locality}, ` : ''}{wp.destination.district}, {wp.destination.state}
                    </span>

                    {wp.visitInfo && (
                      <div className="waypoint-visit-tags">
                        <span className="visit-tag">
                          🎟️ Entry: {wp.visitInfo.entryFee || 'Unverified'}
                        </span>
                        <span className="visit-tag">
                          🅿️ Parking: {wp.visitInfo.parkingInformation || 'Unverified'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Ordering and Removal Controls */}
                  <div className="waypoint-controls">
                    <button
                      type="button"
                      className="btn-move"
                      onClick={() => handleMoveWaypoint(idx, 'up')}
                      disabled={idx === 0}
                      title="Move earlier in route"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      className="btn-move"
                      onClick={() => handleMoveWaypoint(idx, 'down')}
                      disabled={idx === waypoints.length - 1}
                      title="Move later in route"
                    >
                      ▼
                    </button>
                    <button
                      type="button"
                      className="btn-remove-waypoint"
                      onClick={() => handleRemoveDestination(wp.destination.id)}
                      title="Remove from trip"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Destination Form */}
          <div className="add-destination-box">
            <h3 className="text-label" style={{ marginBottom: '0.5rem' }}>Add Stop to Itinerary</h3>
            <div className="add-dest-row">
              <select
                className="input-field"
                value={selectedDestToAdd}
                onChange={(e) => setSelectedDestToAdd(e.target.value)}
              >
                <option value="">Select a published destination...</option>
                {availableDestinations
                  .filter((d) => !waypoints.some((w) => w.destination.id === d.id))
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.district}, {d.state})
                    </option>
                  ))}
              </select>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleAddDestination}
                disabled={!selectedDestToAdd || isAddingDest}
              >
                {isAddingDest ? 'Adding...' : '+ Add Stop'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Multi-Stop Calculation & Google Maps Deep Link */}
        <div className="itinerary-calculator-column">
          <div className="column-header">
            <h2 className="text-h3">Multi-Stop Trip Calculation</h2>
            <span className="text-caption" style={{ color: 'var(--color-text-muted)' }}>
              Independent segment routing & aggregated cost engineering
            </span>
          </div>

          {/* Trip Direction Option */}
          <div className="calc-options-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isRoundTrip}
                onChange={(e) => setIsRoundTrip(e.target.checked)}
              />
              <span>Include return leg back to starting point</span>
            </label>

            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={calculateItinerary}
              disabled={isCalculating || waypoints.length === 0}
            >
              {isCalculating ? 'Calculating...' : '↻ Recalculate'}
            </button>
          </div>

          {calcError ? (
            <div className="calc-error-banner" role="alert">
              <strong>Calculation Note:</strong> {calcError}
            </div>
          ) : isCalculating ? (
            <div className="calc-loading-state">
              <div className="spinner" />
              <span>Calculating route segments and fuel consumption...</span>
            </div>
          ) : itineraryResult ? (
            <div className="itinerary-result-card">
              {/* Segments Breakdown */}
              <div className="segments-section">
                <h3 className="breakdown-title">Route Segments</h3>
                <div className="segments-list">
                  {itineraryResult.segments.map((seg, idx) => (
                    <div key={idx} className="segment-row">
                      <div className="segment-endpoints">
                        <span className="seg-step-num">Leg {idx + 1}</span>
                        <span className="seg-name">{seg.fromName} ➔ {seg.toName}</span>
                      </div>
                      <div className="segment-metrics">
                        <span className="seg-dist">{seg.distanceKm} km</span>
                        <span className="seg-time">~{Math.round((seg.durationMinutes / 60) * 10) / 10}h</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals Summary Metrics */}
              <div className="metrics-grid" style={{ marginTop: '1rem' }}>
                <div className="metric-box">
                  <span className="metric-label">Total Distance</span>
                  <span className="metric-value">{itineraryResult.totalDistanceKm} km</span>
                  <span className="metric-sub">{itineraryResult.segments.length} segments</span>
                </div>

                <div className="metric-box">
                  <span className="metric-label">Total Driving Time</span>
                  <span className="metric-value">
                    ~{Math.round((itineraryResult.totalDurationMinutes / 60) * 10) / 10} hrs
                  </span>
                  <span className="metric-sub">{itineraryResult.totalDurationMinutes} minutes</span>
                </div>

                <div className="metric-box">
                  <span className="metric-label">Energy Required</span>
                  <span className="metric-value">
                    {itineraryResult.costCalculation.energyRequired} {itineraryResult.costCalculation.energyUnit}
                  </span>
                  <span className="metric-sub">{itineraryResult.costCalculation.efficiencyLabel}</span>
                </div>
              </div>

              {/* Aggregated Cost Breakdown */}
              <div className="cost-breakdown-section" style={{ marginTop: '1.25rem' }}>
                <h3 className="breakdown-title">Aggregated Trip Cost</h3>
                <div className="breakdown-list">
                  {itineraryResult.costCalculation.breakdown.map((item) => (
                    <div key={item.id} className="breakdown-row">
                      <div className="item-info">
                        <span className="item-name">{item.title}</span>
                        <span className="item-detail">{item.details}</span>
                      </div>
                      <div className="item-price">
                        <span className={`price-badge status-${item.status.toLowerCase()}`}>
                          {item.formattedAmount}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Honest Total Row */}
                <div className="total-cost-row">
                  <div>
                    <span className="total-label">Estimated Total Trip Cost</span>
                    {itineraryResult.costCalculation.hasUnknownComponents && (
                      <span className="uncertainty-indicator">
                        (Minimum known components; tolls or fees unverified)
                      </span>
                    )}
                  </div>
                  <div className="total-amount-display">
                    {itineraryResult.costCalculation.totalDisplay}
                  </div>
                </div>
              </div>

              {/* Multi-Stop Google Maps Navigation Link */}
              <div className="navigation-action-block" style={{ marginTop: '1.5rem' }}>
                <a
                  href={itineraryResult.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-gmaps-navigate"
                >
                  <span>🗺️ Open Multi-Stop Route in Google Maps</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              </div>

              {/* Estimate Disclaimer */}
              <div className="calculator-disclaimer" style={{ marginTop: '1rem' }}>
                <p>
                  <strong>Notice:</strong> Multi-stop calculations sum segment distances and available destination entrance tariffs.
                  Fuel rates, road conditions, and route estimates reflect current market conditions and may adjust upon recalculation.
                  This calculation represents an estimate at planning time, not a permanent price guarantee.
                </p>
              </div>
            </div>
          ) : null}

          {/* Delete Trip Action */}
          <div className="delete-trip-zone" style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border-subtle)' }}>
            {showDeleteConfirm ? (
              <div className="delete-confirm-box">
                <p className="text-small" style={{ color: '#922B21', marginBottom: '0.5rem' }}>
                  Are you sure you want to permanently delete <strong>{trip.name}</strong>? This cannot be undone.
                </p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={handleDeleteTrip}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Yes, Delete Trip'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                style={{ color: '#C0392B' }}
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete This Trip
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
