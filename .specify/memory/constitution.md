# Project Principles (Factory/Card Planner)

> This document codifies non‑negotiable principles and decision heuristics for the client‑only Factory/Card Planner. It complements the TDD/SEC and governs scope, architecture, UX, data, and delivery.

Spec‑kit roots

- Schemas: .specify/schemas
- Fixtures: .specify/fixtures
- Scripts: .specify/scripts/node (simulate, golden)
- Principle IDs: .specify/principles.index.json

---

## 1) Vision & Scope

1. Graph‑first gameplay. Nodes and typed pins are the core. Players think and act on the graph; everything else supports this.
2. Client‑only MVP. No WeedBreed backend coupling. All simulation runs locally and deterministically.
3. Factory over botany (here). This planner abstracts cultivation; it is not the full agronomy sim.
4. Spec‑driven. Work begins with a small, testable spec slice (spec‑kit) and grows iteratively.

## 2) Determinism & Reproducibility

1. Deterministic sim. No nondeterministic sources (Math.random, time, network). All RNGs must be seeded/streamed.
2. Stable ticks. Tick order is canonical; side effects are isolated. Given the same graph+params, outputs are bit‑reproducible.
3. Golden fixtures. Keep reference graphs with expected hourly deltas and KPI snapshots; tests assert hashes/metrics.

## 3) Safety & Sim Constraints

1. Conservative clamps. Throughput is bounded by inputs, capacity, edges, and scales (budget/labor/maint). No hidden boosts.
2. Explicit energy. Machines that need power require an energy pin; no implicit energy budgets.
3. Typed pins only. Edges connect only identical resource types; validation prevents cross‑type wiring.
4. No silent failure. When clamped, show it (badges/tooltips) with the responsible limit.

## 4) Economy‑Neutral Design

1. Currency‑agnostic. Internals and UI avoid real‑world currencies and symbols.
2. Separation of concerns. Quantity, quality (metadata), and price/contract are distinct channels.
3. Costs first‑class. OpEx (per hour) and maintenance debt are explicit; profits derive, they do not fudge.

## 5) Modding & Extensibility

1. Plugins everywhere. Resources, node types, markets, and UI slices are contributed via validated plugins.
2. JSON‑first, DSL second, DLI last. Prefer declarative JSON → formula DSL; only then deterministic logic modules (sandboxed).
3. Deterministic sandbox. DLI modules run in workers, no network, seeded RNG from context.
4. Strict identities. Stable IDs, versioned manifests, conflict rules (provides/conflicts/replaces).

## 6) Performance & Budgets

1. Tick budget. Define and measure a per‑tick ms budget; degrade gracefully (coarser gauges) if exceeded.
2. Graph scale targets. Publish target ranges (nodes/edges) and test them.
3. O(N+E) paths. Hot loops are linear in nodes+edges with cache‑friendly data.

## 7) UX & Interaction

1. Read the graph. Bottlenecks and limits are visible without opening modals (badges, sparkbars, edge styles, tooltips).
2. Direct manipulation. Drag, connect, delete, undo/redo. Double‑click to edit labels and capacities.
3. Persistent scaffolding. Play/Pause/Speed and balance are always visible. Breadcrumbs and left rail define place.
4. Color semantics. Resource colors are stable (energy yellow, water blue, nutrients cyan, biomass green, wet violet, dry pink, funds zinc, workforce red, compost green/brown, waste gray/brown).
5. Accessibility. Provide shape/label redundancies for color, keyboard ops for all actions.

## 8) Workforce & Maintenance (MVP level)

1. Labor as scale. Ops coverage scales throughput; maintenance debt scales reliability/efficiency (never silently increases capacity).
2. Simple first. Start with pooled minutes and deterministic allocation; agents (named workers) are optional stage‑2.

## 9) Validation & Testing

1. Schema‑locked. All JSON (plugins, graphs, saves) is validated at load time.
2. Black‑box sim tests. Known graphs → tick outputs → hash assertions; include extreme clamps and cycles prevention.
3. UI contract tests. Pin compatibility, edge coloring, deletion, undo/redo, and label editing are covered.

## 10) Data & Persistence

