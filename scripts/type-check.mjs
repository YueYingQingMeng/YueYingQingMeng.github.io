/**
 * `tsc --isolatedDeclarations` gate.
 *
 * Runs the compiler and fails on any error except the documented exception:
 * the four `TS9013` diagnostics on the `collections` entries in
 * `src/content.config.ts`.
 *
 * Why that one cannot be fixed: `defineCollection` is generic, so declaration
 * emit has no way to name each entry's type. Annotating `collections` makes it
 * either re-reference the unnamed consts or drop the per-collection schema
 * types, which turns every `post.data` read into `unknown`. Excluding the file
 * is not an option either — `.astro/content.d.ts` references it through
 * `typeof import(...)`, which pulls it back into the program.
 *
 * Implemented in Node rather than shell so the filter behaves identically on
 * Windows and POSIX. A pipeline like
 * `tsc … | tee /dev/stderr | grep -v … | (! grep -q .)`
 * is bash-only: `/dev/stderr` does not exist on Windows and `(! …)` is not
 * `cmd.exe` syntax, so `pnpm type-check` — the project's primary development
 * platform — would fail to run at all.
 */

import { spawnSync } from "node:child_process";

/** Diagnostics allowed through, matched against the reported file. */
const ALLOWED = [
	{
		file: "src/content.config.ts",
		// Scoped to the code and the count, deliberately: a file-wide exemption
		// would wave through every future error here, which is a weaker
		// guarantee than the comment claims.
		codes: new Set(["TS9013"]),
		maxCount: 4,
		reason:
			"Astro derives entry schemas from this file at build time; see the header comment.",
	},
];

/** Does this diagnostic fall inside `entry`'s documented exception? */
function matchesEntry(diagnostic, entry) {
	const sameFile =
		diagnostic.file === entry.file ||
		diagnostic.file.endsWith(`/${entry.file}`);
	return sameFile && entry.codes.has(diagnostic.code);
}

const result = spawnSync(
	process.execPath,
	["node_modules/typescript/bin/tsc", "--noEmit", "--isolatedDeclarations"],
	{ encoding: "utf8", shell: false },
);

const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
const lines = output.split("\n");

// A diagnostic occupies a `path(line,col): error TSxxxx: …` line; continuation
// lines (the source excerpt tsc prints under it) are indented and carry no
// `error TS` marker, so they are attributed to the diagnostic above them.
const diagnostics = [];
let current = null;
for (const line of lines) {
	const header = line.match(/^(.+?)\(\d+,\d+\):\s+error\s+(TS\d+):/);
	if (header) {
		current = { file: header[1].trim(), code: header[2], text: line };
		diagnostics.push(current);
		continue;
	}
	if (/^\S/.test(line) && !/error\s+TS\d+/.test(line)) {
		current = null; // start of an unrelated section (e.g. "Found 4 errors")
		continue;
	}
	if (current && /^\s/.test(line) && line.trim()) current.text += `\n${line}`;
}

// Classify every diagnostic once: inside a documented exception, or a
// violation. An exemption names specific codes and a count, so a different
// error code in the same file still fails, and so does anything past the
// budget.
const budgetUsed = new Map();
const violations = diagnostics.filter((diagnostic) => {
	const entry = ALLOWED.find((candidate) =>
		matchesEntry(diagnostic, candidate),
	);
	if (!entry) return true;
	const used = budgetUsed.get(entry) ?? 0;
	budgetUsed.set(entry, used + 1);
	return used >= (entry.maxCount ?? Number.POSITIVE_INFINITY);
});

// Report what was waived and what was not: a file can hold both, and calling
// a rejected diagnostic "tolerated" sends the reader down the wrong path.
let allowedCount = 0;
for (const entry of ALLOWED) {
	const relevant = diagnostics.filter((diagnostic) => {
		const sameFile =
			diagnostic.file === entry.file ||
			diagnostic.file.endsWith(`/${entry.file}`);
		return sameFile && entry.codes.has(diagnostic.code);
	});
	const allowed = Math.min(relevant.length, entry.maxCount ?? relevant.length);
	const rejected = relevant.length - allowed;
	if (allowed === 0 && rejected === 0) {
		console.log(
			`[type-check] ${entry.file}: no matching diagnostic — ${entry.reason}`,
		);
		continue;
	}
	console.log(
		`[type-check] ${entry.file}: ${allowed} allowed` +
			(rejected > 0 ? `, ${rejected} rejected (over budget)` : "") +
			` — ${entry.reason}`,
	);
	allowedCount += allowed;
}
if (allowedCount === 0 && diagnostics.length > 0) {
	console.log(
		"[type-check] the documented exception is no longer used; " +
			"drop it from ALLOWED once the file can be annotated.",
	);
}

// Always surface the compiler output: the gate must not hide what it saw.
if (output.trim()) console.log(output.trimEnd());

if (result.error) {
	console.error(`[type-check] failed to run tsc: ${result.error.message}`);
	process.exit(1);
}

// A compiler-level failure (bad tsconfig option, unreadable file, …) is
// reported without a `(line,col)`, so it never becomes a diagnostic and
// would otherwise pass unnoticed. A non-zero exit with nothing captured
// means the run told us something we failed to understand — treat it as a
// failure rather than as a clean tree.
if (result.status !== 0 && diagnostics.length === 0) {
	console.error(
		`[type-check] ✗ tsc exited ${result.status} without a recognisable diagnostic.`,
	);
	console.error(
		"[type-check]   A configuration-level failure carries no file position, so it",
	);
	console.error(
		"[type-check]   cannot be filtered by path. Treat this as a failure.",
	);
	process.exit(1);
}

if (violations.length > 0) {
	console.error(
		`[type-check] ✗ ${violations.length} error(s) beyond the documented exception:`,
	);
	for (const diagnostic of violations) {
		console.error(
			`    ${diagnostic.file}  ${diagnostic.code}  ${diagnostic.text.split("\n")[0].slice(0, 160)}`,
		);
	}
	process.exit(1);
}

console.log("[type-check] ✓ no errors beyond the documented exception");
