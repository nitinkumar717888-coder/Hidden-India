import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/common/Container';

export const KnownUnknownSection: React.FC = () => {
  return (
    <section id="look-closer" className="known-unknown-section" aria-label="Known to Unknown Discovery Path">
      <Container size="normal">
        {/* Section Header */}
        <div className="known-unknown-header">
          <span className="text-eyebrow">The Discovery Triad</span>
          <h2 className="text-h1">You know this place. Now look closer.</h2>
          <p className="text-lead" style={{ marginTop: '0.75rem' }}>
            Famous travel spots often conceal forgotten archaeological layers within walking distance.
            Here is how a familiar weekend trip unfolds into ancient India.
          </p>
        </div>

        {/* 3-Step Triad */}
        <div className="known-unknown-steps">
          {/* Step 1: The Known Anchor */}
          <article className="known-card" aria-label="Step 1: Yadavindra Gardens">
            <div className="known-card-tier tier-known">
              <span>01 • The Familiar Anchor</span>
              <span>Popular</span>
            </div>
            <div className="known-card-img-wrap">
              <Image
                src="https://images.unsplash.com/photo-1592635196078-9fdc757f27f4?auto=format&fit=crop&w=800&q=80"
                alt="Yadavindra Mughal terraced gardens in Pinjore"
                fill
                sizes="(max-width: 768px) 100vw, 320px"
                loading="lazy"
              />
            </div>
            <div className="known-card-body">
              <span className="text-caption" style={{ color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                Panchkula, Haryana
              </span>
              <h3 className="text-h4" style={{ marginBottom: '0.5rem' }}>
                Yadavindra (Pinjore) Gardens
              </h3>
              <p className="text-small" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
                The celebrated 17th-century Mughal terraced garden designed by Fidai Khan under Aurangzeb.
                Visited by hundreds of thousands of tourists annually along the highway to Shimla.
              </p>
              <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                <span className="text-caption" style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                  Starting point for most travelers
                </span>
              </div>
            </div>
          </article>

          {/* Divider Arrow 1 */}
          <div className="step-divider-arrow" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </div>

          {/* Step 2: The Look Closer */}
          <article className="known-card" aria-label="Step 2: Bhima Devi Temple">
            <div className="known-card-tier tier-closer">
              <span>02 • Look Closer (300m away)</span>
              <span>8th–12th CE</span>
            </div>
            <div className="known-card-img-wrap">
              <Image
                src="https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80"
                alt="Ancient sculptural stone ruins of Bhima Devi temple complex"
                fill
                sizes="(max-width: 768px) 100vw, 320px"
                loading="lazy"
              />
            </div>
            <div className="known-card-body">
              <span className="text-caption" style={{ color: 'var(--color-ochre)', fontWeight: 600, marginBottom: '0.25rem' }}>
                Panchkula, Haryana • Directly Adjacent
              </span>
              <h3 className="text-h4" style={{ marginBottom: '0.5rem' }}>
                <Link href="/destinations/bhima-devi-temple-pinjore" className="hover-link">
                  Bhima Devi Temple Complex
                </Link>
              </h3>
              <p className="text-small" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
                Just behind the Mughal gardens lie the evocative carved sandstone foundations of an
                8th–12th century temple sanctuary — known by archaeologists as the <em>Khajuraho of Northern India</em>.
              </p>
              <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                <Link
                  href="/destinations/bhima-devi-temple-pinjore"
                  className="text-small"
                  style={{ color: 'var(--color-terracotta)', fontWeight: 600 }}
                >
                  Uncover Bhima Devi &rarr;
                </Link>
              </div>
            </div>
          </article>

          {/* Divider Arrow 2 */}
          <div className="step-divider-arrow" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </div>

          {/* Step 3: The Hidden Reality */}
          <article className="known-card" aria-label="Step 3: Bassi Baoli">
            <div className="known-card-tier tier-hidden">
              <span>03 • Hidden Depths (1.5 km trail)</span>
              <span>16th Century</span>
            </div>
            <div className="known-card-img-wrap">
              <Image
                src="https://images.unsplash.com/photo-1592635196078-9fdc757f27f4?auto=format&fit=crop&w=800&q=80"
                alt="Subterranean limestone stepwell and aquifer spring in foothill ravine"
                fill
                sizes="(max-width: 768px) 100vw, 320px"
                loading="lazy"
              />
            </div>
            <div className="known-card-body">
              <span className="text-caption" style={{ color: 'var(--color-terracotta)', fontWeight: 600, marginBottom: '0.25rem' }}>
                Shiwalik Foothills, Pinjore
              </span>
              <h3 className="text-h4" style={{ marginBottom: '0.5rem' }}>
                <Link href="/destinations/bassi-baoli-pinjore" className="hover-link">
                  Bassi Baoli Subterranean Spring
                </Link>
              </h3>
              <p className="text-small" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
                Tucked into a quiet mountain ravine lies a vaulted 16th-century limestone stepwell fed by
                pristine subterranean Shiwalik springs, preserved far beyond highway tourist itineraries.
              </p>
              <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                <Link
                  href="/destinations/bassi-baoli-pinjore"
                  className="text-small"
                  style={{ color: 'var(--color-terracotta)', fontWeight: 600 }}
                >
                  Uncover Bassi Baoli &rarr;
                </Link>
              </div>
            </div>
          </article>
        </div>
      </Container>
    </section>
  );
};
