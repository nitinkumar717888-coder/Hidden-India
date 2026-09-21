import React from 'react';
import { DestinationEvidenceItem } from '@/lib/db/schema';
import { FactBadge } from '../common/FactBadge';

interface EvidenceSectionProps {
  longDescription: string;
  evidenceItems: DestinationEvidenceItem[];
}

export const EvidenceSection: React.FC<EvidenceSectionProps> = ({
  longDescription,
  evidenceItems,
}) => {
  // Separate items into Documented ("What We Know") vs Folklore/Tradition ("Local Stories & Legends")
  const documentedItems = evidenceItems.filter(
    (item) => item.classification === 'DOCUMENTED' || item.classification === 'DISPUTED'
  );

  const folkloreItems = evidenceItems.filter(
    (item) => item.classification === 'LOCAL_TRADITION' || item.classification === 'UNKNOWN'
  );

  return (
    <div className="destination-narrative-container">
      {/* 1. THE STORY (Factual Historical Context) */}
      <section className="narrative-section editorial-story" id="the-story">
        <h2 className="text-h2 section-title">The Story & Context</h2>
        <div className="editorial-prose">
          {longDescription.split('\n\n').map((paragraph, idx) => (
            <p key={idx} className="text-body narrative-p">
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      {/* 2. WHAT WE KNOW (Documented Archaeological Evidence) */}
      {documentedItems.length > 0 && (
        <section className="narrative-section documented-evidence" id="what-we-know">
          <div className="evidence-header-row">
            <h2 className="text-h2 section-title">What We Know: Documented Evidence</h2>
            <FactBadge
              label="Historically Documented"
              variant="evidence"
              evidenceType="DOCUMENTED"
            />
          </div>
          <p className="evidence-subtext text-small">
            The following accounts are directly substantiated by archaeological excavations,
            inscriptions, institutional surveys, or archival documents.
          </p>

          <div className="evidence-cards-list">
            {documentedItems.map((item) => (
              <article key={item.id} className="evidence-item-card card-documented">
                <div className="evidence-item-header">
                  <h3 className="evidence-item-title text-h4">{item.sectionTitle}</h3>
                  <FactBadge
                    label={item.classification}
                    variant="evidence"
                    evidenceType={item.classification}
                  />
                </div>
                <div className="evidence-item-body text-body">{item.content}</div>
                {item.citationNotes && (
                  <footer className="evidence-citation text-caption">
                    <strong>Source attribution:</strong> {item.citationNotes}
                  </footer>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {/* 3. LOCAL STORIES & LEGENDS (Strictly Separated Folklore) */}
      {folkloreItems.length > 0 && (
        <section className="narrative-section folklore-section" id="local-stories">
          <div className="evidence-header-row">
            <h2 className="text-h2 section-title">Local Stories & Oral Tradition</h2>
            <FactBadge
              label="Oral Folklore / Unverified"
              variant="evidence"
              evidenceType="LOCAL_TRADITION"
            />
          </div>
          <p className="folklore-warning-banner text-small">
            <strong>Editorial Standard:</strong> The following accounts represent local memory,
            oral lore, or religious beliefs passed down through generations. They are not
            established archaeological facts and should not be cited as documented history.
          </p>

          <div className="evidence-cards-list">
            {folkloreItems.map((item) => (
              <article key={item.id} className="evidence-item-card card-folklore">
                <div className="evidence-item-header">
                  <h3 className="evidence-item-title text-h4">{item.sectionTitle}</h3>
                  <FactBadge
                    label={item.classification.replace('_', ' ')}
                    variant="evidence"
                    evidenceType={item.classification}
                  />
                </div>
                <div className="evidence-item-body text-body">{item.content}</div>
                {item.citationNotes && (
                  <footer className="evidence-citation text-caption">
                    <strong>Tradition context:</strong> {item.citationNotes}
                  </footer>
                )}
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
