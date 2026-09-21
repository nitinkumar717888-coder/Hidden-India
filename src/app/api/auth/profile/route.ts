import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { profiles, savedDestinations, trips } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser || !db) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { fullName, marketingEmailOptIn } = body;

    const [updated] = await db
      .update(profiles)
      .set({
        fullName: typeof fullName === 'string' ? fullName.trim() : authUser.profile.fullName,
        marketingEmailOptIn: typeof marketingEmailOptIn === 'boolean' ? marketingEmailOptIn : authUser.profile.marketingEmailOptIn,
        marketingEmailOptedInAt: marketingEmailOptIn ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, authUser.id))
      .returning();

    return NextResponse.json({ success: true, profile: updated });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const authUser = await getCurrentUser();
    if (!authUser || !db) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Cascade delete user-owned data
    await db.delete(savedDestinations).where(eq(savedDestinations.userId, authUser.id));
    await db.delete(trips).where(eq(trips.userId, authUser.id));
    await db.delete(profiles).where(eq(profiles.id, authUser.id));

    return NextResponse.json({
      success: true,
      message: 'Account and personal data successfully purged.',
    });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
