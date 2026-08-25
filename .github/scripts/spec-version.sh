#!/usr/bin/env bash
# Print the spec version parsed out of the <title> element of an HTML file.
#
#   $ .github/scripts/spec-version.sh index.html
#   v0.4.0-draft
#
# The <title> is the single source of truth for the version of the spec,
# e.g. `<title>Authorization Capabilities v0.4.0-draft</title>`.
set -euo pipefail

html="${1:-index.html}"

if [ ! -f "$html" ]; then
  echo "spec-version: no such file: $html" >&2
  exit 1
fi

# Join lines so a <title> split across lines still matches, then take the
# first non-greedy <title>...</title>.
title="$(tr '\n' ' ' < "$html" | grep -o -i -E '<title>[^<]*</title>' | head -n 1 || true)"

if [ -z "$title" ]; then
  echo "spec-version: no <title> element found in $html" >&2
  exit 1
fi

# semver, optionally with a `-prerelease` and/or `+build` part.
version="$(printf '%s' "$title" \
  | grep -o -E 'v?[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?' \
  | head -n 1 || true)"

if [ -z "$version" ]; then
  echo "spec-version: no semver found in title: $title" >&2
  exit 1
fi

case "$version" in
  v*) ;;
  *) version="v$version" ;;
esac

printf '%s\n' "$version"
