'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/common/Container';
import { createClient } from '@/lib/supabase/client';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') || '/saved';

  const [mode, setMode] = useState<'magic_link' | 'password'>('magic_link');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [marketingOptIn, setMarketingOptIn] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      if (mode === 'magic_link') {
        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: {
            emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}${nextUrl}` : undefined,
            data: {
              marketing_email_opt_in: marketingOptIn,
            },
          },
        });

        if (error) throw error;

        setMessage({
          type: 'success',
          text: `Check your inbox at ${email}! We have sent you a secure sign-in link.`,
        });
      } else {
        // Sign in or Sign up with password
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (signInError) {
          // If invalid login credentials, attempt sign up
          if (signInError.message.includes('Invalid login credentials')) {
            const { error: signUpError } = await supabase.auth.signUp({
              email: email.trim(),
              password,
              options: {
                data: {
                  marketing_email_opt_in: marketingOptIn,
                },
              },
            });

            if (signUpError) throw signUpError;

            setMessage({
              type: 'success',
              text: 'Account created! Please check your email to confirm your account.',
            });
            setIsLoading(false);
            return;
          }
          throw signInError;
        }

        router.push(nextUrl);
        router.refresh();
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Authentication failed. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="login-page-main">
      <Container size="narrow">
        <div className="login-card">
          <header className="login-header">
            <Link href="/" className="site-brand" style={{ display: 'inline-block', marginBottom: '1rem' }}>
              <span className="brand-title">HIDDEN INDIA</span>
            </Link>
            <h1 className="text-h2">Sign In to Your Account</h1>
            <p className="text-muted" style={{ marginTop: '0.25rem' }}>
              Access your personal discoveries, saved places, and custom road trip itineraries.
            </p>
          </header>

          {/* Mode Switcher */}
          <div className="auth-mode-toggle" style={{ margin: '1.5rem 0 1rem' }}>
            <button
              type="button"
              className={`toggle-btn ${mode === 'magic_link' ? 'active' : ''}`}
              onClick={() => {
                setMode('magic_link');
                setMessage(null);
              }}
            >
              Passwordless (Magic Link)
            </button>
            <button
              type="button"
              className={`toggle-btn ${mode === 'password' ? 'active' : ''}`}
              onClick={() => {
                setMode('password');
                setMessage(null);
              }}
            >
              Email & Password
            </button>
          </div>

          {message && (
            <div
              className={`calc-error-banner ${message.type === 'success' ? 'auth-success-banner' : ''}`}
              role="alert"
              style={{ marginBottom: '1.5rem' }}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleAuth} className="login-form">
            <div className="control-group">
              <label htmlFor="auth-email" className="control-label">
                Email Address *
              </label>
              <input
                id="auth-email"
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {mode === 'password' && (
              <div className="control-group" style={{ marginTop: '1rem' }}>
                <label htmlFor="auth-password" className="control-label">
                  Password *
                </label>
                <input
                  id="auth-password"
                  type="password"
                  className="input-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            )}

            {/* Separate Marketing Consent (Section 5: Default false, strictly separate) */}
            <div className="marketing-consent-box" style={{ marginTop: '1.25rem' }}>
              <label className="checkbox-label" style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                <input
                  type="checkbox"
                  checked={marketingOptIn}
                  onChange={(e) => setMarketingOptIn(e.target.checked)}
                  style={{ marginTop: '0.2rem' }}
                />
                <span className="text-small" style={{ color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>
                  Keep me updated with newly documented hidden destinations and curated road trip guides. (Optional)
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-calculate-trip"
              style={{ marginTop: '1.5rem' }}
              disabled={isLoading}
            >
              {isLoading
                ? 'Signing In...'
                : mode === 'magic_link'
                ? 'Send Magic Link ➔'
                : 'Sign In / Register ➔'}
            </button>
          </form>

          <footer className="login-footer" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <p className="text-caption" style={{ color: 'var(--color-text-muted)' }}>
              🔒 Powered by Supabase Authentication. Passwords and credentials are encrypted securely and never stored in application code.
            </p>
          </footer>
        </div>
      </Container>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="login-page">
          <Container size="narrow">
            <div className="login-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
              <p className="text-secondary">Loading authentication portal...</p>
            </div>
          </Container>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

