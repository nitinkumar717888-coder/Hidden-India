'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { updateCollectionDestinationsAction } from '@/app/admin/collections/actions';

interface DestinationOption {
  id: string;
  name: string;
  slug: string;
  state: string;
}

interface WaypointItem {
  destinationId: string;
  destinationName: string;
  destinationSlug: string;
  state?: string;
  editorialNote: string;
}

interface CollectionWaypointsEditorProps {
  collectionId: string;
  initialWaypoints: {
    sequence: number;
    destinationId: string;
    destinationName: string;
    destinationSlug: string;
    state?: string;
    editorialNote: string | null;
  }[];
  allDestinations: DestinationOption[];
}

export default function CollectionWaypointsEditor({
  collectionId,
  initialWaypoints,
  allDestinations,
}: CollectionWaypointsEditorProps) {
  const [waypoints, setWaypoints] = useState<WaypointItem[]>(
    initialWaypoints.map((w) => ({
      destinationId: w.destinationId,
      destinationName: w.destinationName,
      destinationSlug: w.destinationSlug,
      state: w.state,
      editorialNote: w.editorialNote || '',
    }))
  );
  const [selectedDestId, setSelectedDestId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Available destinations (excluding already added)
  const existingDestIds = new Set(waypoints.map((w) => w.destinationId));
  const availableDestinations = allDestinations.filter((d) => !existingDestIds.has(d.id));

  const handleAddDestination = () => {
    if (!selectedDestId) return;
    const dest = allDestinations.find((d) => d.id === selectedDestId);
    if (!dest) return;

    setWaypoints([
      ...waypoints,
      {
        destinationId: dest.id,
        destinationName: dest.name,
        destinationSlug: dest.slug,
        state: dest.state,
        editorialNote: '',
      },
    ]);
    setSelectedDestId('');
  };

  const handleRemove = (index: number) => {
    const updated = [...waypoints];
    updated.splice(index, 1);
    setWaypoints(updated);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...waypoints];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    setWaypoints(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index === waypoints.length - 1) return;
    const updated = [...waypoints];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    setWaypoints(updated);
  };

  const handleNoteChange = (index: number, note: string) => {
    const updated = [...waypoints];
    updated[index].editorialNote = note;
    setWaypoints(updated);
  };

  const handleSaveWaypoints = async () => {
    setIsSaving(true);
    setMessage(null);

    const payload = waypoints.map((w, idx) => ({
      destinationId: w.destinationId,
      sequence: idx + 1,
      editorialNote: w.editorialNote.trim() || null,
    }));

    const result = await updateCollectionDestinationsAction(collectionId, payload);

    if (result.success) {
      setMessage({ type: 'success', text: 'Trail waypoints saved successfully!' });
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to save waypoints.' });
    }
    setIsSaving(false);
  };

  return (
    <div className="card" style={{ padding: 'var(--space-6)', marginTop: 'var(--space-6)' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-4)',
        }}
      >
        <div>
          <h2 className="text-h3">Ordered Trail Stops ({waypoints.length})</h2>
          <p className="text-small" style={{ color: 'var(--color-text-muted)' }}>
            Organize destinations in sequential editorial order. Add unique contextual notes per stop.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSaveWaypoints}
          disabled={isSaving}
          className="btn btn-primary"
        >
          {isSaving ? 'Saving Stops...' : 'Save Trail Waypoints'}
        </button>
      </div>

      {message && (
        <div
          className={`banner ${message.type === 'success' ? 'banner-success' : 'banner-danger'}`}
          style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)' }}
        >
          {message.text}
        </div>
      )}

      {/* Add Destination Form */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-3)',
          alignItems: 'center',
          padding: 'var(--space-4)',
          backgroundColor: 'var(--color-bg-subtle)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--space-4)',
        }}
      >
        <select
          className="form-input"
          value={selectedDestId}
          onChange={(e) => setSelectedDestId(e.target.value)}
          style={{ flex: 1 }}
        >
          <option value="">-- Select a published destination to add --</option>
          {availableDestinations.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} ({d.state})
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleAddDestination}
          disabled={!selectedDestId}
          className="btn btn-secondary"
        >
          + Add to Trail
        </button>
      </div>

      {/* Waypoints List */}
      {waypoints.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <p className="text-muted">No stops added yet. Select a destination above to begin the trail.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {waypoints.map((wp, idx) => (
            <div
              key={wp.destinationId}
              style={{
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-4)',
                backgroundColor: 'var(--color-surface)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 'var(--space-2)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-primary)',
                      color: '#fff',
                      fontWeight: 'bold',
                      fontSize: 'var(--font-size-small)',
                    }}
                  >
                    {idx + 1}
                  </span>
                  <div>
                    <strong>{wp.destinationName}</strong>
                    <span
                      className="text-caption"
                      style={{ marginLeft: 'var(--space-2)', color: 'var(--color-text-muted)' }}
                    >
                      {wp.state ? `(${wp.state})` : ''} • /{wp.destinationSlug}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                  <button
                    type="button"
                    onClick={() => handleMoveUp(idx)}
                    disabled={idx === 0}
                    className="btn btn-small btn-secondary"
                    title="Move earlier in sequence"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveDown(idx)}
                    disabled={idx === waypoints.length - 1}
                    className="btn btn-small btn-secondary"
                    title="Move later in sequence"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    className="btn btn-small btn-ghost"
                    style={{ color: 'var(--color-error)' }}
                    title="Remove destination"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div>
                <label
                  className="form-label text-caption"
                  htmlFor={`note-${wp.destinationId}`}
                  style={{ marginBottom: 'var(--space-1)', display: 'block' }}
                >
                  Editorial Context Note (Why this place is included in this trail)
                </label>
                <textarea
                  id={`note-${wp.destinationId}`}
                  rows={2}
                  className="form-input"
                  placeholder="e.g. Examine the soaring battlements and vaulted travelers' chambers of this 17th-century Grand Trunk Road fortified caravanserai."
                  value={wp.editorialNote}
                  onChange={(e) => handleNoteChange(idx, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
