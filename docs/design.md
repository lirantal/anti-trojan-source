# Technical Design

## Core Logic

The core logic of `anti-trojan-source` is simple and efficient. It relies on a predefined list of dangerous Unicode bidirectional characters and checks for their presence in the source code.

### Dangerous Characters

The following is the list of Unicode bidirectional characters that are considered dangerous and are detected by the tool:

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

This list is stored in the `src/constants.js` file.

### Detection Functions

The main detection logic is implemented in the `src/main.js` file, which provides two key functions:

*   `hasTrojanSource({ sourceText })`: This function takes a string of source code as input and iterates through the list of dangerous characters. It returns `true` if any of the dangerous characters are found in the string, and `false` otherwise.

*   `hasTrojanSourceInFiles({ filePaths })`: This function takes an array of file paths as input. It reads the content of each file and uses the `hasTrojanSource` function to check for the presence of dangerous characters. It returns an array of file paths that are identified as containing Trojan Source vulnerabilities.

## Architecture

The project is structured into a few key components:

*   **`bin/anti-trojan-source.js`**: The executable file for the CLI tool.
*   **`src/main.js`**: The core logic for detecting Trojan Source vulnerabilities.
*   **`src/constants.js`**: The list of dangerous Unicode bidirectional characters.
*   **`__tests__`**: The directory containing the tests for the project.
