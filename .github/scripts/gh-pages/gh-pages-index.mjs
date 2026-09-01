#!/usr/bin/env node
// Build the root index.html of the gh-pages site and print it to stdout.

const DOC = `gh-pages-index.mjs

Builds the root index.html of the gh-pages site and prints it to
stdout.

Lists every full-semver 'vX.Y.Z' or 'vX.Y.Z-prerelease' directory found
at the root of the given directory (major/minor "latest" alias
directories such as 'v0.3' or 'v0' are not full semver and are not
listed), and produces a page that redirects to the latest
non-pull-request version when loaded. Append '?all' to the URL to see
the listing without being redirected.

This script only reads the filesystem; it does not write index.html or
.nojekyll itself. The caller is responsible for redirecting stdout to
the right file and for creating .nojekyll, e.g.:

  node gh-pages-index.mjs gh-pages > gh-pages/index.html
  touch gh-pages/.nojekyll

Usage:
  gh-pages-index.mjs <gh-pages-dir>
  gh-pages-index.mjs (-h | --help)

Arguments:
  <gh-pages-dir>  Path to the checked-out gh-pages branch, containing
                   the published version directories.

Options:
  -h --help       Show this help and exit.
`;

import { readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { handleHelp, htmlEscape } from "./utils.mjs";
import { parseVersion, compareVersions, isPrPreview } from "./semver.mjs";

// Unlike the other scripts, help/usage text goes to stderr here, not
// stdout -- stdout is reserved exclusively for the generated HTML, since
// the intended usage is `node gh-pages-index.mjs dir > index.html`.
const args = handleHelp(DOC, process.argv.slice(2), {
  expectedArgCount: 1,
  helpStream: "stderr",
});
const root = args[0];

if (!existsSync(root) || !statSync(root).isDirectory()) {
  console.error(`gh-pages-index: no such directory: ${root}`);
  process.exit(1);
}

function listVersions(dir) {
  return readdirSync(dir)
    .filter((name) => statSync(join(dir, name)).isDirectory())
    .map(parseVersion)
    .filter((v) => v !== null);
}

const allVersions = listVersions(root).sort(compareVersions);

if (allVersions.length === 0) {
  console.error(`gh-pages-index: no version directories found in ${root}`);
}

// Releases vs. pull-request previews.
const releases = allVersions.filter((v) => !isPrPreview(v.name));
const previews = allVersions.filter((v) => isPrPreview(v.name));

// "latest" never points at a pull-request preview, so an open PR can never
// hijack the root redirect. Also never a prerelease build (e.g. -draft).
const latestCandidates = releases.filter((v) => v.prerelease === null);
const latest = latestCandidates.length > 0
  ? latestCandidates[latestCandidates.length - 1]
  : null;

function listItems(versions) {
  // Newest first.
  return [...versions]
    .reverse()
    .map((v) => {
      const esc = htmlEscape(v.name);
      return `        <li><a href="./${esc}/">${esc}</a></li>`;
    })
    .join("\n");
}

const releasesSection = releases.length > 0
  ? `\n<h2>Versions</h2>\n<ul>\n${listItems(releases)}\n</ul>\n`
  : "";

const previewsSection = previews.length > 0
  ? `\n<h2>Pull request previews</h2>\n<ul>\n${listItems(previews)}\n</ul>\n`
  : "";

const footer = latest
  ? `\n<footer>Loading this page redirects to <a href="./${htmlEscape(latest.name)}/">${htmlEscape(latest.name)}</a>. Append <code>?all</code> to stay here.</footer>\n`
  : "";

const redirectScript = latest
  ? `
<script>
(function () {
  var latest = "${htmlEscape(latest.name)}";
  if (!latest) { return; }
  // Escape hatch: /?all or /#all shows this listing instead of redirecting.
  if (/(^|[?&#])all(=|&|$)/.test(window.location.search + window.location.hash)) { return; }
  window.location.replace(latest + "/" + window.location.hash);
})();
</script>
`
  : "";

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Authorization Capabilities (ZCAP) — published versions</title>
<style>
  :root { color-scheme: light dark; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    line-height: 1.5;
    max-width: 42rem;
    margin: 0 auto;
    padding: 2rem 1.25rem 4rem;
  }
  h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
  h2 { font-size: 1rem; text-transform: uppercase; letter-spacing: 0.04em; opacity: 0.7; margin-top: 2rem; }
  p.lede { margin-top: 0; opacity: 0.8; }
  ul { list-style: none; padding: 0; }
  li { padding: 0.4rem 0; border-bottom: 1px solid rgba(128,128,128,0.25); }
  a { text-decoration: none; }
  a:hover { text-decoration: underline; }
  footer { margin-top: 3rem; font-size: 0.85rem; opacity: 0.65; }
  code { font-size: 0.9em; }
</style>
</head>
<body>
<h1>Authorization Capabilities (ZCAP)</h1>
<p class="lede">Published versions of the specification.</p>
${releasesSection}${previewsSection}${footer}${redirectScript}</body>
</html>
`;

// stdout is reserved for the HTML itself; status goes to stderr.
process.stdout.write(html);
console.error(`gh-pages-index: built index (latest=${latest ? latest.name : "none"})`);
