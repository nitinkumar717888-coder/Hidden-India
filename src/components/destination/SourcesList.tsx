import React from 'react';
import { DestinationSource } from '@/lib/db/schema';
import { FactBadge } from '../common/FactBadge';

interface SourcesListProps {
  sources: DestinationSource[];
}

export const SourcesList: React.FC<SourcesListProps> = ({ sources }) => {
  if (sources.length === 0) return null;

  return (
    <section className="sources-section" id="sources" aria-label="Sources and References">
      <div className="sources-header">
        <div>
          <h2 className="text-h3">Sources & Bibliographic References</h2>
          <p className="text-small" style={{ color: 'var(--color-text-muted)' }}>
            Every documented fact and date is traceable to verifiable institutional and archival
            records.
          </p>
        </div>
        <FactBadge label={`${sources.length} Cited Sources`} variant="default" />
      </div>

      <ol className="sources-list">
        {sources.map((source, index) => {
          const verifiedDate = source.verifiedAt
            ? new Date(source.verifiedAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
              })
            : null;

          return (
            <li key={source.id} className="source-list-item">
              <span className="source-index">[{index + 1}]</span>
              <div className="source-details">
                <div className="source-title-row">
                  <h3 className="source-title text-body">
                    {source.url ? (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="source-external-link"
                      >
                        {source.title}
                        <svg
                          className="external-link-icon"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </a>
                    ) : (
                      <span>{source.title}</span>
                    )}
                  </h3>
                  <span className="source-type-pill">{source.sourceType}</span>
                </div>

                <div className="source-meta text-caption">
                  <span className="source-publisher">Publisher: {source.publisher}</span>
                  {source.publicationDate && (
                    <span className="source-pubdate"> &bull; Year: {source.publicationDate}</span>
                  )}
                  {verifiedDate && (
                    <span className="source-verified"> &bull; Verified: {verifiedDate}</span>
                  )}
                </div>

                {source.notes && <p className="source-notes text-caption">{source.notes}</p>}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
};