1. Portable saves. A save is JSON: graph, params, seed, and version. No environment‑dependent bits.
2. Migrations. Versioned schemas with pure functions that transform prior versions forward.
3. Privacy. No telemetry/remote calls in client‑only MVP.

## 11) Failure Modes & Observability

1. Fail loud, not late. Invalid graphs refuse to run with actionable messages.
2. Explain clamps. Each clamp shows who/why (edge cap, input shortfall, budget, labor, maintenance).
3. Debug panes. Optional inspector shows node inputs/outputs, scales, and current debt/queues.

## 12) Governance & Docs

1. ADRs for irreversible choices. Competing options, why chosen, consequences.
2. Spec slices. Every feature starts as a small spec with acceptance criteria; code follows the spec, not vice versa.
3. Changelog discipline. Human‑readable changes at each slice merge.

## 13) Internationalization

1. English spec, locale UI. Specs/IDs in English; UI copy prepared for i18n.

## 14) Non‑Goals (MVP)

1. No netcode. No multi‑user, no server sync.
2. No full agronomy. We do not simulate VPD/PPFD/strain biology here.
3. No real currencies. Keep neutral units and abstract contracts.

---

## Decision Heuristics (tie‑breakers)

1. Determinism > Convenience. If a feature threatens reproducibility, redesign or drop it.
2. Clarity > Cleverness. Prefer explicit, boring code with tests over magic.
3. Declarative > Imperative. If a node can be expressed in JSON/DSL, do that before DLI.
4. User signal > engine purity. If users cannot see or influence it, it likely doesn’t belong in MVP.
5. Undoability. If an action can’t be undone, it likely needs a different design.

---

## Acceptance (for this document)

* Principles are referenced by ID in specs and PRs (e.g., P‑DET‑02: Stable ticks).
* CI checks exist for schema validation and golden graph hashes.
* A sample plugin passes validation (JSON/DSL) and runs deterministically in the sandbox.

---

# Ideas (Consolidated)

See also: speckit.constitution — non‑negotiable principles and decision heuristics for the client‑only Factory/Card Planner.
Spec‑kit (schemas/fixtures/specs): .specify (see roots above)

**Scope**

* Client‑only Card/Factory Planner (React Flow), deterministisch, ohne WeedBreed‑Backend.
* Hierarchie: Company → Structures → Rooms → Zones.
* Währungsneutral: Funds/Balance, Cost, Price, Profit (einheitenfrei).

---

## Core Loop (High‑Level)

* Spieler platziert Karten/Nodes, verbindet Pins (ressourcen‑typisiert), bildet Ketten.
* Tick‑Sim rechnet Durchsatz, Budgets, Labor, Maint, Transfers → Profit/Cost‑KPIs.
* Bottlenecks sichtbar machen, priorisieren, justieren (Kanten‑Kapazität, Budgets, Labor‑Gewichte, Node‑Params).

---

## Navigation & Node‑Ansichten

* Company View: Structures als Nodes, Position via lat/lon (einfache Projektion). Doppelklick → Structure.
* Structure View: Rooms als Nodes mit Budget‑Sparkbars; Doppelklick → Room.
* Room View:

  * hasZones=false → Info „No zones“.
  * hasZones=true → Zonen‑Switcher; Auswahl mountet Zone‑Canvas (React Flow).
* Breadcrumb & Left‑Rail: Company ▸ Structure ▸ Room ▸ Zone (klickbar).

---

## Ressourcen & Farben (fix)

| Type    | Color           | Hex     | Google Material Icon |
| ------- | --------------- | ------- | -------------------- |
| Energy  | text-yellow-400 | #FACC15 | bolt                 |
| Water   | text-blue-500   | #3B82F6 | humidity_low         |
| Nutrients | text-cyan-400 | #22D3EE | science              |
| Biomass | text-green-500  | #22C55E | eco                  |
| Wet Buds | text-violet-500 | #8B5CF6 | nature               |
| Dry Buds | text-pink-500  | #EC4899 | cannabis             |
| Funds   | text-zinc-300   | #D4D4D8 | payments             |
| Workforce | text-red-500  | #EF4444 | settings             |
| Compost | text-lime-800   | #84CC16 | compost              |
| Trash   | text-amber-800  | #92400e | delete               |

