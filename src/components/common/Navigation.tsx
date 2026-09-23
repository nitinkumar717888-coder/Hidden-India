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

const BASE_NAV_ITEMS: NavItem[] = [
  { label: 'Explore', href: '/search' },
  { label: 'Destinations', href: '/destinations' },
  { label: 'Collections', href: '/collections' },
  { label: 'Map', href: '/map' },
  { label: 'Plan', href: '/trips', isAction: true },
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

  // Dynamic Navigation Items based on auth state (Section 23)
  const navItems: NavItem[] = isAuthenticated
    ? [
        ...BASE_NAV_ITEMS,
        { label: 'Saved', href: '/saved' },
        { label: 'Account', href: '/account' },
      ]
    : [
        ...BASE_NAV_ITEMS,
        { label: 'Sign In', href: '/login' },
      ];

  const navClass = ['site-nav', isHeroMode ? 'nav-hero-mode' : ''].filter(Boolean).join(' ');

  return (
    <nav className={navClass} aria-label="Main Navigation">
      {/* Desktop Navigation Links */}
      <div className="nav-desktop">
        <ul className="nav-links">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            if (item.isAction) {
              return (
                <li key={item.href}>
                  <Link href={item.href} className="btn btn-primary btn-sm">
                    {item.label}
                  </Link>
                </li>
              );
            }
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
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={closeMenu}
                  className={`mobile-nav-link ${
                    pathname === item.href ? 'mobile-nav-link-active' : ''
                  }`.trim()}
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
