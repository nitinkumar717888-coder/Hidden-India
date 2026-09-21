import React from 'react';
import Link from 'next/link';
import { Container } from './Container';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <Container size="wide">
        <div className="footer-grid">
          {/* Column 1: Hidden India Brand & Mission */}
          <div className="footer-col brand-col">
            <h3 className="footer-brand">HIDDEN INDIA</h3>
            <p className="footer-desc">
              A searchable discovery database of India&apos;s hidden, forgotten, unusual,
              historical, cultural, natural, and lesser-known places combined with a
              practical trip-planning engine.
            </p>
            <p className="footer-principle">
              Every destination is independently researched and verified against
              archaeological, academic, and government records.
            </p>
          </div>

          {/* Column 2: Explore */}
          <div className="footer-col">
            <h4 className="footer-heading">Explore</h4>
            <ul className="footer-links">
              <li>
                <Link href="/explore">All Discoveries</Link>
              </li>
              <li>
                <Link href="/map">Interactive Map</Link>
              </li>
              <li>
                <Link href="/categories/forts">Forgotten Forts</Link>
              </li>
              <li>
                <Link href="/categories/ruins">Ancient Ruins</Link>
              </li>
              <li>
                <Link href="/categories/natural">Hidden Natural Sites</Link>
              </li>
              <li>
                <Link href="/categories/unusual">Unusual & Rare Sites</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Plan & Regions */}
          <div className="footer-col">
            <h4 className="footer-heading">Plan & Regions</h4>
            <ul className="footer-links">
              <li>
                <Link href="/trips">Trip Calculator</Link>
              </li>
              <li>
                <Link href="/states/chandigarh">Chandigarh</Link>
              </li>
              <li>
                <Link href="/states/punjab">Punjab</Link>
              </li>
              <li>
                <Link href="/states/haryana">Haryana</Link>
              </li>
              <li>
                <Link href="/states/himachal-pradesh">Himachal Pradesh</Link>
              </li>
              <li>
                <Link href="/states/delhi">Delhi</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Editorial & Stories */}
          <div className="footer-col">
            <h4 className="footer-heading">Stories & Research</h4>
            <ul className="footer-links">
              <li>
                <Link href="/blog">Editorial Dispatches</Link>
              </li>
              <li>
                <Link href="/stories">Local Traditions & Lore</Link>
              </li>
              <li>
                <Link href="/about">Editorial Standards</Link>
              </li>
              <li>
                <Link href="/about#sources">Sources & Verification</Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Legal & Contact */}
          <div className="footer-col">
            <h4 className="footer-heading">Trust & Legal</h4>
            <ul className="footer-links">
              <li>
                <Link href="/privacy">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms">Terms of Service</Link>
              </li>
              <li>
                <Link href="/contact">Contact & Submissions</Link>
              </li>
              <li>
                <Link href="/contact#corrections">Submit a Correction</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            &copy; {currentYear} Hidden India. All rights reserved. Travel facts verified
            independently.
          </p>
          <p className="footer-legal-note">
            Historical claims strictly distinguish documented evidence from local tradition.
            Calculated route times, fuel expenses, and fees are estimates. Always verify local
            permits and conditions before travelling.
          </p>
        </div>
      </Container>
    </footer>
  );
};