* Pins strikt getrennt (pro Typ ein Input- sowie Output‑Pin).

---

## Simulation (Kern)

Tick‑Order

1. Budgets (Structure/Room) → Skalen.
2. Sources erzeugen.
3. Processors: throughput = base * scale.budget * scale.labor * scale.maint, limitiert durch Inputs/Edges/Capacity.
4. Buffer aktualisieren.
5. Transfers (Queues, Latenz) fortschreiben.
6. Sinks/Market verbuchen.

Budget‑Drossel

* scale = min(room/structure Quotienten, 1); Area‑Guards sind Hard‑Limits.

Trocknung (MVP)

* wet_buds → dry_buds mit Faktor 0.67.

Economy (neutral)

* OpEx = Σ costPerHour; Profit = Σ(pricePerUnit × Output) − OpEx.

---

## Workforce (High‑Level)

Level 1 — Labor Pool (abstrakt)

* Structure hat laborPoolMinutesPerHour + Gewichte { ops, maint, log }.
* Nodes/Edges definieren laborPerHour (Ops), wearRatePerHour/maintFixPerMinute/maintDebtMax (Maint) und optional requiresWorker/laborPerUnit (Logistik).
* Scheduler (deterministisch): sammelt Tasks (Ops/Maint/Log), verteilt Minuten nach Gewichten und Grenznutzen, stabile Sortierung.
* Skalen: laborRatio = min(alloc/req,1); maintDebt senkt maintScale (z. B. clamp(1 − debt/debtMax, 0.5, 1)).

Level 2 — Lightweight Agents (optional)

* Benannte Worker ohne Wege: Felder id,name,primary/secondary,efficiency,minutesPerHour,fatigue.
* Effektive Minuten: minutesPerHour * efficiency * (1 − fatigue); Task‑Zuteilung deterministisch (Skill‑Match × Nutzen).

UI (Ausschnitt)

* HR‑Panel (Structure): Pool, Slider ops/maint/log, Coverage‑Badges, Maint‑Debt, Log‑Queue, Sparklines; Click‑through zu Top‑Verbrauchern.
* Room Snapshot: Read‑Only HR‑Badges + Top‑Contributor (klappbar).
* Zone‑Canvas: Node‑Badges (Ops‑Coverage, Maint‑Debt), Edge‑Badges (Logistik‑Queue).

---

## UI‑Interaktion (Graph)

* Verbinden: nur kompatible Ressourcen‑Pins; Kantenfarbe = Ressource; Label name · cap/h, Doppelklick editierbar.
* Löschen: [Del] auf Node/Edge; Undo/Redo (Strg+Z/Y).
* Platzierung: Zone zeigt belegte/gesamt m²; Ghost‑Drop bei Überbelegung.
* Run‑Controls: Play/Pause, Speed (1×/2×/5×/10×), Step.
* Bottleneck‑Codierung: Edge gepunktet (Edge‑Limit), gestrichelt (Upstream), halbtransparent (Downstream); Tooltips mit Zahlen.

---

## Transfers (Inter‑Room/Zone)

* Transfer‑Nodes mit capacityPerHour, latencyTicks, costPerHour (neutral).
* FIFO‑Queues (Menge, ETA) pro Transfer; KPIs zeigen Ankunftsverzögerungen.

---

## Daten (MVP‑Ausschnitte)

```
{
  "company": { "funds": 100000 },
  "structures": [{
    "id": "str-1", "name": "Site A", "lat": 52.52, "lon": 13.40,
    "budgets": { "maxArea_m2": 200, "gridCapacity_kW": 150, "waterMain_Lph": 1000, "exhaust_m3ph": 5000 },
    "laborPoolMinutesPerHour": 240,
    "laborWeights": { "ops": 0.6, "maint": 0.3, "log": 0.1 }
  }],
  "rooms": [{
    "id": "room-veg", "structureId": "str-1", "hasZones": true, "purpose": "Veg",
    "budgets": { "roomArea_m2": 40, "roomGrid_kW": 50, "roomWater_Lph": 300, "roomExhaust_m3ph": 1200 }
  }],
  "zones": [{
    "id": "zone-a", "roomId": "room-veg", "zoneArea_m2": 20,
    "nodes": [], "edges": []
  }]
}
```

