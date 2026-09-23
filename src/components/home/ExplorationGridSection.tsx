import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/common/Container';
import { FactBadge } from '@/components/common/FactBadge';

export const ExplorationGridSection: React.FC = () => {
  return (
    <section id="exploration" className="exploration-section" aria-label="Exploration Catalog">
      <Container size="normal">
        {/* Header with Catalog Link */}
        <div className="exploration-header">
          <div>
            <span className="text-eyebrow">Curated Field Catalog</span>
            <h2 className="text-h2">Architectural Rarities of the Northern Basin</h2>
            <p className="text-small" style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
              Documented monuments spanning ancient rock-cut monoliths, Vedic inscriptions, and royal hydraulic architecture.
            </p>
          </div>
          <Link
            href="/destinations"
            className="text-small"
            style={{ color: 'var(--color-terracotta)', fontWeight: 600 }}
          >
            Explore all 22 verified destinations &rarr;
          </Link>
        </div>

        {/* Asymmetric Editorial Grid */}
        <div className="asymmetric-grid">
          {/* 1. Large Feature Card: Masrur Rock-Cut Temples, Kangra */}
          <article className="asymmetric-card-hero" aria-label="Masrur Rock-Cut Temples">
            <div className="asymmetric-hero-image-wrap">
              <Image
                src="https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80"
                alt="Rock-cut stone spires reflecting into calm water reservoir with mountain view"
                fill
                sizes="(max-width: 900px) 100vw, 55vw"
                loading="lazy"
              />
            </div>
            <div className="asymmetric-hero-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span className="text-caption" style={{ color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Kangra Valley, Himachal Pradesh
                </span>
                <FactBadge label="DOCUMENTED" variant="evidence" evidenceType="DOCUMENTED" />
              </div>
              <h3 className="text-h3" style={{ marginBottom: '0.5rem' }}>
                <Link href="/destinations/masrur-rock-cut-temples-kangra" className="hover-link">
                  Masrur Rock-Cut Temples (Himalayan Monoliths)
                </Link>
              </h3>
              <p className="text-small" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                An extraordinary 8th-century monolithic sanctuary carved directly out of a single sandstone ridge.
                Fifteen shikhara towers reflect across a sacred rectangular water basin with panoramic views of the snow-capped Dhauladhars.
              </p>
              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="text-caption" style={{ color: 'var(--color-ochre)', fontFamily: 'var(--font-mono)' }}>
                  32.0628° N • 76.1558° E
                </span>
                <Link
                  href="/destinations/masrur-rock-cut-temples-kangra"
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--color-terracotta)', fontWeight: 600 }}
                >
                  Explore Shrines &rarr;
                </Link>
              </div>
            </div>
          </article>

          {/* 2. Offset Stack: Horizontal Cards */}
          <div className="asymmetric-stack">
            {/* Horizontal Card 1: Tosham Rock Inscription, Bhiwani */}
            <article className="asymmetric-card-horizontal" aria-label="Tosham Rock Inscription">
              <div className="asymmetric-horizontal-img-wrap">
                <Image
                  src="https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80"
                  alt="Isolated volcanic rocky hill and medieval stone pavilion"
                  fill
                  sizes="(max-width: 600px) 100vw, 200px"
                  loading="lazy"
                />
              </div>
              <div className="asymmetric-horizontal-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <span className="text-caption" style={{ color: 'var(--color-text-muted)' }}>
                    Bhiwani, Haryana
                  </span>
                  <FactBadge label="DOCUMENTED" variant="evidence" evidenceType="DOCUMENTED" />
                </div>
                <h4 className="text-h4" style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>
                  <Link href="/destinations/tosham-rock-inscription-bhiwani" className="hover-link">
                    Tosham Rock Inscription & Baradari
                  </Link>
                </h4>
                <p className="text-small" style={{ color: 'var(--color-text-secondary)', marginBottom: '0.75rem', fontSize: '0.825rem' }}>
                  A 4th-century CE Sanskrit Gupta Brahmi epigraph and medieval lookout baradari crowning an isolated volcanic dome.
                </p>
                <Link
                  href="/destinations/tosham-rock-inscription-bhiwani"
                  className="text-small"
                  style={{ color: 'var(--color-terracotta)', fontWeight: 600, marginTop: 'auto' }}
                >
                  View Inscriptions &rarr;
                </Link>
              </div>
            </article>

            {/* Horizontal Card 2: Jal Mahal, Narnaul */}
            <article className="asymmetric-card-horizontal" aria-label="Jal Mahal Narnaul">
              <div className="asymmetric-horizontal-img-wrap">
                <Image
                  src="https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=800&q=80"
                  alt="Mughal pleasure pavilion centered inside Khan Sarovar reservoir"
                  fill
                  sizes="(max-width: 600px) 100vw, 200px"
                  loading="lazy"
                />
              </div>
              <div className="asymmetric-horizontal-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <span className="text-caption" style={{ color: 'var(--color-text-muted)' }}>
                    Mahendragarh, Haryana
                  </span>
                  <FactBadge label="DOCUMENTED" variant="evidence" evidenceType="DOCUMENTED" />
                </div>
                <h4 className="text-h4" style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>
                  <Link href="/destinations/jal-mahal-narnaul" className="hover-link">
                    Jal Mahal, Narnaul
                  </Link>
                </h4>
                <p className="text-small" style={{ color: 'var(--color-text-secondary)', marginBottom: '0.75rem', fontSize: '0.825rem' }}>
                  A 1591 CE Mughal pleasure pavilion rising dramatically from the center of Khan Sarovar, reached by a causeway bridge.
                </p>
                <Link
                  href="/destinations/jal-mahal-narnaul"
                  className="text-small"
                  style={{ color: 'var(--color-terracotta)', fontWeight: 600, marginTop: 'auto' }}
                >
                  View Water Palace &rarr;
                </Link>
              </div>
            </article>

            {/* Horizontal Card 3: Chor Gumbad, Narnaul */}
            <article className="asymmetric-card-horizontal" aria-label="Chor Gumbad Narnaul">
              <div className="asymmetric-horizontal-img-wrap">
                <Image
                  src="https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80"
                  alt="14th-century square Afghan tomb standing isolated on a rock outcrop"
                  fill
                  sizes="(max-width: 600px) 100vw, 200px"
                  loading="lazy"
                />
              </div>
              <div className="asymmetric-horizontal-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <span className="text-caption" style={{ color: 'var(--color-text-muted)' }}>
                    Mahendragarh, Haryana
                  </span>
                  <FactBadge label="DOCUMENTED" variant="evidence" evidenceType="DOCUMENTED" />
                </div>
                <h4 className="text-h4" style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>
                  <Link href="/destinations/chor-gumbad-narnaul" className="hover-link">
                    Chor Gumbad (‘Signpost of Narnaul’)
                  </Link>
                </h4>
                <p className="text-small" style={{ color: 'var(--color-text-secondary)', marginBottom: '0.75rem', fontSize: '0.825rem' }}>
                  An imposing 14th-century Afghan lookout fortress standing atop a rocky outcrop, historically serving caravan lookouts.
                </p>
                <Link
                  href="/destinations/chor-gumbad-narnaul"
                  className="text-small"
                  style={{ color: 'var(--color-terracotta)', fontWeight: 600, marginTop: 'auto' }}
                >
                  View Fortress &rarr;
                </Link>
              </div>
            </article>
          </div>
        </div>
      </Container>
    </section>
  );
};
