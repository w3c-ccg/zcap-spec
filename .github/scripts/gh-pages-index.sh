#!/usr/bin/env bash
# Regenerate the root index.html of the gh-pages site.
#
#   $ .github/scripts/gh-pages-index.sh ./gh-pages
#
# Lists every `v*` directory found at the root of the given directory, and
# redirects to the latest non-pull-request version when loaded. Append `?all`
# to the URL to see the listing without being redirected.
set -euo pipefail

root="${1:?usage: gh-pages-index.sh <gh-pages-dir>}"

if [ ! -d "$root" ]; then
  echo "gh-pages-index: no such directory: $root" >&2
  exit 1
fi

# Collect version directories (portable: no mapfile, no find -printf).

# Sort versions by semver precedence, ascending, on stdin/stdout.
# `sort -V` alone is wrong here: it ranks `v0.4.0-draft` above `v0.4.0`, but
# semver says a prerelease precedes its release. Split each version into
# core + prerelease, give a missing prerelease the sentinel `~` (which sorts
# after all alphanumerics in the C locale), then sort core with -V.
semver_sort() {
  sed '/^$/d' \
    | awk '{
        core = $0; pre = "~";
        i = index($0, "-");
        if (i > 0) { core = substr($0, 1, i - 1); pre = substr($0, i + 1); }
        # Zero-pad numeric prerelease identifiers so pr.7 sorts before pr.52.
        n = split(pre, part, ".");
        key = "";
        for (j = 1; j <= n; j++) {
          key = key (part[j] ~ /^[0-9]+$/ ? sprintf("%010d", part[j]) : part[j]) ".";
        }
        printf "%s\t%s\t%s\n", core, key, $0;
      }' \
    | LC_ALL=C sort -t "$(printf '\t')" -k1,1V -k2,2 \
    | cut -f3
}

versions=""
for dir in "$root"/v[0-9]*/; do
  [ -d "$dir" ] || continue
  name="$(basename "$dir")"
  versions="${versions}${name}
"
done
versions="$(printf '%s' "$versions" | semver_sort || true)"

if [ -z "$versions" ]; then
  echo "gh-pages-index: no version directories found in $root" >&2
fi

# Releases vs. pull-request previews. A PR preview looks like `v0.4.0-pr.52`.
releases="$(printf '%s\n' "$versions" | grep -v -E -- '-pr\.[0-9]+' || true)"
previews="$(printf '%s\n' "$versions" | grep    -E -- '-pr\.[0-9]+' || true)"

# "latest" never points at a pull-request preview, so an open PR can never
# hijack the root redirect.
latest="$(printf '%s\n' "$releases" | semver_sort | tail -n 1 || true)"

html_escape() {
  printf '%s' "$1" | sed -e 's/&/\&amp;/g' -e 's/</\&lt;/g' -e 's/>/\&gt;/g' -e 's/"/\&quot;/g'
}

list_items() {
  # $1: newline separated version names, newest first
  local name
  printf '%s\n' "$1" | semver_sort | tac | while IFS= read -r name; do
    local esc
    esc="$(html_escape "$name")"
    printf '        <li><a href="./%s/">%s</a></li>\n' "$esc" "$esc"
  done
}

{
  cat <<'HTML_HEAD'
<!DOCTYPE html>
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
HTML_HEAD

  if [ -n "$(printf '%s' "$releases" | sed '/^$/d')" ]; then
    printf '\n<h2>Versions</h2>\n<ul>\n'
    list_items "$releases"
    printf '</ul>\n'
  fi

  if [ -n "$(printf '%s' "$previews" | sed '/^$/d')" ]; then
    printf '\n<h2>Pull request previews</h2>\n<ul>\n'
    list_items "$previews"
    printf '</ul>\n'
  fi

  if [ -n "$latest" ]; then
    printf '\n<footer>Loading this page redirects to <a href="./%s/">%s</a>. Append <code>?all</code> to stay here.</footer>\n' \
      "$(html_escape "$latest")" "$(html_escape "$latest")"
  fi

  cat <<HTML_SCRIPT

<script>
(function () {
  var latest = "$(html_escape "$latest")";
  if (!latest) { return; }
  // Escape hatch: /?all or /#all shows this listing instead of redirecting.
  if (/(^|[?&#])all(=|&|\$)/.test(window.location.search + window.location.hash)) { return; }
  window.location.replace(latest + "/" + window.location.hash);
})();
</script>
HTML_SCRIPT

  cat <<'HTML_TAIL'
</body>
</html>
HTML_TAIL
} > "$root/index.html"

# gh-pages should serve files verbatim, not run them through Jekyll.
touch "$root/.nojekyll"

echo "gh-pages-index: wrote $root/index.html (latest=${latest:-none})"
