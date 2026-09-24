'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Container } from './Container';
import { Navigation } from './Navigation';

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const headerClass = [
    'site-header',
    isHomePage && !isScrolled ? 'site-header-transparent' : 'site-header-scrolled',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <header className={headerClass}>
      <Container size="wide">
        <div className="header-inner">
          {/* Brand Logo & Editorial Wordmark (Left) */}
          <Link href="/" className="site-brand" aria-label="Hidden India Home">
            <span className="brand-title">HIDDEN INDIA</span>
            <span className="brand-tagline">Discover the India you weren&apos;t told about</span>
          </Link>

          {/* Navigation with Center links, Right actions, and Mobile drawer */}
          <div className="header-actions">
            <Navigation isHeroMode={isHomePage && !isScrolled} />
          </div>
        </div>
      </Container>
    </header>
  );
};
