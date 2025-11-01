import { hasConfusables } from '../src/main.js'
import {
  isFormatChar,
  isControlChar,
  isSuspiciousByCategory,
  getCharacterName,
  getCategoryName,
  ALLOWED_CONTROL_CHARS
} from '../src/unicode-categories.js'

describe('Unicode Category Detection', () => {
  test('identifies Format characters (Cf)', () => {
    // Test some known Format characters
    expect(isFormatChar(0x200b)).toBe(true) // ZERO WIDTH SPACE
    expect(isFormatChar(0x200c)).toBe(true) // ZERO WIDTH NON-JOINER
    expect(isFormatChar(0x202a)).toBe(true) // LEFT-TO-RIGHT EMBEDDING
    expect(isFormatChar(0xfeff)).toBe(true) // ZERO WIDTH NO-BREAK SPACE
    expect(isFormatChar(0x061c)).toBe(true) // ARABIC LETTER MARK
  })

  test('does not identify regular characters as Format', () => {
    expect(isFormatChar(0x0041)).toBe(false) // 'A'
    expect(isFormatChar(0x0061)).toBe(false) // 'a'
    expect(isFormatChar(0x0020)).toBe(false) // SPACE
  })

  test('identifies Control characters (Cc)', () => {
    expect(isControlChar(0x00)).toBe(true) // NULL
    expect(isControlChar(0x01)).toBe(true) // START OF HEADING
    expect(isControlChar(0x1f)).toBe(true) // UNIT SEPARATOR
    expect(isControlChar(0x7f)).toBe(true) // DELETE
    expect(isControlChar(0x9f)).toBe(true) // APPLICATION PROGRAM COMMAND
  })

  test('whitelists TAB, LF, CR control characters', () => {
    expect(ALLOWED_CONTROL_CHARS.has(0x09)).toBe(true) // TAB
    expect(ALLOWED_CONTROL_CHARS.has(0x0a)).toBe(true) // LF
    expect(ALLOWED_CONTROL_CHARS.has(0x0d)).toBe(true) // CR
  })

  test('does not flag whitelisted control characters as suspicious', () => {
    expect(isSuspiciousByCategory('\t')).toBe(false) // TAB
    expect(isSuspiciousByCategory('\n')).toBe(false) // LF
    expect(isSuspiciousByCategory('\r')).toBe(false) // CR
  })

  test('flags non-whitelisted control characters as suspicious', () => {
    expect(isSuspiciousByCategory('\u0000')).toBe(true) // NULL
    expect(isSuspiciousByCategory('\u0001')).toBe(true) // START OF HEADING
    expect(isSuspiciousByCategory('\u001f')).toBe(true) // UNIT SEPARATOR
  })

  test('flags Format characters as suspicious', () => {
    expect(isSuspiciousByCategory('\u200b')).toBe(true) // ZERO WIDTH SPACE
    expect(isSuspiciousByCategory('\u202e')).toBe(true) // RIGHT-TO-LEFT OVERRIDE
  })

  test('detects control characters in text via category', () => {
    const textWithNull = 'hello\u0000world'
    expect(hasConfusables({ sourceText: textWithNull })).toBe(true)
  })

  test('detects Format characters in text via category', () => {
    // Test a Format character not in our explicit list
    const textWithFormatChar = 'test\u0600value' // ARABIC NUMBER SIGN
    expect(hasConfusables({ sourceText: textWithFormatChar })).toBe(true)
  })

  test('returns proper character names', () => {
    expect(getCharacterName(0x200b)).toBe('ZERO WIDTH SPACE')
    expect(getCharacterName(0x202e)).toBe('RIGHT-TO-LEFT OVERRIDE')
    expect(getCharacterName(0x00a0)).toBe('NO-BREAK SPACE')
    expect(getCharacterName(0xfe00)).toBe('VARIATION SELECTOR-1')
    expect(getCharacterName(0xe0100)).toBe('VARIATION SELECTOR-17')
  })

  test('returns descriptive names for control characters', () => {
    const name = getCharacterName(0x01)
    expect(name).toContain('CONTROL CHARACTER')
    expect(name).toContain('C0 control')
  })

  test('returns descriptive names for C1 control characters', () => {
    const name = getCharacterName(0x80)
    expect(name).toContain('CONTROL CHARACTER')
    expect(name).toContain('C1 control')
  })

  test('returns variation selector names correctly', () => {
    expect(getCharacterName(0xfe00)).toBe('VARIATION SELECTOR-1')
    expect(getCharacterName(0xfe0f)).toBe('VARIATION SELECTOR-16')
    expect(getCharacterName(0xe0100)).toBe('VARIATION SELECTOR-17')
    expect(getCharacterName(0xe01ef)).toBe('VARIATION SELECTOR-256')
  })

  test('getCategoryName identifies variation selectors', () => {
    expect(getCategoryName(String.fromCodePoint(0xfe00))).toBe('Variation Selector')
    expect(getCategoryName(String.fromCodePoint(0xe0100))).toBe('Variation Selector')
  })

  test('getCategoryName returns Confusable for explicit list items', () => {
    expect(getCategoryName('\u00a0')).toBe('Confusable')
  })
})

describe('Enhanced Reporting', () => {
  test('hasConfusables returns boolean by default', () => {
    const result = hasConfusables({ sourceText: 'normal text' })
    expect(typeof result).toBe('boolean')
    expect(result).toBe(false)
  })

  test('hasConfusables returns array when detailed=true', () => {
    const result = hasConfusables({ sourceText: 'normal text', detailed: true })
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBe(0)
  })

  test('detailed mode returns findings with line and column', () => {
    const text = 'line1\nline2\u200btest\nline3'
    const findings = hasConfusables({ sourceText: text, detailed: true })

    expect(findings.length).toBeGreaterThan(0)
    expect(findings[0]).toHaveProperty('line')
    expect(findings[0]).toHaveProperty('column')
    expect(findings[0]).toHaveProperty('codePoint')
    expect(findings[0]).toHaveProperty('name')
    expect(findings[0]).toHaveProperty('category')
    expect(findings[0]).toHaveProperty('snippet')

    expect(findings[0].line).toBe(2)
    expect(findings[0].codePoint).toBe('U+200B')
  })

  test('detailed mode includes character name and category', () => {
    const text = 'test\u200bvalue' // Use ZERO WIDTH SPACE which is Cf
    const findings = hasConfusables({ sourceText: text, detailed: true })

    expect(findings[0].name).toBe('ZERO WIDTH SPACE')
    expect(findings[0].category).toContain('Cf')
  })

  test('detailed mode handles multiple findings on same line', () => {
    const text = 'test\u200b\u200cvalue'
    const findings = hasConfusables({ sourceText: text, detailed: true })

    expect(findings.length).toBe(2)
    expect(findings[0].line).toBe(1)
    expect(findings[1].line).toBe(1)
    expect(findings[0].column).not.toBe(findings[1].column)
  })

  test('detailed mode handles findings across multiple lines', () => {
    const text = 'line1\u200b\nline2\u200c\nline3'
    const findings = hasConfusables({ sourceText: text, detailed: true })

    expect(findings.length).toBe(2)
    expect(findings[0].line).toBe(1)
    expect(findings[1].line).toBe(2)
  })

  test('snippet is truncated to 80 characters', () => {
    const longLine = 'a'.repeat(100) + '\u200b' + 'b'.repeat(100)
    const findings = hasConfusables({ sourceText: longLine, detailed: true })

    expect(findings[0].snippet.length).toBeLessThanOrEqual(80)
  })
})
