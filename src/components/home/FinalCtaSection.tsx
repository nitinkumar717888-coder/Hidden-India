import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/common/Container';

export const FinalCtaSection: React.FC = () => {
  return (
    <section className="final-cta-section" aria-label="Final Invitation to Explore">
      {/* Background Topographic Image with Archival Scrim */}
      <div className="final-cta-bg" aria-hidden="true">
        <Image
          src="https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1800&q=80"
          alt="Atmospheric mountain terrain and ancient rock shrines"
          fill
          sizes="100vw"
          className="final-cta-bg-img"
          loading="lazy"
        />
        <div className="final-cta-scrim" />
      </div>

      <Container size="narrow" className="final-cta-content">
        <span className="text-eyebrow" style={{ color: 'var(--color-ochre)', letterSpacing: '0.12em' }}>
          Begin the Expedition
        </span>

        <h2 className="final-cta-title">
          The map is bigger than you think.
        </h2>

        <p className="final-cta-sub">
          Start somewhere unexpected. Choose a forgotten fortress, step into ancient ruins,
          or follow an uncharted regional trail across Northern India.
        </p>

        <div className="final-cta-actions">
          <Link href="/destinations" className="btn btn-hero-primary">
            Explore Hidden India &rarr;
          </Link>
          <Link href="/map" className="btn btn-hero-secondary">
            Open the Map
          </Link>
        </div>

        <div className="final-cta-coordinates" aria-hidden="true">
          <span>Northern Frontier • Punjab • Haryana • Himachal Pradesh • Chandigarh • Delhi</span>
        </div>
      </Container>
    </section>
  );
};
