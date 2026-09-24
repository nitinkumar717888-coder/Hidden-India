'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/common/Container';

export const LookCloserSection: React.FC = () => {
  return (
    <section id="look-closer-reveal" className="look-closer-section" aria-label="Cinematic Destination Reveal">
      <Container size="normal">
        {/* Editorial Heading */}
        <div className="look-closer-header">
          <span className="text-eyebrow" style={{ color: 'var(--color-ochre)' }}>
            Focal Investigation
          </span>
          <h2 className="text-h1 look-closer-title">Look closer.</h2>
          <p className="look-closer-subtitle">
            Stand before the massive brick ramparts that outlived empires.
          </p>
        </div>

        {/* Expansive Screen-Dominating Reveal Card */}
        <article className="look-closer-stage" aria-label="Qila Mubarak Bathinda">
          <div className="look-closer-img-box">
            <Image
              src="https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1600&q=85"
              alt="Monumental high brick walls and bastions of Qila Mubarak in Bathinda"
              fill
              sizes="(max-width: 768px) 100vw, 1200px"
              className="look-closer-img"
              loading="lazy"
            />
            <div className="look-closer-scrim" />

            {/* Overlaid Minimal Editorial Info */}
            <div className="look-closer-content">
              <div className="look-closer-meta">
                <span className="look-closer-coords">30.2110° N • 74.9455° E</span>
                <span className="look-closer-loc">BATHINDA, PUNJAB</span>
              </div>

              <h3 className="look-closer-name">QILA MUBARAK</h3>

              <p className="look-closer-editorial-sentence">
                A fortress whose walls carry centuries of northern India&apos;s history.
              </p>

              <div>
                <Link
                  href="/destinations/qila-mubarak-bathinda"
                  className="btn btn-hero-primary"
                  aria-label="Explore the history and architecture of Qila Mubarak"
                >
                  EXPLORE THE FORT &rarr;
                </Link>
              </div>
            </div>
          </div>
        </article>
      </Container>
    </section>
  );
};
