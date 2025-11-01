/**
 * Lightweight Unicode category detection without external dependencies
 * Focuses on Format (Cf) and Control (Cc) categories for security detection
 */

// Allowed control characters (TAB, LF, CR)
export const ALLOWED_CONTROL_CHARS = new Set([0x09, 0x0a, 0x0d])

/**
 * Unicode category ranges for Format characters (Cf)
 * Based on Unicode 15.1 specification
 */
const FORMAT_CHAR_RANGES = [
  [0x00ad, 0x00ad], // SOFT HYPHEN
  [0x0600, 0x0605], // ARABIC NUMBER SIGN..ARABIC NUMBER MARK ABOVE
  [0x061c, 0x061c], // ARABIC LETTER MARK
  [0x06dd, 0x06dd], // ARABIC END OF AYAH
  [0x070f, 0x070f], // SYRIAC ABBREVIATION MARK
  [0x0890, 0x0891], // ARABIC POUND MARK ABOVE..ARABIC PIASTRE MARK ABOVE
  [0x08e2, 0x08e2], // ARABIC DISPUTED END OF AYAH
  [0x180e, 0x180e], // MONGOLIAN VOWEL SEPARATOR
  [0x200b, 0x200f], // ZERO WIDTH SPACE..RIGHT-TO-LEFT MARK
  [0x202a, 0x202e], // LEFT-TO-RIGHT EMBEDDING..RIGHT-TO-LEFT OVERRIDE
  [0x2060, 0x2064], // WORD JOINER..INVISIBLE PLUS
  [0x2066, 0x206f], // LEFT-TO-RIGHT ISOLATE..NOMINAL DIGIT SHAPES
  [0xfeff, 0xfeff], // ZERO WIDTH NO-BREAK SPACE
  [0xfff9, 0xfffb], // INTERLINEAR ANNOTATION ANCHOR..INTERLINEAR ANNOTATION TERMINATOR
  [0x110bd, 0x110bd], // KAITHI NUMBER SIGN
  [0x110cd, 0x110cd], // KAITHI NUMBER SIGN ABOVE
  [0x13430, 0x1343f], // EGYPTIAN HIEROGLYPH VERTICAL JOINER..EGYPTIAN HIEROGLYPH END WALLED ENCLOSURE
  [0x1bca0, 0x1bca3], // SHORTHAND FORMAT LETTER OVERLAP..SHORTHAND FORMAT UP STEP
  [0x1d173, 0x1d17a], // MUSICAL SYMBOL BEGIN BEAM..MUSICAL SYMBOL END PHRASE
  [0xe0001, 0xe0001], // LANGUAGE TAG
  [0xe0020, 0xe007f] // TAG SPACE..CANCEL TAG
]

/**
 * Check if a code point belongs to Unicode Format category (Cf)
 */
export function isFormatChar(codePoint) {
  for (const [start, end] of FORMAT_CHAR_RANGES) {
    if (codePoint >= start && codePoint <= end) {
      return true
    }
  }
  return false
}

/**
 * Check if a code point belongs to Unicode Control category (Cc)
 * Control characters are in ranges: U+0000-U+001F and U+007F-U+009F
 */
export function isControlChar(codePoint) {
  return (codePoint >= 0x00 && codePoint <= 0x1f) || (codePoint >= 0x7f && codePoint <= 0x9f)
}

/**
 * Check if a character is suspicious based on Unicode category
 * Returns true for Cf (Format) or Cc (Control) categories, except whitelisted chars
 */
export function isSuspiciousByCategory(char) {
  const codePoint = char.codePointAt(0)

  // Whitelist allowed control characters (TAB, LF, CR)
  if (ALLOWED_CONTROL_CHARS.has(codePoint)) {
    return false
  }

  // Check if it's a Format character (Cf)
  if (isFormatChar(codePoint)) {
    return true
  }

  // Check if it's a Control character (Cc)
  if (isControlChar(codePoint)) {
    return true
  }

  return false
}

/**
 * Get Unicode category name for a character
 */
