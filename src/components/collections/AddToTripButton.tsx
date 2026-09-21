'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface DestinationOption {
  id: string;
  name: string;
  sequence: number;
}

interface AddToTripButtonProps {
  collectionTitle: string;
  collectionSlug: string;
  destinations: DestinationOption[];
}

interface UserTripOption {
  trip: {
    id: string;
    name: string;
  };
  destinationCount: number;
}

export function AddToTripButton({
  collectionTitle,
  collectionSlug,
  destinations,
}: AddToTripButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userTrips, setUserTrips] = useState<UserTripOption[]>([]);
  const [actionType, setActionType] = useState<'existing' | 'new'>('new');
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [newTripName, setNewTripName] = useState<string>(collectionTitle);
  const [selectedDestIds, setSelectedDestIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState<{
    type: 'success' | 'error';
    text: string;
    tripId?: string;
  } | null>(null);

  // Initialize selected destinations (first 10 max)
  useEffect(() => {
    setSelectedDestIds(destinations.slice(0, 10).map((d) => d.id));
  }, [destinations]);

  const handleOpenModal = async () => {
    setIsOpen(true);
    setIsLoadingAuth(true);
    setResultMessage(null);

    try {
      // Check auth status
      const authRes = await fetch('/api/auth/profile');
      if (authRes.ok) {
        setIsAuthenticated(true);
        // Load user's trips
        const tripsRes = await fetch('/api/trips');
        if (tripsRes.ok) {
          const tripsData = await tripsRes.json();
          setUserTrips(tripsData || []);
          if (tripsData && tripsData.length > 0) {
            setSelectedTripId(tripsData[0].trip.id);
            setActionType('existing');
          } else {
            setActionType('new');
          }
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleToggleDestination = (id: string) => {
    if (selectedDestIds.includes(id)) {
      setSelectedDestIds(selectedDestIds.filter((dId) => dId !== id));
    } else {
      if (selectedDestIds.length >= 10) {
        alert('A trip can contain a maximum of 10 destinations.');
        return;
      }
      setSelectedDestIds([...selectedDestIds, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDestIds.length === 0) {
      setResultMessage({ type: 'error', text: 'Please select at least one destination to add.' });
      return;
    }

    setIsSubmitting(true);
    setResultMessage(null);

    try {
      if (actionType === 'new') {
        const res = await fetch('/api/trips/from-collection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tripName: newTripName.trim() || collectionTitle,
            destinationIds: selectedDestIds,
          }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setResultMessage({
            type: 'success',
            text: `Created new trip "${data.trip.name}" with ${data.destinationCount} stops!`,
            tripId: data.trip.id,
          });
        } else {
          setResultMessage({ type: 'error', text: data.error || 'Failed to create trip.' });
        }
      } else {
        if (!selectedTripId) {
          setResultMessage({ type: 'error', text: 'Please select a trip.' });
          setIsSubmitting(false);
          return;
        }

        const res = await fetch(`/api/trips/${selectedTripId}/add-collection`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            destinationIds: selectedDestIds,
          }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setResultMessage({
            type: 'success',
            text: data.message,
            tripId: selectedTripId,
          });
        } else {
          setResultMessage({ type: 'error', text: data.error || 'Failed to add destinations.' });
        }
      }
    } catch {
      setResultMessage({ type: 'error', text: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpenModal}
        className="btn btn-primary"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          fontSize: 'var(--font-size-body)',
          padding: 'var(--space-3) var(--space-6)',
        }}
      >
        <span>🗺️</span>
        <span>Add to My Trip</span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 'var(--space-4)',
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            className="card"
            style={{
              maxWidth: '560px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 'var(--space-6)',
              position: 'relative',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close modal"
              style={{
                position: 'absolute',
                top: 'var(--space-4)',
                right: 'var(--space-4)',
                background: 'transparent',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
              }}
            >
              ✕
            </button>

            {isLoadingAuth ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                <p className="text-muted">Loading trip options...</p>
              </div>
            ) : isAuthenticated === false ? (
              // Anonymous User Prompt
              <div>
                <h2 id="modal-title" className="text-h3" style={{ marginBottom: 'var(--space-2)' }}>
                  Save Trail to My Trips
                </h2>
                <p className="text-muted" style={{ marginBottom: 'var(--space-6)', lineHeight: 1.5 }}>
                  Sign in or create a free account to customize this trail, add personal waypoints,
                  calculate driving distance and fuel costs, and navigate on your phone.
                </p>

                <div
                  style={{
                    backgroundColor: 'var(--color-bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-4)',
                    marginBottom: 'var(--space-6)',
                  }}
                >
                  <strong className="text-small" style={{ display: 'block', marginBottom: 'var(--space-1)' }}>
                    Trail to Save:
                  </strong>
                  <p className="text-body" style={{ fontWeight: 600 }}>
                    {collectionTitle} ({destinations.length} stops)
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  <Link
                    href={`/login?redirect=/collections/${collectionSlug}`}
                    className="btn btn-primary"
                    style={{ textAlign: 'center' }}
                  >
                    Log In or Sign Up to Continue →
                  </Link>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="btn btn-secondary"
                  >
                    Continue Browsing
                  </button>
                </div>
              </div>
            ) : (
              // Authenticated User Add to Trip Form
              <div>
                <h2 id="modal-title" className="text-h3" style={{ marginBottom: 'var(--space-1)' }}>
                  Add Trail to My Trip
                </h2>
                <p className="text-small" style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
                  {collectionTitle}
                </p>

                {resultMessage ? (
                  <div style={{ textAlign: 'center', padding: 'var(--space-4) 0' }}>
                    <div
                      className={`banner ${
                        resultMessage.type === 'success' ? 'banner-success' : 'banner-danger'
                      }`}
                      style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-4)' }}
                    >
                      {resultMessage.text}
                    </div>

                    {resultMessage.tripId && (
                      <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
                        <Link href={`/trips/${resultMessage.tripId}`} className="btn btn-primary">
                          Open Trip & Calculate Costs →
                        </Link>
                        <button
                          type="button"
                          onClick={() => setIsOpen(false)}
                          className="btn btn-secondary"
                        >
                          Close
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    {/* Action Choice: Existing Trip vs New Trip */}
                    <div
                      style={{
                        display: 'flex',
                        gap: 'var(--space-2)',
                        marginBottom: 'var(--space-4)',
                        backgroundColor: 'var(--color-bg-subtle)',
                        padding: 'var(--space-1)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      {userTrips.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setActionType('existing')}
                          className={`btn btn-small ${
                            actionType === 'existing' ? 'btn-primary' : 'btn-ghost'
                          }`}
                          style={{ flex: 1 }}
                        >
                          Add to Existing Trip
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setActionType('new')}
                        className={`btn btn-small ${
                          actionType === 'new' ? 'btn-primary' : 'btn-ghost'
                        }`}
                        style={{ flex: 1 }}
                      >
                        Create as New Trip
                      </button>
                    </div>

                    {actionType === 'existing' ? (
                      <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                        <label className="form-label" htmlFor="tripSelect">
                          Select Existing Trip
                        </label>
                        <select
                          id="tripSelect"
                          className="form-input"
                          value={selectedTripId}
                          onChange={(e) => setSelectedTripId(e.target.value)}
                          required
                        >
                          {userTrips.map(({ trip, destinationCount }) => (
                            <option key={trip.id} value={trip.id}>
                              {trip.name} ({destinationCount}/10 stops)
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                        <label className="form-label" htmlFor="newTripName">
                          New Trip Name
                        </label>
                        <input
                          id="newTripName"
                          type="text"
                          className="form-input"
                          value={newTripName}
                          onChange={(e) => setNewTripName(e.target.value)}
                          required
                        />
                      </div>
                    )}

                    {/* Destination Selection Checklist */}
                    <div style={{ marginBottom: 'var(--space-4)' }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 'var(--space-2)',
                        }}
                      >
                        <label className="form-label text-small" style={{ marginBottom: 0 }}>
                          Select Destinations to Include:
                        </label>
                        <span
                          className="text-caption"
                          style={{
                            fontWeight: 600,
                            color:
                              selectedDestIds.length === 10
                                ? 'var(--color-primary)'
                                : 'var(--color-text-muted)',
                          }}
                        >
                          {selectedDestIds.length}/10 selected
                        </span>
                      </div>

                      {destinations.length > 10 && (
                        <p
                          className="text-caption"
                          style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-2)' }}
                        >
                          * This collection has {destinations.length} stops. You can select up to 10 for a single trip.
                        </p>
                      )}

                      <div
                        style={{
                          maxHeight: '180px',
                          overflowY: 'auto',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-md)',
                          padding: 'var(--space-2)',
                        }}
                      >
                        {destinations.map((d) => {
                          const isChecked = selectedDestIds.includes(d.id);
                          return (
                            <label
                              key={d.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-2)',
                                padding: 'var(--space-2)',
                                cursor: 'pointer',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: isChecked
                                  ? 'var(--color-bg-subtle)'
                                  : 'transparent',
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleDestination(d.id)}
                              />
                              <span className="text-small" style={{ fontWeight: 500 }}>
                                Stop {d.sequence}: {d.name}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
                      <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="btn btn-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting || selectedDestIds.length === 0}
                        className="btn btn-primary"
                      >
                        {isSubmitting
                          ? 'Adding Stops...'
                          : `Add ${selectedDestIds.length} Stop${selectedDestIds.length > 1 ? 's' : ''} →`}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
