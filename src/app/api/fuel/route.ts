import { NextRequest, NextResponse } from 'next/server';
import { fuelPriceProvider } from '@/lib/fuel/fuel-provider';
import { FuelCategory } from '@/lib/calculator/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fuelType = (searchParams.get('fuelType')?.toUpperCase() || 'PETROL') as FuelCategory;
    const state = searchParams.get('state') || 'Chandigarh';

    const priceRecord = await fuelPriceProvider.getFuelPrice({
      fuelType,
      state,
    });

    return NextResponse.json({
      success: true,
      priceRecord,
    });
  } catch (error) {
    console.error('Fuel price query error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve verified fuel pricing' },
      { status: 500 }
    );
  }
}
