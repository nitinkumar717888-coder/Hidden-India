'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export interface NavItem {
  label: string;
  href: string;
  isAction?: boolean;
}

export interface NavigationProps {
  isHeroMode?: boolean;
}

const CENTER_NAV_ITEMS: NavItem[] = [
  { label: 'Explore', href: '/search' },
  { label: 'Destinations', href: '/destinations' },
  { label: 'Collections', href: '/collections' },
  { label: 'Map', href: '/map' },
  { label: 'Stories', href: '/#stories' },
];

export const Navigation: React.FC<NavigationProps> = ({ isHeroMode = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  // Dynamic Navigation Items based on auth state
  const authNavItems: NavItem[] = isAuthenticated
    ? [
        { label: 'Saved', href: '/saved' },
        { label: 'Account', href: '/account' },
      ]
    : [
        { label: 'Sign In', href: '/login' },
      ];

  const allMobileItems: NavItem[] = [
    ...CENTER_NAV_ITEMS,
    { label: 'Plan a Trip', href: '/trips', isAction: true },
    ...authNavItems,
  ];

  const navClass = ['site-nav', isHeroMode ? 'nav-hero-mode' : ''].filter(Boolean).join(' ');

  return (
    <nav className={navClass} aria-label="Main Navigation">
      {/* Desktop Center Navigation Links */}
      <div className="nav-desktop">
        <ul className="nav-links">
          {CENTER_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`nav-link ${isActive ? 'nav-link-active' : ''}`.trim()}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Desktop Right Action Area */}
      <div className="nav-desktop-actions">
        <Link href="/trips" className="hi-btn hi-btn-primary hi-btn-sm nav-plan-btn">
          Plan a Trip
        </Link>
        <Link
          href="/search"
          className="search-icon-btn"
          aria-label="Search destinations and stories"
        >
          <svg
            width="18"
            height="18"
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
        {authNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="nav-link nav-auth-link"
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* Mobile Menu Toggle Button */}
      <button
        type="button"
        className="nav-mobile-toggle"
        onClick={toggleMenu}
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
        aria-label="Toggle navigation menu"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {isOpen ? (
            <>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </>
          ) : (
            <>
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </>
          )}
        </svg>
      </button>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div id="mobile-menu" className="nav-mobile-menu">
          <ul className="mobile-nav-links">
            {allMobileItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={closeMenu}
                  className={`mobile-nav-link ${
                    item.isAction ? 'mobile-nav-action' : ''
                  } ${pathname === item.href ? 'mobile-nav-link-active' : ''}`.trim()}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/search" onClick={closeMenu} className="mobile-nav-link">
                Search
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};
