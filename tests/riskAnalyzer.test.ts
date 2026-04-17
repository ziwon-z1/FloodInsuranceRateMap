import { describe, it, expect } from '@jest/globals';
import { evaluateFloodRisk } from '../src/riskAnalyzer';
import { RiskZone, Parcel, Floodzone } from '../src/types';

describe('Risk Analyzer Module: evaluateFloodRisk', () => {
  
  // Helpers to keep our test setup clean and readable
  const createBox = (minX: number, minY: number, maxX: number, maxY: number) => ({ minX, minY, maxX, maxY });
  
  const createParcel = (id: string, minX: number, minY: number, maxX: number, maxY: number): Parcel => ({
    id,
    bounds: createBox(minX, minY, maxX, maxY)
  });

  const createZone = (type: RiskZone, minX: number, minY: number, maxX: number, maxY: number): Floodzone => ({
    type,
    bounds: createBox(minX, minY, maxX, maxY)
  });

  it('should assign the correct zone when a parcel overlaps with a single floodzone', () => {
    const parcels = [createParcel('1', 5, 5, 10, 10)];
    const zones = [createZone('X', 0, 0, 20, 20)];

    const result = evaluateFloodRisk(parcels, zones);

    expect(result.length).toBe(1);
    expect(result[0].parcelId).toBe('1');
    expect(result[0].riskiestZone).toBe('X');
  });

  it('should assign the riskiest zone (VE) when a parcel overlaps multiple zones including VE', () => {
    const parcels = [createParcel('1', 5, 5, 15, 15)];
    const zones = [
      createZone('X', 0, 0, 20, 20),   // Base zone
      createZone('AE', 0, 0, 15, 15),  // Riskier
      createZone('VE', 0, 0, 10, 10)   // Riskiest
    ];

    const result = evaluateFloodRisk(parcels, zones);

    expect(result.length).toBe(1);
    expect(result[0].riskiestZone).toBe('VE');
  });

  it('should assign the riskiest zone (AE) when overlapping AE and X, but not VE', () => {
    const parcels = [createParcel('1', 5, 5, 15, 15)];
    const zones = [
      createZone('X', 0, 0, 20, 20),
      createZone('AE', 0, 0, 10, 10)
      // Notice there is no VE zone here
    ];

    const result = evaluateFloodRisk(parcels, zones);

    expect(result.length).toBe(1);
    expect(result[0].riskiestZone).toBe('AE');
  });

  it('should omit parcels from the output if they do not overlap with any floodzones', () => {
    const parcels = [
      createParcel('1', 0, 0, 5, 5),     // Will overlap
      createParcel('2', 50, 50, 60, 60)  // Way outside the zone
    ];
    const zones = [createZone('AE', 0, 0, 20, 20)];

    const result = evaluateFloodRisk(parcels, zones);

    // Only Parcel 1 should be returned
    expect(result.length).toBe(1);
    expect(result[0].parcelId).toBe('1');
  });

  it('should handle an empty list of floodzones safely', () => {
    const parcels = [createParcel('1', 0, 0, 5, 5)];
    const zones: Floodzone[] = [];

    const result = evaluateFloodRisk(parcels, zones);

    expect(result.length).toBe(0);
  });


});