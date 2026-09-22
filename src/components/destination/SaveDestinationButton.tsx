'use client';

import React, { useState, useEffect } from 'react';
import { trackEvent } from '@/lib/analytics/telemetry';

interface SaveDestinationButtonProps {
  destinationId: string;
  destinationName: string;
}

export const SaveDestinationButton: React.FC<SaveDestinationButtonProps> = ({
  destinationId,
  destinationName,
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    // Check initial saved status from server or local storage
    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/saved?destinationId=${destinationId}`);
        const data = await res.json();
        if (data.isSaved) {
          setIsSaved(true);
          return;
        }
      } catch {
        // Fallback to local storage
      }

      // Check anonymous local storage
      try {
        const localSaved = JSON.parse(
          localStorage.getItem('hidden_india_saved_destinations') || '[]'
        );
        if (localSaved.includes(destinationId)) {
          setIsSaved(true);
        }
      } catch {
        // Ignore local storage errors
      }
    };

    checkStatus();
  }, [destinationId]);

  const handleToggleSave = async () => {
    setIsLoading(true);
    setNotice(null);

    try {
      const res = await fetch('/api/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinationId,
          action: isSaved ? 'unsave' : 'save',
        }),
      });

      if (res.status === 401) {
        // Anonymous visitor: handle locally with explicit disclosure
        const localSaved: string[] = JSON.parse(
          localStorage.getItem('hidden_india_saved_destinations') || '[]'
        );

        if (isSaved) {
          const updated = localSaved.filter((id) => id !== destinationId);
          localStorage.setItem('hidden_india_saved_destinations', JSON.stringify(updated));
          setIsSaved(false);
          setNotice('Removed from local saved places.');
        } else {
          localSaved.push(destinationId);
          localStorage.setItem('hidden_india_saved_destinations', JSON.stringify(localSaved));
          setIsSaved(true);
          trackEvent({ type: 'destination_saved', destinationSlug: destinationName });
          setNotice('Saved locally on this device. Sign in to sync across devices.');
        }
        setIsLoading(false);
        return;
      }

      const data = await res.json();
      if (data.success) {
        setIsSaved(data.isSaved);
        if (data.isSaved) {
          trackEvent({ type: 'destination_saved', destinationSlug: destinationName });
        }
        setNotice(data.isSaved ? 'Saved to My Hidden India!' : 'Removed from saved discoveries.');
      }
    } catch {
      setNotice('Could not update saved status. Please try again.');
    } finally {
      setIsLoading(false);
      setTimeout(() => setNotice(null), 4000);
    }
  };

  return (
    <div className="save-button-container">
      <button
        type="button"
        className={`btn btn-sm ${isSaved ? 'btn-saved-active' : 'btn-secondary'}`}
        onClick={handleToggleSave}
        disabled={isLoading}
        aria-pressed={isSaved}
        title={isSaved ? 'Remove from My Hidden India' : 'Save to My Hidden India'}
      >
        <span className="bookmark-icon">{isSaved ? '★' : '☆'}</span>
        <span>{isSaved ? 'Saved' : 'Save to My Hidden India'}</span>
      </button>

      {notice && (
        <span className="save-feedback-notice" role="status">
          {notice}
        </span>
      )}
    </div>
  );
};
