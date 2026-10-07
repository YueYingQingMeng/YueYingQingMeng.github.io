# `vite/icon/`

`Icon.svelte` imports `@/generated/local-icon-collections`, a tree-shaken subset
of the installed `@iconify-json/*` sets. Tree-shaking is the reason this exists:

| | icons | size |
|---|---|---|
| full sets | 30407 | 14.4 MB |
| what a theme uses | ~200 | ~107 KB |

The alternatives do not work here. Loading the Iconify API at runtime puts a
network request on first paint, which `AGENTS.md` forbids; one chunk per icon
means one request per glyph. A single generated module keeps the icons offline
and in one request.

## Files

- `collections.ts` — scans the sources, resolves each referenced glyph through
  its alias chain, writes the collection module.
- `regeneration.ts` — the Vite plugin that keeps it current.

## Where it runs

`regeneration.ts` regenerates in two places:

- `buildStart` — the collection must exist before Vite resolves
  `Icon.svelte`. This runs for `astro dev` and `astro build`. `astro sync`
  does not fire it, so that command reads whatever the last dev or build
  left behind; run `pnpm dev` once after adding an icon to a component.
- `handleHotUpdate` — an icon added while the dev server is up regenerates
  without a restart. This is the reason the plugin exists at all; generation used
  to happen only in the script chain, which ran once before the server started.

There is deliberately no CLI wrapper. An earlier version exposed
`pnpm icons:generate`; with the hook in place it had no callers left except the
`dev`/`build` chains it duplicated.

## What gets scanned

`packageSrc` (the theme's own components) and `contentDir` (a user's posts,
absent in source mode). Together those cover both modes without a mode check:
in source mode the theme *is* the project, so `packageSrc` already contains
`src/content`.

`ICON_PREFIXES` in `collections.ts` is the allow-list of usable sets, and it
duplicates `iconInclude` in `src/config/integrationsConfig.ts`. Both need a new
set; keep them in step.

## Gotcha: Vite resolves aliases before plugins

`Icon.svelte` writes the specifier `@/generated/local-icon-collections`, but by
the time a plugin's `resolveId` runs, Vite has already rewritten it — to
`packageRoot/src/...` in source mode (via tsconfig paths) and to
`<package>/src/...` in package mode. `enforce: "pre"` does not change this.

This is also why the collection is a real file rather than a virtual module.
Serving it from `load()` needs the virtual id to parse as TypeScript (the
generated source uses `as const`), and a generated module has to exist on disk
for the packaging step's local-import check anyway.

`regeneration.ts` writes the file and adds a `resolveId` that points
`Icon.svelte` at it, falling back to the copy shipped in the package. That
fallback is what makes the two modes behave the same: in package mode the alias
resolves into `node_modules`, where this plugin must not write, so without the
redirect a user's own posts would never reach the collection.

### Verifying the redirect

Delete the packaged copy and build — if it still succeeds, the user's file is
what got read:

```
mv node_modules/shirones/src/generated/local-icon-collections.ts{,.bak}
pnpm build   # must succeed
```

Confirm the consumer actually has the change first. `pnpm build` in the
packaging repo only rewrites `dist/`; a throwaway consumer keeps the tarball it
installed until it re-installs. Testing against a stale install makes a working
redirect look broken — and `Icon.svelte` shipping as source is easy to miss,
because `find node_modules/shirones -name Icon.svelte` follows no symlink under
pnpm's layout and reports nothing while the file is there.

## Errors are swallowed on purpose

`regeneration.ts` catches failures. A typo in one post should cost one icon,
not take the dev server down or fail a deploy. The CLI path is gone, so nothing
reports the problem loudly — if an icon silently does not appear, check that the
name exists in the installed set.