import { Parcel, Floodzone, ParcelRiskResult, RiskZone } from './types';
import { doRectanglesOverlap } from './geometry';

/**
 * Maps risk zones to a numeric value to easily calculate the "maximum" risk.
 * Higher number = higher risk.
 */
const RISK_WEIGHTS: Record<RiskZone, number> = {
    X: 1,
    AE: 2,
    VE: 3
};

/**
 * Compares two risk zones and returns the one with the higher risk profile.
 */
function getRiskiestZone(zoneA: RiskZone, zoneB: RiskZone): RiskZone {
  return RISK_WEIGHTS[zoneA] > RISK_WEIGHTS[zoneB] ? zoneA : zoneB;
}

/**
 * Evaluates all parcels against all floodzones to determine the applicable insurance rate.
 */
export function evaluateFloodRisk(parcels: Parcel[], floodzones: Floodzone[]): ParcelRiskResult[] {
  const results: ParcelRiskResult[] = [];

  for (const parcel of parcels) {
    let maxRiskForParcel: RiskZone | null = null; // Start with null, no risk found yet.

    for (const zone of floodzones) {
      if (doRectanglesOverlap(parcel.bounds, zone.bounds)) {
        
        // If it's the first intersection found, set it.
        // Otherwise, compare it with the current max risk and keep the riskiest.
        if (maxRiskForParcel === null) {
          maxRiskForParcel = zone.type;
        } else {
          maxRiskForParcel = getRiskiestZone(maxRiskForParcel, zone.type);
        }
        
        // Optimization: If we hit a VE zone, we can stop checking other zones for this parcel 
        // because VE is the absolute maximum risk.
        if (maxRiskForParcel === 'VE') {
          break; 
        }
      }
    }

    // If the parcel does not overlap with any floodzones, it is omitted from the results as case 1 output. 
    if (maxRiskForParcel !== null) {
      results.push({
        parcelId: parcel.id,
        riskiestZone: maxRiskForParcel
      });
    }
  }

  return results;
}