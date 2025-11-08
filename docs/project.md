# Project Overview

## Introduction

`anti-trojan-source` is a security tool designed to detect and prevent attacks that use confusable Unicode characters to create visually deceptive code. This includes Trojan Source attacks, which exploit bidirectional characters, as well as other attacks like glassworm that use invisible characters to hide malicious code.

The tool provides comprehensive detection through:
- **Explicit character list**: 277 dangerous Unicode characters including bidirectional text markers, zero-width characters, and variation selectors
- **Category-based detection**: Automatically detects ALL Unicode Format (Cf) and Control (Cc) characters by category, making the tool future-proof against new Unicode characters
- **Enhanced reporting**: Detailed findings with line/column numbers, character names, and categories

## Purpose

The primary purpose of this project is to provide a simple and effective way to scan source code for the presence of dangerous confusable Unicode characters. By detecting these characters through both explicit lists and category-based detection, the tool helps to mitigate the risk of attacks that can be used to introduce malicious code that is not easily visible during code reviews.

## Features

*   **CLI Tool:** A command-line interface for scanning files and directories with support for:
    *   Simple boolean detection (backward compatible)
    *   Verbose mode (`--verbose` / `-v`) with detailed character information
    *   JSON mode (`--json` / `-j`) for programmatic processing and CI/CD integration
*   **Library:** A JavaScript library that can be integrated into other tools and workflows with both simple and detailed detection modes.
*   **ESLint Plugin:** An ESLint plugin for real-time detection of confusable characters in your code.
*   **Pre-commit Hook:** A pre-commit hook to prevent committing code that contains dangerous Unicode characters.
*   **Category-Based Detection:** Detects characters by Unicode category (Format and Control) without requiring external dependencies, making detection future-proof.
*   **No External Dependencies:** Unicode category detection is implemented using lightweight, dependency-free code.

## Compatibility and Migration

For projects that previously used the `hasTrojanSource*` functions, backward-compatible aliases are still exported:

- `hasTrojanSource({...})` (alias of `hasConfusables({...})`)
- `hasTrojanSourceInFiles({...})` (alias of `hasConfusablesInFiles({...})`)

These aliases are deprecated and will be removed in a future major release. New consumers should use `hasConfusables` and `hasConfusablesInFiles`.

## How it Works

The tool works in two complementary ways:

1. **Explicit Character List**: Searches for a predefined list of 277 dangerous Unicode characters, including:
   - Bidirectional text markers (U+202A-U+202E, etc.)
   - Zero-width characters (U+200B, U+200C, U+200D)
   - Variation selectors (U+FE00-U+FE0F and U+E0100-U+E01EF)
   - Other invisible confusable characters

2. **Category-Based Detection**: Checks each character against Unicode categories:
   - **Format (Cf)**: ALL Unicode Format characters are flagged
   - **Control (Cc)**: ALL Control characters except TAB, LF, and CR are flagged

If any suspicious characters are found, the tool can either return a simple boolean result (for backward compatibility) or provide detailed findings with line numbers, column positions, character names, and Unicode categories.
