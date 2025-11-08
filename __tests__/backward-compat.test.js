/*
 * Tests to ensure backward compatibility aliases still work.
 */

import { hasTrojanSource, hasTrojanSourceInFiles, hasConfusables } from '../src/main.js'
import { writeFileSync, unlinkSync } from 'fs'
import path from 'path'

describe('backward compatibility aliases', () => {
  test('hasTrojanSource returns same boolean as hasConfusables', () => {
    const dangerous = 'const value = "user\u202E // bidi override"'
    expect(hasTrojanSource({ sourceText: dangerous })).toBe(true)
    expect(hasTrojanSource({ sourceText: 'safe value' })).toBe(false)
    // parity check
    expect(hasTrojanSource({ sourceText: dangerous })).toBe(
      hasConfusables({ sourceText: dangerous })
    )
  })

  test('hasTrojanSourceInFiles delegates correctly', () => {
    const tmpFile = path.join(process.cwd(), '__tmp_bidi_sample.js')
    writeFileSync(tmpFile, 'const a = "user\u202E // bidi override"')

    const results = hasTrojanSourceInFiles({ filePaths: [tmpFile] })
    expect(Array.isArray(results)).toBe(true)
    expect(results.length).toBe(1)
    expect(results[0].file).toBe(tmpFile)

    unlinkSync(tmpFile)
  })
})
