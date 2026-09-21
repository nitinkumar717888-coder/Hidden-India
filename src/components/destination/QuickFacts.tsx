import React from 'react';
import { Destination, DestinationVisitInfo } from '@/lib/db/schema';

interface QuickFactsProps {
  destination: Destination;
  visitInfo?: DestinationVisitInfo | null;
}

interface FactItem {
  label: string;
  value: string;
  verified?: boolean;
}

export const QuickFacts: React.FC<QuickFactsProps> = ({ destination, visitInfo }) => {
  const facts: FactItem[] = [];

  // Location string
  const loc = [destination.locality, destination.district, destination.state]
    .filter(Boolean)
    .join(', ');
  if (loc) {
    facts.push({ label: 'Location', value: loc, verified: true });
  }

  // Historical Period
  if (destination.historicalPeriod) {
    facts.push({ label: 'Historical Era', value: destination.historicalPeriod });
  }

  // Physical Difficulty
  if (destination.difficulty) {
    const diffLabel =
      destination.difficulty.charAt(0).toUpperCase() + destination.difficulty.slice(1);
    facts.push({ label: 'Terrain Difficulty', value: diffLabel });
  }

  // Estimated Duration
  if (destination.estimatedVisitDuration) {
    facts.push({ label: 'Recommended Duration', value: destination.estimatedVisitDuration });
  }

  // Best Time to Visit (from visit info)
  if (visitInfo?.bestTimeInformation) {
    facts.push({ label: 'Best Season', value: visitInfo.bestTimeInformation });
  }

  // Entry Fee (from visit info)
  if (visitInfo?.entryFee) {
    facts.push({
      label: 'Entry Fee',
      value: visitInfo.entryFee,
      verified: visitInfo.isFeeVerified,
    });
  }

  if (facts.length === 0) return null;

  return (
    <div className="quick-facts-card" aria-label="Verified Quick Facts">
      <h2 className="quick-facts-heading text-h4">Quick Facts & Verified Parameters</h2>
      <div className="quick-facts-grid">
        {facts.map((fact, index) => (
          <div key={index} className="quick-fact-item">
            <span className="fact-label">{fact.label}</span>
            <span className="fact-value">{fact.value}</span>
            {fact.verified && (
              <span className="fact-verified-dot" title="Verified against institutional records">
                &bull; Verified
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
