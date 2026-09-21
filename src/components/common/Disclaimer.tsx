import React from 'react';

export interface DisclaimerProps {
  children?: React.ReactNode;
  className?: string;
}

export const Disclaimer: React.FC<DisclaimerProps> = ({
  children = 'Information may change. Verify access, opening hours, road conditions, and local permits before travelling.',
  className = '',
}) => {
  return (
    <aside className={`disclaimer-box ${className}`.trim()} role="note" aria-label="Travel Disclaimer">
      <svg
        className="disclaimer-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <div className="disclaimer-text">{children}</div>
    </aside>
  );
};
