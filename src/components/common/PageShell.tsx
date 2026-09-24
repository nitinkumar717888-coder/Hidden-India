import React from 'react';

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'main' | 'section';
}

export const PageShell: React.FC<PageShellProps> = ({
  children,
  className = '',
  as: Component = 'div',
}) => {
  return (
    <div className="hi-page-outer">
      <Component className={`hi-page-shell ${className}`.trim()}>
        {children}
      </Component>
    </div>
  );
};