---

## Plugin‑System (Mod‑freundlich)

Ziel: Alles als Plugins (deklarativ per JSON; optional DLI für Logik), deterministisch & sandboxed.

Packaging

* Ordner/ZIP .wbmod mit plugin.manifest.json (id, version, wbSpecVersion, contributions, permissions, deterministic).

Deklarativ (JSON)

* Resources, NodeTypes, Markets, UI‑Slices per Schema;
* Formel‑DSL für Node‑Berechnung: Operanden in.*, capacityPerHour, scale.*, params.*, actual.*; Operatoren + - * / min max clamp ...; zyklusfrei.

DLI (Deterministic Logic Interface, optional)

* ES‑Module/WASM im Sandbox‑Worker, API: computeNode(ctx) (rein funktional), inspectNode(ctx).
* Kein Netz, kein Math.random; RNG aus ctx (seeded); Time‑Budget/Fail‑Safe.

Registry & Konflikte

* Stable Load‑Order (core→official→mods); provides/conflicts/replaces; harte Fehler bei Doppel‑IDs ohne Regel.

Migration

* version pro JSON; DLI‑onLoad kann funktional migrieren.

Dev‑Erlebnis

* wb‑cli: init/pack/validate; Hot‑Reload (JSON/UI), Worker‑Swap für DLI.

Engine‑Hook (Tick)

* Pro Node: DLI computeNode → sonst Formel‑DSL → Pipeline.

---

## Acceptance (Systemebene)

* Drill‑Down Company→Structure→Room→Zone funktioniert (Doppelklick, Breadcrumb, Left‑Rail).
* Budgets propagieren; Drosselung sichtbar (HUD, Badges, Tooltips).
* Workforce beeinflusst Durchsatz (Ops‑Coverage), Maint‑Debt wirkt (maintScale), Log‑Queues sichtbar.
* Transfers liefern mit Latenz; KPIs konsistent.
* Währungsneutral: keine Symbole/ISO‑Codes im UI/JSON.
* Plugins können Ressourcen/Nodes/Märkte/UI ergänzen, deterministisch & validiert.

---

## Next Slices (Implement‑Reihenfolge)

1. Navigation & Koordinaten (Company/Structure/Room/Zone + Breadcrumbs).
2. Budget‑HUD & Bottlenecks (Sparkbars, Edge/Node‑Codierung, Tooltips).
3. HR‑Panel & Labor‑Skalen (Level 1, deterministisch; Badges & Click‑through).
4. Transfers & Queues (Inter‑Room/Zone, Latenz + KPIs).
5. Plugin‑Registry + JSON‑Schemata + Formel‑DSL (Zero‑Code Mods).
6. DLI‑Sandbox (opt., computeNode + Worker‑Isolation).

---

## Beispiel‑Karten (Nodes) — MVP‑Set

Ziel: Ein kleines, konsistentes Set, mit dem man sofort sinnvolle Ketten bauen kann – kompatibel mit den oben fixierten Ressourcen und der Formel‑DSL.

0) Mini‑Schema (zur Orientierung)

```
{
  "id": "processor.dryer",
  "kind": "processor",
  "label": "Dryer",
  "footprint_m2": 2,
  "params": { "capacityPerHour": 40, "energyPerUnit": 0.5, "lossFactor": 0.67 },
  "labor": { "opsPerHour": 6 },
  "maint": { "wearRatePerHour": 0.01, "fixPerMinute": 0.2, "debtMax": 240 },
  "pins": {
    "in":  [ { "name": "wet", "resource": "wet_buds" }, { "name": "power", "resource": "energy" } ],
    "out": [ { "name": "dry", "resource": "dry_buds" } ]
  },
  "compute": "actual.out.dry = min(in.wet, params.capacityPerHour, edges.capacity) * params.lossFactor * scale.budget * scale.labor * scale.maint; require(in.power >= actual.out.dry * params.energyPerUnit)"
}
```

1) Sources

source.grid_tap — Grid Tap (Power)

* Pins: out energy
* Params: capacityPerHour, costPerHour
* Compute: actual.out.energy = min(params.capacityPerHour, edges.capacity) * scale.budget
* Labor/Maint: opsPerHour: 0, wearRatePerHour: 0.003

