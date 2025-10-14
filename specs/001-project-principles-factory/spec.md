# Feature Specification: Factory/Card Planner MVP Core Loop

**Feature Branch**: `001-project-principles-factory`  
**Created**: 2025-10-14  
**Status**: Draft  
**Input**: User description: "Project principles, consolidated ideas, and MVP mechanics for the client-only Factory/Card Planner"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Compose Deterministic Production Graph (Priority: P1)

Operations planners build and run a production graph by placing nodes, assigning capacities, and connecting typed pins so the simulation can calculate hourly throughput without needing a backend.

**Why this priority**: This is the core activity that delivers value; without it the planner has no reason to exist (Vision & Scope #1, #2).

**Independent Test**: Build the reference greenhouse graph from the golden fixture, run the simulation twice with the same seed, and confirm identical KPI outputs, deterministic tick traces, and visible clamps.

**Acceptance Scenarios**:

1. **Given** a blank Zone canvas, **When** the planner adds nodes and connects only matching resource types, **Then** the system allows the connection, blocks mismatched resources, and shows configured capacities on each node with separate input/output pins per resource type.
2. **Given** a saved graph with seeded parameters, **When** the planner reloads the save and reruns the simulation, **Then** the hourly KPIs, tick hashes, and clamp badges match the baseline snapshot exactly.
3. **Given** a node capacity adjustment, **When** the planner double-clicks its edge label or node badge, **Then** the inline editor opens, the capacity can be updated, and undo/redo restores the prior value deterministically.

---

### User Story 2 - Navigate Hierarchical Spaces (Priority: P2)

Operations planners move between company, structure, room, and zone views to edit the correct part of the facility while retaining context and honoring spatial constraints.

**Why this priority**: Hierarchical navigation is required to locate the right canvas, keep budget context, and apply changes without losing place (Ideas -> Navigation & Node-Ansichten).

**Independent Test**: Start from the company overview, drill down to a specific zone, attempt to overfill the zone footprint, and verify breadcrumbs/left rail and placement feedback guide the planner back to valid canvases.

**Acceptance Scenarios**:

1. **Given** a company overview with multiple structures, **When** the planner double-clicks a structure card, **Then** the structure view opens, breadcrumbs update, and the left rail highlights the active structure with budget sparkbars visible.
2. **Given** a room that has no zones, **When** the planner opens it, **Then** the interface displays a "No zones" message and offers actions to add or exit without showing an empty canvas.
3. **Given** a zone at capacity, **When** the planner drags an additional node into the canvas, **Then** a ghost drop indicates the area limit, the placement is rejected, and breadcrumbs remain unchanged.

---

### User Story 3 - Diagnose Bottlenecks, Workforce, and Transfer Constraints (Priority: P3)

Operations planners review simulation output to understand which limits (inputs, energy, labor, maintenance, logistics) constrain throughput and decide adjustments.

**Why this priority**: Visibility into clamped resources, labor coverage, and transfer delays enables actionable tuning and aligns with principles about explaining limits (Safety & Sim Constraints #4, Workforce & Maintenance #1).

**Independent Test**: Run a scenario with undersupplied energy, constrained labor minutes, and transfer latency; observe badges, workforce panels, and KPI queues; adjust the limiting inputs and confirm clamps clear predictably.

**Acceptance Scenarios**:

1. **Given** a running simulation with insufficient energy, **When** the planner inspects the affected nodes, **Then** a clamp badge appears indicating "Energy limit" and tooltips cite the constraining edge or budget with supporting metrics.
2. **Given** labor minutes set below demand, **When** the simulation runs, **Then** throughput scales proportionally, the HR panel highlights the deficit with ops/maint/log sliders, and the workforce panel shows the deterministic allocation and resulting maintenance debt.
3. **Given** a transfer node with latency, **When** goods queue up, **Then** edge badges show queue length, the FIFO list displays ETA, and KPIs reflect the recorded arrival delays.

---

### Edge Cases

- Attempting to connect pins of different resource types must show an immediate validation error and prevent the edge from forming.
- A node that requires energy but is missing an energy input must clamp throughput to zero and explain the missing pin.
- Cyclical resource routing that would cause runaway feedback must be detected and halted with a deterministic warning before ticks execute.
- If a plugin manifest declares a conflicting `provides` identifier, the system must block loading that plugin and surface the conflict details.
- When the live graph exceeds the published tick budget, the system must degrade gauges (e.g., lower refresh frequency) while logging the overage.
- Dropping a node into a zone that exceeds the available area must show a ghost placement state and refuse the drop.
- Transfer queues must surface when latency would cause overflow or missed deliveries, prompting the planner to adjust capacity.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The planner must let users add, edit, and remove nodes, pins, and edges only when resource types match, with discrete input and output pins enforced per resource type.
- **FR-002**: The simulation must execute entirely on the client using seeded deterministic processes so that identical graphs, parameters, and seeds always produce identical KPI outputs and tick hashes.
- **FR-003**: The system must persist and reload simulation seeds with saves so planners can rerun scenarios and compare results to golden fixtures without drift.
- **FR-004**: Each simulation tick must execute the canonical order (budget scaling, source generation, processor throughput, buffer updates, transfer progression, sink settlement) and isolate side effects so hourly deltas remain stable for reference graphs.
- **FR-005**: Budget throttling must compute scale factors as the minimum of room and structure quotients (capped at 1), apply area guards as hard limits, and display any throttled state in context.
- **FR-006**: Clamp conditions (inputs, capacity, budgets, labor, maintenance, energy) must display badges and tooltips that name the limiting factor, impacted throughput, and contributing scale multipliers.
- **FR-007**: Company, structure, room, and zone views must expose breadcrumbs and a left-rail navigator that stay in sync with the active context and support direct jumps across levels while preserving budget indicators.
- **FR-008**: Simulation controls for play, pause, speed (1x, 2x, 5x, 10x), single-step, and balance indicators must remain visible and usable across all hierarchy levels.
- **FR-009**: Resource visualization must apply the defined color semantics together with shape or label redundancies so color-blind users can distinguish resources.
- **FR-010**: Workforce scheduling must deterministically allocate pooled labor minutes across ops, maintenance, and logistics according to configured weights and marginal utility, compute `laborRatio = min(allocated/required, 1)`, and degrade maintenance scale based on debt without increasing throughput.
- **FR-011**: Workforce UI must provide an HR panel at the structure level (sliders for ops/maint/log, coverage badges, maintenance debt, logistics queues, sparklines) and room/zone badges summarizing coverage and top contributors.
- **FR-012**: Optional lightweight worker agents, when enabled, must use deterministic assignment based on skills, efficiency, and fatigue without pathfinding, and default to pooled labor behavior when disabled.
- **FR-013**: Transfers between rooms or zones must run through designated transfer nodes with defined hourly capacity, latency ticks, and neutral operating costs, maintaining FIFO queues that expose quantity and ETA metrics.
- **FR-014**: Wet bud processing must convert to dry buds using a fixed 0.67 throughput factor, logging the conversion and any losses in KPI outputs.
- **FR-015**: OpEx must equal the sum of cost-per-hour across active nodes and transfers, while profit must equal total price-per-unit output minus OpEx, honoring currency-neutral presentation.
- **FR-016**: Zone placement must track occupied versus total square meters, show ghost drops for over-capacity placements, and block finalizing placements that exceed the available area.
- **FR-017**: Loading of plugins, graphs, and saves must perform schema validation; any violation must block execution and present actionable errors before the simulation starts.
- **FR-018**: Plugins must declare stable IDs, version metadata, and conflict rules (`provides`, `conflicts`, `replaces`); the system must enforce these rules and run plugin logic inside a deterministic sandbox without network access.
- **FR-019**: Save files must be portable JSON bundles that include graph topology, parameters, seed, version information, and KPI snapshots so scenarios can be shared across environments without modification.

### Key Entities *(include if feature involves data)*

- **Graph Node**: Represents a production activity with typed input/output pins, capacity settings, maintenance debt, and optional zone placement.
- **Resource Pin**: Defines a resource type, direction (input/output), and current throughput, and enforces type-safe connections with distinct sockets per type.
- **Simulation Tick**: Captures the ordered execution cycle, including seed, tick index, budget scales, throughput deltas, and resulting KPI snapshots.
- **Budget Scale**: Stores room and structure budget quotients, area guards, and resulting throttle multipliers applied each tick.
- **Labor Task**: Aggregates operational, maintenance, and logistics requirements with associated weights, allocations, and resulting ratios per tick.
- **Workforce Pool**: Stores available labor minutes, allocation priorities, maintenance debt, and resulting scales per tick; optionally references lightweight agents.
- **Transfer Node**: Describes inter-room or zone transfers with hourly capacity, latency ticks, operating cost, and associated FIFO queues.
- **Transfer Queue**: Maintains ordered shipments with quantity, enqueue tick, projected arrival tick, and current status for UI display.
- **Location Context**: Encodes the Company -> Structure -> Room -> Zone hierarchy, including labels, geolocation metadata, navigation state, and area bounds.
- **Plugin Manifest**: Describes contributed resources, node types, UI panels, versioning, and declared conflicts for validation.
- **Save Package**: Bundles graph data, simulation parameters, seed, KPI snapshots, and version stamps for portability.

## Data Snapshot *(illustrative)*

```json
{
  "company": {
    "id": "company.greenhouse",
    "name": "North Loop Green",
    "funds": 100000,
    "seed": 1337,
    "structures": [
      {
        "id": "str-1",
        "name": "Site A",
        "lat": 52.52,
        "lon": 13.40,
        "budgets": {
          "maxArea_m2": 200,
          "gridCapacity_kW": 150,
          "waterMain_Lph": 1000,
          "exhaust_m3ph": 5000
        },
        "laborPoolMinutesPerHour": 240,
        "laborWeights": {
          "ops": 0.6,
          "maint": 0.3,
          "log": 0.1
        },
        "rooms": [
          {
            "id": "room-veg",
            "structureId": "str-1",
            "name": "Propagation",
            "purpose": "Veg",
            "floor": 1,
            "budgets": {
              "roomArea_m2": 40,
              "roomGrid_kW": 50,
              "roomWater_Lph": 300,
              "roomExhaust_m3ph": 1200
            },
            "hasZones": true,
            "zones": [
              {
                "id": "zone-a",
                "roomId": "room-veg",
                "name": "Veg Bed A",
                "zoneArea_m2": 20,
                "nodes": [
                  {
                    "id": "node.energy-source",
                    "type": "energy_source",
                    "pins": {
                      "outputs": [
                        {
                          "id": "node.energy-source.energy-out",
                          "resource": "energy",
                          "capacityPerHour": 60
                        }
                      ]
                    },
                    "costPerHour": 105
                  },
                  {
                    "id": "node.veg-rack",
                    "type": "veg_processor",
                    "pins": {
                      "inputs": [
                        {
                          "id": "node.veg-rack.energy-in",
                          "resource": "energy",
                          "capacityPerHour": 50
                        },
                        {
                          "id": "node.veg-rack.water-in",
                          "resource": "water",
                          "capacityPerHour": 40
                        }
                      ],
                      "outputs": [
                        {
                          "id": "node.veg-rack.wet-buds-out",
                          "resource": "wet_buds",
                          "capacityPerHour": 30
                        }
                      ]
                    },
                    "laborPerHour": 30,
                    "costPerHour": 55,
                    "wearRatePerHour": 2,
                    "maintDebtMax": 25
                  }
                ],
                "edges": [
                  {
                    "id": "edge.zone-a.energy",
                    "fromPin": "node.energy-source.energy-out",
                    "toPin": "node.veg-rack.energy-in",
                    "resource": "energy",
                    "capacityPerHour": 50
                  },
                  {
                    "id": "edge.zone-a.irrigation",
                    "fromPin": "structure.str-1.water-main",
                    "toPin": "node.veg-rack.water-in",
                    "resource": "water",
                    "capacityPerHour": 40
                  }
                ],
                "transfers": [
                  {
                    "id": "transfer.zone-a.to-drying",
                    "capacityPerHour": 20,
                    "latencyTicks": 1,
                    "resource": "wet_buds",
                    "costPerHour": 8,
                    "queue": [
                      {
                        "quantity": 6,
                        "enqueuedTick": 24,
                        "etaTick": 25
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
```
## Assumptions

- MVP targets single-user desktop sessions with no server synchronization or telemetry.
- Baseline performance testing uses graphs up to 150 nodes and 300 edges, with graceful degradation guidance above 200 nodes or 400 edges.
- Resource color assignments follow the provided palette and are documented for planners; energy uses a bright yellow (#FACC15) with bolt iconography, water uses a vivid blue (#3B82F6) with humidity_low iconography, nutrients use a cyan (#22D3EE) with science iconography, biomass uses a saturated green (#22C55E) with eco iconography, wet buds use a violet (#8B5CF6) with nature iconography, dry buds use a saturated pink (#EC4899) with cannabis iconography, funds use a muted zinc (#D4D4D8) with payments iconography, workforce uses a bold red (#EF4444) with settings iconography, compost uses an earthy lime (#84CC16) with compost iconography, and trash uses a dark amber (#92400E) with delete iconography, all reinforced with shape/label redundancies.
- Optional Level 2 workforce agents will ship as a follow-on slice; MVP defaults to pooled labor unless the toggle is enabled for testing.
- Golden fixtures will be maintained for at least one representative company, structure, and zone to anchor regression tests and expose deterministic tick traces.
- OpEx and profit outputs remain unit-neutral and avoid references to real-world currencies or symbols.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of regression runs on golden fixture graphs produce identical KPI hashes and tick order traces across three consecutive executions, confirming deterministic behavior.
- **SC-002**: In usability sessions, 90% of planners complete the core graph-building scenario (User Story 1) within 5 minutes without facilitator intervention.
- **SC-003**: During bottleneck diagnosis tests, 95% of participants correctly identify the top limiting factor within 30 seconds of the clamp appearing.
- **SC-004**: Performance benchmarks show the simulation processes at least 95% of ticks for the 150-node reference graph within the published tick budget, with the system documenting any degradations applied.
- **SC-005**: Accessibility audits confirm that all resource types remain distinguishable using color-blind safe palettes plus shape/label redundancies, meeting WCAG 2.1 contrast requirements.
- **SC-006**: Workforce allocation tests confirm that identical inputs produce the same ops/maint/log minute distributions across three runs and that maintenance debt never increases throughput, meeting deterministic labor scheduling expectations.
- **SC-007**: Transfer stress tests show FIFO queues accurately predict arrival ETAs within +/-1 tick for 95% of shipments and surface latency KPIs to planners.

## Plugin System Overview

**Goal**: Enable every extension across resources, node types, markets, and UI slices to ship as deterministic, sandboxed plugins with optional logic modules.

### Packaging

- Plugins ship as folders or `.wbmod` archives containing `plugin.manifest.json` with `id`, semantic `version`, `wbSpecVersion`, declared contributions, permissions, and a `deterministic` flag.

### Declarative Contributions

- Resources, node types, markets, and UI slices are defined via JSON schemas and validated on load.
- The formula DSL lets node authors express behavior with operands such as `in.*`, `capacityPerHour`, `scale.*`, `params.*`, and `actual.*`, combining operators like `+`, `-`, `*`, `/`, `min`, `max`, and `clamp` while remaining acyclic.

### Deterministic Logic Interface (optional)

- DLI modules (ES modules or WASM) run in sandbox workers and expose `computeNode(ctx)` and `inspectNode(ctx)` functions that must remain pure.
- No network access or unseeded randomness; random streams come from `ctx` and respect the simulation seed, and watchdog timers enforce execution budgets.

### Registry & Conflict Rules

- The registry loads plugins in a stable order (core, official, then user) and honours `provides`, `conflicts`, and `replaces` metadata, halting load on duplicate IDs without a resolution rule.

### Migration & Developer Workflow

- Declarative payloads version their JSON; optional `onLoad` hooks in DLI modules may perform pure forward migrations.
- `wbcli` tooling supports init, pack, validate, hot reload for JSON/UI slices, and worker swapping for DLI modules.

### Engine Hook

- Each node executes DLI `computeNode` when provided; otherwise engine falls back to the declared formula DSL path within the deterministic tick pipeline.

## System Acceptance Alignment

- Company ? Structure ? Room ? Zone drill-down functions via double-click, breadcrumbs, and left-rail navigation.
- Budget propagation and throttling show up across HUD badges, sparkbars, and tooltips.
- Workforce coverage scales throughput, maintenance debt reduces the maintenance scale, and logistics queues surface visibly on edges.
- Transfer nodes honour latency, surface FIFO queues, and feed consistent KPIs.
- Currency-neutral presentation persists across UI copy and JSON payloads.
- Plugin extensions add resources, nodes, markets, and UI panes only after passing validation and determinism checks.

## Next Slices (Recommended Sequence)

1. Navigation and coordinates (Company/Structure/Room/Zone plus breadcrumbs).
2. Budget HUD and bottleneck visualization (sparkbars, edge/node encoding, tooltips).
3. HR panel and labor scaling (level-one pool, deterministic allocation, badges, click-through).
4. Transfers and queues (inter-room/zone latency handling, KPI surfacing).
5. Plugin registry, JSON schemas, and formula DSL (baseline zero-code mods).
6. DLI sandbox (optional `computeNode` support with worker isolation).

## Example Nodes (MVP Set)

> Provide a small, coherent catalogue that lets planners assemble working chains while exercising the formula DSL and resource palette.

### 0) Mini Schema (orientation)

```json
{
  "id": "processor.dryer",
  "kind": "processor",
  "label": "Dryer",
  "footprint_m2": 2,
  "params": {
    "capacityPerHour": 40,
    "energyPerUnit": 0.5,
    "lossFactor": 0.67
  },
  "labor": {
    "opsPerHour": 6
  },
  "maint": {
    "wearRatePerHour": 0.01,
    "fixPerMinute": 0.2,
    "debtMax": 240
  },
  "pins": {
    "inputs": [
      { "id": "pin.energy-in", "name": "power", "resource": "energy", "capacityPerHour": 20 },
      { "id": "pin.wet-buds-in", "name": "wet", "resource": "wet_buds", "capacityPerHour": 40 }
    ],
    "outputs": [
      { "id": "pin.dry-buds-out", "name": "dry", "resource": "dry_buds", "capacityPerHour": 26.8 }
    ]
  },
  "compute": "actual.out.dry = min(in.wet, params.capacityPerHour, edges.capacity) * params.lossFactor * scale.budget * scale.labor * scale.maint; require(in.power >= actual.out.dry * params.energyPerUnit);"
}
```

## Card Catalogue (MVP)

### 1) Sources

**source.grid_tap** - Grid Tap (Power)

- **Pins**: out energy
- **Params**: capacityPerHour, costPerHour
- **Compute**: actual.out.energy = min(params.capacityPerHour, edges.capacity) * scale.budget
- **Labor/Maint**: opsPerHour: 0, wearRatePerHour: 0.003

**source.water_main** - Water Main

- **Pins**: out water
- **Params**: capacityPerHour, costPerHour
- **Compute**: actual.out.water = min(params.capacityPerHour, edges.capacity) * scale.budget

**source.nutrient_tank** - Nutrient Stock

- **Pins**: out 
utrients
- **Params**: capacityPerHour, costPerHour
- **Compute**: actual.out.nutrients = min(params.capacityPerHour, edges.capacity) * scale.budget

**source.wet_intake** - Wet Harvest Intake

- **Pins**: out wet_buds
- **Params**: capacityPerHour
- **Compute**: actual.out.wet_buds = min(params.capacityPerHour, edges.capacity) * scale.labor * scale.maint
- **Labor**: opsPerHour: 4

### 2) Processors

**processor.dryer** - Dryer

- **Pins**: in wet_buds, in energy, out dry_buds
- **Params**: capacityPerHour, energyPerUnit, lossFactor = 0.67
- **Compute**: see Mini Schema example above
- **Labor/Maint**: opsPerHour: 6, wearRatePerHour: 0.01, fixPerMinute: 0.2, debtMax: 240

**processor.trimmer** - Trimmer

- **Pins**: in dry_buds (optional in energy), out dry_buds
- **Params**: capacityPerHour, energyPerUnit, shrinkFactor = 0.98, priceBoost = 1.05
- **Compute**: actual.out.dry_buds = min(in.dry_buds * params.shrinkFactor, params.capacityPerHour, edges.capacity) * scale.budget * scale.labor * scale.maint
- **Note**: priceBoost influences sink pricing, not throughput.

**processor.packager** - Packaging Station

- **Pins**: in dry_buds, out dry_buds
- **Params**: capacityPerHour, unitsPerPackage
- **Compute**: throughput clamp as above; metadata records packaging for sink pricing.

**processor.ro_filter** - RO Filter

- **Pins**: in water (optional in energy), out water
- **Params**: capacityPerHour, energyPerUnit, 
ecovery = 0.5
- **Compute**: actual.out.water = min(in.water, params.capacityPerHour, edges.capacity) * params.recovery * scale.budget * scale.labor * scale.maint; remainder can route to waste.

**processor.nutrient_mixer** - Nutrient Mixer

- **Pins**: in water, in 
utrients (optional in energy), out water
- **Params**: capacityPerHour, 
atio = nutrients_per_water, energyPerUnit
- **Compute**: limited by the scarcest input and capacity, forwarding water with nutrient metadata.

**processor.composter** - Composter

- **Pins**: in biomass, in water (optional in energy), out compost_brown
- **Params**: capacityPerHour, moistureTarget = 0.6, conversion = 0.5, holdTicks = 24
- **Compute**: actual.out.compost_brown = min(in.biomass * params.conversion, params.capacityPerHour, edges.capacity) * scale.budget * scale.labor * scale.maint; optional internal FIFO enforces curing.

### 3) Buffers

**buffer.curing_rack** - Curing Rack

- **Pins**: in dry_buds, out dry_buds
- **Params**: capacityPerHour, holdTicks = 24
- **Compute**: FIFO buffer with mandatory hold and optional quality uplift metadata.

**buffer.tank** - Holding Tank

- **Pins**: in water, out water
- **Params**: capacityPerHour, maxVolume, evapLossPerTick
- **Compute**: buffer with optional evaporation losses.

**buffer.cure_compost** - Compost Cure Bay

- **Pins**: in compost_brown, out compost_brown
- **Params**: capacityPerHour, holdTicks = 48
- **Compute**: FIFO buffer simulating maturation before sale.

### 4) Transfers

**transfer.pipe** - Pipe (Water)

- **Pins**: in water, out water
- **Params**: capacityPerHour, latencyTicks, costPerHour
- **Compute**: advances a FIFO queue respecting latency.

**transfer.conveyor** - Conveyor (Wet)

- **Pins**: in wet_buds, out wet_buds
- **Params**: capacityPerHour, latencyTicks = 1, costPerHour

**transfer.pallet** - Pallet Jack (Dry)

- **Pins**: in dry_buds, out dry_buds
- **Params**: capacityPerHour, latencyTicks, 
equiresWorker = true, laborPerUnit

### 5) Sinks and Markets

**sink.market_contract** - Market (Dry Buds)

- **Pins**: in dry_buds
- **Params**: pricePerUnit, contractCapPerHour
- **Compute**: Funds += min(in.dry_buds, contractCapPerHour) * pricePerUnit

**sink.market_compost** - Market (Compost)

- **Pins**: in compost_brown, compost_green
- **Params**: pricePerUnit, contractCapPerHour
- **Compute**: Funds += min(totalInput, contractCapPerHour) * pricePerUnit

**sink.landfill_gray** - Landfill (Gray Waste)

- **Pins**: in waste_gray
- **Params**: costPerUnit
- **Compute**: Funds -= amount * costPerUnit

**sink.landfill_brown** - Compostable Waste Drop

- **Pins**: in waste_brown
- **Params**: costPerUnit
- **Compute**: Funds -= amount * costPerUnit

**sink.waste** - Waste Bin

- **Pins**: in wet_buds, dry_buds, water, 
utrients
- **Params**: costPerUnit
- **Compute**: Funds -= amount * costPerUnit

### 6) Utilities

**utility.maintenance_station** - Maintenance Station

- **Pins**: none
- **Params**: laborPerHour, debtReducePerHour
- **Compute**: reduces maintenance debt for the highest offenders.

**utility.power_splitter** - Power Splitter

- **Pins**: in energy, out energy (three outputs)
- **Params**: shares = 0.34, 0.33, 0.33, capacityPerHour
- **Compute**: distributes incoming energy according to shares with per-output clamps.

## Quickstart Chains

**A) Dry Line (core loop)**

1. source.wet_intake
2. transfer.conveyor
3. processor.dryer (plus source.grid_tap for energy)
4. buffer.curing_rack
5. processor.trimmer
6. processor.packager
7. sink.market_contract

**B) Water ? RO ? Mix ? Distribution**

1. source.water_main
2. processor.ro_filter (with source.grid_tap)
3. processor.nutrient_mixer
4. buffer.tank
5. transfer.pipe

**C) Power Distribution**

