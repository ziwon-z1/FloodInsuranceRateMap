# FEMA Flood Zone Risk Classifier

A command-line tool built in TypeScript that determines the applicable flood insurance risk zones for property parcels based on FEMA Flood Insurance Rate Maps (FIRMs). Given a list of rectangular flood-zones and parcels, it determines the riskiest zone each parcel overlaps and prints the insurance classification. Zones are ranked from highest to lowest risk as: **VE → AE → X**.

#### Prerequisites
- **Node.js**: v18.0.0 or higher recommended.
- **npm**: v8.0.0 or higher.

#### Installation
1. Unzip the project directory and navigate into it via your terminal:
   ```bash
   cd forerunner-cli

2. Install the necessary dependencies (TypeScript, Jest, and type definitions):

   Bash

   ```bash
   npm install
   ```

#### Project Structure

```txt
forerunner-flood/
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── index.ts          # CLI entry point
│   ├── parser.ts         # Input file parsing
│   ├── geometry.ts       # Rectangle overlap math
│   ├── riskAnalyzer.ts   # Risk ranking & analysis
│   └── types.ts          # Shared TypeScript interfaces
└── tests/
    ├── geometry.test.ts
    ├── riskAnalyzer.test.ts
```

#### Running the Application

You can execute the application in two different ways depending on your needs. Ensure you have an `input.txt` file ready in the root directory.

1. **Option A — run directly with ts-node (no build step):**

   ```bash
   npx ts-node src/index.ts input.txt
   ```

   **Option B — compile to JavaScript, then run:**

   ```bash
   npm run build
   node dist/index.js input.txt
   ```

#### Running the Tests

This project uses **Jest** for automated unit testing. The test suite covers both the geometric overlap math and the business logic for risk ranking.

To run the test suite:

```bash
npm test
```

This runs Jest across all `tests/*.test.ts` files:

- `tests/geometry.test.ts` — rectangle-overlap math
- `tests/riskAnalyzer.test.ts` — risk ranking, zone selection

## Technical Decisions & Architecture

Below is a breakdown of the core technical decisions made while building this application:

#### 1. The `BoundingBox` Abstraction

The instructions guarantee that coordinates are provided in a clockwise order starting from the bottom-left. Instead of storing and iterating over all four points, the parser instantly extracts only the bottom-left (`minX`, `minY`) and top-right (`maxX`, `maxY`) coordinates to create a `BoundingBox`. This vastly simplifies the downstream geometry logic and reduces memory overhead. 

#### 2. Negative Space Intersection Logic

When determining if a parcel and a flood-zone overlap, the `doRectanglesOverlap` function does not attempt to calculate <u>the shared area</u>. Instead, it checks if the two boxes are *strictly separated* on either the X-axis or the Y-axis. If they are completely separated on either axis, they cannot overlap. If they are not separated, they must be overlapping. This approach is highly efficient ($O(1)$ constant time per check).

#### 3. Numeric Risk Weighting

To comply with the rule that a parcel overlapping multiple zones adopts the *riskiest* zone, I mapped the Riskzone type to numeric weights (`X`: 1, `AE`: 2, `VE`: 3). This allowed the risk comparison logic to use simple mathematical greater-than operations rather than a convoluted chain of `if/else` string comparisons.

#### 4. Early Exit Optimization

If a parcel is evaluated against a `VE` zone and registers an overlap, the program immediately `break`s out of the inner loop for that parcel. Because `VE` is the highest possible risk, there is no mathematical need to check the remaining floodzones, saving computational cycles.

#### 5. Separation of Concerns

The application is strictly modularized into:

- `types.ts`: The data contracts (Interfaces and types).
- `parser.ts`: File I/O and string extraction.
- `geometry.ts`: Pure mathematical logic.
- `riskAnalyzer.ts`: Business rules and domain logic.
- `index.ts`: The CLI entry point that wires the modules together.

This structure ensures that the geometry logic can be tested entirely independently of the file-reading logic.

### Future Optimization and Industrialization

Some reflections upon working on this project: 

1. Scaling to City-Level & complex geometry 

   - **Spatial Indexing**: Time complexity being $O(P\times Z)$ ($P$ #parcels, $Z$ #flood-zones). If this grows into a city-scale map where there are a million flood zones and ten million parcels, I think of using **R-Tree** which dynamically groups nearby polygons <u>(flood zones aren't always rectangles)</u> into larger, overarching bounding boxes. When checking a parcel, we check the paint bounding box first. If it misses, you instantly rule out thousands of zones inside it in $O(\log Z)$ time. 
   - **Irregular Shapes**: If zones are polygons, calculating the shared area is expensive. I think of a standard strategy is a two-phase approach: do a simple rectangle -overlap check first around a complex polygon. If overlaps, then runaway precise algorithm like the Separating Axis Three or a Ray-Casting algorithm to see it the actual geometric lines intersect. 
   - **Union Type over Enums**: While dealing with large-scale dataset, our parcel and flood zone data is likely coming from an external source like a database, a REST API, or a parsed CSV/GeoJSON file. With Union type, we have no need to import to every files it is used,  better test readability and API/JSON compatibility, and no runtime overhead. 
   - **Non-blocking/ Non-sequential**:  If this is a web server, switch to async `parseInputFile`. We would handle `Promise` and add test module and debug methods for background behaviors. 	

2. Domain Modeling:  The Multi-Hazard Risk Complex

   If we want to track mountain fires ( windward/leeward ), avalanches, and earthquakes , the `Parcel` model needs to evolve from simple geometry into a complex topological node.

   - **Topography & Wind:** we would need to pull in a Digital Elevation Model (DEM). To determine if a house is sheltered from prevailing winds, you calculate the *aspect* (the compass direction the slope faces) and use the dot product between the slope's normal vector and the wind vector.
   - **The Risk Complex Score:** Instead of just outputting `VE`, an industrial system calculates a weighted composite matrix. For example: `Total Risk = (FloodLevel * 0.4) + (FireRisk * 0.4) + (QuakeFactor * 0.2)`. 

3.  Data Integrity & TypeScript Robustness

   - **Coordinate Ordering:** If coordinates aren't clockwise, a simple Convex Hull algorithm (like a Graham Scan) or sorting the points by their angle relative to the shape's centroid will mathematically force them into a clockwise polygon.
   - **Type Safety**: I treat simple data as objects (like Coordinates). In stead of operates on raw strings, this improvement in data modeling operates on domain objects (`{x,y}`).  The time the data reaches `parseBoundingBox`, it has already been validated and structured. This prevents the "logic leak" where every function needs to know how to parse a string.

   - **Immutability:** Using the `readonly` modifier on the interfaces (e.g., `readonly bounds: BoundingBox`) could be a good TypeScript improvement. Once the parser builds a parcel, the analyzer cannot accidentally mutate its coordinates.
   - **Strictness during Dev:** Keep `"strict": true` and `"noImplicitAny": true` permanently on. They force me to write good code. However, I can temporarily set `"noUnusedLocals": false` while drafting logic so the compiler doesn't yell at you for variables you just haven't finished using yet.

4. I/O Resilience & Real-World Optimizations

   - **I/O Edge Cases:** If the file doesn't exist, checking `fs.existsSync(filePath)` before reading prevents a hard crash. If the user passes a URL (e.g., `https://api.fema.gov/map.txt`), the script could detect the `http` prefix and dynamically switch from `fs.readFileSync` to the native `fetch()` API.
   - **The VE Early Exit:** `VE` zones are rare in real life, meaning the `break` statement rarely fires in the real world. In a production environment, we would optimize by sorting the flood-zones by risk first, checking the `VE` zones, then `AE`, then `X`.

#### AI Usage Note

Artificial Intelligence was leveraged during the development of this project in the following ways:

- **Architectural Brainstorming:** Used AI to discuss and validate the optimal file structure and module separation for a pure TypeScript CLI application. 
- **Testing Scaffolding:** Used AI to determine the optimal testing framework (Jest) for this specific stack and to help generate the configuration files (`tsconfig.json` and `jest.config.js`) necessary to test TypeScript without manual compilation steps.
- **Code Generation & Review:** Leveraged AI as a pair-programmer to draft boilerplate TypeScript interfaces and test cases. All AI-generated code was actively reviewed, refactored, and tested to ensure it met standard software engineering best practices, such as ensuring correct runtime environment targets and eliminating unnecessary dependencies.



