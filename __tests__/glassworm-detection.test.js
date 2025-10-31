import { hasConfusables, confusableChars } from '../src/main.js'
import { readFileSync } from 'fs'

test('shouldnt detect confusable because this text is innocent', () => {
  expect(hasConfusables({ sourceText: 'bla bla bla' })).toBe(false)
})

test('the list of confusable characters should be more than 12', () => {
  expect(confusableChars.length).toBeGreaterThan(12)
})

test('detects all those confusable characters', () => {
  confusableChars.forEach((char) => {
    expect(
      hasConfusables({
        sourceText: `this is some text that could have \n and \r and even \n\r but above all it has this confusable character: ${char} which the library should detect`
      })
    ).toBe(true)
  })
})

test('detects confusable characters in a fixture file', () => {
  const fileContent = readFileSync('./__tests__/__fixtures__/true-glassworm.js', 'utf-8')
  expect(hasConfusables({ sourceText: fileContent })).toBe(true)
})

test('detects NO-BREAK SPACE (U+00A0) character', () => {
  const textWithNBSP = 'if (user\u00A0== "admin") return true'
  expect(hasConfusables({ sourceText: textWithNBSP })).toBe(true)
})

test('detects NO-BREAK SPACE in realistic code context', () => {
  // NO-BREAK SPACE character between words that looks like normal space
  const codeWithNBSP = 'const\u00A0value = process.env.API_KEY || "default"'
  expect(hasConfusables({ sourceText: codeWithNBSP })).toBe(true)
})

test('detects NO-BREAK SPACE in fixture file', () => {
  const fileContent = readFileSync('./__tests__/__fixtures__/true-nbsp.js', 'utf-8')
  expect(hasConfusables({ sourceText: fileContent })).toBe(true)
})

test('the list should include Extended Variation Selectors', () => {
  // Should have 37 explicit chars + 240 Extended Variation Selectors = 277
  expect(confusableChars.length).toBe(277)
})

test('detects Extended Variation Selectors (U+E0100)', () => {
  // Test first Extended Variation Selector
  const textWithExtVS = `const value${String.fromCodePoint(0xe0100)} = 123`
  expect(hasConfusables({ sourceText: textWithExtVS })).toBe(true)
})

test('detects Extended Variation Selectors (U+E01EF)', () => {
  // Test last Extended Variation Selector
  const textWithExtVS = `const value${String.fromCodePoint(0xe01ef)} = 123`
  expect(hasConfusables({ sourceText: textWithExtVS })).toBe(true)
})

test('detects Extended Variation Selectors in middle of range', () => {
  // Test middle of Extended Variation Selectors range
  const textWithExtVS = `const value${String.fromCodePoint(0xe0150)} = 123`
  expect(hasConfusables({ sourceText: textWithExtVS })).toBe(true)
})

test('detects Extended Variation Selectors in fixture file', () => {
  const fileContent = readFileSync('./__tests__/__fixtures__/true-extended-vs.js', 'utf-8')
  expect(hasConfusables({ sourceText: fileContent })).toBe(true)
})
