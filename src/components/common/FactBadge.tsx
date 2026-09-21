import React from 'react';
import { EvidenceClassificationType } from '@/lib/types/enums';

export interface FactBadgeProps {
  label: string;
  variant?: 'default' | 'evidence';
  evidenceType?: EvidenceClassificationType;
  icon?: React.ReactNode;
  className?: string;
}

export const FactBadge: React.FC<FactBadgeProps> = ({
  label,
  variant = 'default',
  evidenceType,
  icon,
  className = '',
}) => {
  let badgeClass = 'badge badge-default';
  let ariaLabel = label;

  if (variant === 'evidence' && evidenceType) {
    switch (evidenceType) {
      case 'DOCUMENTED':
        badgeClass = 'badge badge-documented';
        ariaLabel = `Historically Documented Evidence: ${label}`;
        break;
      case 'LOCAL_TRADITION':
        badgeClass = 'badge badge-local-tradition';
        ariaLabel = `Local Oral Tradition / Folklore: ${label}`;
        break;
      case 'DISPUTED':
        badgeClass = 'badge badge-disputed';
        ariaLabel = `Disputed Historical Account: ${label}`;
        break;
      case 'UNKNOWN':
        badgeClass = 'badge badge-unknown';
        ariaLabel = `Historical Status Unknown: ${label}`;
        break;
    }
  }

  return (
    <span className={`${badgeClass} ${className}`.trim()} aria-label={ariaLabel}>
      {icon}
      <span>{label}</span>
    </span>
  );
};
