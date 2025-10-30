import { readFileSync, existsSync } from 'fs'
import { confusableChars } from '../src/constants.js'

function hasConfusables({ sourceText }) {
  const sourceTextToSearch = sourceText.toString()

  for (const confusableChar of confusableChars) {
    if (sourceTextToSearch.includes(confusableChar)) {
      return true
    }
  }

  return false
}

function hasConfusablesInFiles({ filePaths }) {
  const filesFoundVulnerable = []

  for (const filePath of filePaths) {
    if (existsSync(filePath)) {
      const file = readFileSync(filePath, 'utf-8')
      const fileText = file.toString()

      if (hasConfusables({ sourceText: fileText })) {
        filesFoundVulnerable.push({
          file: filePath
        })
      }
    }
  }

  return filesFoundVulnerable
}

export { hasConfusables, hasConfusablesInFiles, confusableChars }
