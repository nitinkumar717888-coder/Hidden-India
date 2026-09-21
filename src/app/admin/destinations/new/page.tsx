'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/common/Container';
import { createDestinationAction } from '../../actions';

export default function NewDestinationPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{ field: string; message: string }[]>([]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors([]);

    const formData = new FormData(e.currentTarget);
    const result = await createDestinationAction(formData);

    setIsSubmitting(false);

    if (result.success) {
      router.push(`/admin/destinations`);
    } else if (result.errors) {
      setFormErrors(result.errors);
    }
  }

  const getFieldError = (field: string) =>
    formErrors.find((err) => err.field === field)?.message;

  return (
    <div className="admin-page">
      <Container size="narrow">
        <div className="admin-page-header">
          <div>
            <Link href="/admin/destinations" className="admin-back-link">
              &larr; Back to Destinations
            </Link>
            <h1 className="text-h2" style={{ marginTop: '0.5rem' }}>
              Create Destination Record
            </h1>
            <p className="text-small" style={{ color: 'var(--color-text-muted)' }}>
              All records must strictly adhere to the fact vs. legend verification policy.
            </p>
          </div>
        </div>

        {formErrors.length > 0 && (
          <div className="admin-error-box" role="alert">
            <h3 className="text-h4" style={{ color: 'var(--color-danger)' }}>
              Please correct the following errors:
            </h3>
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
              {formErrors.map((err, idx) => (
                <li key={idx} className="text-small">
                  <strong>{err.field}:</strong> {err.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-form">
          {/* Section 1: Basic Identity */}
          <fieldset className="admin-fieldset">
            <legend className="admin-legend">1. Permanent Identity</legend>

            <div className="input-group">
              <label htmlFor="name" className="input-label">
                Destination Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="e.g. Qila Mubarak (Bathinda Fort)"
                className="input-text"
              />
              {getFieldError('name') && (
                <span className="field-error">{getFieldError('name')}</span>
              )}
            </div>

            <div className="input-group" style={{ marginTop: '1rem' }}>
              <label htmlFor="slug" className="input-label">
                SEO Slug * (lowercase alphanumeric with hyphens)
              </label>
              <input
                id="slug"
                name="slug"
                type="text"
                required
                placeholder="e.g. qila-mubarak-bathinda"
                className="input-text"
              />
              {getFieldError('slug') && (
                <span className="field-error">{getFieldError('slug')}</span>
              )}
            </div>

            <div className="input-group" style={{ marginTop: '1rem' }}>
              <label htmlFor="shortDescription" className="input-label">
                Short Summary * (1–2 concise sentences)
              </label>
              <textarea
                id="shortDescription"
                name="shortDescription"
                rows={2}
                required
                placeholder="A towering mud-brick fortress dating to the Kushan era, notable for the 13th-century imprisonment of Razia Sultana."
                className="input-text"
              />
              {getFieldError('shortDescription') && (
                <span className="field-error">{getFieldError('shortDescription')}</span>
              )}
            </div>

            <div className="input-group" style={{ marginTop: '1rem' }}>
              <label htmlFor="longDescription" className="input-label">
                The Story & Editorial Narrative * (Factual historical context)
              </label>
              <textarea
                id="longDescription"
                name="longDescription"
                rows={6}
                required
                placeholder="Detailed narrative documenting the history, architectural features, and recorded events without speculative or fictional storytelling."
                className="input-text"
              />
              {getFieldError('longDescription') && (
                <span className="field-error">{getFieldError('longDescription')}</span>
              )}
            </div>
          </fieldset>

          {/* Section 2: Canonical Geographical Location */}
          <fieldset className="admin-fieldset" style={{ marginTop: '2rem' }}>
            <legend className="admin-legend">2. Canonical Location</legend>

            <div className="grid grid-cols-1 grid-cols-3 gap-4">
              <div className="input-group">
                <label htmlFor="state" className="input-label">
                  State *
                </label>
                <select id="state" name="state" required className="input-text">
                  <option value="Punjab">Punjab</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Himachal Pradesh">Himachal Pradesh</option>
                  <option value="Chandigarh">Chandigarh</option>
                  <option value="Delhi">Delhi</option>
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="district" className="input-label">
                  District *
                </label>
                <input
                  id="district"
                  name="district"
                  type="text"
                  required
                  placeholder="e.g. Bathinda"
                  className="input-text"
                />
              </div>

              <div className="input-group">
                <label htmlFor="locality" className="input-label">
                  Locality / Town
                </label>
                <input
                  id="locality"
                  name="locality"
                  type="text"
                  placeholder="e.g. Old City"
                  className="input-text"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 grid-cols-2 gap-4" style={{ marginTop: '1rem' }}>
              <div className="input-group">
                <label htmlFor="latitude" className="input-label">
                  Latitude * (decimal)
                </label>
                <input
                  id="latitude"
                  name="latitude"
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 30.2110"
                  className="input-text"
                />
                {getFieldError('latitude') && (
                  <span className="field-error">{getFieldError('latitude')}</span>
                )}
              </div>

              <div className="input-group">
                <label htmlFor="longitude" className="input-label">
                  Longitude * (decimal)
                </label>
                <input
                  id="longitude"
                  name="longitude"
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 74.9455"
                  className="input-text"
                />
                {getFieldError('longitude') && (
                  <span className="field-error">{getFieldError('longitude')}</span>
                )}
              </div>
            </div>

            <div className="input-group" style={{ marginTop: '1rem' }}>
              <label htmlFor="coordinateSource" className="input-label">
                Coordinate Provenance (e.g. &quot;Survey of India Gazette&quot;, &quot;ASI Survey&quot;)
              </label>
              <input
                id="coordinateSource"
                name="coordinateSource"
                type="text"
                placeholder="ASI Chandigarh Circle Map Index"
                className="input-text"
              />
            </div>
          </fieldset>

          {/* Section 3: Classification & Workflow */}
          <fieldset className="admin-fieldset" style={{ marginTop: '2rem' }}>
            <legend className="admin-legend">3. Evidence & Editorial Governance</legend>

            <div className="grid grid-cols-1 grid-cols-2 gap-4">
              <div className="input-group">
                <label htmlFor="evidenceClassification" className="input-label">
                  Evidence Classification *
                </label>
                <select
                  id="evidenceClassification"
                  name="evidenceClassification"
                  required
                  className="input-text"
                >
                  <option value="DOCUMENTED">DOCUMENTED (Supported by official/archaeological sources)</option>
                  <option value="LOCAL_TRADITION">LOCAL_TRADITION (Folklore/oral belief)</option>
                  <option value="DISPUTED">DISPUTED (Contradictory historical accounts)</option>
                  <option value="UNKNOWN">UNKNOWN (Insufficient verified evidence)</option>
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="editorialStatus" className="input-label">
                  Editorial Workflow Status *
                </label>
                <select
                  id="editorialStatus"
                  name="editorialStatus"
                  required
                  className="input-text"
                >
                  <option value="draft">DRAFT (Internal authoring)</option>
                  <option value="researching">RESEARCHING (Active source gathering)</option>
                  <option value="needs_review">NEEDS_REVIEW (Awaiting editorial verification)</option>
                  <option value="verified">VERIFIED (Fact-checked against records)</option>
                  <option value="published">PUBLISHED (Live on public website)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 grid-cols-3 gap-4" style={{ marginTop: '1rem' }}>
              <div className="input-group">
                <label htmlFor="historicalPeriod" className="input-label">
                  Historical Era
                </label>
                <input
                  id="historicalPeriod"
                  name="historicalPeriod"
                  type="text"
                  placeholder="e.g. Kushan / Early Medieval"
                  className="input-text"
                />
              </div>

              <div className="input-group">
                <label htmlFor="difficulty" className="input-label">
                  Terrain Difficulty
                </label>
                <select id="difficulty" name="difficulty" className="input-text">
                  <option value="easy">Easy (Paved / Flat access)</option>
                  <option value="moderate">Moderate (Steps / Slight incline)</option>
                  <option value="challenging">Challenging (Rough trail / Rocky)</option>
                  <option value="strenuous">Strenuous (Long steep hike)</option>
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="estimatedVisitDuration" className="input-label">
                  Estimated Visit Duration *
                </label>
                <input
                  id="estimatedVisitDuration"
                  name="estimatedVisitDuration"
                  type="text"
                  required
                  placeholder="e.g. 1.5–2 hours"
                  className="input-text"
                />
              </div>
            </div>
          </fieldset>

          <div className="form-submit-row" style={{ marginTop: '2.5rem' }}>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-lg">
              {isSubmitting ? 'Creating Record...' : 'Save Destination Record'}
            </button>
            <Link href="/admin/destinations" className="btn btn-secondary btn-lg">
              Cancel
            </Link>
          </div>
        </form>
      </Container>
    </div>
  );
}
