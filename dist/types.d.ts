/**
 * Represents a discrete coordinate on the 2D plane.
 */
export interface Coordinate {
    x: number;
    y: number;
}
/**
 * Represents the axis-aligned boundaries of a rectangle.
 * Extracted from the 4 coordinates provided in the input file.
 */
export interface BoundingBox {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
}
/**
 * The allowed flood zone classifications, ensuring no invalid zones
 * can be assigned or processed. Like "ZE" .
 */
export type RiskZone = 'X' | 'AE' | 'VE';
/**
 * Represents a parsed Floodzone instruction.
 */
export interface Floodzone {
    type: RiskZone;
    bounds: BoundingBox;
}
/**
 * Represents a parsed Parcel instruction.
 */
export interface Parcel {
    id: string;
    bounds: BoundingBox;
}
/**
 * Maps a parcel to its highest calculated risk zone.
 */
export interface ParcelRiskResult {
    parcelId: string;
    riskiestZone: RiskZone;
}
//# sourceMappingURL=types.d.ts.map