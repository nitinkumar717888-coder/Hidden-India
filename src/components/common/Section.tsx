import React from 'react';

interface SectionProps {
  children: React.ReactNode;
  variant?: 'default' | 'subtle' | 'dark';
  className?: string;
  id?: string;
}

export const Section: React.FC<SectionProps> = ({
  children,
  variant = 'default',
  className = '',
  id,
}) => {
  const variantClass =
    variant === 'subtle'
      ? 'section-subtle'
      : variant === 'dark'
      ? 'section-dark'
      : '';

  return (
    <section id={id} className={`section ${variantClass} ${className}`.trim()}>
      {children}
    </section>
  );
};
