'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/common/Container';
import { createCollectionAction } from '../actions';
import { EditorialStatus } from '@/lib/types/enums';

export default function NewCollectionPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [autoSlug, setAutoSlug] = useState(true);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (autoSlug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '')
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await createCollectionAction(formData);

    if (result.success && result.id) {
      router.push(`/admin/collections/${result.id}`);
    } else {
      setError(result.error || 'Failed to create collection.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-page">
      <Container size="normal">
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <Link
            href="/admin/collections"
            className="text-small"
            style={{ color: 'var(--color-text-muted)' }}
          >
            ← Back to Collections
          </Link>
          <h1 className="text-h2" style={{ marginTop: 'var(--space-2)' }}>
            Create Curated Collection
          </h1>
          <p className="text-small" style={{ color: 'var(--color-text-muted)' }}>
            Establish the editorial overview, theme, and region before adding destinations.
          </p>
        </div>

        {error && (
          <div
            className="banner banner-danger"
            style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-4)' }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="card" style={{ padding: 'var(--space-6)' }}>
          <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
            <label className="form-label" htmlFor="title">
              Collection Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              className="form-input"
              placeholder="e.g. Forgotten Fortresses of Haryana & the Borderlands"
              value={title}
              onChange={handleTitleChange}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
            <label className="form-label" htmlFor="slug">
              URL Slug *
            </label>
            <input
              id="slug"
              name="slug"
              type="text"
              required
              className="form-input"
              placeholder="forgotten-fortresses-haryana-borderlands"
              value={slug}
              onChange={(e) => {
                setAutoSlug(false);
                setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
              }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
            <label className="form-label" htmlFor="shortDescription">
              Short Description (Card Summary & Meta Description) *
            </label>
            <textarea
              id="shortDescription"
              name="shortDescription"
              required
              rows={2}
              maxLength={500}
              className="form-input"
              placeholder="A concise, factual summary explaining the theme of this trail (max 500 characters)."
            />
          </div>

          <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
            <label className="form-label" htmlFor="description">
              Editorial Overview (Introduction to the Trail) *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={6}
              className="form-input"
              placeholder="Why are these places presented together? Provide the historical, architectural, or geographic context connecting these sites without generic travel-blog fluff."
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 'var(--space-4)',
              marginBottom: 'var(--space-4)',
            }}
          >
            <div className="form-group">
              <label className="form-label" htmlFor="region">
                Region / Geographic Scope
              </label>
              <input
                id="region"
                name="region"
                type="text"
                className="form-input"
                placeholder="e.g. Haryana & Borderlands"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="theme">
                Thematic Focus
              </label>
              <input
                id="theme"
                name="theme"
                type="text"
                className="form-input"
                placeholder="e.g. Military Architecture & Fortifications"
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
            <label className="form-label" htmlFor="coverImageUrl">
              Cover Image URL (Verified Reference Photography)
            </label>
            <input
              id="coverImageUrl"
              name="coverImageUrl"
              type="url"
              className="form-input"
              placeholder="https://images.unsplash.com/..."
            />
          </div>

          <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
            <label className="form-label" htmlFor="editorialStatus">
              Editorial Status *
            </label>
            <select
              id="editorialStatus"
              name="editorialStatus"
              className="form-input"
              defaultValue={EditorialStatus.DRAFT}
            >
              <option value={EditorialStatus.DRAFT}>Draft (Private)</option>
              <option value={EditorialStatus.NEEDS_REVIEW}>Needs Review</option>
              <option value={EditorialStatus.VERIFIED}>Verified</option>
              <option value={EditorialStatus.PUBLISHED}>Published</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
            <Link href="/admin/collections" className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? 'Creating...' : 'Create & Add Destinations →'}
            </button>
          </div>
        </form>
      </Container>
    </div>
  );
}
