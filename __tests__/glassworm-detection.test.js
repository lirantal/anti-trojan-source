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
