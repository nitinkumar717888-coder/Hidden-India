import { NextRequest, NextResponse } from 'next/server';
import { calculateMultiStopItinerary } from '@/lib/calculator/multiStopCalculator';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await calculateMultiStopItinerary(body);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('Multi-stop calculation error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Calculation error',
      },
      { status: 400 }
    );
  }
}
