'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

// Explicit list of dangerous confusable characters
const explicitConfusableChars = [
  '\u061C', // ARABIC LETTER MARK
  '\u200E', // LEFT-TO-RIGHT MARK
  '\u200F', // RIGHT-TO-LEFT MARK
  '\u202A', // LEFT-TO-RIGHT EMBEDDING
  '\u202B', // RIGHT-TO-LEFT EMBEDDING
  '\u202C', // POP DIRECTIONAL FORMATTING
  '\u202D', // LEFT-TO-RIGHT OVERRIDE
  '\u202E', // RIGHT-TO-LEFT OVERRIDE
  '\u2066', // LEFT-TO-RIGHT ISOLATE
  '\u2067', // RIGHT-TO-LEFT ISOLATE
  '\u2068', // FIRST STRONG ISOLATE
  '\u2069', // POP DIRECTIONAL ISOLATE
  '\u200B', // ZERO WIDTH SPACE
  '\u200C', // ZERO WIDTH NON-JOINER
  '\u200D', // ZERO WIDTH JOINER
  '\u2060', // WORD JOINER
  '\u2063', // INVISIBLE SEPARATOR
  '\u00AD', // SOFT HYPHEN
  '\u00A0', // NO-BREAK SPACE
  '\uFE00', // VARIATION SELECTOR-1
  '\uFE01', // VARIATION SELECTOR-2
  '\uFE02', // VARIATION SELECTOR-3
  '\uFE03', // VARIATION SELECTOR-4
  '\uFE04', // VARIATION SELECTOR-5
  '\uFE05', // VARIATION SELECTOR-6
  '\uFE06', // VARIATION SELECTOR-7
  '\uFE07', // VARIATION SELECTOR-8
  '\uFE08', // VARIATION SELECTOR-9
  '\uFE09', // VARIATION SELECTOR-10
  '\uFE0A', // VARIATION SELECTOR-11
  '\uFE0B', // VARIATION SELECTOR-12
  '\uFE0C', // VARIATION SELECTOR-13
  '\uFE0D', // VARIATION SELECTOR-14
  '\uFE0E', // VARIATION SELECTOR-15
  '\uFE0F', // VARIATION SELECTOR-16
  '\uFEFF', // ZERO WIDTH NO-BREAK SPACE (BOM)
  '\u180E' // MONGOLIAN VOWEL SEPARATOR
];

// Generate Extended Variation Selectors (U+E0100 to U+E01EF)
// These are Variation Selectors Supplement - 240 characters
function generateExtendedVariationSelectors() {
  const selectors = [];
  for (let codePoint = 0xe0100; codePoint <= 0xe01ef; codePoint++) {
    selectors.push(String.fromCodePoint(codePoint));
  }
  return selectors
}

// Combine all confusable characters
const confusableChars = [...explicitConfusableChars, ...generateExtendedVariationSelectors()];

exports.confusableChars = confusableChars;
