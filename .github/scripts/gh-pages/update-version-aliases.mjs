#!/usr/bin/env node
// Updates the vMAJOR, vMAJOR.MINOR, and top-level "latest" alias
// directories in gh-pages, based on every full-semver vX.Y.Z directory
// already published. Prerelease versions (e.g. v0.4.0-draft,
// v0.4.0-pr.52) are never considered as candidates, and never get their
// own alias.

const DOC = `update-version-aliases.mjs

Updates the vMAJOR, vMAJOR.MINOR, and top-level "latest" alias
directories in a gh-pages checkout, based on every full-semver vX.Y.Z
directory already published there. Prerelease versions (e.g.
v0.4.0-draft, v0.4.0-pr.52) are never considered as candidates, and
never get an alias of their own.

'latest' always mirrors the single highest release across every major
line (e.g. once v9.0.0 is published, 'latest', 'v9', 'v9.0', and
'v9.0.0' all mirror it, even though 'v8' would keep pointing at the
highest v8.x.y release). 'vMAJOR' and 'vMAJOR.MINOR' mirror the highest
release within that specific major or major.minor line.

Usage:
  update-version-aliases.mjs <gh-pages-dir>
  update-version-aliases.mjs (-h | --help)

Arguments:
  <gh-pages-dir>  Path to the checked-out gh-pages branch, containing
                   the published version directories.

Options:
  -h --help       Show this help and exit.
`;

import { readdirSync, statSync, rmSync, cpSync } from "node:fs";
import { join } from "node:path";
import { handleHelp } from "./utils.mjs";
import { parseVersion, compareVersions } from "./semver.mjs";

const args = handleHelp(DOC, process.argv.slice(2), { expectedArgCount: 1 });
const ghPagesDir = args[0];

// Only full releases (no prerelease suffix) are alias candidates. This also
// naturally excludes alias directories themselves (v0.3, v0), since they
// don't match the full vX.Y.Z pattern in the first place.
function listReleaseVersions(dir) {
  return readdirSync(dir)
    .filter((name) => statSync(join(dir, name)).isDirectory())
    .map(parseVersion)
    .filter((v) => v !== null && v.prerelease === null);
}

function updateAlias(alias, target) {
  // Guard against an alias colliding with a real full-semver dir (shouldn't
  // happen given parseVersion, but these paths get recursively deleted).
  // "latest" never matches this, so it always passes through untouched.
  if (/^v\d+\.\d+\.\d+$/.test(alias)) {
    console.log(`::error::refusing to alias over full version dir: ${alias}`);
    process.exit(1);
  }
  const aliasPath = join(ghPagesDir, alias);
  const targetPath = join(ghPagesDir, target);
  rmSync(aliasPath, { recursive: true, force: true });
  cpSync(targetPath, aliasPath, { recursive: true });
  console.log(`Updated ${alias} -> ${target}`);
}

const versions = listReleaseVersions(ghPagesDir).sort(compareVersions);

if (versions.length === 0) {
  console.log("No released versions found; skipping alias update.");
  process.exit(0);
}

const latestForMinor = new Map(); // "major.minor" -> dirname
const latestForMajor = new Map(); // "major" -> dirname

// Ascending sort means the last write for a given key is the highest version.
for (const v of versions) {
  latestForMinor.set(`${v.major}.${v.minor}`, v.name);
  latestForMajor.set(`${v.major}`, v.name);
}

// The single highest release across every major line. `versions` is sorted
// ascending, so the last entry is the overall latest -- e.g. if v9.0.0 is
// the newest release, "latest" mirrors it even though older major lines
// (v8, v7, ...) keep their own vMAJOR alias pointing elsewhere.
const overallLatest = versions[versions.length - 1];

for (const [key, target] of latestForMinor) updateAlias(`v${key}`, target);
for (const [key, target] of latestForMajor) updateAlias(`v${key}`, target);
updateAlias("latest", overallLatest.name);
