# Agent specification: anti-trojan-source

This document is for human and automated agents working on the repository. It summarizes purpose, architecture, public surfaces, and invariants so changes stay consistent and safe.

## Mission

`anti-trojan-source` is a security-focused npm package that scans text (source code, docs, configs) for **confusable and invisible Unicode** that can hide malicious logic or mislead reviewers. It targets:

- **Trojan Source**-style attacks: bidirectional and format controls that change how text orders or displays without obvious visual cues in every context.
- **Homoglyph / “glassworm”**-style tricks: dangerous characters from an explicit blocklist (not a full homoglyph / confusables database).
- **Broad category coverage**: all characters classified as Unicode **Format (Cf)** and **Control (Cc)** (with a small whitelist for TAB, LF, CR), so new code points in those categories are caught without updating a hand-maintained list for every Unicode release.
- **Strict supplemental blocklist**: a tiny set of **non-Cf/Cc** code points that are commonly invisible in UI fonts but still carry scalar values in source (e.g. certain Hangul fillers and U+034F); see [`README.md` § Scope](README.md#scope).

**What is in or out of scope** (threat model, UTF‑8 layers, homoglyphs, etc.) is maintained in the **[`README.md` Scope section](README.md#scope)** so it stays a single source of truth—update that table when the product boundary changes.

## Repository layout

| Area | Role |
|------|------|
| [`src/main.js`](src/main.js) | Core API: `hasConfusables`, `hasConfusablesInFiles`; composes explicit list + category checks. |
| [`src/constants.js`](src/constants.js) | Explicit `confusableChars` (BMP bidi/zero-width/etc. + generated extended variation selectors U+10000 block). |
| [`src/extended-blocklist.js`](src/extended-blocklist.js) | Opt-in homoglyphs / extra invisibles; only scanned when `extended: true` (CLI `--extended` / `--all`). |
| [`src/unicode-categories.js`](src/unicode-categories.js) | Cf/Cc range tables, `isSuspiciousByCategory`, naming helpers for reporting. |
| [`src/formatter.js`](src/formatter.js) | CLI output formatting (minimal, verbose, JSON-oriented messaging). |
| [`bin/anti-trojan-source.js`](bin/anti-trojan-source.js) | CLI entry: globbing, stdin, delegates to library with `detailed: true` for reporting. |
| [`cjs/`](cjs/) | **Generated** CommonJS output from Rollup. Do not edit by hand; run `npm run build` after changing `src/`. |

Human-oriented background: [`docs/project.md`](docs/project.md), [`docs/design.md`](docs/design.md). Contribution norms: [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Public API (library)

- **`hasConfusables({ sourceText, detailed, extended })`**
  - `detailed` false (default): returns `boolean`.
  - `detailed` true: returns an array of findings: `line`, `column`, `codePoint`, `name`, `category`, **`severity`** (`high` | `low`), `snippet`.
  - `extended` false (default): only core scan (Cf/Cc + `confusableChars`). `extended` true: also match [`extended-blocklist.js`](src/extended-blocklist.js) (low severity).
- **`hasConfusablesInFiles({ filePaths, detailed, extended })`**: returns an array of `{ file, findings? }` for files that contain confusables (findings present when `detailed` is true).
- Also exported: **`extendedConfusableChars`** (opt-in list array).

Deprecated but still exported for downstream compatibility (prefer migrating callers):

- `hasTrojanSource` → alias of `hasConfusables`
- `hasTrojanSourceInFiles` → alias of `hasConfusablesInFiles`

## CLI

- Paths or `--files` / `-f` glob patterns.
- `--verbose` / `-v`: per-finding detail (includes **high** / **low** and bidi **critical** labels).
- `--json` / `-j`: machine-readable output (each finding includes `severity`).
- `--extended` / `--all`: enable extended blocklist (low severity); see [README](README.md#extended-scan---extended--all).

## Detection model (invariants)

1. **Core layers** (always): (a) substring / membership against `confusableChars`; (b) per–**code point** category check via `isSuspiciousByCategory` (Cf, or Cc except TAB/LF/CR). **Optional third layer**: `extended: true` adds `extendedConfusableChars`; hits are **`severity: low`** and **`category: Extended blocklist`** unless already caught as core (**high** wins).
2. **Unicode code points, not UTF-16 code units**: JavaScript strings are UTF-16. Supplementary characters (e.g. U+E0001, U+E0020–U+E007F tag letters, U+E0100+ variation selectors) occupy two code units. Scans **must** advance with `codePointAt` and `String.fromCodePoint` (or equivalent) so astral characters are evaluated as a single scalar value. Never rely on `charAt(i)` alone for security-sensitive classification.
3. **Column numbers**: In detailed mode, `column` is **1-based** and is the **starting UTF-16 index** of the code point within that line plus one (aligned with common editor column semantics for JavaScript strings).
4. **Snippets**: Findings use a prefix of the line (`substring(0, 80)`) for context; this is UTF-16-based length, not grapheme count.

## Changing behavior

- **New explicit characters**: update [`src/constants.js`](src/constants.js) if they are not already covered by Cf/Cc logic and you need them named or prioritized distinctly. Reserve this for **high-signal** scalars; document additions in [`README.md` Scope](README.md#scope).
- **Extended blocklist** (opt-in, low severity): update [`src/extended-blocklist.js`](src/extended-blocklist.js) only for **ASCII-lookalike** or **high-signal invisible** scalars; update [`README.md` Scope](README.md#scope) when the boundary changes.
- **Strict supplemental invisibles** on the core list (non-Cf/Cc): keep **minimal** — prefer Cf/Cc when Unicode classifies the code point that way.
- **New Cf/Cc ranges** (Unicode adds blocks): update [`src/unicode-categories.js`](src/unicode-categories.js).
- **Scanning logic**: only [`src/main.js`](src/main.js) unless you intentionally extend helpers elsewhere.

Always run tests, lint, and build before merging (see [`DEVELOPMENT.md`](DEVELOPMENT.md)).

## Security stance

Treat findings as **high-signal alerts** for review, not as a complete proof of malice. Legitimate content can include format characters (e.g. in internationalized data); the tool’s job is to make them **visible** to automation and humans.
