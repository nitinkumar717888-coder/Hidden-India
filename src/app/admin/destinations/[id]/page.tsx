import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { destinationService } from '@/lib/services/destination-service';
import { Container } from '@/components/common/Container';
import { FactBadge } from '@/components/common/FactBadge';
import { addDestinationImageAction } from '../../actions';
import { PERMITTED_THIRD_PARTY_LICENSES } from '@/lib/services/photography-service';

interface AdminDestinationDetailPageProps {
  params: { id: string };
}

export const dynamic = 'force-dynamic';

export default async function AdminDestinationDetailPage({
  params,
}: AdminDestinationDetailPageProps) {
  const fullRecord = await destinationService.getByIdForAdmin(params.id);
  if (!fullRecord) {
    notFound();
  }

  const { destination, images, sources, evidenceItems } = fullRecord;

  const isResearchPending =
    destination.slug === 'jyotisar-kurukshetra' || destination.slug === 'phillaur-fort-ludhiana';

  return (
    <div className="admin-page">
      <Container size="wide">
        {/* Header Navigation */}
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <Link
            href="/admin/destinations"
            className="text-small"
            style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}
          >
            &larr; Back to All Destinations
          </Link>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-6)',
          }}
        >
          <div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
              <span className={`status-pill status-${destination.editorialStatus}`}>
                {destination.editorialStatus.toUpperCase()}
              </span>
              <FactBadge
                label={destination.evidenceClassification.replace('_', ' ')}
                variant="evidence"
                evidenceType={destination.evidenceClassification}
              />
              <span className="location-pill">
                {destination.district}, {destination.state}
              </span>
            </div>
            <h1 className="text-h2" style={{ margin: 0 }}>
              {destination.name}
            </h1>
            <p className="text-small" style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Slug: <code>{destination.slug}</code> • Coords: {destination.latitude}, {destination.longitude} (
              {destination.coordinateSource})
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Link
              href={`/destinations/${destination.slug}?preview=true`}
              target="_blank"
              className="btn btn-secondary"
            >
              Preview Page ↗
            </Link>
          </div>
        </div>

        {/* Safety & Editorial Warnings */}
        {isResearchPending && (
          <div
            style={{
              backgroundColor: '#fff3cd',
              border: '1px solid #ffeeba',
              color: '#856404',
              padding: '12px 16px',
              borderRadius: '6px',
              marginBottom: 'var(--space-6)',
            }}
            role="alert"
          >
            <strong>RESEARCH PROBLEM IDENTIFIED:</strong> This destination currently has unresolved source or civilian
            access issues (<code>NEEDS_SOURCE_RESEARCH</code>). Adding photography does NOT resolve research gaps or
            permit publication.
          </div>
        )}

        {destination.editorialStatus === 'draft' && (
          <div
            style={{
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef',
              color: '#495057',
              padding: '12px 16px',
              borderRadius: '6px',
              marginBottom: 'var(--space-6)',
              fontSize: '0.875rem',
            }}
          >
            <strong>PUBLICATION PROTECTION ACTIVE:</strong> This destination is in <strong>DRAFT</strong> status. It is
            strictly excluded from the public sitemap, search index, and public directory. Ingesting verified
            photography will <strong>not</strong> automatically publish this record.
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-8)' }}>
          {/* Column 1: Existing Attached Photography */}
          <div>
            <h2 className="text-h3" style={{ marginBottom: 'var(--space-4)' }}>
              Attached Photography ({images.length})
            </h2>

            {images.length === 0 ? (
              <p className="text-small" style={{ color: 'var(--color-text-muted)' }}>
                No photographs currently attached.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {images.map((img) => (
                  <div
                    key={img.id}
                    style={{
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                      padding: '16px',
                      backgroundColor: 'var(--color-surface)',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div
                        style={{
                          width: '120px',
                          height: '90px',
                          position: 'relative',
                          borderRadius: '4px',
                          overflow: 'hidden',
                          backgroundColor: '#eee',
                          flexShrink: 0,
                        }}
                      >
                        <Image
                          src={img.imageUrl}
                          alt={img.altText}
                          fill
                          sizes="120px"
                          style={{ objectFit: 'cover' }}
                        />
                      </div>

                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: 'flex',
                            gap: '6px',
                            alignItems: 'center',
                            marginBottom: '6px',
                            flexWrap: 'wrap',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              backgroundColor: img.role === 'hero' ? '#e2e3e5' : '#f8f9fa',
                            }}
                          >
                            {img.role || 'Hero'}
                          </span>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              backgroundColor:
                                img.editorialStatus === 'VERIFIED_THIRD_PARTY' ||
                                img.editorialStatus === 'VERIFIED_FIELD'
                                  ? '#d4edda'
                                  : '#fff3cd',
                              color:
                                img.editorialStatus === 'VERIFIED_THIRD_PARTY' ||
                                img.editorialStatus === 'VERIFIED_FIELD'
                                  ? '#155724'
                                  : '#856404',
                            }}
                          >
                            {img.editorialStatus || 'PENDING_PHOTOGRAPHY'}
                          </span>
                          {img.requiresEditorialReplacement && (
                            <span
                              style={{
                                fontSize: '0.7rem',
                                color: '#721c24',
                                backgroundColor: '#f8d7da',
                                padding: '2px 6px',
                                borderRadius: '4px',
                              }}
                            >
                              Placeholder (Needs Replacement)
                            </span>
                          )}
                        </div>

                        <p className="text-small" style={{ margin: '0 0 4px 0', fontWeight: 500 }}>
                          {img.caption || img.altText}
                        </p>

                        <div className="text-caption" style={{ color: 'var(--color-text-muted)' }}>
                          <div>Photo: {img.photographer || img.credit || 'Not documented'}</div>
                          <div>
                            Source: {img.source || 'Wikimedia Commons'}{' '}
                            {img.sourceUrl && (
                              <a
                                href={img.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: 'underline' }}
                              >
                                [View Page]
                              </a>
                            )}
                          </div>
                          <div>
                            License: {img.license || 'Unverified'}{' '}
                            {img.licenseUrl && (
                              <a
                                href={img.licenseUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: 'underline' }}
                              >
                                [Terms]
                              </a>
                            )}
                          </div>
                          {img.attribution && (
                            <div style={{ marginTop: '4px', fontStyle: 'italic' }}>
                              Attribution: &ldquo;{img.attribution}&rdquo;
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Column 2: Photography Intake & Licensing Form */}
          <div
            style={{
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              padding: '24px',
              backgroundColor: 'var(--color-surface)',
            }}
          >
            <h2 className="text-h3" style={{ marginBottom: '8px' }}>
              Add / Ingest Photograph
            </h2>
            <p className="text-caption" style={{ color: 'var(--color-text-muted)', marginBottom: '16px' }}>
              Enforces strict Creative Commons provenance, author attribution, and individual file verification.
            </p>

            <form
              action={async (formData: FormData) => {
                'use server';
                await addDestinationImageAction(formData);
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <input type="hidden" name="destinationId" value={destination.id} />

              <div>
                <label className="text-caption" style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Image Role *
                </label>
                <select name="role" className="form-control" defaultValue="hero" required>
                  <option value="hero">Hero (Recognizable site vista / establishing)</option>
                  <option value="detail">Detail (Sculpture, inscription, architectural masonry)</option>
                  <option value="context">Context (Landscape, approach, settlement)</option>
                </select>
              </div>

              <div>
                <label className="text-caption" style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Image URL (High-Resolution File) *
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  className="form-control"
                  placeholder="https://upload.wikimedia.org/.../file.jpg"
                  required
                />
              </div>

              <div>
                <label className="text-caption" style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Accessible Alt Text *
                </label>
                <input
                  type="text"
                  name="altText"
                  className="form-control"
                  placeholder="Accurate physical description of visible monument feature"
                  required
                />
              </div>

              <div>
                <label className="text-caption" style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Caption (Optional)
                </label>
                <input
                  type="text"
                  name="caption"
                  className="form-control"
                  placeholder="Curatorial note explaining what the viewer sees"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label className="text-caption" style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Photographer Name
                  </label>
                  <input
                    type="text"
                    name="photographer"
                    className="form-control"
                    placeholder="Real name or verified handle"
                  />
                </div>
                <div>
                  <label className="text-caption" style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Capture Date (YYYY-MM-DD)
                  </label>
                  <input type="text" name="captureDate" className="form-control" placeholder="Leave blank if unknown" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label className="text-caption" style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Repository Source *
                  </label>
                  <input
                    type="text"
                    name="source"
                    className="form-control"
                    defaultValue="Wikimedia Commons"
                    required
                  />
                </div>
                <div>
                  <label className="text-caption" style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Source Page URL *
                  </label>
                  <input
                    type="url"
                    name="sourceUrl"
                    className="form-control"
                    placeholder="https://commons.wikimedia.org/wiki/File:..."
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-caption" style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  License *
                </label>
                <select name="license" className="form-control" defaultValue="CC BY-SA 4.0" required>
                  {PERMITTED_THIRD_PARTY_LICENSES.map((lic) => (
                    <option key={lic} value={lic}>
                      {lic}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-caption" style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  License URL
                </label>
                <input
                  type="url"
                  name="licenseUrl"
                  className="form-control"
                  placeholder="https://creativecommons.org/licenses/by-sa/4.0/"
                />
              </div>

              <div>
                <label className="text-caption" style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Attribution String
                </label>
                <input
                  type="text"
                  name="attribution"
                  className="form-control"
                  placeholder="Photo: [Author] • Source: Wikimedia Commons • License: CC BY-SA 4.0"
                />
              </div>

              <div>
                <label className="text-caption" style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Photography Editorial Status *
                </label>
                <select name="editorialStatus" className="form-control" defaultValue="PENDING_LICENSE_VERIFICATION" required>
                  <option value="PENDING_PHOTOGRAPHY">PENDING_PHOTOGRAPHY (Initial intake)</option>
                  <option value="PENDING_LICENSE_VERIFICATION">PENDING_LICENSE_VERIFICATION (Review in progress)</option>
                  <option value="VERIFIED_THIRD_PARTY">VERIFIED_THIRD_PARTY (Approved & Verified)</option>
                  <option value="VERIFIED_FIELD">VERIFIED_FIELD (Direct Field Capture)</option>
                  <option value="REJECTED">REJECTED (Rights or quality unverified)</option>
                </select>
              </div>

              <div style={{ marginTop: '12px' }}>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  Save & Ingest Photograph
                </button>
              </div>
            </form>
          </div>
        </div>
      </Container>
    </div>
  );
}
