import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { collectionService } from '@/lib/services/collection-service';
import { destinationService } from '@/lib/services/destination-service';
import { Container } from '@/components/common/Container';
import { updateCollectionAction } from '../actions';
import { EditorialStatus } from '@/lib/types/enums';
import CollectionWaypointsEditor from '@/components/admin/CollectionWaypointsEditor';

interface AdminCollectionEditPageProps {
  params: { id: string };
}

export const dynamic = 'force-dynamic';

export default async function AdminCollectionEditPage({
  params,
}: AdminCollectionEditPageProps) {
  const collectionData = await collectionService.getByIdForAdmin(params.id);
  if (!collectionData) {
    notFound();
  }

  const { collection, waypoints } = collectionData;
  const allDestinations = await destinationService.getAllForAdmin();

  return (
    <div className="admin-page">
      <Container size="normal">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 'var(--space-6)',
          }}
        >
          <div>
            <Link
              href="/admin/collections"
              className="text-small"
              style={{ color: 'var(--color-text-muted)' }}
            >
              ← Back to Collections
            </Link>
            <h1 className="text-h2" style={{ marginTop: 'var(--space-2)' }}>
              Edit Collection: {collection.title}
            </h1>
            <p className="text-small" style={{ color: 'var(--color-text-muted)' }}>
              Slug: /{collection.slug} • Status: {collection.editorialStatus.toUpperCase()}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <Link
              href={`/collections/${collection.slug}?preview=true`}
              target="_blank"
              className="btn btn-secondary"
            >
              Preview Trail ↗
            </Link>
          </div>
        </div>

        {/* Collection Metadata Form */}
        <form
          action={async (formData: FormData) => {
            'use server';
            await updateCollectionAction(formData);
          }}
          className="card"
          style={{ padding: 'var(--space-6)' }}
        >
          <input type="hidden" name="id" value={collection.id} />

          <h2 className="text-h3" style={{ marginBottom: 'var(--space-4)' }}>
            Collection Metadata
          </h2>

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
              defaultValue={collection.title}
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
              defaultValue={collection.slug}
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
              defaultValue={collection.shortDescription}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
            <label className="form-label" htmlFor="description">
              Editorial Overview (Why these places are presented together) *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={6}
              className="form-input"
              defaultValue={collection.description}
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
                defaultValue={collection.region || ''}
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
                defaultValue={collection.theme || ''}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
            <label className="form-label" htmlFor="coverImageUrl">
              Cover Image URL
            </label>
            <input
              id="coverImageUrl"
              name="coverImageUrl"
              type="url"
              className="form-input"
              defaultValue={collection.coverImageUrl || ''}
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
              defaultValue={collection.editorialStatus}
            >
              <option value={EditorialStatus.DRAFT}>Draft (Private)</option>
              <option value={EditorialStatus.NEEDS_REVIEW}>Needs Review</option>
              <option value={EditorialStatus.VERIFIED}>Verified</option>
              <option value={EditorialStatus.PUBLISHED}>Published</option>
              <option value={EditorialStatus.ARCHIVED}>Archived</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
            <button type="submit" className="btn btn-primary">
              Save Metadata Changes
            </button>
          </div>
        </form>

        {/* Ordered Trail Destinations Editor */}
        <CollectionWaypointsEditor
          collectionId={collection.id}
          initialWaypoints={waypoints.map((w) => ({
            sequence: w.sequence,
            destinationId: w.destination.id,
            destinationName: w.destination.name,
            destinationSlug: w.destination.slug,
            state: w.destination.state,
            editorialNote: w.editorialNote,
          }))}
          allDestinations={allDestinations.map((d) => ({
            id: d.id,
            name: d.name,
            slug: d.slug,
            state: d.state,
          }))}
        />
      </Container>
    </div>
  );
}
