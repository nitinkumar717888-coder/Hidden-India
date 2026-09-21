'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  VehicleCategory,
  TripType,
  TripCalculationResult,
  VEHICLE_PROFILES,
} from '@/lib/calculator/types';
import { calculateTripCost } from '@/lib/calculator/tripEngine';
import { DestinationVisitInfo } from '@/lib/db/schema';
import { parseDestinationVisitCosts } from '@/lib/calculator/visitParser';
import { Coordinates, RouteEstimate } from '@/lib/routing/types';
import { generateGoogleMapsNavigationUrl } from '@/lib/routing/routing-provider';

interface TripCalculatorProps {
  destinationName: string;
  destinationCoordinates: Coordinates;
  destinationState: string;
  visitInfo: DestinationVisitInfo | null;
}

export const TripCalculator: React.FC<TripCalculatorProps> = ({
  destinationName,
  destinationCoordinates,
  destinationState,
  visitInfo,
}) => {
  // Origin State
  const [originInput, setOriginInput] = useState('Chandigarh');
  const [userCoords, setUserCoords] = useState<Coordinates | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationNotice, setLocationNotice] = useState<string | null>(null);

  // Vehicle & Trip Parameters
  const [vehicleType, setVehicleType] = useState<VehicleCategory>('PETROL_CAR');
  const [tripType, setTripType] = useState<TripType>('ROUND_TRIP');
  const [customEfficiency, setCustomEfficiency] = useState<string>('');
  const [customFuelPrice, setCustomFuelPrice] = useState<string>('');

  // Verified Fuel Tariff state
  const [verifiedPrice, setVerifiedPrice] = useState<{
    price: number;
    source: string;
    verifiedAt: string;
    precision: 'CITY' | 'DISTRICT' | 'STATE' | 'USER_PROVIDED';
    isHistoricalBaseline?: boolean;
    provenanceNote?: string;
  } | null>(null);

  // Route & Calculation State
  const [routeEstimate, setRouteEstimate] = useState<RouteEstimate | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  // Parsed Visit Info Costs (Entry & Parking)
  const parsedCosts = useMemo(() => parseDestinationVisitCosts(visitInfo), [visitInfo]);

  // Fetch verified fuel price when state or vehicle changes
  useEffect(() => {
    const profile = VEHICLE_PROFILES[vehicleType];
    const fetchTariff = async () => {
      try {
        const res = await fetch(
          `/api/fuel?fuelType=${profile.fuelType}&state=${encodeURIComponent(destinationState)}`
        );
        const data = await res.json();
        if (data.success && data.priceRecord) {
          setVerifiedPrice({
            price: data.priceRecord.pricePerUnit,
            source: data.priceRecord.source,
            verifiedAt: data.priceRecord.verifiedAt,
            precision: data.priceRecord.precision,
            isHistoricalBaseline: data.priceRecord.isHistoricalBaseline,
            provenanceNote: data.priceRecord.provenanceNote,
          });
        } else {
          setVerifiedPrice({
            price: profile.defaultFuelPriceEstimate,
            source: 'Regional Baseline Estimate',
            verifiedAt: new Date().toISOString(),
            precision: 'STATE',
            isHistoricalBaseline: true,
            provenanceNote: 'Regional reference estimate',
          });
        }
      } catch {
        setVerifiedPrice({
          price: profile.defaultFuelPriceEstimate,
          source: 'Regional Baseline Estimate',
          verifiedAt: new Date().toISOString(),
          precision: 'STATE',
          isHistoricalBaseline: true,
          provenanceNote: 'Regional reference estimate',
        });
      }
    };

    fetchTariff();
  }, [vehicleType, destinationState]);

  // "Use my location" Geolocation Handler
  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setLocationNotice('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationNotice(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setUserCoords(coords);
        setOriginInput('Your Current Location');
        setIsLocating(false);
        setLocationNotice('Your location is used for this calculation and is not saved.');
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationNotice('Location permission was denied. You can enter your city/town manually.');
        } else {
          setLocationNotice('Unable to retrieve location. Please type your city/town manually.');
        }
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  // Route calculation execution
  const calculateRoute = useCallback(async () => {
    setIsLoadingRoute(true);
    setRouteError(null);

    try {
      const payload = {
        origin: originInput,
        destination: destinationCoordinates,
        originCoordinates: userCoords || undefined,
      };

      const res = await fetch('/api/routing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to calculate route.');
      }

      setRouteEstimate(data.route);
    } catch (err) {
      setRouteError(err instanceof Error ? err.message : 'Routing service unavailable.');
    } finally {
      setIsLoadingRoute(false);
    }
  }, [originInput, destinationCoordinates, userCoords]);

  // Trigger initial calculation on mount
  useEffect(() => {
    calculateRoute();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Instant local calculation whenever route or local parameters change (Zero API overhead!)
  const calculationResult: TripCalculationResult | null = useMemo(() => {
    if (!routeEstimate) return null;

    const parsedCustomEff = parseFloat(customEfficiency);
    const parsedCustomPrice = parseFloat(customFuelPrice);

    const fuelPrice = !isNaN(parsedCustomPrice) && parsedCustomPrice > 0
      ? parsedCustomPrice
      : (verifiedPrice?.price || VEHICLE_PROFILES[vehicleType].defaultFuelPriceEstimate);

    const fuelPricePrecision = !isNaN(parsedCustomPrice) && parsedCustomPrice > 0
      ? 'USER_PROVIDED'
      : (verifiedPrice?.precision || 'ESTIMATED');

    const fuelPriceSource = !isNaN(parsedCustomPrice) && parsedCustomPrice > 0
      ? 'User-provided rate'
      : (verifiedPrice?.source || undefined);

    const fuelPriceVerifiedAt = !isNaN(parsedCustomPrice) && parsedCustomPrice > 0
      ? undefined
      : (verifiedPrice?.verifiedAt || undefined);

    // Tolls from route provider
    const tollInput = routeEstimate.hasTollInfo && routeEstimate.tollEstimateINR !== null && routeEstimate.tollEstimateINR !== undefined
      ? { status: 'KNOWN_AMOUNT' as const, amount: routeEstimate.tollEstimateINR }
      : { status: 'UNKNOWN' as const };

    try {
      return calculateTripCost({
        oneWayDistanceKm: routeEstimate.distanceKm,
        tripType,
        vehicleType,
        customEfficiency: !isNaN(parsedCustomEff) && parsedCustomEff > 0 ? parsedCustomEff : null,
        fuelPricePerUnit: fuelPrice,
        fuelPricePrecision,
        fuelPriceSource,
        fuelPriceVerifiedAt,
        tolls: tollInput,
        parking: parsedCosts.parking,
        entryFee: parsedCosts.entryFee,
      });
    } catch {
      return null;
    }
  }, [routeEstimate, tripType, vehicleType, customEfficiency, customFuelPrice, verifiedPrice, parsedCosts]);

  // Google Maps Navigation Deep Link
  const navigationUrl = useMemo(() => {
    const originParam = userCoords || originInput;
    return generateGoogleMapsNavigationUrl(originParam, destinationCoordinates, destinationName);
  }, [userCoords, originInput, destinationCoordinates, destinationName]);

  const currentProfile = VEHICLE_PROFILES[vehicleType];

  return (
    <div className="trip-calculator-card" id="plan-visit">
      <div className="trip-calculator-header">
        <div>
          <h2 className="text-h3">Trip & Fuel Calculation Engine</h2>
          <p className="text-small" style={{ color: 'var(--color-text-muted)' }}>
            Transparent, deterministic estimates for driving to {destinationName}.
          </p>
        </div>
        <div className="calculator-badge">
          <span className="badge-pulse" />
          <span>Real-time Estimator</span>
        </div>
      </div>

      <div className="calculator-grid">
        {/* Left Column: Trip Parameters */}
        <div className="calculator-controls">
          {/* 1. Origin Input */}
          <div className="control-group">
            <label htmlFor="origin-input" className="control-label">
              Starting Location
            </label>
            <div className="origin-input-wrapper">
              <input
                id="origin-input"
                type="text"
                className="input-field"
                placeholder="City, town, area, or hub"
                value={originInput}
                onChange={(e) => {
                  setOriginInput(e.target.value);
                  setUserCoords(null);
                }}
              />
              <button
                type="button"
                className="btn-locate"
                onClick={handleUseLocation}
                disabled={isLocating}
                title="Use current GPS location"
              >
                {isLocating ? 'Locating...' : '📍 Use my location'}
              </button>
            </div>
            {locationNotice && (
              <p className="location-privacy-notice">
                🔒 {locationNotice}
              </p>
            )}
            {/* Regional Hub Quick Picks */}
            <div className="hub-quick-picks">
              <span className="quick-label">Quick hubs:</span>
              {['Chandigarh', 'Delhi', 'Amritsar', 'Shimla'].map((hub) => (
                <button
                  key={hub}
                  type="button"
                  className={`hub-chip ${originInput.toLowerCase() === hub.toLowerCase() ? 'active' : ''}`}
                  onClick={() => {
                    setOriginInput(hub);
                    setUserCoords(null);
                  }}
                >
                  {hub}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Vehicle Selector */}
          <div className="control-group">
            <label className="control-label">Vehicle & Energy Type</label>
            <div className="vehicle-selector-grid">
              {(Object.keys(VEHICLE_PROFILES) as VehicleCategory[]).map((vKey) => {
                const prof = VEHICLE_PROFILES[vKey];
                const isSelected = vehicleType === vKey;
                return (
                  <button
                    key={vKey}
                    type="button"
                    className={`vehicle-card-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      setVehicleType(vKey);
                      setCustomEfficiency('');
                    }}
                  >
                    <span className="vehicle-title">{prof.label}</span>
                    <span className="vehicle-fuel-badge">{prof.fuelType}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Efficiency & Custom Mileage Override */}
          <div className="control-group-row">
            <div className="control-group" style={{ flex: 1 }}>
              <label htmlFor="efficiency-input" className="control-label">
                Efficiency ({currentProfile.efficiencyUnit})
              </label>
              <div className="input-with-unit">
                <input
                  id="efficiency-input"
                  type="number"
                  step="0.1"
                  min="1"
                  className="input-field"
                  placeholder={currentProfile.defaultEfficiency.toString()}
                  value={customEfficiency}
                  onChange={(e) => setCustomEfficiency(e.target.value)}
                />
                <span className="unit-suffix">{currentProfile.efficiencyUnit}</span>
              </div>
              <span className="field-note">
                {customEfficiency && parseFloat(customEfficiency) > 0
                  ? 'Using your custom vehicle efficiency'
                  : `Estimated default: ${currentProfile.defaultEfficiency} ${currentProfile.efficiencyUnit}`}
              </span>
            </div>

            {/* 4. Fuel/Energy Price Override */}
            <div className="control-group" style={{ flex: 1 }}>
              <label htmlFor="fuel-price-input" className="control-label">
                {currentProfile.fuelType === 'ELECTRICITY' ? 'Electricity Tariff' : `${currentProfile.fuelType} Price`}
              </label>
              <div className="input-with-unit">
                <input
                  id="fuel-price-input"
                  type="number"
                  step="0.1"
                  min="0"
                  className="input-field"
                  placeholder={verifiedPrice ? verifiedPrice.price.toFixed(2) : currentProfile.defaultFuelPriceEstimate.toString()}
                  value={customFuelPrice}
                  onChange={(e) => setCustomFuelPrice(e.target.value)}
                />
                <span className="unit-suffix">
                  ₹ / {currentProfile.fuelType === 'ELECTRICITY' ? 'kWh' : vehicleType === 'CNG_CAR' ? 'kg' : 'L'}
                </span>
              </div>
              <span className="field-note">
                {customFuelPrice && parseFloat(customFuelPrice) > 0 ? (
                  'Provenance: User-provided rate'
                ) : verifiedPrice ? (
                  `Reference rate: ₹${verifiedPrice.price.toFixed(2)} (${verifiedPrice.source} — May 2024). Enter your rate for today's market estimate.`
                ) : (
                  'Regional reference estimate'
                )}
              </span>
            </div>
          </div>

          {/* 5. Trip Type Toggle */}
          <div className="control-group">
            <label className="control-label">Trip Direction</label>
            <div className="trip-type-toggle">
              <button
                type="button"
                className={`toggle-btn ${tripType === 'ONE_WAY' ? 'active' : ''}`}
                onClick={() => setTripType('ONE_WAY')}
              >
                One Way
              </button>
              <button
                type="button"
                className={`toggle-btn ${tripType === 'ROUND_TRIP' ? 'active' : ''}`}
                onClick={() => setTripType('ROUND_TRIP')}
              >
                Round Trip (Return)
              </button>
            </div>
          </div>

          {/* Calculate Button */}
          <button
            type="button"
            className="btn btn-primary btn-calculate-trip"
            onClick={calculateRoute}
            disabled={isLoadingRoute || !originInput.trim()}
          >
            {isLoadingRoute ? 'Calculating Route...' : 'Calculate Trip'}
          </button>
        </div>

        {/* Right Column: Transparent Calculation Breakdown */}
        <div className="calculator-results">
          {routeError ? (
            <div className="calc-error-banner" role="alert">
              <strong>Calculation Note:</strong> {routeError}
              <p className="text-small" style={{ marginTop: '0.25rem' }}>
                Try selecting a recognized regional hub above.
              </p>
            </div>
          ) : calculationResult && routeEstimate ? (
            <div className="result-card">
              {/* Route Summary */}
              <div className="result-route-bar">
                <div className="route-endpoints">
                  <span className="route-origin">{originInput}</span>
                  <span className="route-arrow">➔</span>
                  <span className="route-dest">{destinationName}</span>
                </div>
                <div className="route-tags">
                  <span className={`precision-tag ${routeEstimate.precision === 'ACTUAL_DRIVE' ? 'verified' : 'estimated'}`}>
                    {routeEstimate.precision === 'ACTUAL_DRIVE' ? '🛣️ Google Routes' : '📐 Curvature Estimate'}
                  </span>
                </div>
              </div>

              {/* Distance and Duration Metrics */}
              <div className="metrics-grid">
                <div className="metric-box">
                  <span className="metric-label">Distance ({tripType === 'ROUND_TRIP' ? 'Round Trip' : 'One Way'})</span>
                  <span className="metric-value">{calculationResult.totalDistanceKm} km</span>
                  <span className="metric-sub">{routeEstimate.precisionLabel}</span>
                </div>

                <div className="metric-box">
                  <span className="metric-label">Est. Travel Time</span>
                  <span className="metric-value">
                    {tripType === 'ROUND_TRIP'
                      ? `~${Math.round((routeEstimate.durationMinutes * 2) / 60 * 10) / 10} hrs`
                      : `~${Math.round((routeEstimate.durationMinutes / 60) * 10) / 10} hrs`}
                  </span>
                  <span className="metric-sub">
                    {routeEstimate.durationMinutes} min {tripType === 'ROUND_TRIP' ? 'each way' : 'one way'}
                  </span>
                </div>

                <div className="metric-box">
                  <span className="metric-label">Energy Required</span>
                  <span className="metric-value">
                    {calculationResult.energyRequired} {calculationResult.energyUnit}
                  </span>
                  <span className="metric-sub">{calculationResult.efficiencyLabel}</span>
                </div>
              </div>

              {/* Cost Breakdown Table */}
              <div className="cost-breakdown-section">
                <h3 className="breakdown-title">Itemized Cost Estimate</h3>
                <div className="breakdown-list">
                  {calculationResult.breakdown.map((item) => (
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

                {/* Total Cost Display */}
                <div className="total-cost-row">
                  <div>
                    <span className="total-label">Estimated Total Trip Cost</span>
                    {calculationResult.hasUnknownComponents && (
                      <span className="uncertainty-indicator">
                        (Minimum known components; tolls or fees unverified)
                      </span>
                    )}
                  </div>
                  <div className="total-amount-display">
                    {calculationResult.totalDisplay}
                  </div>
                </div>
              </div>

              {/* Navigation Deep Link */}
              <div className="navigation-action-block">
                <a
                  href={navigationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-gmaps-navigate"
                >
                  <span>🗺️ Open in Google Maps</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              </div>

              {/* Estimate Disclaimer */}
              <div className="calculator-disclaimer">
                <p>
                  <strong>Notice:</strong> Trip costs are estimates based on the selected route, vehicle efficiency,
                  fuel/energy price, and available destination information. Actual costs may vary depending on driving style,
                  traffic congestion, local toll changes, and seasonal tariffs.
                </p>
                {calculationResult.uncertaintyNotes.length > 0 && (
                  <ul className="uncertainty-bullet-list">
                    {calculationResult.uncertaintyNotes.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : (
            <div className="calc-loading-state">
              <div className="spinner" />
              <span>Calculating route distance and energy estimates...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
