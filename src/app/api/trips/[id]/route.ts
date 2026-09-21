import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase/server';
import { tripService } from '@/lib/services/trip-service';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: { id: string };
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!UUID_REGEX.test(params.id)) {
      return NextResponse.json({ error: 'Invalid trip ID format.' }, { status: 400 });
    }

    const trip = await tripService.getTripById(authUser.id, params.id);
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, trip });
  } catch (error) {
    console.error('Get trip error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve trip' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!UUID_REGEX.test(params.id)) {
      return NextResponse.json({ error: 'Invalid trip ID format.' }, { status: 400 });
    }

    const body = await req.json();
    const { action } = body;

    if (action === 'add_destination') {
      if (!body.destinationId || !UUID_REGEX.test(body.destinationId)) {
        return NextResponse.json({ error: 'Invalid destination ID format.' }, { status: 400 });
      }
      await tripService.addDestinationToTrip(authUser.id, params.id, body.destinationId);
      const updatedTrip = await tripService.getTripById(authUser.id, params.id);
      return NextResponse.json({ success: true, trip: updatedTrip });
    }

    if (action === 'remove_destination') {
      if (!body.destinationId || !UUID_REGEX.test(body.destinationId)) {
        return NextResponse.json({ error: 'Invalid destination ID format.' }, { status: 400 });
      }
      await tripService.removeDestinationFromTrip(authUser.id, params.id, body.destinationId);
      const updatedTrip = await tripService.getTripById(authUser.id, params.id);
      return NextResponse.json({ success: true, trip: updatedTrip });
    }

    if (action === 'reorder_destinations') {
      if (!Array.isArray(body.destinationIds) || body.destinationIds.some((id: string) => !UUID_REGEX.test(id))) {
        return NextResponse.json({ error: 'Invalid destination IDs format.' }, { status: 400 });
      }
      await tripService.reorderTripDestinations(authUser.id, params.id, body.destinationIds);
      const updatedTrip = await tripService.getTripById(authUser.id, params.id);
      return NextResponse.json({ success: true, trip: updatedTrip });
    }

    if (action === 'toggle_sharing') {
      const shareResult = await tripService.toggleTripSharing(authUser.id, params.id, Boolean(body.isShared));
      return NextResponse.json({ success: true, ...shareResult });
    }

    // Default metadata update
    const updated = await tripService.updateTrip(authUser.id, params.id, body.updates);
    const updatedTrip = await tripService.getTripById(authUser.id, params.id);
    return NextResponse.json({ success: true, trip: updatedTrip, raw: updated });
  } catch (error) {
    console.error('Update trip error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update trip' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!UUID_REGEX.test(params.id)) {
      return NextResponse.json({ error: 'Invalid trip ID format.' }, { status: 400 });
    }

    const deleted = await tripService.deleteTrip(authUser.id, params.id);
    return NextResponse.json({ success: deleted });
  } catch (error) {
    console.error('Delete trip error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete trip' },
      { status: 500 }
    );
  }
}
