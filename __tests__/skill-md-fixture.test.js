import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { hasConfusables, hasConfusablesInFiles } from '../src/main.js'

const __dirname = new URL('.', import.meta.url).pathname

const skillPath = path.join(__dirname, '..', 'SKILL.md')

function isTagOrLanguageFinding(codePointStr) {
  const m = codePointStr.match(/^U\+([0-9A-F]+)$/)
  if (!m) return false
  const cp = parseInt(m[1], 16)
  if (cp === 0xe0001) return true
  if (cp >= 0xe0020 && cp <= 0xe007f) return true
  return false
}

describe('SKILL.md fixture (Unicode language tag + tag letters)', () => {
  test('fixture file exists at repo root', () => {
    expect(existsSync(skillPath)).toBe(true)
  })

  test('detects confusables in SKILL.md as-is', () => {
    const sourceText = readFileSync(skillPath, 'utf8')
    expect(hasConfusables({ sourceText })).toBe(true)
  })

  test('hasConfusablesInFiles includes tag-range findings in detailed mode', () => {
    const results = hasConfusablesInFiles({ filePaths: [skillPath], detailed: true })
    expect(results).toHaveLength(1)
    expect(results[0].file).toBe(skillPath)
    const tagFindings = results[0].findings.filter((f) => isTagOrLanguageFinding(f.codePoint))
    expect(tagFindings.length).toBeGreaterThan(0)
  })
})
