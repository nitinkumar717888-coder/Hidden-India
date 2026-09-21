import { NextRequest, NextResponse } from 'next/server';
import { routingService } from '@/lib/routing/routing-provider';
import { geocodingProvider } from '@/lib/geocoding/geocoding-provider';
import { Coordinates } from '@/lib/routing/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { origin, destination, originCoordinates, travelMode } = body;

    if (!destination || typeof destination.latitude !== 'number' || typeof destination.longitude !== 'number') {
      return NextResponse.json(
        { error: 'Valid destination coordinates (latitude, longitude) are required.' },
        { status: 400 }
      );
    }

    let resolvedOriginCoords: Coordinates | null = null;

    if (originCoordinates && typeof originCoordinates.latitude === 'number' && typeof originCoordinates.longitude === 'number') {
      resolvedOriginCoords = originCoordinates;
    } else if (typeof origin === 'object' && origin !== null && typeof origin.latitude === 'number') {
      resolvedOriginCoords = origin;
    } else if (typeof origin === 'string' && origin.trim().length > 0) {
      const geoResults = await geocodingProvider.geocode(origin.trim());
      if (geoResults && geoResults.length > 0) {
        resolvedOriginCoords = geoResults[0].coordinates;
      }
    }

    if (!resolvedOriginCoords) {
      return NextResponse.json(
        {
          error:
            'Could not resolve starting location coordinates. Please select a recognized city/town or use browser location.',
        },
        { status: 400 }
      );
    }

    const routeEstimate = await routingService.calculateRoute({
      origin: resolvedOriginCoords,
      destination,
      originCoordinates: resolvedOriginCoords,
      travelMode,
    });

    return NextResponse.json({
      success: true,
      route: routeEstimate,
      resolvedOrigin: resolvedOriginCoords,
    });
  } catch (error) {
    console.error('Routing calculation error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal routing calculation error',
      },
      { status: 500 }
    );
  }
}
