import { hasConfusables } from '../src/main.js'
import { getCharacterName } from '../src/unicode-categories.js'

// Mongolian free variation selectors: variation selectors (like VS1-VS256) that
// live in the Mongolian block. They are Default_Ignorable_Code_Point, so they
// render invisibly and can hide a payload the same way the existing zero-width
// and variation-selector entries do.
const FVS = [
  { hex: 'U+180B', cp: 0x180b, name: 'MONGOLIAN FREE VARIATION SELECTOR ONE' },
  { hex: 'U+180C', cp: 0x180c, name: 'MONGOLIAN FREE VARIATION SELECTOR TWO' },
  { hex: 'U+180D', cp: 0x180d, name: 'MONGOLIAN FREE VARIATION SELECTOR THREE' },
  { hex: 'U+180F', cp: 0x180f, name: 'MONGOLIAN FREE VARIATION SELECTOR FOUR' }
]

describe('Mongolian free variation selectors', () => {
  test.each(FVS)('flags $hex as confusable', ({ cp }) => {
    const text = 'value' + String.fromCodePoint(cp) + 'end'
    expect(hasConfusables({ sourceText: text })).toBe(true)
  })

  test.each(FVS)('reports the name for $hex', ({ cp, name }) => {
    expect(getCharacterName(cp)).toBe(name)
  })

  test('detailed mode reports a free variation selector finding', () => {
    const text = 'a' + String.fromCodePoint(0x180b) + 'b'
    const findings = hasConfusables({ sourceText: text, detailed: true })

    expect(findings).toHaveLength(1)
    expect(findings[0].codePoint).toBe('U+180B')
    expect(findings[0].name).toBe('MONGOLIAN FREE VARIATION SELECTOR ONE')
    expect(findings[0].severity).toBe('high')
  })

  test('does not flag a visible Mongolian letter', () => {
    // U+1820 MONGOLIAN LETTER A is a normal visible letter, not invisible.
    const text = 'a' + String.fromCodePoint(0x1820) + 'b'
    expect(hasConfusables({ sourceText: text })).toBe(false)
  })
})
