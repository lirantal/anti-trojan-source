import { readFileSync, existsSync } from 'fs'
import { dangerousBidiChars } from '../src/constants.js'

function hasTrojanSource({ sourceText }) {
  const sourceTextToSearch = sourceText.toString()

  for (const bidiChar of dangerousBidiChars) {
    if (sourceTextToSearch.includes(bidiChar)) {
      return true
    }
  }

  return false
}

function hasTrojanSourceInFiles({ filePaths }) {
  const filesFoundVulnerable = []

  for (const filePath of filePaths) {
    if (existsSync(filePath)) {
      const file = readFileSync(filePath, 'utf-8')
      const fileText = file.toString()

      if (hasTrojanSource({ sourceText: fileText })) {
        filesFoundVulnerable.push({
          file: filePath
        })
      }
    }
  }

  return filesFoundVulnerable
}

export { hasTrojanSource, hasTrojanSourceInFiles, dangerousBidiChars }
