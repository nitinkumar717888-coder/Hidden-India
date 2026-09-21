/**
 * HIDDEN INDIA — SUPABASE SERVER CLIENT & AUTHENTICATION HELPERS
 * Secure server-side session resolution and RBAC verification.
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { db } from '../db';
import { profiles, Profile } from '../db/schema';
import { eq } from 'drizzle-orm';

export function createClient() {
  const cookieStore = cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Can happen in Server Components where cookies are read-only
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options });
        } catch {
          // Can happen in Server Components
        }
      },
    },
  });
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  profile: Profile;
}

/**
 * Resolves the authenticated user from the secure server session.
 * Never trusts client-supplied user IDs.
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  try {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user || !user.email) {
      return null;
    }

    if (!db) {
      return null;
    }

    // Retrieve or create canonical profile record
    let profile = await db.query.profiles?.findFirst({
      where: eq(profiles.id, user.id),
    });

    if (!profile) {
      // First-time profile initialization
      const [newProfile] = await db
        .insert(profiles)
        .values({
          id: user.id,
          email: user.email,
          fullName: user.user_metadata?.full_name || null,
          role: 'user',
          marketingEmailOptIn: false,
        })
        .onConflictDoNothing()
        .returning();

      profile = newProfile || (await db.query.profiles?.findFirst({ where: eq(profiles.id, user.id) }));
    }

    if (!profile) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      profile,
    };
  } catch (err) {
    console.error('Failed to resolve authenticated user:', err);
    return null;
  }
}

/**
 * Asserts that a valid user session exists.
 * Throws an authorization error if the request is anonymous.
 */
export async function assertAuthenticated(): Promise<AuthenticatedUser> {
  const authUser = await getCurrentUser();
  if (!authUser) {
    throw new Error('Authentication required to perform this action.');
  }
  return authUser;
}

/**
 * Asserts that the authenticated user possesses administrative or editorial permissions.
 * STRICT: Regular users are rejected.
 */
export async function assertAdminUser(): Promise<AuthenticatedUser> {
  const authUser = await assertAuthenticated();
  if (authUser.profile.role !== 'admin' && authUser.profile.role !== 'editor') {
    throw new Error('Administrative authorization required.');
  }
  return authUser;
}
