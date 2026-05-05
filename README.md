<p align="center"><h1 align="center">
  anti-trojan-source
</h1>

<p align="center">
  Detect trojan source attacks that employ unicode bidi attacks to inject malicious code
</p>

<p align="center">
  <img src="https://github.com/lirantal/anti-trojan-source/raw/main/.github/anti-trojan-source-logo.png" height="220">
</p>

<p align="center">
  <a href="https://www.npmjs.org/package/anti-trojan-source"><img src="https://badgen.net/npm/v/anti-trojan-source" alt="npm version"/></a>
  <a href="https://www.npmjs.org/package/anti-trojan-source"><img src="https://badgen.net/npm/license/anti-trojan-source" alt="license"/></a>
  <a href="https://www.npmjs.org/package/anti-trojan-source"><img src="https://badgen.net/npm/dt/anti-trojan-source" alt="downloads"/></a>
  <a href="https://github.com/lirantal/anti-trojan-source/actions/workflows/main.yml"><img src="https://github.com/lirantal/anti-trojan-source/actions/workflows/main.yml/badge.svg?branch=main" alt="build"/></a>
  <a href="https://codecov.io/gh/lirantal/anti-trojan-source"><img src="https://badgen.net/codecov/c/github/lirantal/anti-trojan-source" alt="codecov"/></a>
  <a href="./SECURITY.md"><img src="https://img.shields.io/badge/Security-Responsible%20Disclosure-yellow.svg" alt="Responsible Disclosure Policy" /></a>
</p>

# About

