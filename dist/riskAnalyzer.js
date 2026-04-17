"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateFloodRisk = evaluateFloodRisk;
const geometry_1 = require("./geometry");
/**
 * Maps risk zones to a numeric value to easily calculate the "maximum" risk.
 * Higher number = higher risk.
 */
const RISK_WEIGHTS = {
    X: 1,
    AE: 2,
    VE: 3
};
/**
 * Compares two risk zones and returns the one with the higher risk profile.
 */
function getRiskiestZone(zoneA, zoneB) {
    return RISK_WEIGHTS[zoneA] > RISK_WEIGHTS[zoneB] ? zoneA : zoneB;
}
/**
 * Evaluates all parcels against all floodzones to determine the applicable insurance rate.
 */
function evaluateFloodRisk(parcels, floodzones) {
    const results = [];
    for (const parcel of parcels) {
        let maxRiskForParcel = null; // Start with null, no risk found yet.
        for (const zone of floodzones) {
            if ((0, geometry_1.doRectanglesOverlap)(parcel.bounds, zone.bounds)) {
                // If it's the first intersection found, set it.
                // Otherwise, compare it with the current max risk and keep the riskiest.
                if (maxRiskForParcel === null) {
                    maxRiskForParcel = zone.type;
                }
                else {
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
//# sourceMappingURL=riskAnalyzer.js.map