export function getCategoryName(char) {
  const codePoint = char.codePointAt(0)

  if (ALLOWED_CONTROL_CHARS.has(codePoint)) {
    return 'Allowed'
  }

  if (isFormatChar(codePoint)) {
    return 'Cf (Format)'
  }

  if (isControlChar(codePoint)) {
    return 'Cc (Control)'
  }

  // Check if it's a variation selector or other known confusable
  if (
    (codePoint >= 0xfe00 && codePoint <= 0xfe0f) ||
    (codePoint >= 0xe0100 && codePoint <= 0xe01ef)
  ) {
    return 'Variation Selector'
  }

  // For characters in explicit list but not in Format/Control categories
  return 'Confusable'
}

/**
 * Get a descriptive name for common invisible characters
 * Falls back to generic descriptions if not in our known list
 */
export function getCharacterName(codePoint) {
  const names = new Map([
    [0x00ad, 'SOFT HYPHEN'],
    [0x061c, 'ARABIC LETTER MARK'],
    [0x180e, 'MONGOLIAN VOWEL SEPARATOR'],
    [0x200b, 'ZERO WIDTH SPACE'],
    [0x200c, 'ZERO WIDTH NON-JOINER'],
    [0x200d, 'ZERO WIDTH JOINER'],
    [0x200e, 'LEFT-TO-RIGHT MARK'],
    [0x200f, 'RIGHT-TO-LEFT MARK'],
    [0x202a, 'LEFT-TO-RIGHT EMBEDDING'],
    [0x202b, 'RIGHT-TO-LEFT EMBEDDING'],
    [0x202c, 'POP DIRECTIONAL FORMATTING'],
    [0x202d, 'LEFT-TO-RIGHT OVERRIDE'],
    [0x202e, 'RIGHT-TO-LEFT OVERRIDE'],
    [0x2060, 'WORD JOINER'],
    [0x2061, 'FUNCTION APPLICATION'],
    [0x2062, 'INVISIBLE TIMES'],
    [0x2063, 'INVISIBLE SEPARATOR'],
    [0x2064, 'INVISIBLE PLUS'],
    [0x2066, 'LEFT-TO-RIGHT ISOLATE'],
    [0x2067, 'RIGHT-TO-RIGHT ISOLATE'],
    [0x2068, 'FIRST STRONG ISOLATE'],
    [0x2069, 'POP DIRECTIONAL ISOLATE'],
    [0x206a, 'INHIBIT SYMMETRIC SWAPPING'],
    [0x206b, 'ACTIVATE SYMMETRIC SWAPPING'],
    [0x206c, 'INHIBIT ARABIC FORM SHAPING'],
    [0x206d, 'ACTIVATE ARABIC FORM SHAPING'],
    [0x206e, 'NATIONAL DIGIT SHAPES'],
    [0x206f, 'NOMINAL DIGIT SHAPES'],
    [0x00a0, 'NO-BREAK SPACE'],
    [0xfeff, 'ZERO WIDTH NO-BREAK SPACE'],
    [0xfff9, 'INTERLINEAR ANNOTATION ANCHOR'],
    [0xfffa, 'INTERLINEAR ANNOTATION SEPARATOR'],
    [0xfffb, 'INTERLINEAR ANNOTATION TERMINATOR']
  ])

  // Check if it's a variation selector
  if (codePoint >= 0xfe00 && codePoint <= 0xfe0f) {
    return `VARIATION SELECTOR-${codePoint - 0xfe00 + 1}`
  }

  if (codePoint >= 0xe0100 && codePoint <= 0xe01ef) {
    return `VARIATION SELECTOR-${codePoint - 0xe0100 + 17}`
  }

  // Check if it's a control character
  if (isControlChar(codePoint)) {
    if (codePoint <= 0x1f) {
      return `CONTROL CHARACTER (C0 control: 0x${codePoint.toString(16).toUpperCase()})`
    }
    return `CONTROL CHARACTER (C1 control: 0x${codePoint.toString(16).toUpperCase()})`
  }

  return (
    names.get(codePoint) || `UNKNOWN (U+${codePoint.toString(16).toUpperCase().padStart(4, '0')})`
  )
}
