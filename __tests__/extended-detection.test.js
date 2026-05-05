import { hasConfusables, hasConfusablesInFiles, extendedConfusableChars } from '../src/main.js'
import path from 'path'
import { readFileSync } from 'fs'

const __dirname = new URL('.', import.meta.url).pathname

describe('extended blocklist (opt-in)', () => {
  test('extended list is non-empty and disjoint from core confusable count', () => {
    expect(extendedConfusableChars.length).toBeGreaterThan(5)
  })

  test('does not flag extended-only homoglyph without extended:true', () => {
    const text = 'const \u0430 = 1'
    expect(hasConfusables({ sourceText: text })).toBe(false)
    expect(hasConfusables({ sourceText: text, detailed: true })).toHaveLength(0)
  })

  test('flags extended-only homoglyph with extended:true', () => {
    const text = 'const \u0430 = 1'
    expect(hasConfusables({ sourceText: text, extended: true })).toBe(true)
    const findings = hasConfusables({ sourceText: text, detailed: true, extended: true })
    expect(findings).toHaveLength(1)
    expect(findings[0].severity).toBe('low')
    expect(findings[0].category).toBe('Extended blocklist')
    expect(findings[0].codePoint).toBe('U+0430')
  })

  test('extended-only invisible (Braille blank)', () => {
    const text = 'x\u2800y'
    expect(hasConfusables({ sourceText: text })).toBe(false)
    const findings = hasConfusables({ sourceText: text, detailed: true, extended: true })
    expect(findings).toHaveLength(1)
    expect(findings[0].severity).toBe('low')
    expect(findings[0].name).toBe('BRAILLE PATTERN BLANK')
  })

  test('core finding remains high when extended is true', () => {
    const text = 'a\u200Bb'
    const findings = hasConfusables({ sourceText: text, detailed: true, extended: true })
    expect(findings).toHaveLength(1)
    expect(findings[0].severity).toBe('high')
    expect(findings[0].codePoint).toBe('U+200B')
  })

  test('fixture: homoglyph file not reported without extended', () => {
    const p = path.join(__dirname, '__fixtures__', 'true-extended-homoglyph.js')
    expect(hasConfusablesInFiles({ filePaths: [p], detailed: false })).toHaveLength(0)
  })

  test('fixture: homoglyph file reported with extended', () => {
    const p = path.join(__dirname, '__fixtures__', 'true-extended-homoglyph.js')
    const res = hasConfusablesInFiles({ filePaths: [p], detailed: true, extended: true })
    expect(res).toHaveLength(1)
    expect(res[0].findings.some((f) => f.severity === 'low')).toBe(true)
  })

  test('fixture: invisible extended file', () => {
    const p = path.join(__dirname, '__fixtures__', 'true-extended-invisible.js')
    expect(hasConfusablesInFiles({ filePaths: [p], extended: false })).toHaveLength(0)
    const res = hasConfusablesInFiles({ filePaths: [p], detailed: true, extended: true })
    expect(res).toHaveLength(1)
    expect(res[0].findings[0].codePoint).toBe('U+2800')
  })

  test('fixture: Cyrillic without homoglyph list letters passes with extended', () => {
    const p = path.join(__dirname, '__fixtures__', 'false-extended-cyrillic-comment.js')
    const content = readFileSync(p, 'utf-8')
    expect(hasConfusables({ sourceText: content, extended: true })).toBe(false)
  })
})
