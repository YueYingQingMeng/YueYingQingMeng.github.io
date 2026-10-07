/**
 * Keep moment thumbnails in step with the moment images.
 *
 * Generation used to live only in the `dev` and `build` script chains. A
 * package-mode project therefore never regenerated them: the thumbnails in the
 * tarball came from the template's demo content, so images the user added got
 * none. Running from the integration fixes both modes with one code path, the
 * same way `icon/regeneration.ts` does for the icon collection.
 *
 * Unlike the icon collection, these write into `public/`, which Astro copies
 * verbatim — nothing participates in module resolution. `buildStart` is
 * therefore early enough, and it also keeps `astro sync` from paying for sharp.
 */

import type { Plugin } from "vite";
import type { ResolvedShironesPaths } from "../../types.ts";
import { generateMomentThumbnails } from "./generate.ts";

/** Only these can add or change a moment image. */
const IMAGE_EXTENSIONS = /\.(avif|jpeg|jpg|png|webp)$/i;

/** Coalesce the burst of events one save produces. */
const DEBOUNCE_MS = 300;

const pending = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * `buildStart` fires once per Vite environment, and a build creates several —
 * client, server, and the prerender pass. Without this the log repeats three
 * times for one build. Set per process, which is the scope that matters: a
 * second `astro build` is a new process and should report again.
 */
let reportedThisProcess = false;

export function shironesThumbnailsRegeneration(
	paths: ResolvedShironesPaths,
): Plugin {
	const generate = async () => {
		try {
			const result = await generateMomentThumbnails({
				projectRoot: paths.projectRoot,
			});
			if (reportedThisProcess) return;
			reportedThisProcess = true;
			const summary =
				result.generated > 0 ? `Generated ${result.generated}` : "Reused";
			const pruned =
				result.removed > 0 ? `; removed ${result.removed} stale files` : "";
			console.log(
				`[moment-thumbnails] ${summary} thumbnail assets for ${result.total} images${pruned}.`,
			);
		} catch (error) {
			// During `astro dev` a single unreadable image should not stop the
			// server; the next run retries, since the cache only advances on
			// success. A production build is different: the templates reference
			// these files by name, so shipping without them means broken images
			// rather than a degraded dev experience.
			const message = `[moment-thumbnails] generation failed: ${(error as Error).message}`;
			if (isBuild) throw new Error(message, { cause: error });
			console.warn(message);
		}
	};

	// Set by `configResolved`: `astro build` runs Vite in build mode, and a
	// failed generation must stop that run rather than ship missing images.
	let isBuild = false;

	return {
		name: "shirone:thumbnails-regeneration",

		configResolved(config) {
			isBuild = config.command === "build";
		},

		// Awaited, not fired and forgotten: sharp work must finish before Vite
		// starts copying `public/`, or a cold build can ship a partially
		// written thumbnail directory.
		async buildStart() {
			await generate();
		},

		handleHotUpdate({ file }) {
			if (!IMAGE_EXTENSIONS.test(file)) return;
			const root = paths.projectRoot;
			clearTimeout(pending.get(root));
			pending.set(
				root,
				setTimeout(() => {
					void generate();
				}, DEBOUNCE_MS),
			);
		},
	};
}
