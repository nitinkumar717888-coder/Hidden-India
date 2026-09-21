import React from 'react';
import Link from 'next/link';
import { collectionService } from '@/lib/services/collection-service';
import { Container } from '@/components/common/Container';
import { FactBadge } from '@/components/common/FactBadge';
import { EditorialStatus, EditorialStatusType } from '@/lib/types/enums';
import { toggleCollectionStatusAction, deleteCollectionAction } from './actions';

interface AdminCollectionsPageProps {
  searchParams: { status?: EditorialStatusType };
}

export const dynamic = 'force-dynamic';

export default async function AdminCollectionsListPage({
  searchParams,
}: AdminCollectionsPageProps) {
  const currentStatus = searchParams.status;
  const collectionsList = await collectionService.getAllForAdmin(currentStatus);

  const STATUS_TABS: { label: string; value?: EditorialStatusType }[] = [
    { label: 'All' },
    { label: 'Draft', value: EditorialStatus.DRAFT },
    { label: 'Needs Review', value: EditorialStatus.NEEDS_REVIEW },
    { label: 'Verified', value: EditorialStatus.VERIFIED },
    { label: 'Published', value: EditorialStatus.PUBLISHED },
    { label: 'Archived', value: EditorialStatus.ARCHIVED },
  ];

  return (
    <div className="admin-page">
      <Container size="wide">
        <div className="admin-page-header">
          <div>
            <h1 className="text-h2">Curated Collections & Trails</h1>
            <p className="text-small" style={{ color: 'var(--color-text-muted)' }}>
              Manage editorial trails, thematic groups, sequential waypoints, and publication gates.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <Link href="/admin/destinations" className="btn btn-secondary">
              ← Destinations CMS
            </Link>
            <Link href="/admin/collections/new" className="btn btn-primary">
              + New Collection
            </Link>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="admin-filter-tabs">
          {STATUS_TABS.map((tab) => {
            const isActive = currentStatus === tab.value;
            const href = tab.value
              ? `/admin/collections?status=${tab.value}`
              : '/admin/collections';
            return (
              <Link
                key={tab.label}
                href={href}
                className={`admin-tab ${isActive ? 'admin-tab-active' : ''}`.trim()}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Collections Table */}
        <div className="admin-table-container card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Collection Title</th>
                <th>Region / Theme</th>
                <th>Waypoints</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {collectionsList.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                    <p className="text-muted">No collections found matching this filter.</p>
                    <Link
                      href="/admin/collections/new"
                      className="btn btn-secondary"
                      style={{ marginTop: 'var(--space-4)' }}
                    >
                      Create First Collection
                    </Link>
                  </td>
                </tr>
              ) : (
                collectionsList.map(({ collection, waypointCount }) => (
                  <tr key={collection.id}>
                    <td>
                      <div>
                        <strong>{collection.title}</strong>
                        <div
                          className="text-caption"
                          style={{ color: 'var(--color-text-muted)' }}
                        >
                          /{collection.slug}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-small">{collection.region || '—'}</div>
                      <div
                        className="text-caption"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        {collection.theme || '—'}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-neutral">{waypointCount} stops</span>
                    </td>
                    <td>
                      <FactBadge
                        label={collection.editorialStatus.toUpperCase()}
                      />
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <Link
                          href={`/collections/${collection.slug}?preview=true`}
                          target="_blank"
                          className="btn btn-small btn-secondary"
                        >
                          Preview
                        </Link>
                        <Link
                          href={`/admin/collections/${collection.id}`}
                          className="btn btn-small btn-primary"
                        >
                          Edit Trail
                        </Link>
                        {collection.editorialStatus === EditorialStatus.PUBLISHED ? (
                          <form
                            action={async () => {
                              'use server';
                              await toggleCollectionStatusAction(
                                collection.id,
                                EditorialStatus.DRAFT
                              );
                            }}
                          >
                            <button
                              type="submit"
                              className="btn btn-small btn-secondary"
                              title="Unpublish"
                            >
                              Unpublish
                            </button>
                          </form>
                        ) : (
                          <form
                            action={async () => {
                              'use server';
                              await toggleCollectionStatusAction(
                                collection.id,
                                EditorialStatus.PUBLISHED
                              );
                            }}
                          >
                            <button
                              type="submit"
                              className="btn btn-small btn-primary"
                              title="Publish"
                            >
                              Publish
                            </button>
                          </form>
                        )}
                        <form
                          action={async () => {
                            'use server';
                            await deleteCollectionAction(collection.id);
                          }}
                        >
                          <button
                            type="submit"
                            className="btn btn-small btn-ghost"
                            style={{ color: 'var(--color-error)' }}
                            title="Delete collection"
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Container>
    </div>
  );
}
