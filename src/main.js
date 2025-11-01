import { readFileSync, existsSync } from 'fs'
import { confusableChars } from '../src/constants.js'
import {
  isSuspiciousByCategory,
  getCharacterName,
  getCategoryName
} from '../src/unicode-categories.js'

/**
 * Check if text contains confusable characters
 * @param {Object} options - Options object
 * @param {string} options.sourceText - The text to check
 * @param {boolean} options.detailed - Return detailed findings (default: false)
 * @returns {boolean|Array} - Boolean if not detailed, array of findings if detailed
 */
function hasConfusables({ sourceText, detailed = false }) {
  const sourceTextToSearch = sourceText.toString()

  if (!detailed) {
    // Fast path for boolean check - maintain backward compatibility
    for (const confusableChar of confusableChars) {
      if (sourceTextToSearch.includes(confusableChar)) {
        return true
      }
    }

    // Also check by category
    for (let i = 0; i < sourceTextToSearch.length; i++) {
      const char = sourceTextToSearch.charAt(i)
      if (isSuspiciousByCategory(char)) {
        return true
      }
    }

    return false
  }

  // Detailed mode: return findings with line/column information
  const findings = []
  const lines = sourceTextToSearch.split('\n')

  lines.forEach((line, lineIndex) => {
    const lineNumber = lineIndex + 1

    for (let colIndex = 0; colIndex < line.length; colIndex++) {
      const char = line.charAt(colIndex)
      const codePoint = char.codePointAt(0)

      // Check if char is in explicit confusables list or suspicious by category
      const isInExplicitList = confusableChars.includes(char)
      const isSuspicious = isInExplicitList || isSuspiciousByCategory(char)

      if (isSuspicious) {
        findings.push({
          line: lineNumber,
          column: colIndex + 1,
          codePoint: `U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}`,
          name: getCharacterName(codePoint),
          category: getCategoryName(char),
          snippet: line.substring(0, 80) // First 80 chars of the line
        })
      }
    }
  })

  return findings
}

/**
 * Check files for confusable characters
 * @param {Object} options - Options object
 * @param {Array} options.filePaths - Array of file paths to check
 * @param {boolean} options.detailed - Return detailed findings (default: false)
 * @returns {Array} - Array of results
 */
function hasConfusablesInFiles({ filePaths, detailed = false }) {
  const filesFoundVulnerable = []

  for (const filePath of filePaths) {
    if (existsSync(filePath)) {
      const file = readFileSync(filePath, 'utf-8')
      const fileText = file.toString()

      if (detailed) {
        const findings = hasConfusables({ sourceText: fileText, detailed: true })
        if (findings.length > 0) {
          filesFoundVulnerable.push({
            file: filePath,
            findings
          })
        }
      } else {
        if (hasConfusables({ sourceText: fileText })) {
          filesFoundVulnerable.push({
            file: filePath
          })
        }
      }
    }
  }

  return filesFoundVulnerable
}

export { hasConfusables, hasConfusablesInFiles, confusableChars }
