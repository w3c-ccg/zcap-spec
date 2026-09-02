#!/usr/bin/env node
// Resolves the gh-pages version prefix for this deploy, and writes it
// (plus whether it's a prerelease) to $GITHUB_OUTPUT.

const DOC = `determine-version.mjs

Resolves the gh-pages version prefix for a deploy, applies PR-build
suffixing, validates it as a safe semver, and writes the result to
$GITHUB_OUTPUT as 'version' and 'is_prerelease'.

Usage:
  determine-version.mjs <raw-version>
  determine-version.mjs (-h | --help)

Arguments:
  <raw-version>  Either the workflow_dispatch 'version' input, or the
                 output of spec-version.mjs (parsed from <title>). A
                 leading 'v' is added if missing.

Options:
  -h --help      Show this help and exit.

Environment:
  HAD_EXPLICIT_INPUT  "true" if <raw-version> came from the workflow
                       input (PR-suffixing is skipped in that case).
                       Any other value (or unset) means it was parsed
                       from <title>.
  PR_NUMBER            Pull request number, if this run is for a PR.
  GITHUB_OUTPUT        Path to the file GitHub Actions reads outputs
                       from. Required.
`;

import { appendFileSync } from "node:fs";
import { handleHelp, fail } from "./utils.mjs";
import { isValidVersion, isPrerelease } from "./semver.mjs";

const args = handleHelp(DOC, process.argv.slice(2), { expectedArgCount: 1 });
const rawVersion = args[0];

const hadExplicitInput = process.env.HAD_EXPLICIT_INPUT === "true";
const prNumber = process.env.PR_NUMBER || "";
const githubOutput = process.env.GITHUB_OUTPUT;
if (!githubOutput) fail("GITHUB_OUTPUT is not set");

let version = rawVersion.startsWith("v") ? rawVersion : `v${rawVersion}`;

// For a pull request build, add `-pr.N` to the prerelease part, so
// `v0.4.0-draft` on PR 52 becomes `v0.4.0-pr.52`. Only applies when the
// version was computed from <title>, not when explicitly given as input.
if (prNumber && !hadExplicitInput) {
  const versionNoBuild = version.split("+")[0];
  const versionNoPrerelease = versionNoBuild.split("-")[0];
  version = `${versionNoPrerelease}-pr.${prNumber}`;
}

// Reject anything that is not a plain semver -- this string becomes a
// directory name and is passed to recursive deletes/copies downstream.
if (!isValidVersion(version)) {
  fail(`refusing to deploy to unsafe version prefix: ${version}`);
}

const prerelease = isPrerelease(version);

console.log(`Publishing to prefix: ${version} (prerelease: ${prerelease})`);

appendFileSync(githubOutput, `version=${version}\n`);
appendFileSync(githubOutput, `is_prerelease=${prerelease}\n`);
