import React from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Container } from '@/components/common/Container';
import { getCurrentUser } from '@/lib/supabase/server';
import { AccountClient } from '@/components/account/AccountClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Account Settings — Hidden India',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AccountPage() {
  const authUser = await getCurrentUser();

  if (!authUser) {
    redirect('/login?next=/account');
  }

  return (
    <main className="account-page-main">
      <Container size="narrow">
        <header className="page-header" style={{ marginBottom: '2rem' }}>
          <span className="text-eyebrow">Account & Privacy Settings</span>
          <h1 className="text-h1">Account Profile</h1>
        </header>

        <AccountClient profile={authUser.profile} />
      </Container>
    </main>
  );
}
