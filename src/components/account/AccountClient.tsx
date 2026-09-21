'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Profile } from '@/lib/db/schema';
import { createClient } from '@/lib/supabase/client';

interface AccountClientProps {
  profile: Profile;
}

export const AccountClient: React.FC<AccountClientProps> = ({ profile }) => {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState(profile.fullName || '');
  const [marketingOptIn, setMarketingOptIn] = useState(profile.marketingEmailOptIn);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState<string | null>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateMsg(null);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          marketingEmailOptIn: marketingOptIn,
        }),
      });

      if (res.ok) {
        setUpdateMsg('Profile preferences updated successfully.');
      } else {
        setUpdateMsg('Failed to update preferences.');
      }
    } catch {
      setUpdateMsg('Network error.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'DELETE',
      });

      if (res.ok) {
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
      }
    } catch {
      setIsDeleting(false);
    }
  };

  return (
    <div className="account-layout">
      {/* Profile Info Box */}
      <div className="account-card">
        <h2 className="text-h3" style={{ marginBottom: '1rem' }}>Account Identity</h2>

        <div className="account-details-grid">
          <div className="account-field">
            <span className="field-label">Email Address</span>
            <span className="field-value">{profile.email}</span>
          </div>

          <div className="account-field">
            <span className="field-label">Account Role</span>
            <span className="field-value" style={{ textTransform: 'uppercase' }}>
              {profile.role}
            </span>
          </div>

          <div className="account-field">
            <span className="field-label">Member Since</span>
            <span className="field-value">
              {new Date(profile.createdAt).toLocaleDateString('en-IN', {
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} style={{ marginTop: '1.5rem' }}>
          <div className="control-group">
            <label htmlFor="full-name" className="control-label">
              Display Name
            </label>
            <input
              id="full-name"
              type="text"
              className="input-field"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          {/* Marketing consent toggle */}
          <div className="control-group" style={{ marginTop: '1rem' }}>
            <label className="checkbox-label" style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={marketingOptIn}
                onChange={(e) => setMarketingOptIn(e.target.checked)}
              />
              <span className="text-small">
                Receive newly documented destination dispatches & editorial guides
              </span>
            </label>
          </div>

          {updateMsg && (
            <p className="text-small" style={{ color: 'var(--color-forest)', marginTop: '0.5rem' }}>
              {updateMsg}
            </p>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', alignItems: 'center' }}>
            <button type="submit" className="btn btn-primary btn-sm" disabled={isUpdating}>
              {isUpdating ? 'Saving...' : 'Update Profile'}
            </button>

            <button type="button" className="btn btn-secondary btn-sm" onClick={handleSignOut}>
              Sign Out
            </button>
          </div>
        </form>
      </div>

      {/* Account Data & Deletion Box (Section 24) */}
      <div className="account-card danger-zone-card" style={{ marginTop: '2rem' }}>
        <h2 className="text-h3" style={{ color: '#922B21', marginBottom: '0.5rem' }}>
          Data Privacy & Account Deletion
        </h2>
        <p className="text-small" style={{ color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
          Deleting your account permanently purges all saved discoveries, personal trip itineraries,
          and stored preferences from Hidden India&apos;s database.
        </p>

        {showDeleteConfirm ? (
          <div className="delete-confirm-box" style={{ marginTop: '1rem' }}>
            <p className="text-small" style={{ color: '#922B21', fontWeight: 600, marginBottom: '0.5rem' }}>
              Are you sure? This will delete all your personal trips and saved places immediately.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-sm btn-danger"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? 'Purging Data...' : 'Permanently Delete My Account'}
              </button>
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            style={{ color: '#C0392B', marginTop: '1rem' }}
            onClick={() => setShowDeleteConfirm(true)}
          >
            Request Account & Data Deletion
          </button>
        )}
      </div>
    </div>
  );
};