source.water_main — Water Main

* Pins: out water
* Params: capacityPerHour, costPerHour
* Compute: actual.out.water = min(params.capacityPerHour, edges.capacity) * scale.budget

source.nutrient_tank — Nutrient Stock

* Pins: out nutrients
* Params: capacityPerHour, costPerHour
* Compute: actual.out.nutrients = min(params.capacityPerHour, edges.capacity) * scale.budget

source.wet_intake — Wet Harvest Intake

* Pins: out wet_buds
* Params: capacityPerHour
* Compute: actual.out.wet_buds = min(params.capacityPerHour, edges.capacity) * scale.labor * scale.maint
* Labor: opsPerHour: 4 (Annahme: Sortieren/Wiegen)

2) Processor

processor.dryer — Dryer

* Pins: in wet_buds, in energy ▸ out dry_buds
* Params: capacityPerHour, energyPerUnit, lossFactor = 0.67
* Compute: siehe Mini‑Schema oben
* Labor/Maint: opsPerHour: 6, wearRatePerHour: 0.01, fixPerMinute: 0.2, debtMax: 240

processor.trimmer — Trimmer

* Pins: in dry_buds (+ optional in energy) ▸ out dry_buds
* Params: capacityPerHour, energyPerUnit, shrinkFactor = 0.98, priceBoost = 1.05
* Compute: actual.out.dry_buds = min(in.dry_buds * params.shrinkFactor, params.capacityPerHour, edges.capacity) * scale.budget * scale.labor * scale.maint
* Hinweis: priceBoost wird im Market/Sink berücksichtigt, nicht in der Menge.

processor.packager — Packaging Station

* Pins: in dry_buds ▸ out dry_buds
* Params: capacityPerHour, unitsPerPackage
* Compute: Durchsatz clamp wie oben; lediglich Metadaten (Packaging) für Sink‑Preis.

processor.ro_filter — RO Filter

* Pins: in water (+ in energy) ▸ out water
* Params: capacityPerHour, energyPerUnit, recovery = 0.5
* Compute: out.water = min(in.water, capacity, edges) * recovery * scales; Rest implicit als Waste (optional Sink).

processor.nutrient_mixer — Nutrient Mixer

* Pins: in water, in nutrients (+ in energy) ▸ out water
* Params: capacityPerHour, ratio = nutrients_per_water, energyPerUnit
* Compute: limitiert durch knappstes Input + capacity; rechnet water als Träger weiter.

processor.composter — Composter

* Pins: in biomass, in water (+ optional in energy) ▸ out compost_brown
* Params: capacityPerHour, moistureTarget=0.6, conversion=0.5, holdTicks=24
* Compute: actual.out.compost_brown = min(in.biomass * params.conversion, params.capacityPerHour, edges.capacity) * scale.budget * scale.labor * scale.maint; optional Latenz via holdTicks (als interner FIFO‑Puffer).

3) Buffer

buffer.curing_rack — Curing Rack

* Pins: in dry_buds ▸ out dry_buds
* Params: capacityPerHour, holdTicks = 24
* Compute: FIFO‑Puffer mit Mindesthaltezeit; optional kleiner priceBoost via Metadata.

buffer.tank — Holding Tank

* Pins: in water ▸ out water
* Params: capacityPerHour, maxVolume, evapLossPerTick
* Compute: einfacher Puffer; Verluste optional.

buffer.cure_compost — Compost Cure Bay

* Pins: in compost_brown ▸ out compost_brown
* Params: capacityPerHour, holdTicks=48
* Compute: FIFO‑Puffer; simuliert Nachreife vor Verkauf.

4) Transfer

transfer.pipe — Pipe (Water)

* Pins: in water ▸ out water
* Params: capacityPerHour, latencyTicks, costPerHour
* Compute: schiebt FIFO‑Queue über latencyTicks.

transfer.conveyor — Conveyor (Wet)

* Pins: in wet_buds ▸ out wet_buds
* Params: capacityPerHour, latencyTicks=1, costPerHour

transfer.pallet — Pallet Jack (Dry)

