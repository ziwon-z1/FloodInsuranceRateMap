import * as fs from 'fs';
import { RiskZone, Floodzone, Parcel, BoundingBox, Coordinate } from './types';

/**
 * Extracts a BoundingBox from an array of 4 coordinate strings.
 */
function parseBoundingBox(coords: Coordinate[]): BoundingBox {
  // Extract the bottom-left coordinate
//   if (coords.length < 4 || !coords[0] || !coords[2]) {
//     throw new Error(`Invalid bounding box coords: ${JSON.stringify(coords)}`);
//   }  // maintain lightweight parsing. by input assumption. 
  const [minX, minY] = [coords[0].x, coords[0].y];   
  
  // Extract the top-right coordinate
  const [maxX, maxY] = [coords[2].x, coords[2].y];   // again, well-formed, clockwise input.

//   if ([minX, minY, maxX, maxY].some((n) => Number.isNaN(n))) {
//     throw new Error(`Non-numeric coordinate in: ${JSON.stringify(coords)}`);
//   }     // maintain lightweight parsing.

  return { minX, minY, maxX, maxY };   //   "noUncheckedIndexedAccess": false, by input assumption
}

/**
 * Reads and parses the input file into structured Floodzone and Parcel arrays.
 */
export function parseInputFile(filePath: string): { floodzones: Floodzone[], parcels: Parcel[] } { // could add asynchronous
  const fileContent = fs.readFileSync(filePath, 'utf-8');   
  const lines = fileContent.split('\n');

  const floodzones: Floodzone[] = [];
  const parcels: Parcel[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // trailing newlines or empty lines could cause issues if not handled
    if (!trimmedLine) continue; 

    const parts = trimmedLine.split(' ');
    const instruction = parts[0];

    if (instruction === 'FLOODZONE') {
      const type = parts[1] as RiskZone;
      const coordStrings = parts.slice(2, 6);
      
      floodzones.push({
        type,
        bounds: parseBoundingBox(coordStrings.map(parseCoordinates))
      });
    } else if (instruction === 'PARCEL') {
      const id = parts[1];
      const coordStrings = parts.slice(2, 6);

      parcels.push({
        id,
        bounds: parseBoundingBox(coordStrings.map(parseCoordinates))
      });
    }
  }
  return { floodzones, parcels };
}

export function parseCoordinates(coordStr: string): Coordinate {  //add type safety. 
  const [x, y] = coordStr.split(',').map(Number);
  return { x, y };
}