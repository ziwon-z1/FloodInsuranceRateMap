import type { BoundingBox } from './types';

/**
 * Evaluates whether two bounding boxes overlap in a 2D plane.
 * * @param box1 The first bounding box (e.g., a Parcel)
 * @param box2 The second bounding box (e.g., a Floodzone)
 * @returns boolean True if they overlap, false otherwise
 */


export function doRectanglesOverlap(box1: BoundingBox, box2: BoundingBox): boolean {
  // Check horizontal separation:
  // Is box1 completely to the left of box2, or is box2 completely to the left of box1?
  const isSeparatedHorizontally = box1.maxX <= box2.minX || box2.maxX <= box1.minX;  // thanks for no fractional pixel intersection

  // Check vertical separation (y-axis goes bottom to top):
  // Is box1 completely below box2, or is box2 completely below box1?
  const isSeparatedVertically = box1.maxY <= box2.minY || box2.maxY <= box1.minY;
  return !(isSeparatedHorizontally || isSeparatedVertically);
}