1. source.grid_tap
2. utility.power_splitter
3. Feeds processor.dryer, processor.trimmer, processor.ro_filter via dedicated energy pins.

**D) Compost Loop (green waste ? compost)**

1. source.green_waste_intake
2. processor.composter (with source.water_main)
3. buffer.cure_compost
4. sink.market_compost

**E) Waste Handling (disposal)**

1. source.mixed_waste_intake
2. sink.landfill_gray and/or sink.landfill_brown

## Pin Rules

1. Resource types are fixed across energy, water, nutrients, biomass, wet_buds, dry_buds, funds, workforce, compost_green, compost_brown, waste_gray, and waste_brown.
2. Only identical resource types connect; per node each resource type has at most one input and one output pin unless the node is a dedicated splitter such as power_splitter.
3. Processors that require power always expose an energy input pin alongside their material inputs.
4. Edge labels display 
ame @ cap/h, support double-click editing, and act as additional clamps in compute expressions.
5. Labor and maintenance inputs modify scale.labor and scale.maint only; they never increase the nominal capacity.

## Acceptance (Card Catalogue)

- At least one complete Dry Line flow built from these cards yields positive profit under baseline parameters.
- Every listed card can be placed, connected, and removed with pins, labels, and colors matching the resource palette.
- processor.dryer demonstrates the secondary energy pin requirement in practice.