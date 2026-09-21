import React from 'react';
import { DestinationVisitInfo } from '@/lib/db/schema';
import { Disclaimer } from '../common/Disclaimer';

interface VisitInfoCardProps {
  visitInfo: DestinationVisitInfo | null;
}

export const VisitInfoCard: React.FC<VisitInfoCardProps> = ({ visitInfo }) => {
  if (!visitInfo) return null;

  const verifiedDateFormatted = visitInfo.verifiedAt
    ? new Date(visitInfo.verifiedAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <section className="visit-info-card" id="visit-guidelines" aria-label="Visit & Access Information">
      <div className="visit-info-header">
        <div>
          <h2 className="text-h3">Visit & Access Guidelines</h2>
          <p className="text-small" style={{ color: 'var(--color-text-muted)' }}>
            Practical field parameters for travelers and drivers.
          </p>
        </div>

        {verifiedDateFormatted && (
          <div className="verification-timestamp-badge">
            <span className="timestamp-dot" />
            <span>Last verified: {verifiedDateFormatted}</span>
          </div>
        )}
      </div>

      <div className="visit-info-grid">
        {/* Entry Fee */}
        {visitInfo.entryFee && (
          <div className="visit-param-block">
            <span className="param-label">Entry Fee</span>
            <span className="param-value">{visitInfo.entryFee}</span>
            <span className="param-note">
              {visitInfo.isFeeVerified ? 'Verified with official tariff' : 'Unverified / confirm on site'}
            </span>
          </div>
        )}

        {/* Opening Hours */}
        {visitInfo.openingInformation && (
          <div className="visit-param-block">
            <span className="param-label">Opening Timings</span>
            <span className="param-value">{visitInfo.openingInformation}</span>
          </div>
        )}

        {/* Road & Access */}
        {visitInfo.accessInformation && (
          <div className="visit-param-block">
            <span className="param-label">Road & Approach</span>
            <span className="param-value">{visitInfo.accessInformation}</span>
          </div>
        )}

        {/* Parking */}
        {visitInfo.parkingInformation && (
          <div className="visit-param-block">
            <span className="param-label">Parking Facilities</span>
            <span className="param-value">{visitInfo.parkingInformation}</span>
          </div>
        )}

        {/* Best Season */}
        {visitInfo.bestTimeInformation && (
          <div className="visit-param-block">
            <span className="param-label">Best Season to Visit</span>
            <span className="param-value">{visitInfo.bestTimeInformation}</span>
          </div>
        )}

        {/* Contact info */}
        {visitInfo.contactInformation && (
          <div className="visit-param-block">
            <span className="param-label">Local Authority Contact</span>
            <span className="param-value">{visitInfo.contactInformation}</span>
          </div>
        )}
      </div>

      <Disclaimer>
        Entry tariffs, opening hours, and road permits are subject to local district administration
        and forest department revisions. Always confirm on-ground conditions before traveling.
      </Disclaimer>
    </section>
  );
};
