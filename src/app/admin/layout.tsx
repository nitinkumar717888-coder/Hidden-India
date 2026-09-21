import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/common/Container';
import { getCurrentUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Editorial CMS Admin — Hidden India',
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authUser = await getCurrentUser();

  // STRICT RBAC: Ordinary authenticated users ('user') are forbidden from /admin
  if (authUser && authUser.profile.role !== 'admin' && authUser.profile.role !== 'editor') {
    redirect('/?error=forbidden_admin_access');
  }
  return (
    <div className="admin-shell">
      <header className="admin-header">
        <Container size="wide">
          <div className="admin-header-inner">
            <div className="admin-brand">
              <Link href="/admin" className="admin-logo">
                HIDDEN INDIA <span className="admin-pill">CMS</span>
              </Link>
              <span className="admin-env-tag">Editorial Dashboard</span>
            </div>

            <nav className="admin-nav" aria-label="Admin Navigation">
              <Link href="/admin" className="admin-nav-link">
                Overview
              </Link>
              <Link href="/admin/destinations" className="admin-nav-link">
                Destinations
              </Link>
              <Link href="/admin/destinations/new" className="btn btn-primary btn-sm">
                + New Destination
              </Link>
              <Link href="/" className="admin-nav-link" target="_blank">
                View Site &rarr;
              </Link>
            </nav>
          </div>
        </Container>
      </header>

      <main className="admin-content">{children}</main>
    </div>
  );
}
