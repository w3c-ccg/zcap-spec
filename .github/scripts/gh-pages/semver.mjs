// semver.mjs
// Shared semver parsing/validation/comparison helpers for the gh-pages
// deploy scripts. Version directory names look like:
//   v0.4.0            (release)
//   v0.4.0-draft      (prerelease)
//   v0.4.0-pr.52      (pull-request preview, also a prerelease)
// Alias directories like v0.3 or v0 (major/minor "latest" pointers) are
// NOT full semver and will not match VERSION_PATTERN.

export const VERSION_PATTERN = /^v(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/;

// A pull-request preview looks like v0.4.0-pr.52.
export const PR_PREVIEW_PATTERN = /-pr\.\d+$/;

/**
 * Parse a version directory name into its components.
 * Returns null if `name` is not a valid full-semver version string.
 */
export function parseVersion(name) {
  const match = name.match(VERSION_PATTERN);
  if (!match) return null;
  const [, major, minor, patch, prerelease] = match;
  return {
    name,
    major: Number(major),
    minor: Number(minor),
    patch: Number(patch),
    prerelease: prerelease ?? null,
  };
}

/** True if `name` matches the full vX.Y.Z[-prerelease] pattern. */
export function isValidVersion(name) {
  return VERSION_PATTERN.test(name);
}

/** True if `name` is a prerelease (has a -suffix), e.g. v0.4.0-draft. */
export function isPrerelease(name) {
  return /^v\d+\.\d+\.\d+-/.test(name);
}

/** True if `name` is a pull-request preview, e.g. v0.4.0-pr.52. */
export function isPrPreview(name) {
  return PR_PREVIEW_PATTERN.test(name);
}

/**
 * Semver precedence for the prerelease part: identifiers are compared
 * dot-separated; numeric identifiers compare numerically, alphanumeric
 * identifiers compare lexically (ASCII), and numeric identifiers always
 * sort before alphanumeric ones. A version with no prerelease has higher
 * precedence than one with a prerelease.
 */
export function comparePrerelease(a, b) {
  if (a === b) return 0;
  if (a === null) return 1; // no prerelease > has prerelease
  if (b === null) return -1;

  const partsA = a.split(".");
  const partsB = b.split(".");
  const len = Math.max(partsA.length, partsB.length);

  for (let i = 0; i < len; i++) {
    const pa = partsA[i];
    const pb = partsB[i];
    if (pa === undefined) return -1; // fewer fields = lower precedence
    if (pb === undefined) return 1;
    if (pa === pb) continue;

    const na = /^\d+$/.test(pa);
    const nb = /^\d+$/.test(pb);
    if (na && nb) {
      const diff = Number(pa) - Number(pb);
      if (diff !== 0) return diff;
    } else if (na && !nb) {
      return -1; // numeric identifiers always sort before alphanumeric
    } else if (!na && nb) {
      return 1;
    } else {
      if (pa < pb) return -1;
      if (pa > pb) return 1;
    }
  }
  return 0;
}

/** Compare two parsed versions (as returned by parseVersion), ascending. */
export function compareVersions(a, b) {
  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  if (a.patch !== b.patch) return a.patch - b.patch;
  return comparePrerelease(a.prerelease, b.prerelease);
}
