import React from 'react';

export interface LoadingStateProps {
  lines?: number;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ lines = 3, className = '' }) => {
  return (
    <div
      className={`flex flex-col gap-3 ${className}`.trim()}
      role="status"
      aria-live="polite"
      aria-label="Loading content"
    >
      <div className="skeleton" style={{ height: '2rem', width: '60%' }} />
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="skeleton"
          style={{
            height: '1rem',
            width: index === lines - 1 ? '75%' : '100%',
          }}
        />
      ))}
      <span className="sr-only" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}>
        Loading...
      </span>
    </div>
  );
};
