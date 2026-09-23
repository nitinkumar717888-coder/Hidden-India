import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/common/Container';
import { FactBadge } from '@/components/common/FactBadge';

export const DiscoveryStorySection: React.FC = () => {
  return (
    <section id="storytelling" className="story-section" aria-label="Featured Travel Story">
      <Container size="normal">
        {/* Editorial Narrative Bridge */}
        <div className="story-header">
          <span className="story-number">DISCOVERY 01</span>
          <p className="story-prelude">You&apos;ve seen India. But have you really looked?</p>
          <h2 className="story-title">India&apos;s Oldest Surviving Fortress Rampart</h2>
          <p className="story-body">
            Centuries before the Taj Mahal or the Red Fort of Delhi rose into the northern sky,
            empires clashed upon massive baked-brick bastions overlooking the historic caravan routes
            of the Punjab plains.
          </p>
        </div>

        {/* Feature Story Card */}
        <article className="story-feature-card" aria-label="Qila Mubarak Bathinda Discovery">
          <div className="story-card-grid">
            {/* High-Resolution Architectural Photography */}
            <div className="story-image-wrap">
              <Image
                src="https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80"
                alt="Monumental brick bastions and high walls of Qila Mubarak in Bathinda"
                fill
                sizes="(max-width: 900px) 100vw, 55vw"
                className="story-image"
                loading="lazy"
              />
            </div>

            {/* Editorial Content Panel */}
            <div className="story-content-panel">
              <div className="story-badge-row">
                <span className="story-coordinates">30.2110° N • 74.9455° E</span>
                <FactBadge
                  label="DOCUMENTED"
                  variant="evidence"
                  evidenceType="DOCUMENTED"
                />
              </div>

              <h3 className="story-monument-name">Qila Mubarak</h3>
              <p className="story-monument-location">Bathinda, Punjab</p>

              <p className="story-narrative">
                Dating from the Kushan period (c. 90–110 CE) and substantially rebuilt by subsequent dynasties,
                Qila Mubarak holds nearly two millennia of unwritten frontier history. In 1240 CE, it served
                as the high-security prison of Delhi&apos;s first and only female monarch, Razia Sultana, after her
                generals mutinied along the Ghaggar basin.
              </p>

              {/* Verified Editorial Facts */}
              <div className="story-key-facts">
                <div className="story-fact-item">
                  <span className="story-fact-label">Earliest Phase</span>
                  <span className="story-fact-val">1st–3rd Century CE (Kushan)</span>
                </div>
                <div className="story-fact-item">
                  <span className="story-fact-label">Historical Event</span>
                  <span className="story-fact-val">Imprisonment of Razia Sultana (1240 CE)</span>
                </div>
                <div className="story-fact-item">
                  <span className="story-fact-label">Architecture</span>
                  <span className="story-fact-val">Massive Lakhori & Mud-Core Brick</span>
                </div>
                <div className="story-fact-item">
                  <span className="story-fact-label">Visit Duration</span>
                  <span className="story-fact-val">2 to 3 hours • Accessible</span>
                </div>
              </div>

              <div>
                <Link
                  href="/destinations/qila-mubarak-bathinda"
                  className="btn btn-primary"
                  aria-label="Read full architectural and historical investigation of Qila Mubarak"
                >
                  Explore the Fortress Story &rarr;
                </Link>
              </div>
            </div>
          </div>
        </article>
      </Container>
    </section>
  );
};
