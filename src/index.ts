import * as process from 'process';
import { parseInputFile } from './parser';
import { evaluateFloodRisk } from './riskAnalyzer';

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
    const { floodzones, parcels } = parseInputFile(filePath);

    // 3. Pass the data to the business logic
    const results = evaluateFloodRisk(parcels, floodzones);

    // 4. Format and print the exact STDOUT string required
    for (const result of results) {
      console.log(`Parcel ${result.parcelId} should be insured against a ${result.riskiestZone} zone`);
    }
    
  } catch (error) {
    // 5. Catch any unexpected file reading or parsing errors
    console.error('An error occurred while processing the file:', (error as Error).message);
    process.exit(1);
  }
}

// Execute the function
main();