import React from 'react';
import Link from 'next/link';
import { Container } from './Container';
import { Navigation } from './Navigation';

export const Header: React.FC = () => {
  return (
    <header className="site-header">
      <Container size="wide">
        <div className="header-inner">
          {/* Brand Logo & Editorial Wordmark */}
          <Link href="/" className="site-brand" aria-label="Hidden India Home">
            <span className="brand-title">HIDDEN INDIA</span>
            <span className="brand-tagline">Discover the India you weren&apos;t told about</span>
          </Link>

          {/* Navigation with responsive drawer */}
          <div className="header-actions">
            <Navigation />
            <Link
              href="/search"
              className="search-icon-btn"
              aria-label="Search destinations and stories"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </Link>
          </div>
        </div>
      </Container>
    </header>
  );
};
