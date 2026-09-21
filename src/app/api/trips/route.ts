import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase/server';
import { tripService } from '@/lib/services/trip-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const trips = await tripService.getUserTrips(authUser.id);
    return NextResponse.json({ success: true, trips });
  } catch (error) {
    console.error('List trips error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve trips' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json(
        { error: 'Sign in to create and save trips.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { error: 'Trip name is required.' },
        { status: 400 }
      );
    }

    const newTrip = await tripService.createTrip(authUser.id, body);
    return NextResponse.json({ success: true, trip: newTrip });
  } catch (error) {
    console.error('Create trip error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create trip' },
      { status: 500 }
    );
  }
}
