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
const process = __importStar(require("process"));
const parser_1 = require("./parser");
const riskAnalyzer_1 = require("./riskAnalyzer");
function main() {
    // 1. Grab the command line arguments
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.error('Error: Please provide an input file path.');
        console.error('Usage: npm start <path-to-file>');
        process.exit(1);
    }
    const filePath = args[0];
    try {
        // 2. Parse the input file into structured data
        const { floodzones, parcels } = (0, parser_1.parseInputFile)(filePath);
        // 3. Pass the data to the business logic
        const results = (0, riskAnalyzer_1.evaluateFloodRisk)(parcels, floodzones);
        // 4. Format and print the exact STDOUT string required
        for (const result of results) {
            console.log(`Parcel ${result.parcelId} should be insured against a ${result.riskiestZone} zone`);
        }
    }
    catch (error) {
        // 5. Catch any unexpected file reading or parsing errors
        console.error('An error occurred while processing the file:', error.message);
        process.exit(1);
    }
}
// Execute the function
main();
//# sourceMappingURL=index.js.map