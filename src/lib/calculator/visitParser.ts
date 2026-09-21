/**
 * HIDDEN INDIA — DESTINATION VISIT DATA PARSER
 * Extracts honest cost components from DestinationVisitInfo records.
 * STRICT: Distinguishes FREE from UNKNOWN; never converts missing data into zero.
 */

import { DestinationVisitInfo } from '../db/schema';
import { CostComponentInput } from './types';

export function parseDestinationVisitCosts(visitInfo: DestinationVisitInfo | null): {
  entryFee: CostComponentInput;
  parking: CostComponentInput;
} {
  // 1. Entry Fee Parsing
  let entryFee: CostComponentInput = { status: 'UNKNOWN' };

  if (visitInfo && visitInfo.entryFee) {
    const rawFee = visitInfo.entryFee.trim().toLowerCase();
    if (visitInfo.feeType === 'free' || rawFee.includes('free') || rawFee === 'nil' || rawFee === '0') {
      entryFee = {
        status: 'FREE',
        amount: 0,
        label: 'Free entry',
        verifiedAt: visitInfo.verifiedAt ? new Date(visitInfo.verifiedAt).toISOString() : undefined,
      };
    } else {
      // Extract first numeric rupee figure if present
      const match = rawFee.match(/(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d+)?)/i);
      if (match && match[1]) {
        const parsedAmount = parseFloat(match[1]);
        if (!isNaN(parsedAmount) && parsedAmount >= 0) {
          entryFee = {
            status: 'KNOWN_AMOUNT',
            amount: parsedAmount,
            label: visitInfo.entryFee,
            verifiedAt: visitInfo.verifiedAt ? new Date(visitInfo.verifiedAt).toISOString() : undefined,
          };
        }
      } else {
        // Text exists but no clean single number can be assumed
        entryFee = {
          status: 'UNKNOWN',
          label: visitInfo.entryFee,
        };
      }
    }
  }

  // 2. Parking Parsing
  let parking: CostComponentInput = { status: 'UNKNOWN' };

  if (visitInfo && visitInfo.parkingInformation) {
    const rawParking = visitInfo.parkingInformation.trim().toLowerCase();
    if (rawParking.includes('free') || rawParking.includes('no charge') || rawParking.includes('open roadside')) {
      parking = {
        status: 'FREE',
        amount: 0,
        label: 'Free parking',
      };
    } else {
      const match = rawParking.match(/(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d+)?)/i);
      if (match && match[1]) {
        const parsedAmount = parseFloat(match[1]);
        if (!isNaN(parsedAmount) && parsedAmount >= 0) {
          parking = {
            status: 'KNOWN_AMOUNT',
            amount: parsedAmount,
            label: visitInfo.parkingInformation,
          };
        }
      } else {
        parking = {
          status: 'UNKNOWN',
          label: visitInfo.parkingInformation,
        };
      }
    }
  }

  return { entryFee, parking };
}
