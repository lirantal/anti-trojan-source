import { readFileSync, existsSync } from 'fs'
import { confusableChars } from './constants.js'
import { isExtendedConfusableChar, extendedConfusableChars } from './extended-blocklist.js'
import {
  isSuspiciousByCategory,
  getCharacterName,
  getCategoryName
} from './unicode-categories.js'

function isHighSeverityChar(char) {
  return confusableChars.includes(char) || isSuspiciousByCategory(char)
}

/**
 * Check if text contains confusable characters
 * @param {Object} options - Options object
 * @param {string} options.sourceText - The text to check
 * @param {boolean} options.detailed - Return detailed findings (default: false)
 * @param {boolean} options.extended - Also match extended blocklist (homoglyphs + extra invisibles); default false
 * @returns {boolean|Array} - Boolean if not detailed, array of findings if detailed
 */
function hasConfusables({ sourceText, detailed = false, extended = false }) {
  const sourceTextToSearch = sourceText.toString()

  if (!detailed) {
    for (const confusableChar of confusableChars) {
      if (sourceTextToSearch.includes(confusableChar)) {
        return true
      }
    }

    for (let i = 0; i < sourceTextToSearch.length; ) {
      const codePoint = sourceTextToSearch.codePointAt(i)
      const char = String.fromCodePoint(codePoint)
      const width = char.length
      if (isSuspiciousByCategory(char)) {
        return true
      }
      if (extended && isExtendedConfusableChar(char)) {
        return true
      }
      i += width
    }

    return false
  }

  const findings = []
  const lines = sourceTextToSearch.split('\n')

  lines.forEach((line, lineIndex) => {
    const lineNumber = lineIndex + 1

    for (let colIndex = 0; colIndex < line.length; ) {
      const codePoint = line.codePointAt(colIndex)
      const char = String.fromCodePoint(codePoint)
      const width = char.length

      const isHigh = isHighSeverityChar(char)
      const isLow = isExtendedConfusableChar(char)

      if (!extended && isLow && !isHigh) {
        colIndex += width
        continue
      }

      let severity = null
      if (isHigh) {
        severity = 'high'
      } else if (extended && isLow) {
        severity = 'low'
      }

      if (severity) {
        const category =
          severity === 'low' ? 'Extended blocklist' : getCategoryName(char)
        findings.push({
          line: lineNumber,
          column: colIndex + 1,
          codePoint: `U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}`,
          name: getCharacterName(codePoint),
          category,
          severity,
          snippet: line.substring(0, 80)
        })
      }
      colIndex += width
    }
  })

  return findings
}

/**
 * Check files for confusable characters
 * @param {Object} options - Options object
 * @param {Array} options.filePaths - Array of file paths to check
 * @param {boolean} options.detailed - Return detailed findings (default: false)
 * @param {boolean} options.extended - Also match extended blocklist; default false
 * @returns {Array} - Array of results
 */
function hasConfusablesInFiles({ filePaths, detailed = false, extended = false }) {
  const filesFoundVulnerable = []

  for (const filePath of filePaths) {
    if (existsSync(filePath)) {
      const file = readFileSync(filePath, 'utf-8')
      const fileText = file.toString()

      if (detailed) {
        const findings = hasConfusables({ sourceText: fileText, detailed: true, extended })
        if (findings.length > 0) {
          filesFoundVulnerable.push({
            file: filePath,
            findings
          })
        }
      } else {
        if (hasConfusables({ sourceText: fileText, extended })) {
          filesFoundVulnerable.push({
            file: filePath
          })
        }
      }
    }
  }

  return filesFoundVulnerable
}

// ---------------------------------------------------------------------------
// Backward Compatibility Layer
// ---------------------------------------------------------------------------
function hasTrojanSource(options) {
  return hasConfusables(options)
}

function hasTrojanSourceInFiles(options) {
  return hasConfusablesInFiles(options)
}

export {
  hasConfusables,
  hasConfusablesInFiles,
  confusableChars,
  extendedConfusableChars,
  hasTrojanSource,
  hasTrojanSourceInFiles
}
