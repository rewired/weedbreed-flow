import { pluginManifestSchema, type PluginManifest, type ValidationIssue } from "../schema";

export interface PluginRegistrationResult {
  ok: boolean;
  manifest?: PluginManifest;
  issues?: ValidationIssue[];
}

export type PluginSourceKind = "core" | "official" | "user";

export interface PluginManifestDescriptor {
  manifest: unknown;
  source?: string;
  kind?: PluginSourceKind;
  priority?: number;
}

const sourceOrder: Record<PluginSourceKind, number> = {
  core: 0,
  official: 1,
  user: 2
};

const joinPath = (issue: ValidationIssue, prefix: string) => {
  if (issue.path === "") {
    return prefix;
  }
  return `${prefix}.${issue.path}`;
};

const describeDescriptor = (descriptor: PluginManifestDescriptor, index: number) => {
  const parts = [
    descriptor.kind ?? "user",
    (descriptor.priority ?? 0).toString().padStart(3, "0"),
    descriptor.source ?? manifest_
  ];
  return parts.join(":");
};

export class PluginRegistry {
  private manifests = new Map<string, PluginManifest>();
  private providesIndex = new Map<string, string>();

  private removeManifest(id: string) {
    const manifest = this.manifests.get(id);
    if (!manifest) {
      return;
    }
    this.manifests.delete(id);
    manifest.provides.forEach((provided) => {
      if (this.providesIndex.get(provided) === id) {
        this.providesIndex.delete(provided);
      }
    });
  }

  register(manifestInput: unknown): PluginRegistrationResult {
    const parsed = pluginManifestSchema.safeParse(manifestInput);
    if (!parsed.success) {
      return {
        ok: false,
        issues: parsed.error.issues.map((issue) => ({
          code: issue.code,
          message: issue.message,
          path: issue.path.length ? issue.path.join(".") : ""
        }))
      };
    }

    const manifest = parsed.data;
    const replaced = new Set(manifest.replaces);
    const issues: ValidationIssue[] = [];

    if (!manifest.deterministic) {
      issues.push({
        code: "plugins.non_deterministic",
        message: "Plugin must opt into deterministic execution",
        path: "deterministic"
      });
    }

    const current = this.manifests.get(manifest.id);
    if (current && current.version !== manifest.version && !replaced.has(manifest.id)) {
      issues.push({
        code: "plugins.version_conflict",
        message: "Plugin already registered with version",
        path: "id"
      });
    }

    manifest.conflicts.forEach((conflictId, conflictIndex) => {
      if (this.manifests.has(conflictId) && !replaced.has(conflictId)) {
        issues.push({
          code: "plugins.conflict_detected",
          message: "Plugin conflicts with loaded",
          path: `conflicts.${conflictIndex}`
        });
      }
    });

    manifest.provides.forEach((provided, providedIndex) => {
      const owner = this.providesIndex.get(provided);
      if (owner && owner !== manifest.id && !replaced.has(owner)) {
        issues.push({
          code: "plugins.provides_conflict",
          message: "Capability already provided by",
          path: `provides.${providedIndex}`
        });
      }
    });

    if (issues.length > 0) {
      return { ok: false, issues };
    }

    replaced.forEach((id) => this.removeManifest(id));
    if (current) {
      this.removeManifest(current.id);
    }

    this.manifests.set(manifest.id, manifest);
    manifest.provides.forEach((provided) => this.providesIndex.set(provided, manifest.id));

    return { ok: true, manifest };
  }

  registerMany(manifests: unknown[]): { manifests: PluginManifest[]; issues: ValidationIssue[] } {
    const descriptors = manifests.map((manifest, index) => ({
      manifest,
      source: manifests.
    } satisfies PluginManifestDescriptor));

    return this.load(descriptors);
  }

  load(descriptors: PluginManifestDescriptor[]): { manifests: PluginManifest[]; issues: ValidationIssue[] } {
    const sorted = descriptors
      .map((descriptor, index) => ({
        descriptor,
        label: describeDescriptor(descriptor, index),
        rank: sourceOrder[descriptor.kind ?? "user"],
        priority: descriptor.priority ?? 0,
        index
      }))
      .sort((a, b) => {
        if (a.rank !== b.rank) {
          return a.rank - b.rank;
        }
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        return a.label.localeCompare(b.label);
      });

    const loaded: PluginManifest[] = [];
    const issues: ValidationIssue[] = [];

    sorted.forEach(({ descriptor, label }) => {
      const result = this.register(descriptor.manifest);
      if (!result.ok) {
        result.issues?.forEach((issue) => {
          issues.push({
            ...issue,
            path: joinPath(issue, label)
          });
        });
      } else if (result.manifest) {
        loaded.push(result.manifest);
      }
    });

    return { manifests: loaded, issues };
  }

  list(): PluginManifest[] {
    return Array.from(this.manifests.values()).sort((a, b) => a.id.localeCompare(b.id));
  }

  get(id: string): PluginManifest | undefined {
    return this.manifests.get(id);
  }

  clear() {
    this.manifests.clear();
    this.providesIndex.clear();
  }
}
