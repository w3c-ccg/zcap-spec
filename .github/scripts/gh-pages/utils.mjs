// utils.mjs
// Shared CLI helpers for the gh-pages deploy scripts.

/**
 * Standard -h/--help + required-positional-arg handling, docopt-style.
 *
 *   - `-h` or `--help` anywhere in argv: print `doc` and exit 0.
 *   - No args at all: treated as a usage error -- print `doc` and exit 1.
 *   - More positional args than `expectedArgCount`: print an error and
 *     `doc`, exit 1.
 *
 * `helpStream` controls where help/usage text is printed: "stdout" (the
 * default) or "stderr". Scripts that print machine-readable output to
 * stdout (e.g. HTML) should pass "stderr" so help text never contaminates
 * piped output.
 *
 * Returns argv unchanged if none of the above applied, so the caller can
 * go on to read its positional arguments.
 */
export function handleHelp(doc, argv, { expectedArgCount = 1, helpStream = "stdout" } = {}) {
  const print = helpStream === "stderr" ? console.error : console.log;

  function exitWithHelp(code) {
    print(doc.trim());
    process.exit(code);
  }

  if (argv.includes("-h") || argv.includes("--help")) {
    exitWithHelp(0);
  }
  if (argv.length === 0) {
    // Missing required argument is a usage error: show help, exit non-zero.
    exitWithHelp(1);
  }
  if (argv.length > expectedArgCount) {
    print(`::error::unexpected extra arguments: ${argv.slice(expectedArgCount).join(" ")}`);
    exitWithHelp(1);
  }
  return argv;
}

/** Print a GitHub Actions error annotation and exit 1. */
export function fail(message) {
  console.error(`::error::${message}`);
  process.exit(1);
}

/** Escape a string for safe inclusion in HTML text/attribute content. */
export function htmlEscape(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
