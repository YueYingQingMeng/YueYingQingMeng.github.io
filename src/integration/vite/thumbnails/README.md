# `vite/thumbnails/`

Moments pages show a downscaled copy of each image so the list stays light and
the lightbox keeps the original. `generate.ts` writes 192/384/640-wide WebP into
`public/assets/moments/thumbnails/` and prunes outputs whose source is gone.

## Why it is a plugin

Generation used to live in the `dev` and `build` script chains only, so a
package-mode project never regenerated them — the tarball shipped thumbnails for
the template's demo images, and anything the user added got none. Running from
the integration gives both modes one code path, mirroring `../icon/`.

`scripts/content/clean.mjs` also calls `generateMomentThumbnails` directly after
cleaning, which is why the logic is a plain exported function rather than
something hidden inside the plugin.

## Where it runs

`buildStart`, not `astro:config:setup`. Thumbnails land in `public/`, which Astro
copies verbatim — nothing here participates in module resolution, so there is no
import to satisfy first. Using `buildStart` also keeps `astro sync` from paying
for sharp.

`handleHotUpdate` covers adding an image while the dev server is up.

## Freshness is content-based, not mtime

Every CI checkout — and every `pnpm content:sync` materialisation — writes fresh
mtimes. An mtime comparison would miss on every run and regenerate the whole set
each time, so freshness is decided by a SHA-256 of the source image, recorded in
`.cache.json` next to the outputs. An unchanged re-run is a no-op, which is what
makes calling this on every build affordable.

`sharp` runs with `.rotate()` so EXIF orientation is baked in, and
`withoutEnlargement` so a small source is not upscaled.

## If thumbnails stop appearing

Check `.cache.json` — a stale entry plus a zero-byte output makes
`hasUsableOutput` false and forces regeneration, so that combination is safe.
The likelier cause is an unreadable source file; that throws, `regeneration.ts`
warns and continues, and the cache is not advanced, so the next run retries.