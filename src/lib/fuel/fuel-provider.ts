/**
 * HIDDEN INDIA — FUEL & ENERGY PRICE PROVIDER
 * Honest geographic fuel price resolution with verified timestamps and source attribution.
 * Never invents unverified data.
 */

import { FuelCategory } from '../calculator/types';
import { FuelPriceQuery, FuelPriceRecord, IFuelPriceProvider } from './types';

export class FuelPriceProvider implements IFuelPriceProvider {
  /**
   * Geographic tariff database for verified launch territories.
   * Indexed by state/territory key (lowercase) -> fuel category.
   */
  private verifiedTariffs: Record<string, Record<FuelCategory, FuelPriceRecord>> = {
    chandigarh: {
      PETROL: {
        fuelType: 'PETROL',
        state: 'Chandigarh',
        city: 'Chandigarh',
        pricePerUnit: 94.24,
        unit: 'litre',
        currency: 'INR',
        source: 'Indian Oil Corporation Ltd (IOCL)',
        verifiedAt: '2024-05-01T06:00:00Z',
        precision: 'CITY',
      },
      DIESEL: {
        fuelType: 'DIESEL',
        state: 'Chandigarh',
        city: 'Chandigarh',
        pricePerUnit: 82.4,
        unit: 'litre',
        currency: 'INR',
        source: 'Indian Oil Corporation Ltd (IOCL)',
        verifiedAt: '2024-05-01T06:00:00Z',
        precision: 'CITY',
      },
      CNG: {
        fuelType: 'CNG',
        state: 'Chandigarh',
        city: 'Chandigarh',
        pricePerUnit: 87.5,
        unit: 'kg',
        currency: 'INR',
        source: 'GAIL Gas Ltd',
        verifiedAt: '2024-05-01T06:00:00Z',
        precision: 'CITY',
      },
      ELECTRICITY: {
        fuelType: 'ELECTRICITY',
        state: 'Chandigarh',
        city: 'Chandigarh',
        pricePerUnit: 8.5,
        unit: 'kWh',
        currency: 'INR',
        source: 'Chandigarh Electricity Dept Tariff Order',
        verifiedAt: '2024-04-01T00:00:00Z',
        precision: 'CITY',
      },
    },
    delhi: {
      PETROL: {
        fuelType: 'PETROL',
        state: 'Delhi',
        city: 'New Delhi',
        pricePerUnit: 94.72,
        unit: 'litre',
        currency: 'INR',
        source: 'Indian Oil Corporation Ltd (IOCL)',
        verifiedAt: '2024-05-01T06:00:00Z',
        precision: 'CITY',
      },
      DIESEL: {
        fuelType: 'DIESEL',
        state: 'Delhi',
        city: 'New Delhi',
        pricePerUnit: 87.62,
        unit: 'litre',
        currency: 'INR',
        source: 'Indian Oil Corporation Ltd (IOCL)',
        verifiedAt: '2024-05-01T06:00:00Z',
        precision: 'CITY',
      },
      CNG: {
        fuelType: 'CNG',
        state: 'Delhi',
        city: 'Delhi NCR',
        pricePerUnit: 75.09,
        unit: 'kg',
        currency: 'INR',
        source: 'Indraprastha Gas Limited (IGL)',
        verifiedAt: '2024-05-01T06:00:00Z',
        precision: 'CITY',
      },
      ELECTRICITY: {
        fuelType: 'ELECTRICITY',
        state: 'Delhi',
        pricePerUnit: 9.0,
        unit: 'kWh',
        currency: 'INR',
        source: 'Delhi Electricity Regulatory Commission (DERC) EV Schedule',
        verifiedAt: '2024-04-01T00:00:00Z',
        precision: 'STATE',
      },
    },
    punjab: {
      PETROL: {
        fuelType: 'PETROL',
        state: 'Punjab',
        pricePerUnit: 98.65,
        unit: 'litre',
        currency: 'INR',
        source: 'IOCL State Retail Price Average',
        verifiedAt: '2024-05-01T06:00:00Z',
        precision: 'STATE',
      },
      DIESEL: {
        fuelType: 'DIESEL',
        state: 'Punjab',
        pricePerUnit: 88.95,
        unit: 'litre',
        currency: 'INR',
        source: 'IOCL State Retail Price Average',
        verifiedAt: '2024-05-01T06:00:00Z',
        precision: 'STATE',
      },
      CNG: {
        fuelType: 'CNG',
        state: 'Punjab',
        pricePerUnit: 89.0,
        unit: 'kg',
        currency: 'INR',
        source: 'Think Gas / Gujarat Gas Regional Average',
        verifiedAt: '2024-05-01T06:00:00Z',
        precision: 'STATE',
      },
      ELECTRICITY: {
        fuelType: 'ELECTRICITY',
        state: 'Punjab',
        pricePerUnit: 8.8,
        unit: 'kWh',
        currency: 'INR',
        source: 'Punjab State Power Corporation (PSPCL) EV Tariff Schedule',
        verifiedAt: '2024-04-01T00:00:00Z',
        precision: 'STATE',
      },
    },
    haryana: {
      PETROL: {
        fuelType: 'PETROL',
        state: 'Haryana',
        pricePerUnit: 95.28,
        unit: 'litre',
        currency: 'INR',
        source: 'IOCL State Retail Price Average',
        verifiedAt: '2024-05-01T06:00:00Z',
        precision: 'STATE',
      },
      DIESEL: {
        fuelType: 'DIESEL',
        state: 'Haryana',
        pricePerUnit: 88.14,
        unit: 'litre',
        currency: 'INR',
        source: 'IOCL State Retail Price Average',
        verifiedAt: '2024-05-01T06:00:00Z',
        precision: 'STATE',
      },
      CNG: {
        fuelType: 'CNG',
        state: 'Haryana',
        pricePerUnit: 82.5,
        unit: 'kg',
        currency: 'INR',
        source: 'Haryana City Gas Distribution Schedule',
        verifiedAt: '2024-05-01T06:00:00Z',
        precision: 'STATE',
      },
      ELECTRICITY: {
        fuelType: 'ELECTRICITY',
        state: 'Haryana',
        pricePerUnit: 8.7,
        unit: 'kWh',
        currency: 'INR',
        source: 'UHBVN / DHBVN EV Charging Schedule',
        verifiedAt: '2024-04-01T00:00:00Z',
        precision: 'STATE',
      },
    },
    'himachal pradesh': {
      PETROL: {
        fuelType: 'PETROL',
        state: 'Himachal Pradesh',
        pricePerUnit: 95.74,
        unit: 'litre',
        currency: 'INR',
        source: 'IOCL State Retail Price Average',
        verifiedAt: '2024-05-01T06:00:00Z',
        precision: 'STATE',
      },
      DIESEL: {
        fuelType: 'DIESEL',
        state: 'Himachal Pradesh',
        pricePerUnit: 87.48,
        unit: 'litre',
        currency: 'INR',
        source: 'IOCL State Retail Price Average',
        verifiedAt: '2024-05-01T06:00:00Z',
        precision: 'STATE',
      },
      CNG: {
        fuelType: 'CNG',
        state: 'Himachal Pradesh',
        pricePerUnit: 92.0,
        unit: 'kg',
        currency: 'INR',
        source: 'HP Regional Gas Distribution',
        verifiedAt: '2024-05-01T06:00:00Z',
        precision: 'STATE',
      },
      ELECTRICITY: {
        fuelType: 'ELECTRICITY',
        state: 'Himachal Pradesh',
        pricePerUnit: 7.9,
        unit: 'kWh',
        currency: 'INR',
        source: 'HPSEBL Public Charging Tariff Order',
        verifiedAt: '2024-04-01T00:00:00Z',
        precision: 'STATE',
      },
    },
  };

  /**
   * Resolves fuel price by geographic region and fuel category.
   */
  async getFuelPrice(query: FuelPriceQuery): Promise<FuelPriceRecord | null> {
    const rawState = (query.state || 'chandigarh').trim().toLowerCase();
    const tariffForState = this.verifiedTariffs[rawState];

    if (tariffForState && tariffForState[query.fuelType]) {
      const record = tariffForState[query.fuelType];
      return {
        ...record,
        isHistoricalBaseline: true,
        provenanceNote: 'Historical reference baseline (May 2024)',
      };
    }

    return null;
  }
}

export const fuelPriceProvider = new FuelPriceProvider();
