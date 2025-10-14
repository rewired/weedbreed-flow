# Data Model

## Company
- **Attributes**: id (string), name (string), funds (number), coordinates (lat: number, lon: number), structures (array<StructureRef>), pluginManifestVersions (array<string>).
- **Relationships**: Owns multiple structures; references active plugins by id.
- **Invariants**: Funds must remain currency-neutral; coordinates optional but when present must include both lat and lon.

## Structure
- **Attributes**: id (string), name (string), budgets (StructureBudgets), laborPool (LaborPool), laborWeights (LaborWeights), rooms (array<RoomRef>).
- **Relationships**: Belongs to a company; contains rooms; shares labor pool across rooms.
- **Invariants**: Budget caps clamp room throughput; labor pool minutes per hour >= 0.

## StructureBudgets
- **Attributes**: maxAreaM2 (number), gridCapacityKW (number), waterMainLph (number), exhaustM3ph (number).
- **Relationships**: Applied as multipliers to rooms and zones within the structure.
- **Invariants**: Values must be non-negative; act as hard clamps when exceeded.

## LaborPool
- **Attributes**: minutesPerHour (number), opsWeight (0-1), maintWeight (0-1), logWeight (0-1).
- **Relationships**: Distributed across nodes via deterministic scheduler.
- **Invariants**: Weights sum to 1; allocation output feeds WorkforceAllocation records each tick.

## Room
- **Attributes**: id (string), structureId (string), purpose (enum), hasZones (boolean), budgets (RoomBudgets).
- **Relationships**: Belongs to a structure; either hosts a zone canvas or displays no-zone message.
- **Invariants**: Room area <= structure area cap; budgets clamp zone scale factors.

## RoomBudgets
- **Attributes**: roomAreaM2 (number), roomGridKW (number), roomWaterLph (number), roomExhaustM3ph (number).
- **Invariants**: Each metric >= 0; propagate as multipliers into zone nodes.

## Zone
- **Attributes**: id (string), roomId (string), zoneAreaM2 (number), nodes (array<Node>), edges (array<Edge>).
- **Relationships**: Belongs to a room; hosts graph canvas content.
- **Invariants**: Sum of node footprints must not exceed zoneAreaM2; zone belongs to exactly one room.

## Node
- **Attributes**: id (string), typeId (NodeTypeId), label (string), footprintM2 (number), params (Record<string, number|string>), pins (Pins), labor (LaborProfile), maintenance (MaintenanceProfile), compute (FormulaRef).
- **Relationships**: Associated with a NodeType definition from plugin registry; connects to edges via pins.
- **Invariants**: Each resource type exposes at most one input and one output pin except declared splitters; energy-requiring nodes must include energy pin.

## Edge
- **Attributes**: id (string), sourceNodeId (string), sourcePin (string), targetNodeId (string), targetPin (string), resourceType (ResourceType), capacityPerHour (number), metadata (labels, annotations).
- **Relationships**: Connects two nodes within the same zone with matching resource types.
- **Invariants**: Resource types must match; capacityPerHour >= 0; no self-loop cycles that would violate cycle detection rules.

## ResourceType
- **Values**: energy, water, nutrients, biomass, wet_buds, dry_buds, funds, workforce, compost_green, compost_brown, waste_gray, waste_brown.
- **Invariants**: Fixed palette; UI must reuse canonical color/shape semantics.

## LaborProfile
- **Attributes**: opsPerHour (number), requiresWorker (boolean), laborPerUnit (number optional).
- **Invariants**: opsPerHour >= 0; if requiresWorker true, laborPerUnit must be defined.

## MaintenanceProfile
- **Attributes**: wearRatePerHour (number), fixPerMinute (number), debtMax (number).
- **Invariants**: wearRatePerHour >= 0; debtMax >= fixPerMinute to avoid impossible recovery; maintenance scale never increases throughput.

## WorkforceAllocation
- **Attributes**: tickId (string), nodeId (string), opsMinutes (number), maintMinutes (number), logMinutes (number).
- **Relationships**: Generated per tick from LaborPool distribution.
- **Invariants**: Minutes sum must not exceed pool allocation for each category; stored for diagnostics.

## TransferQueue
- **Attributes**: transferNodeId (string), fifo (array<TransferItem>), latencyTicks (number), capacityPerHour (number).
- **Relationships**: Bound to transfer nodes; feeds arrival KPIs.
- **Invariants**: FIFO order preserved; latencyTicks >= 0.

## TransferItem
- **Attributes**: resourceType (ResourceType), quantity (number), etaTick (number).
- **Invariants**: Quantity >= 0; etaTick monotonic within queue.

## PluginManifest
- **Attributes**: id (string), version (semver), wbSpecVersion (string), contributions (NodeTypes, Resources, UISlices), provides/conflicts/replaces (arrays), deterministic (boolean).
- **Relationships**: Registered with plugin loader; influences available nodes and UI slices.
- **Invariants**: IDs unique; deterministic flag must be true for inclusion; conflicts rules enforced before activation.

## SaveFile
- **Attributes**: version (semver), seed (string), company (Company snapshot), structures (array<Structure>), nodes (array<Node>), edges (array<Edge>), plugins (array<PluginManifestRef>).
- **Relationships**: Portable JSON exported/imported by user.
- **Invariants**: Version must match current loader schema or be migratable; seed required for determinism.

## SimulationTick
- **Attributes**: tickIndex (number), nodeOutputs (Record<NodeId, OutputMetrics>), clamps (array<ClampEvent>), workforce (array<WorkforceAllocation>), transfers (array<TransferSnapshot>).
- **Relationships**: Produced by simulation engine; consumed by UI for KPIs.
- **Invariants**: tickIndex monotonic; outputs deterministic for given seed and config.

## ClampEvent
- **Attributes**: nodeId (string), limitingFactor (enum: input|edge|budget|labor|maintenance|energy), magnitude (number), message (string).
- **Invariants**: limitingFactor must map to UI badges; message localized via resource table.

## TransferSnapshot
- **Attributes**: transferNodeId (string), queuedUnits (number), averageEtaTicks (number).
- **Invariants**: queuedUnits >= 0; averageEtaTicks >= 0.