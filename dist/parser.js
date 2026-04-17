"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseInputFile = parseInputFile;
exports.parseCoordinates = parseCoordinates;
const fs = __importStar(require("fs"));
/**
 * Extracts a BoundingBox from an array of 4 coordinate strings.
 */
function parseBoundingBox(coords) {
    // Extract the bottom-left coordinate
    //   if (coords.length < 4 || !coords[0] || !coords[2]) {
    //     throw new Error(`Invalid bounding box coords: ${JSON.stringify(coords)}`);
    //   }  // maintain lightweight parsing. by input assumption. 
    const [minX, minY] = [coords[0].x, coords[0].y];
    // Extract the top-right coordinate
    const [maxX, maxY] = [coords[2].x, coords[2].y]; // again, well-formed, clockwise input.
    //   if ([minX, minY, maxX, maxY].some((n) => Number.isNaN(n))) {
    //     throw new Error(`Non-numeric coordinate in: ${JSON.stringify(coords)}`);
    //   }     // maintain lightweight parsing.
    return { minX, minY, maxX, maxY }; //   "noUncheckedIndexedAccess": false, by input assumption
}
/**
 * Reads and parses the input file into structured Floodzone and Parcel arrays.
 */
function parseInputFile(filePath) {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.split('\n');
    const floodzones = [];
    const parcels = [];
    for (const line of lines) {
        const trimmedLine = line.trim();
        // trailing newlines or empty lines could cause issues if not handled
        if (!trimmedLine)
            continue;
        const parts = trimmedLine.split(' ');
        const instruction = parts[0];
        if (instruction === 'FLOODZONE') {
            const type = parts[1];
            const coordStrings = parts.slice(2, 6);
            floodzones.push({
                type,
                bounds: parseBoundingBox(coordStrings.map(parseCoordinates))
            });
        }
        else if (instruction === 'PARCEL') {
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
function parseCoordinates(coordStr) {
    const [x, y] = coordStr.split(',').map(Number);
    return { x, y };
}
//# sourceMappingURL=parser.js.map