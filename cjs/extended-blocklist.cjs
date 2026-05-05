'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/**
 * Opt-in extended blocklist (--extended / --all): ASCII lookalike homoglyphs and
 * a few extra “invisible letter” scalars. Not part of default Cf/Cc + core scan.
 * Keep this list small and high-signal; do not add whole scripts.
 */

const extendedExplicitChars = [
  // --- Invisible / blank in common fonts (not in core explicit list) ---
  '\u2800', // BRAILLE PATTERN BLANK — blank cell, often abused as invisible
  '\u3130', // HANGUL LETTER FILLER
  '\uFFA0', // HALFWIDTH HANGUL FILLER

  // --- Cyrillic letters visually confusable with Latin (mixed-script / glassworm) ---
  '\u0410', // CYRILLIC CAPITAL LETTER A
  '\u0412', // CYRILLIC CAPITAL LETTER VE (like B)
  '\u0415', // CYRILLIC CAPITAL LETTER IE (like E)
  '\u0417', // CYRILLIC CAPITAL LETTER ZE (like digit 3 / Latin)
  '\u041E', // CYRILLIC CAPITAL LETTER O
  '\u0420', // CYRILLIC CAPITAL LETTER ER (like P)
  '\u0421', // CYRILLIC CAPITAL LETTER ES (like C)
  '\u0422', // CYRILLIC CAPITAL LETTER TE (like T / m in some fonts)
  '\u0423', // CYRILLIC CAPITAL LETTER U
  '\u0425', // CYRILLIC CAPITAL LETTER HA (like X)
  '\u0430', // CYRILLIC SMALL LETTER A
  '\u0435', // CYRILLIC SMALL LETTER IE
  '\u043E', // CYRILLIC SMALL LETTER O
  '\u0440', // CYRILLIC SMALL LETTER ER
  '\u0441', // CYRILLIC SMALL LETTER ES
  '\u0443', // CYRILLIC SMALL LETTER U
  '\u0445', // CYRILLIC SMALL LETTER HA
  '\u0442', // CYRILLIC SMALL LETTER TE
  '\u0456', // CYRILLIC SMALL LETTER BYELORUSSIAN-UKRAINIAN I (like Latin i)

  // --- Greek letters confusable with Latin ---
  '\u0391', // GREEK CAPITAL LETTER ALPHA (like A)
  '\u03B1', // GREEK SMALL LETTER ALPHA
  '\u039F', // GREEK CAPITAL LETTER OMICRON (like O)
  '\u03BF', // GREEK SMALL LETTER OMICRON
  '\u03C1', // GREEK SMALL LETTER RHO (like p)
  '\u03C3', // GREEK SMALL LETTER SIGMA (like o in some fonts / script confusion)

  // --- Digit lookalikes (strict) ---
  '\u0669' // ARABIC-INDIC DIGIT NINE (like 9)
];

const extendedConfusableChars = extendedExplicitChars;

const extendedConfusableSet = new Set(extendedExplicitChars);

function isExtendedConfusableChar(char) {
  return extendedConfusableSet.has(char)
}

exports.extendedConfusableChars = extendedConfusableChars;
exports.extendedConfusableSet = extendedConfusableSet;
exports.isExtendedConfusableChar = isExtendedConfusableChar;
