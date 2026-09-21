'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/common/Container';
import { VEHICLE_PROFILES, VehicleCategory } from '@/lib/calculator/types';

export default function NewTripPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [startLocation, setStartLocation] = useState('Chandigarh');
  const [startCoords, setStartCoords] = useState<{ lat: number; lng: number } | null>({
    lat: 30.7333,
    lng: 76.7794,
  });
  const [isStartLocationSaved, setIsStartLocationSaved] = useState(false);
  const [vehicleType, setVehicleType] = useState<VehicleCategory>('PETROL_CAR');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');

  const [isLocating, setIsLocating] = useState(false);
  const [locationNotice, setLocationNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setLocationNotice('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationNotice(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setStartCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setStartLocation('Current GPS Location');
        setIsLocating(false);
        setLocationNotice(
          'Location captured. Check the box below if you explicitly want this saved with your trip.'
        );
      },
      () => {
        setIsLocating(false);
        setLocationNotice('Unable to retrieve location. Please enter a city or town name.');
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Trip name is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          startLocation: startLocation.trim(),
          startLocationLabel: startLocation.trim(),
          startLatitude: isStartLocationSaved && startCoords ? startCoords.lat : null,
          startLongitude: isStartLocationSaved && startCoords ? startCoords.lng : null,
          isStartLocationSaved,
          vehicleType,
          tripStartDate: startDate || null,
          tripEndDate: endDate || null,
          notes: notes.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create trip');
      }

      router.push(`/trips/${data.trip.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating trip');
      setIsSubmitting(false);
    }
  };

  return (
    <main className="new-trip-page-main">
      <Container size="narrow">
        <div className="form-card">
          <header className="form-header" style={{ marginBottom: '1.5rem' }}>
            <Link href="/trips" className="back-link">
              ← Back to My Trips
            </Link>
            <h1 className="text-h2" style={{ marginTop: '0.5rem' }}>
              Create a New Road Trip
            </h1>
            <p className="text-muted">
              Define your trip parameters. You can add, remove, and reorder destinations on the next screen.
            </p>
          </header>

          {error && (
            <div className="calc-error-banner" role="alert" style={{ marginBottom: '1.5rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="trip-form">
            {/* 1. Trip Name */}
            <div className="control-group">
              <label htmlFor="trip-name" className="control-label">
                Trip Name *
              </label>
              <input
                id="trip-name"
                type="text"
                className="input-field"
                placeholder="e.g. Shivalik Forts Circuit, Himachal Monsoon Journey"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* 2. Starting Point */}
            <div className="control-group">
              <label htmlFor="start-location" className="control-label">
                Starting Location (Hub or City)
              </label>
              <div className="origin-input-wrapper">
                <input
                  id="start-location"
                  type="text"
                  className="input-field"
                  placeholder="e.g. Chandigarh, Delhi, Ambala, Shimla"
                  value={startLocation}
                  onChange={(e) => {
                    setStartLocation(e.target.value);
                    setStartCoords(null);
                  }}
                />
                <button
                  type="button"
                  className="btn-locate"
                  onClick={handleUseLocation}
                  disabled={isLocating}
                >
                  {isLocating ? 'Locating...' : '📍 Use Location'}
                </button>
              </div>

              {locationNotice && (
                <p className="location-privacy-notice" style={{ marginTop: '0.25rem' }}>
                  {locationNotice}
                </p>
              )}

              {/* Explicit Privacy Persistence Checkbox (Section 21) */}
              <label className="checkbox-label" style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={isStartLocationSaved}
                  onChange={(e) => setIsStartLocationSaved(e.target.checked)}
                />
                <span className="text-small">
                  Save this starting point coordinates permanently to this trip
                </span>
              </label>
            </div>

            {/* 3. Vehicle Type */}
            <div className="control-group">
              <label className="control-label">Vehicle & Energy Model</label>
              <div className="vehicle-selector-grid">
                {(Object.keys(VEHICLE_PROFILES) as VehicleCategory[]).map((vKey) => {
                  const prof = VEHICLE_PROFILES[vKey];
                  const isSelected = vehicleType === vKey;
                  return (
                    <button
                      key={vKey}
                      type="button"
                      className={`vehicle-card-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => setVehicleType(vKey)}
                    >
                      <span className="vehicle-title">{prof.label}</span>
                      <span className="vehicle-fuel-badge">{prof.fuelType}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Dates */}
            <div className="control-group-row">
              <div className="control-group" style={{ flex: 1 }}>
                <label htmlFor="start-date" className="control-label">
                  Start Date (Optional)
                </label>
                <input
                  id="start-date"
                  type="date"
                  className="input-field"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="control-group" style={{ flex: 1 }}>
                <label htmlFor="end-date" className="control-label">
                  End Date (Optional)
                </label>
                <input
                  id="end-date"
                  type="date"
                  className="input-field"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* 5. Private Notes */}
            <div className="control-group">
              <label htmlFor="trip-notes" className="control-label">
                Private Trip Notes (Optional)
              </label>
              <textarea
                id="trip-notes"
                className="input-field"
                rows={3}
                placeholder="Field access notes, permit contacts, gear reminders..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-calculate-trip"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Trip...' : 'Create Trip & Build Itinerary →'}
            </button>
          </form>
        </div>
      </Container>
    </main>
  );
}
