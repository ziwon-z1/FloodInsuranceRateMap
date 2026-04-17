import { Floodzone, Parcel, Coordinate } from './types';
/**
 * Reads and parses the input file into structured Floodzone and Parcel arrays.
 */
export declare function parseInputFile(filePath: string): {
    floodzones: Floodzone[];
    parcels: Parcel[];
};
export declare function parseCoordinates(coordStr: string): Coordinate;
//# sourceMappingURL=parser.d.ts.map