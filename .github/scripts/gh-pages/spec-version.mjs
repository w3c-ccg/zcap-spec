#!/usr/bin/env node
// Print the spec version parsed out of the <title> element of an HTML file.
//
//   $ node .github/scripts/spec-version.mjs index.html
//   v0.4.0-draft
//
// The <title> is the single source of truth for the version of the spec,
// e.g. `<title>Authorization Capabilities v0.4.0-draft</title>`.

const DOC = `spec-version.mjs

Prints the spec version parsed out of the <title> element of an HTML
file, e.g. <title>Authorization Capabilities v0.4.0-draft</title>
prints "v0.4.0-draft".

Usage:
  spec-version.mjs [<html-file>]
  spec-version.mjs (-h | --help)

Arguments:
  <html-file>  Path to the HTML file to read the <title> from.
               [default: index.html]

Options:
  -h --help    Show this help and exit.
`;

import { readFileSync, existsSync } from "node:fs";

function printHelpAndExit(code) {
  console.log(DOC.trim());
  process.exit(code);
}

function fail(message) {
  console.error(`spec-version: ${message}`);
  process.exit(1);
}

const args = process.argv.slice(2);

if (args.includes("-h") || args.includes("--help")) {
  printHelpAndExit(0);
}

if (args.length > 1) {
  console.error(`spec-version: unexpected extra arguments: ${args.slice(1).join(" ")}`);
  printHelpAndExit(1);
}

// Unlike the other scripts in this repo, this argument is optional -- it
// defaults to index.html, matching the original spec-version.sh behavior.
const htmlPath = args[0] ?? "index.html";

if (!existsSync(htmlPath)) {
  fail(`no such file: ${htmlPath}`);
}

const html = readFileSync(htmlPath, "utf8");

// Join lines so a <title> split across lines still matches, then take the
// first non-greedy <title>...</title>.
const joined = html.replace(/\n/g, " ");
const titleMatch = joined.match(/<title>([^<]*)<\/title>/i);

if (!titleMatch) {
  fail(`no <title> element found in ${htmlPath}`);
}

const title = titleMatch[0];

// semver, optionally with a `-prerelease` and/or `+build` part.
const versionMatch = title.match(/v?\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?/);

if (!versionMatch) {
  fail(`no semver found in title: ${title}`);
}

let version = versionMatch[0];
if (!version.startsWith("v")) {
  version = `v${version}`;
}

console.log(version);
