# Technical Design

## Core Logic

The core logic of `anti-trojan-source` is simple and efficient. It relies on a predefined list of confusable Unicode characters and checks for their presence in the source code.

### Confusable Characters

The following is the list of Unicode characters that are considered dangerous and are detected by the tool:

*   `U+061C`: ARABIC LETTER MARK
*   `U+200E`: LEFT-TO-RIGHT MARK
*   `U+200F`: RIGHT-TO-LEFT MARK
*   `U+202A`: LEFT-TO-RIGHT EMBEDDING
*   `U+202B`: RIGHT-TO-LEFT EMBEDDING
*   `U+202C`: POP DIRECTIONAL FORMATTING
*   `U+202D`: LEFT-TO-RIGHT OVERRIDE
*   `U+202E`: RIGHT-TO-LEFT OVERRIDE
*   `U+2066`: LEFT-TO-RIGHT ISOLATE
*   `U+2067`: RIGHT-TO-LEFT ISOLATE
*   `U+2068`: FIRST STRONG ISOLATE
*   `U+2069`: POP DIRECTIONAL ISOLATE
*   `U+200B`: Zero Width Space
*   `U+200C`: Zero Width Non-Joiner
*   `U+200D`: Zero Width Joiner
*   `U+2060`: Word Joiner
*   `U+2063`: Invisible Separator
*   `U+00AD`: Soft Hyphen
*   `U+00A0`: No-Break Space
*   `U+FE00` to `U+FE0F`: Variation Selectors 1-16
*   `U+E0100` to `U+E01EF`: Variation Selectors Supplement (240 characters)
*   `U+FEFF`: Zero Width No-Break Space
*   `U+180E`: Mongolian Vowel Separator

This list is stored in the `src/constants.js` file. The Extended Variation Selectors (U+E0100 to U+E01EF) are programmatically generated to avoid hardcoding 240 individual character entries.

### Category-Based Detection

In addition to checking against an explicit list of dangerous characters, the tool also employs **category-based detection** to catch Unicode characters by their category:

*   **Format Category (Cf)**: All Unicode Format characters are flagged as suspicious. This includes bidirectional text markers, invisible formatting characters, and other format control characters.
*   **Control Category (Cc)**: All Unicode Control characters are flagged, **except** for commonly-used whitespace characters:
    *   `U+0009`: TAB
    *   `U+000A`: LINE FEED (LF)
    *   `U+000D`: CARRIAGE RETURN (CR)

This category-based approach is implemented in `src/unicode-categories.js` without requiring any third-party dependencies. It makes the detection future-proof against new Unicode characters that may be added to these categories.

### Detection Functions

The main detection logic is implemented in the `src/main.js` file, which provides two key functions:

*   `hasConfusables({ sourceText, detailed })`: This function takes a string of source code as input and checks for confusable characters.
    *   When `detailed` is `false` (default): Returns a boolean (`true` if confusables found, `false` otherwise)
    *   When `detailed` is `true`: Returns an array of detailed findings, each containing:
        *   `line`: Line number where the character was found
        *   `column`: Column number where the character was found
        *   `codePoint`: Unicode code point (e.g., "U+200B")
        *   `name`: Descriptive name of the character
        *   `category`: Unicode category (e.g., "Cf (Format)")
        *   `snippet`: Context snippet from the line (up to 80 characters)

*   `hasConfusablesInFiles({ filePaths, detailed })`: This function takes an array of file paths as input and checks each file for confusable characters. Returns an array of results for files containing confusables.

### Enhanced Reporting

The CLI tool supports multiple output modes:

*   **Simple mode** (default): Shows a list of affected files
*   **Verbose mode** (`--verbose` or `-v`): Shows detailed information about each detected character including line/column numbers, character names, and code points
*   **JSON mode** (`--json` or `-j`): Outputs results in JSON format for programmatic processing

## Architecture

The project is structured into a few key components:

*   **`bin/anti-trojan-source.js`**: The executable file for the CLI tool with support for verbose and JSON output modes.
*   **`src/main.js`**: The core logic for detecting confusable characters with support for detailed findings.
*   **`src/constants.js`**: The list of confusable Unicode characters (explicit list + programmatically generated ranges).
*   **`src/unicode-categories.js`**: Lightweight Unicode category detection for Format (Cf) and Control (Cc) categories without external dependencies.
*   **`__tests__`**: The directory containing the tests for the project.