Detects cases of [trojan source attacks](https://trojansource.codes) that employ unicode bidi attacks to inject malicious code, as well as other attacks that use confusable characters (such as glassworm attacks). The tool uses both an explicit list of dangerous Unicode characters and category-based detection to catch invisible characters by their Unicode category (Format and Control categories).

<https://github.com/user-attachments/assets/8f10628f-3746-469e-a296-01523beeaa42>

If you're using ESLint:
* See: [eslint-plugin-anti-trojan-source](https://github.com/lirantal/eslint-plugin-anti-trojan-source) for a purpose-bulit plugin to detect anti-trojan characters.
* This plugin [inspired work](https://github.com/eslint-community/eslint-plugin-security/pull/95) to create an anti-trojan rule `detect-bidi-characters` in [eslint-plugin-security](https://github.com/eslint-community/eslint-plugin-security) and if you're already using that security plugin then it is advised to turn on that rule.

## Detection Capabilities

`anti-trojan-source` provides comprehensive protection by detecting:

- **281 explicit confusable scalars** — bidirectional controls, zero-width characters, BMP variation selectors, a small set of non-Cf/Cc invisibles (Hangul fillers, U+034F), plus **240** supplementary variation selectors (U+E0100–U+E01EF)
- **All Unicode Format characters (Cf category)** — invisible formatting characters by category (including Unicode **tag letters** used for ASCII smuggling / hidden payloads)
- **All Unicode Control characters (Cc category)** — except commonly-used whitespace (TAB, LF, CR)

Category-based Cf/Cc detection keeps the tool **future-proof** as Unicode adds new format or control code points. The explicit list covers characters that matter for security but are **not** Cf/Cc (e.g. BMP variation selectors are **Mn**, not Cf).

## Scope

This project scans **decoded Unicode text** — the string you get after reading a UTF‑8 (or other Unicode encoding) file the usual way. It does **not** inspect raw bytes, URLs, or tokenizer-specific behavior.

### In scope

| Topic | Detection approach |
| ----- | ------------------ |
| Trojan Source (bidi embeddings, overrides, isolates, PDF, etc.) | Cf ranges + explicit list |
| Zero-width / word joiner / BOM / soft hyphen (where Cf or listed) | Cf + explicit list |
| **Unicode Tags block** (U+E0001, U+E0020–U+E007F) — invisible ASCII-shaped payloads ([background](https://embracethered.com/blog/posts/2024/hiding-and-finding-text-with-unicode-tags/)) | Cf |
| Variation selectors (BMP U+FE00–U+FE0F + supplement U+E0100–U+E01EF) | Explicit list (**Mn** in Unicode, not Cf) |
| **Strict explicit blocklist** of a few **non-Cf/Cc** scalars that often render invisibly (U+034F, U+115F, U+1160, U+3164) | Explicit list only |
| Any other **Format (Cf)** or **Control (Cc)** code point | Category tables (Cc minus TAB/LF/CR) |
| Dangerous confusables on the maintained explicit list (e.g. NO-BREAK SPACE) | Explicit list |

### Out of scope

| Topic | Reason |
| ----- | ------ |
| Full homoglyph / mixed-script confusable-IDN databases (“every Cyrillic lookalike of Latin”) | Requires a large, policy-heavy confusables data set; we only flag **listed** confusables plus **all** Cf/Cc |
| UTF‑8 “sneaky” byte patterns, overlong encodings, non-Unicode steganography | Needs **byte-level** analysis, not scalar-by-scalar Unicode |
| URL / percent-encoded layers, HTML entities | Decode/normalize elsewhere first |
| Full rendering, grapheme clusters, locale-specific display rules | Tooling is scalar-based and intentionally simple |
| Whether a finding is malicious | High-signal alert for human review |

## Invisible Characters Support Matrix

The following table summarizes attack styles versus what this tool flags:

| Attack Type | Supported | Notes |
| ----------- | :-------: | ----- |
| **Trojan Source** | ✅ | Bidi / format controls per [trojansource.codes](https://trojansource.codes). |
| **Glassworm / confusable identifiers** | ✅ (partial) | Flags **explicit** confusables and **all** Cf/Cc — not a complete homoglyph alphabet. |
| **Unicode tag / “ASCII smuggling”** | ✅ | Tag letters are **Cf**; see [Embrace The Red](https://embracethered.com/blog/posts/2024/hiding-and-finding-text-with-unicode-tags/). |
| **Extended variation selectors** | ✅ | U+E0100–U+E01EF on explicit list. |
| **Category-based Cf / Cc** | ✅ | Future-proof for new format/control code points. |
| **Invisible letters (strict list)** | ✅ | U+034F, Hangul fillers — explicit blocklist only. |

## Why is Confusable Unicode Character detection important?

The following publication on the topic of unicode characters attacks, dubbed [Trojan Source: Invisible Vulnerabilities](https://trojansource.codes/trojan-source.pdf), has caused a lot of concern from potential supply chain attacks where adversaries are able to inject malicious code into the source code of a project, slipping by unseen in the code review process. This project expands on that to detect other forms of confusable characters that can be used in similar attacks.

For more information on the topic, you're welcome to read on the official website [trojansource.codes](https://trojansource.codes/) and the following [source code repository](https://github.com/nickboucher/trojan-source/) which contains the source code of the publication.

---

Table of Contents

- [About](#about)
  - [Detection Capabilities](#detection-capabilities)
  - [Scope](#scope)
  - [Invisible Characters Support Matrix](#invisible-characters-support-matrix)
  - [Why is Confusable Unicode Character detection important?](#why-is-confusable-unicode-character-detection-important)
- [Use as a CLI](#use-as-a-cli)
  - [Detect confusable characters using file globbing](#detect-confusable-characters-using-file-globbing)
  - [Detect confusable characters using file paths](#detect-confusable-characters-using-file-paths)
  - [Detect confusable characters by piping input](#detect-confusable-characters-by-piping-input)
  - [Verbose output mode](#verbose-output-mode)
  - [JSON output mode](#json-output-mode)
- [Use as an eslint plugin](#use-as-an-eslint-plugin)
- [Use as a library](#use-as-a-library)
  - [Simple boolean check](#simple-boolean-check)
  - [Detailed findings](#detailed-findings)
- [Use as a pre-commit hook](#use-as-a-pre-commit-hook)
- [References](#references)
- [Contributing](#contributing)
- [Author](#author)

---

# Use as a CLI

`anti-trojan-source` is an npm package that supports detecting files that contain confusable unicode characters in them, per the research.

## Detect confusable characters using file globbing

The following command will detect all files that contain confusable unicode characters in them based on the file matching pattern that was provided to it:

```bash
npx anti-trojan-source --files='src/**/*.js'
```

If it doesn't find anything it will return with a 0 exit code and print to stdout:

```
[✓] No confusable characters detected
```

## Detect confusable characters using file paths

```bash
npx anti-trojan-source '/src/index.js' '/src/helper.js'
```

If it found any matching confusable unicode characters, it will return with an exit code of 1 and print to stderr:

```
[x] Detected cases of confusable characters in the following files:
|
 - /src/index.js
 - /src/helper.js
Note: For backward compatibility, `hasTrojanSource({...})` is still exported as an alias to `hasConfusables({...})`. It is deprecated and will be removed in a future major version. Prefer `hasConfusables` going forward.

```

## Detect confusable characters by piping input

If you just run `npx anti-trojan-source` and pipe in a file contents, it will detect the confusable unicode characters in that file:

```bash
cat /src/index.js | npx anti-trojan-source
```

## Verbose output mode

Use the `--verbose` (or `-v`) flag to get detailed information about each detected character, including line and column numbers, character names, and Unicode code points:

```bash
npx anti-trojan-source --files='src/**/*.js' --verbose
```

Example output:

```
[x] Detected cases of trojan source in the following files:
| 
 - src/utils.js

   Line 12:34 - U+200B ZERO WIDTH SPACE [Cf (Format)]
   Snippet: const value = getUserInput()
   Line 45:10 - U+202E RIGHT-TO-LEFT OVERRIDE [Cf (Format)]
   Snippet: if (isAdmin) { // Check permissions
```

This mode is particularly useful for:
- **Code reviews**: Quickly identify where invisible characters are located
- **Debugging**: Understand which specific characters are causing issues
- **Security audits**: Get detailed reports of all suspicious characters

## JSON output mode

Use the `--json` (or `-j`) flag to get machine-readable JSON output, perfect for CI/CD integration and automated processing:

```bash
npx anti-trojan-source --files='src/**/*.js' --json
```

Example output:

```json
[
  {
    "file": "src/utils.js",
    "findings": [
      {
        "line": 12,
        "column": 34,
        "codePoint": "U+200B",
        "name": "ZERO WIDTH SPACE",
        "category": "Cf (Format)",
        "snippet": "const value = getUserInput()"
      }
    ]
  }
]
```

This mode enables:
- **CI/CD integration**: Parse results programmatically in your pipeline
- **Custom reporting**: Build your own reporting tools on top of the detection
- **Automated workflows**: Trigger specific actions based on findings

# Use as an eslint plugin

Refer to the ESLint Plugin for this CLI and the README on that repository which clearly explains how to set it up: [eslint-plugin-anti-trojan-source](https://github.com/lirantal/eslint-plugin-anti-trojan-source).

# Use as a library

## Simple boolean check

To use it as a library and pass it file contents to detect (backward compatible):

```js
import { hasConfusables } from 'anti-trojan-source'

const isDangerous = hasConfusables({
  sourceText: 'if (accessLevel != "user‮ ⁦// Check if admin⁩ ⁦") {'
})

console.log(isDangerous) // true or false
```

`hasConfusables` returns a boolean when called without the `detailed` option.

## Detailed findings

Get comprehensive information about detected characters including their location, names, and categories:

```js
import { hasConfusables } from 'anti-trojan-source'

const findings = hasConfusables({
  sourceText: 'const value\u200b = 123', // Contains ZERO WIDTH SPACE
  detailed: true
})

console.log(findings)
// [
//   {
//     line: 1,
//     column: 12,
//     codePoint: "U+200B",
//     name: "ZERO WIDTH SPACE",
//     category: "Cf (Format)",
//     snippet: "const value = 123"
//   }
// ]
```

Each finding includes:
- **line**: Line number where the character was found
- **column**: Column number where the character was found  
- **codePoint**: Unicode code point (e.g., "U+200B")
- **name**: Descriptive name of the character
- **category**: Unicode category or classification
- **snippet**: Context from the line (up to 80 characters)

You can also check multiple files at once:

```js
import { hasConfusablesInFiles } from 'anti-trojan-source'

const results = hasConfusablesInFiles({
  filePaths: ['src/index.js', 'src/utils.js'],
  detailed: true // Optional: get detailed findings
})

console.log(results)
// [
//   {
//     file: "src/index.js",
//     findings: [ /* array of findings */ ]
//   }
// ]
```

# Use as a pre-commit hook

To add this tool to your project as a [`pre-commit`](https://pre-commit.com) hook, try this sample configuration in `.pre-commit-config.yaml`:

```yaml
repos:
  - repo: https://github.com/lirantal/anti-trojan-source
    rev: v1.8.1  # choose the release you want
    hooks:
      - id: anti-trojan-source
```

# References

- [Hiding and finding text with Unicode Tags](https://embracethered.com/blog/posts/2024/hiding-and-finding-text-with-unicode-tags/) — Unicode tag letters, LLM / review bypass, and links to specs (Embrace The Red).
- [ASCII Smuggler](https://embracethered.com/blog/ascii-smuggler.html) — encode/decode tool for tags, variant selectors, and related invisible patterns (Embrace The Red).
- [Trojan Source](https://trojansource.codes/) — original bidi / trojan source research and paper.

# Contributing

Please consult [CONTRIBUTING](./CONTRIBUTING.md) for guidelines on contributing to this project.

# Author

**anti-trojan-source** © [Liran Tal](https://github.com/lirantal), Released under the [Apache-2.0](./LICENSE) License.
