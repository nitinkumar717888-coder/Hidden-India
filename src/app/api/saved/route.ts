import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase/server';
import { savedDestinationService } from '@/lib/services/saved-destination-service';

export const dynamic = 'force-dynamic';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const destinationId = searchParams.get('destinationId');

    const authUser = await getCurrentUser();
    if (!authUser || !destinationId) {
      return NextResponse.json({ isSaved: false });
    }

    if (!UUID_REGEX.test(destinationId)) {
      return NextResponse.json({ isSaved: false });
    }

    const isSaved = await savedDestinationService.isDestinationSaved(
      authUser.id,
      destinationId
    );

    return NextResponse.json({ isSaved });
  } catch (error) {
    console.error('Check saved error:', error);
    return NextResponse.json({ isSaved: false });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json(
        { error: 'Sign in to save discoveries to your account.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { destinationId, action } = body;

    if (!destinationId || !UUID_REGEX.test(destinationId)) {
      return NextResponse.json(
        { error: 'A valid Destination UUID is required.' },
        { status: 400 }
      );
    }

    if (action === 'unsave') {
      const success = await savedDestinationService.unsaveDestination(
        authUser.id,
        destinationId
      );
      return NextResponse.json({ success, isSaved: false });
    } else {
      const success = await savedDestinationService.saveDestination(
        authUser.id,
        destinationId
      );
      return NextResponse.json({ success, isSaved: true });
    }
  } catch (error) {
    console.error('Save destination error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to update saved status',
      },
      { status: 500 }
    );
  }
}
