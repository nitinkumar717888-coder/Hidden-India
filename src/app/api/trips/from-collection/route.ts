import { NextRequest, NextResponse } from 'next/server';
import { assertAuthenticated } from '@/lib/supabase/server';
import { tripService } from '@/lib/services/trip-service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const authUser = await assertAuthenticated();
    const body = await request.json();
    const { tripName, destinationIds } = body;

    if (!Array.isArray(destinationIds) || destinationIds.length === 0) {
      return NextResponse.json(
        { error: 'destinationIds must be a non-empty array of strings.' },
        { status: 400 }
      );
    }

    const result = await tripService.createTripFromDestinations(
      authUser.profile.id,
      tripName || 'Curated Trail Trip',
      destinationIds
    );

    return NextResponse.json({
      success: true,
      trip: {
        id: result.trip.id,
        name: result.trip.name,
      },
      destinationCount: result.destinationCount,
    });
  } catch (error: any) {
    const message = error?.message || 'Failed to create trip from collection';
    const status = message.includes('Authentication required') ? 401 : 400;

    return NextResponse.json({ error: message }, { status });
  }
}
