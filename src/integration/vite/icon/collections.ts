/**
 * Icon collection generation.
 *
 * `Icon.svelte` imports `@/generated/local-icon-collections`, a tree-shaken
 * subset of the installed `@iconify-json/*` sets. Tree-shaking is the point:
 * the full sets are 30407 icons / 14.4 MB, while a typical theme uses ~200 of
 * them. The alternative — loading the Iconify API at runtime — would put a
 * network request on every first paint, and one chunk per icon would mean one
 * request per glyph.
 *
 * The logic lives here rather than in the old standalone script so the Vite
 * plugin in `regeneration.ts` can call it directly, and so the integration
 * stays bundled into the published package: package-mode projects get the
 * same behaviour without shipping `scripts/`.
 */

import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	renameSync,
	writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Locate an installed `@iconify-json/<prefix>/icons.json`.
 *
 * Resolution starts from this module so the theme's own icon sets are found
 * whether the project runs from source or installs `shirones` from npm. Walks
 * up the directory tree because pnpm's symlinked layout puts the real
 * directory outside any obvious `node_modules/<pkg>` prefix.
 */
function resolveIconSetPath(prefix: string): string | null {
	const require = createRequire(import.meta.url);
	try {
		return require.resolve(`@iconify-json/${prefix}/icons.json`);
	} catch {
		// Fall back to a manual walk for layouts where the package is not
		// resolvable by name but is present on disk.
		// fileURLToPath, not `new URL(...).pathname`: the latter skips
		// percent-decoding, so a checkout path containing a space, `#` or
		// non-ASCII character would yield a path that does not exist.
		let dir = dirname(fileURLToPath(import.meta.url));
		while (true) {
			const candidate = join(
				dir,
				"node_modules",
				"@iconify-json",
				prefix,
				"icons.json",
			);
			if (existsSync(candidate)) return candidate;
			const parent = dirname(dir);
			if (parent === dir) return null;
			dir = parent;
		}
	}
}

/**
 * Icon sets the theme is allowed to reference.
 * Mirrors `src/config/integrationsConfig.ts`.
 */
const ICON_PREFIXES: ReadonlySet<string> = new Set<string>([
	"fa7-brands",
	"fa7-solid",
	"material-symbols",
	"simple-icons",
]);

/** The specifier `Icon.svelte` imports; see `regeneration.ts` for how it resolves. */
export const ICON_COLLECTIONS_SPECIFIER = "@/generated/local-icon-collections";

const SOURCE_EXTENSIONS: ReadonlySet<string> = new Set<string>([
	".astro",
	".md",
	".mdx",
	".svelte",
	".ts",
	".tsx",
]);

/** `prefix:name`, e.g. `material-symbols:home-rounded`. */
const ICON_PATTERN = /\b(?<prefix>[a-z][a-z0-9-]*):(?<name>[a-z0-9-]+)\b/g;

function collectSourceFiles(directory: string): string[] {
	if (!existsSync(directory)) return [];
	const files: string[] = [];
	for (const entry of readdirSync(directory, { withFileTypes: true })) {
		const absolute = join(directory, entry.name);
		if (entry.isDirectory()) {
			// `generated/` holds previous output; scanning it would feed the
			// generator its own icon names back in.
			if (entry.name !== "generated")
				files.push(...collectSourceFiles(absolute));
		} else if (SOURCE_EXTENSIONS.has(extname(entry.name))) {
			files.push(absolute);
		}
	}
	return files;
}

export interface GenerateIconCollectionsOptions {
	/** Directories to scan for `prefix:name` references. */
	roots: string[];
	/** Where to write the generated module. */
	outputPath: string;
}

/**
 * Scan `roots`, resolve each referenced glyph, and write the collection module.
 *
 * Throws on an unknown icon name or a missing icon set: a collection that
 * silently drops a glyph is harder to notice than a failure. Callers running
 * inside the dev server are expected to catch — see `shironesIconRegeneration`.
 */
export function generateIconCollections({
	roots,
	outputPath,
}: GenerateIconCollectionsOptions): number {
	const requested = new Map<string, Set<string>>();
	for (const root of roots) {
		for (const file of collectSourceFiles(root)) {
			const source = readFileSync(file, "utf8");
			for (const match of source.matchAll(ICON_PATTERN)) {
				const { prefix, name } = match.groups as {
					prefix: string;
					name: string;
				};
				if (!ICON_PREFIXES.has(prefix) || name === "xxx") continue;
				if (!requested.has(prefix)) requested.set(prefix, new Set());
				requested.get(prefix)?.add(name);
			}
		}
	}

	const collections: Record<string, unknown>[] = [];
	for (const [prefix, names] of [...requested].sort(([a], [b]) =>
		a.localeCompare(b),
	)) {
		// Resolve from this module, not from `projectRoot`. In package mode
		// `projectRoot` is the user's project, which does not contain the
		// theme's own devDependencies under pnpm's strict layout.
		const iconSetPath = resolveIconSetPath(prefix);
		if (!iconSetPath) {
			throw new Error(
				`[local-icons] Missing installed icon set @iconify-json/${prefix} for ${[...names][0]}`,
			);
		}
		const set = JSON.parse(readFileSync(iconSetPath, "utf8"));
		const icons: Record<string, unknown> = {};
		const aliases: Record<string, unknown> = {};

		// Follow the alias chain so an alias the theme asked for resolves to the
		// same glyph as the concrete icon it points at.
		function include(name: string, chain: string[] = []): void {
			if (icons[name] || aliases[name]) return;
			if (set.icons?.[name]) {
				icons[name] = set.icons[name];
				return;
			}
			const alias = set.aliases?.[name];
			if (!alias) {
				throw new Error(`[local-icons] Unknown icon ${prefix}:${name}`);
			}
			if (chain.includes(name)) {
				throw new Error(
					`[local-icons] Circular alias ${prefix}:${[...chain, name].join(" -> ")}`,
				);
			}
			aliases[name] = alias;
			include(alias.parent, [...chain, name]);
		}

		for (const name of [...names].sort()) include(name);
		collections.push({
			prefix,
			...(set.width ? { width: set.width } : {}),
			...(set.height ? { height: set.height } : {}),
			icons,
			...(Object.keys(aliases).length ? { aliases } : {}),
		});
	}

	const output = [
		"// Generated by src/integration/vite/icon/collections.ts. Do not edit.",
		`export const localIconCollections = ${JSON.stringify(collections)} as const;`,
		"",
	].join("\n");
	// Write-then-rename so a dev server reading mid-write never sees a partial file.
	const temporaryPath = `${outputPath}.tmp`;
	mkdirSync(dirname(outputPath), { recursive: true });
	writeFileSync(temporaryPath, output, "utf8");
	renameSync(temporaryPath, outputPath);

	return collections.reduce(
		(total, collection) =>
			total +
			Object.keys(collection.icons as object).length +
			Object.keys((collection.aliases as object) ?? {}).length,
		0,
	);
}

export { ICON_PREFIXES, SOURCE_EXTENSIONS };
