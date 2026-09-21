import React from 'react';
import Link from 'next/link';
import { destinationService } from '@/lib/services/destination-service';
import { Container } from '@/components/common/Container';
import { EditorialStatus } from '@/lib/types/enums';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const allDestinations = await destinationService.getAllForAdmin();

  const counts = {
    total: allDestinations.length,
    draft: allDestinations.filter((d) => d.editorialStatus === EditorialStatus.DRAFT).length,
    researching: allDestinations.filter(
      (d) => d.editorialStatus === EditorialStatus.RESEARCHING
    ).length,
    needs_review: allDestinations.filter(
      (d) => d.editorialStatus === EditorialStatus.NEEDS_REVIEW
    ).length,
    verified: allDestinations.filter((d) => d.editorialStatus === EditorialStatus.VERIFIED)
      .length,
    published: allDestinations.filter((d) => d.editorialStatus === EditorialStatus.PUBLISHED)
      .length,
    archived: allDestinations.filter((d) => d.editorialStatus === EditorialStatus.ARCHIVED)
      .length,
  };

  return (
    <div className="admin-page">
      <Container size="wide">
        <div className="admin-page-header">
          <div>
            <h1 className="text-h2">Editorial Database Overview</h1>
            <p className="text-small" style={{ color: 'var(--color-text-muted)' }}>
              Monitor destination records through the verification and publication lifecycle.
            </p>
          </div>

          <Link href="/admin/destinations/new" className="btn btn-primary">
            + Create New Destination
          </Link>
        </div>

        {/* Workflow Lifecycle Pipeline Cards */}
        <div className="grid grid-cols-2-sm grid-cols-4 gap-4" style={{ marginTop: '2rem' }}>
          <div className="admin-stat-card">
            <span className="stat-label">Total Records</span>
            <span className="stat-number">{counts.total}</span>
            <span className="stat-hint">Across all workflow states</span>
          </div>

          <div className="admin-stat-card">
            <span className="stat-label">Researching / Draft</span>
            <span className="stat-number">{counts.draft + counts.researching}</span>
            <span className="stat-hint">In active editorial investigation</span>
          </div>

          <div className="admin-stat-card">
            <span className="stat-label">Needs Review</span>
            <span className="stat-number" style={{ color: 'var(--color-ochre)' }}>
              {counts.needs_review}
            </span>
            <span className="stat-hint">Awaiting bibliographic cross-check</span>
          </div>

          <div className="admin-stat-card">
            <span className="stat-label">Published Publicly</span>
            <span className="stat-number" style={{ color: 'var(--color-forest)' }}>
              {counts.published}
            </span>
            <span className="stat-hint">Visible in public discovery</span>
          </div>
        </div>

        {/* Quick Links & Actions */}
        <div className="admin-section-box" style={{ marginTop: '3rem' }}>
          <div className="admin-box-header">
            <h2 className="text-h3">Quick Actions</h2>
          </div>
          <div className="admin-box-body">
            <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
              <Link href="/admin/destinations" className="btn btn-secondary">
                View All Destinations ({counts.total}) &rarr;
              </Link>
              <Link
                href="/admin/destinations?status=needs_review"
                className="btn btn-secondary"
              >
                Review Pending ({counts.needs_review}) &rarr;
              </Link>
              <Link
                href="/admin/destinations?status=published"
                className="btn btn-secondary"
              >
                Published Catalog ({counts.published}) &rarr;
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
