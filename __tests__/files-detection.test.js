import { hasTrojanSourceInFiles } from '../src/main.js'
import path from 'path'

const __dirname = new URL('.', import.meta.url).pathname

test('should detect that file really has trojan source -complex1 typescript file', () => {
  const vulnerableFiles = [path.join(__dirname, '__fixtures__', 'true-trojan-source-complex1.ts')]

  const result = hasTrojanSourceInFiles({ filePaths: vulnerableFiles })
  expect(result).toHaveLength(1)
  expect(result[0].file.includes('true-trojan-source-complex1.ts')).toBe(true)
})

test('should detect that file really has trojan source', () => {
  const vulnerableFiles = [path.join(__dirname, '__fixtures__', 'true-trojan-source.js')]

  const result = hasTrojanSourceInFiles({ filePaths: vulnerableFiles })
  expect(result).toHaveLength(1)
  expect(result[0].file.includes('true-trojan-source.js')).toBe(true)
})

test('should not detect that file really has trojan source because it really doesnt have it', () => {
  const vulnerableFiles = [path.join(__dirname, '__fixtures__', 'false-trojan-source.js')]

  const result = hasTrojanSourceInFiles({ filePaths: vulnerableFiles })
  expect(result).toHaveLength(0)
})

test('should not detect that file really has trojan source because when file paths dont actually exist', () => {
  const vulnerableFiles = [
    path.join(__dirname, '__fixtures__', 'this-doesnt-really-exist-on-the-fs-trojan-source.js')
  ]

  const result = hasTrojanSourceInFiles({ filePaths: vulnerableFiles })
  expect(result).toHaveLength(0)
})