* Pins: in dry_buds ▸ out dry_buds
* Params: capacityPerHour, latencyTicks, requiresWorker=true, laborPerUnit

5) Sink / Market

sink.market_contract — Market (Dry Buds)

* Pins: in dry_buds
* Params: pricePerUnit, contractCapPerHour
* Compute: verbucht Funds += min(in.dry_buds, contractCap) * pricePerUnit.

sink.market_compost — Market (Compost)

* Pins: in compost_brown | compost_green
* Params: pricePerUnit, contractCapPerHour
* Compute: Funds += min(sum(in.*), contractCap) * pricePerUnit.

sink.landfill_gray — Landfill (Gray Waste)

* Pins: in waste_gray
* Params: costPerUnit
* Compute: vernichtet Input, Funds -= amount * costPerUnit.

sink.landfill_brown — Compostable Waste Drop

* Pins: in waste_brown
* Params: costPerUnit
* Compute: vernichtet Input (ohne Verwertung), Funds -= amount * costPerUnit.

sink.waste — Waste Bin

* Pins: in wet_buds | dry_buds | water | nutrients
* Params: costPerUnit
* Compute: vernichtet Input, verbucht Funds -= amount * costPerUnit.

6) Utility

utility.maintenance_station — Maintenance Station

* Pins: keine
* Params: laborPerHour, debtReducePerHour
* Compute: reduziert global maintDebt anteilig auf Top‑Verbraucher.

utility.power_splitter — Power Splitter

* Pins: in energy ▸ out energy (3×)
* Params: shares = [0.34,0.33,0.33], capacityPerHour
* Compute: verteilt in.energy nach shares, clamp auf capacityPerHour je Ausgang.

---

## Beispiel‑Ketten (Quick‑Start)

A) Dry‑Line (Kern‑Loop)

1. source.wet_intake → 2. transfer.conveyor → 3. processor.dryer (plus source.grid_tap in energy) → 4. buffer.curing_rack → 5. processor.trimmer → 6. processor.packager → 7. sink.market_contract.

B) Water → RO → Mix → Verteilung

1. source.water_main → 2. processor.ro_filter (+ source.grid_tap) → 3. processor.nutrient_mixer → 4. buffer.tank → 5. transfer.pipe (zu Verbrauchern).

C) Power‑Verteilung

1. source.grid_tap → utility.power_splitter → versorgt processor.dryer, processor.trimmer, processor.ro_filter über separate energy‑Pins.

D) Compost‑Loop (Green Waste → Compost)

1. source.green_waste_intake (out biomass) → 2. processor.composter (+ source.water_main) → 3. buffer.cure_compost → 4. sink.market_compost.

E) Waste‑Handling (Disposal)

1. source.mixed_waste_intake (out waste_gray &/or waste_brown) → 2. sink.landfill_gray / sink.landfill_brown (Kosten verbuchen).

---

## Pin‑Regeln (klar & strikt)

1. Ressourcen‑Typen sind hart (Energy/Water/Nutrients/Biomass/Wet Buds/Dry Buds/Funds/Workforce/Compost‑Green/Compost‑Brown/Waste‑Gray/Waste‑Brown).
2. Kompatibilität: Nur identischer Ressourcentyp verbindet; je Node ist pro Typ exakt ein Input‑Pin und ein Output‑Pin zulässig, außer bei dedizierten Utility‑Nodes (z. B. power_splitter).
3. Energie‑Pflicht: Maschinen‑Processor, die realistisch Strom brauchen, haben stets einen zweiten Pin für energy.
4. Edge‑Labels: name · cap/h; Edit per Doppelklick; Caps wirken als zusätzlicher Clamp in compute.
5. Labor & Maint: beeinflussen ausschließlich Skalen (scale.labor, scale.maint), nicht die Nominal‑Kapazität.

---

## Acceptance‑Ergänzung (Cards)

* Mindestens ein kompletter MVP‑Flow (Dry‑Line) lässt sich mit obigen Karten bauen und ergibt >0 Profit bei Standard‑Parametern.
* Alle oben definierten Karten lassen sich im UI platzieren, verbinden, löschen; Pins/Labels/Farben stimmen mit der Ressourcentabelle.
* processor.dryer demonstriert den zweiten Energy‑Pin exemplarisch.
