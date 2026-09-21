import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  size?: 'normal' | 'narrow' | 'wide';
  className?: string;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  size = 'normal',
  className = '',
}) => {
  const sizeClass =
    size === 'narrow'
      ? 'container-narrow'
      : size === 'wide'
      ? 'container-wide'
      : 'container';

  return <div className={`${sizeClass} ${className}`.trim()}>{children}</div>;
};
