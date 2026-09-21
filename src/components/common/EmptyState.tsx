import React from 'react';

export interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  icon,
  className = '',
}) => {
  return (
    <div className={`empty-state ${className}`.trim()} role="region" aria-label={title}>
      {icon && <div style={{ marginBottom: '1rem', color: 'var(--color-text-muted)' }}>{icon}</div>}
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {action && <div style={{ marginTop: '1.25rem' }}>{action}</div>}
    </div>
  );
};
