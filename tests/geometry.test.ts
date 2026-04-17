import { describe, it, expect } from '@jest/globals';
import { doRectanglesOverlap } from '../src/geometry';
import { BoundingBox } from '../src/types';

describe('Geometry Module: doRectanglesOverlap', () => {
  
  // Helper function to quickly generate a BoundingBox for testing
  const createBox = (minX: number, minY: number, maxX: number, maxY: number): BoundingBox => {
    return { minX, minY, maxX, maxY };
  };

  describe('When rectangles OVERLAP', () => {
    it('should return true for a standard partial intersection', () => {
      const box1 = createBox(0, 0, 10, 10);
      const box2 = createBox(5, 5, 15, 15);
      expect(doRectanglesOverlap(box1, box2)).toBe(true);
    });

    it('should return true when one box is completely inside the other', () => {
      const largeBox = createBox(0, 0, 20, 20);
      const smallBox = createBox(5, 5, 10, 10);
      expect(doRectanglesOverlap(largeBox, smallBox)).toBe(true);
      // Test reverse order just to be safe
      expect(doRectanglesOverlap(smallBox, largeBox)).toBe(true); 
    });

    it('should return true for a cross-shape intersection', () => {
      const horizontalBox = createBox(0, 5, 20, 10);
      const verticalBox = createBox(5, 0, 10, 20);
      expect(doRectanglesOverlap(horizontalBox, verticalBox)).toBe(true);
    });
  });

  describe('When rectangles DO NOT overlap', () => {
    it('should return false when separated completely on the X-axis (left/right)', () => {
      const box1 = createBox(0, 0, 10, 10);
      const box2 = createBox(15, 0, 25, 10);
      expect(doRectanglesOverlap(box1, box2)).toBe(false);
    });

    it('should return false when separated completely on the Y-axis (top/bottom)', () => {
      const box1 = createBox(0, 0, 10, 10);
      const box2 = createBox(0, 15, 10, 25);
      expect(doRectanglesOverlap(box1, box2)).toBe(false);
    });

    it('should return false when separated diagonally', () => {
      const box1 = createBox(0, 0, 10, 10);
      const box2 = createBox(15, 15, 25, 25);
      expect(doRectanglesOverlap(box1, box2)).toBe(false);
    });
  });
});