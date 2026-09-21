import { NextRequest, NextResponse } from 'next/server';
import { assertAuthenticated } from '@/lib/supabase/server';
import { tripService } from '@/lib/services/trip-service';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await assertAuthenticated();
    const tripId = params.id;
    const body = await request.json();
    const { destinationIds } = body;

    if (!Array.isArray(destinationIds) || destinationIds.length === 0) {
      return NextResponse.json(
        { error: 'destinationIds must be a non-empty array of strings.' },
        { status: 400 }
      );
    }

    const result = await tripService.addDestinationsToTrip(
      authUser.profile.id,
      tripId,
      destinationIds
    );

    return NextResponse.json(result);
  } catch (error: any) {
    const message = error?.message || 'Failed to add destinations to trip';
    const status = message.includes('Authentication required')
      ? 401
      : message.includes('unauthorized') || message.includes('not found')
      ? 404
      : 400;

    return NextResponse.json({ error: message }, { status });
  }
}
