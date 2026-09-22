import React from 'react';
import Link from 'next/link';
import { destinationService } from '@/lib/services/destination-service';
import { Container } from '@/components/common/Container';
import { FactBadge } from '@/components/common/FactBadge';
import { EditorialStatus, EditorialStatusType } from '@/lib/types/enums';
import { updateDestinationStatusAction } from '../actions';

interface AdminDestinationsPageProps {
  searchParams: { status?: EditorialStatusType };
}

export const dynamic = 'force-dynamic';

export default async function AdminDestinationsListPage({
  searchParams,
}: AdminDestinationsPageProps) {
  const currentStatus = searchParams.status;
  const destinationsList = await destinationService.getAllForAdmin(currentStatus);

  const STATUS_TABS: { label: string; value?: EditorialStatusType }[] = [
    { label: 'All' },
    { label: 'Draft', value: EditorialStatus.DRAFT },
    { label: 'Researching', value: EditorialStatus.RESEARCHING },
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
            <h1 className="text-h2">Destination Management</h1>
            <p className="text-small" style={{ color: 'var(--color-text-muted)' }}>
              Manage editorial workflow, fact classifications, and publication states.
            </p>
          </div>
          <Link href="/admin/destinations/new" className="btn btn-primary">
            + New Destination
          </Link>
        </div>

        {/* Status Filter Tabs */}
        <div className="admin-filter-tabs">
          {STATUS_TABS.map((tab) => {
            const isActive = currentStatus === tab.value;
            const href = tab.value ? `/admin/destinations?status=${tab.value}` : '/admin/destinations';
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

        {/* Destination Table */}
        <div className="admin-table-container">
          {destinationsList.length === 0 ? (
            <div className="admin-empty-notice">
              <p>No destination records found matching this status filter.</p>
              <Link href="/admin/destinations/new" className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }}>
                Create First Destination &rarr;
              </Link>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Destination Name & Slug</th>
                  <th>Location</th>
                  <th>Evidence</th>
                  <th>Images</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {destinationsList.map((dest: any) => (
                  <tr key={dest.id}>
                    <td>
                      <div className="dest-name-cell">
                        <strong>{dest.name}</strong>
                        <span className="dest-slug-hint">/{dest.slug}</span>
                      </div>
                    </td>
                    <td>
                      <span className="text-small">
                        {[dest.locality, dest.district, dest.state].filter(Boolean).join(', ')}
                      </span>
                    </td>
                    <td>
                      <FactBadge
                        label={dest.evidenceClassification.replace('_', ' ')}
                        variant="evidence"
                        evidenceType={dest.evidenceClassification}
                      />
                    </td>
                    <td>
                      {dest.requiresEditorialReplacement ? (
                        <span
                          className="status-pill"
                          style={{
                            backgroundColor: '#fff3cd',
                            color: '#856404',
                            border: '1px solid #ffeeba',
                            fontSize: '0.75rem',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                          title="Representative stock image. Needs editorial replacement."
                        >
                          📷 Stock Placeholder
                        </span>
                      ) : (
                        <span
                          className="status-pill"
                          style={{
                            backgroundColor: '#d4edda',
                            color: '#155724',
                            border: '1px solid #c3e6cb',
                            fontSize: '0.75rem',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          ✅ Verified Photo
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`status-pill status-${dest.editorialStatus}`}>
                        {dest.editorialStatus.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className="text-caption">
                        {new Date(dest.updatedAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="admin-row-actions">
                        {/* Photos / Intake link */}
                        <Link
                          href={`/admin/destinations/${dest.id}`}
                          className="btn btn-secondary btn-sm"
                          title="Photography Intake & Licensing"
                        >
                          📷 Photos
                        </Link>

                        {/* Preview link */}
                        <a
                          href={`/destinations/${dest.slug}?preview=true`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-ghost btn-sm"
                          title="Preview destination page"
                        >
                          Preview
                        </a>

                        {/* Quick publish / unpublish actions */}
                        {dest.editorialStatus !== EditorialStatus.PUBLISHED ? (
                          <form
                            action={async () => {
                              'use server';
                              await updateDestinationStatusAction(
                                dest.id,
                                EditorialStatus.PUBLISHED
                              );
                            }}
                            style={{ display: 'inline' }}
                          >
                            <button
                              type="submit"
                              className="btn btn-secondary btn-sm"
                              title="Publish destination publicly"
                            >
                              Publish
                            </button>
                          </form>
                        ) : (
                          <form
                            action={async () => {
                              'use server';
                              await updateDestinationStatusAction(
                                dest.id,
                                EditorialStatus.ARCHIVED
                              );
                            }}
                            style={{ display: 'inline' }}
                          >
                            <button
                              type="submit"
                              className="btn btn-ghost btn-sm"
                              title="Archive destination from public view"
                            >
                              Archive
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Container>
    </div>
  );
}
