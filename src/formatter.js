/**
 * Formatter module for CLI output
 * Provides formatted output for minimal and verbose modes
 */

// Box drawing characters (Unicode Box Drawing U+2500-U+257F)
const BOX = {
  TOP_LEFT: '┌',
  TOP_RIGHT: '┐',
  BOTTOM_LEFT: '└',
  BOTTOM_RIGHT: '┘',
  HORIZONTAL: '─',
  VERTICAL: '│',
  T_RIGHT: '├',
  T_LEFT: '┤'
}

// ANSI color codes
const COLORS = {
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  CYAN: '\x1b[36m',
  GRAY: '\x1b[90m',
  BOLD: '\x1b[1m',
  RESET: '\x1b[0m',
  DIM: '\x1b[2m'
}

// Critical unicode characters (bidirectional overrides)
const CRITICAL_CHARS = [
  0x202e, // RIGHT-TO-LEFT OVERRIDE
  0x202d, // LEFT-TO-RIGHT OVERRIDE
  0x2066, // LEFT-TO-RIGHT ISOLATE
  0x2067, // RIGHT-TO-LEFT ISOLATE
  0x2068, // FIRST STRONG ISOLATE
  0x2069 // POP DIRECTIONAL ISOLATE
]

/**
 * Determine if a character is critical severity
 * @param {string} codePointStr - Code point string like "U+202E"
 * @returns {boolean}
 */
function isCritical(codePointStr) {
  const codePoint = parseInt(codePointStr.replace('U+', ''), 16)
  return CRITICAL_CHARS.includes(codePoint)
}

/**
 * Get severity level for a finding
 * @param {Object} finding - Finding object with codePoint
 * @returns {string} - 'CRITICAL' or 'WARNING'
 */
function getSeverity(finding) {
  return isCritical(finding.codePoint) ? 'CRITICAL' : 'WARNING'
}

/**
 * Get risk description for a code point
 * @param {string} codePointStr - Code point string like "U+202E"
 * @returns {string}
 */
function getRiskDescription(codePointStr) {
  const codePoint = parseInt(codePointStr.replace('U+', ''), 16)

  const riskMap = {
    0x202e: 'Can reverse the meaning of code',
    0x202d: 'Can reverse the meaning of code',
    0x2066: 'Can manipulate text direction',
    0x2067: 'Can manipulate text direction',
    0x2068: 'Can manipulate text direction',
    0x2069: 'Can manipulate text direction',
    0x200b: 'Invisible character that may hide logic',
    0x00a0: 'May hide malicious logic or confuse developers',
    0x00ad: 'Invisible hyphenation that may hide logic'
  }

  return riskMap[codePoint] || 'May be used to hide or confuse code logic'
}

/**
 * Create a colored and styled text
 * @param {string} text - Text to style
 * @param {string} color - Color code
 * @returns {string}
 */
function colorize(text, color) {
  return `${color}${text}${COLORS.RESET}`
}

/**
 * Create a box header
 * @param {string} title - Title text
 * @param {number} width - Box width
 * @returns {string}
 */
function boxHeader(title, width = 50) {
  const paddedTitle = ` ${title} `.padEnd(width - 2)
  return `${BOX.TOP_LEFT}${BOX.HORIZONTAL.repeat(width - 2)}${BOX.TOP_RIGHT}\n${
    BOX.VERTICAL
  }${paddedTitle}${BOX.VERTICAL}\n${BOX.BOTTOM_LEFT}${BOX.HORIZONTAL.repeat(width - 2)}${
    BOX.BOTTOM_RIGHT
  }`
}

/**
 * Create a simple box line
 * @param {string} content - Content text
 * @param {number} width - Box width
 * @returns {string}
 */
function boxLine(content, width = 50) {
  const paddedContent = ` ${content} `.padEnd(width - 2)
  return `${BOX.VERTICAL}${paddedContent}${BOX.VERTICAL}`
}

/**
 * Create a box footer
 * @param {number} width - Box width
 * @returns {string}
 */
function boxFooter(width = 50) {
  return `${BOX.BOTTOM_LEFT}${BOX.HORIZONTAL.repeat(width - 2)}${BOX.BOTTOM_RIGHT}`
}

/**
 * Calculate statistics from results
 * @param {Array} results - Results array
 * @param {number} totalFiles - Total files scanned
 * @returns {Object}
 */
function calculateStats(results, totalFiles) {
  let totalIssues = 0
  let criticalCount = 0
  let warningCount = 0

  results.forEach((result) => {
    if (result.findings && result.findings.length > 0) {
      result.findings.forEach((finding) => {
        totalIssues++
        if (isCritical(finding.codePoint)) {
          criticalCount++
        } else {
          warningCount++
        }
      })
    }
  })

  return {
    totalFiles,
    filesWithIssues: results.length,
    totalIssues,
    criticalCount,
    warningCount
  }
}

/**
 * Find the position indicator for the invisible character in the snippet
 * @param {number} column - Column number (1-indexed)
 * @param {string} snippet - Code snippet
 * @returns {string} - String with spaces and ^ marker
 */
function createPositionIndicator(column, snippet) {
  // The column is 1-indexed, and we need to account for the "│ " prefix
  const position = column - 1
  const spaces = ' '.repeat(position)
  return `${BOX.VERTICAL} ${spaces}^ invisible character here`
}

/**
 * Format output for minimal mode (default)
 * @param {Array} results - Results array with findings
 * @param {Object} stats - Statistics object
 * @returns {string}
 */
export function formatMinimal(results, stats) {
  let output = []

  // Header
  output.push(boxHeader('Anti-Trojan Source Scanner', 50))
  output.push('')

  // Main message
  output.push(colorize('Security Issues Found:', COLORS.BOLD))
  output.push('')

  // List files with issue counts
  results.forEach((result) => {
    const issueCount = result.findings ? result.findings.length : 1
    const hasCritical = result.findings && result.findings.some((f) => isCritical(f.codePoint))
    const icon = hasCritical ? '❌' : '⚠️'
    const issueText = `(${issueCount} issue${issueCount !== 1 ? 's' : ''})`
    const filePath = colorize(result.file, COLORS.CYAN)

    output.push(`  ${issueText} ${icon}  ${filePath}`)
  })

  output.push('')
  output.push(colorize('Run with --verbose for detailed information.', COLORS.GRAY))
  output.push('')

  // Footer
  const footerText = `${stats.totalIssues} issue${
    stats.totalIssues !== 1 ? 's' : ''
  } found across ${stats.filesWithIssues} file${stats.filesWithIssues !== 1 ? 's' : ''}`
  output.push(`${BOX.BOTTOM_LEFT}${BOX.HORIZONTAL} ${footerText}`)

  return output.join('\n')
}

/**
 * Format output for verbose mode
 * @param {Array} results - Results array with detailed findings
 * @param {Object} stats - Statistics object
 * @returns {string}
 */
export function formatVerbose(results, stats) {
  let output = []

  // Header
  output.push(boxHeader('Anti-Trojan Source Security Scanner', 50))
  output.push('')
  output.push(`Scanning ${stats.totalFiles} files...`)
  output.push('')

  // Process each file
  results.forEach((result, index) => {
    const filePath = colorize(result.file, COLORS.CYAN)
    output.push(`${BOX.TOP_LEFT}${BOX.HORIZONTAL} File: ${filePath}`)
    output.push(BOX.VERTICAL)

    // Determine severity for this file
    const hasCritical = result.findings.some((f) => isCritical(f.codePoint))
    const severityLabel = hasCritical
      ? colorize('[CRITICAL]', COLORS.RED + COLORS.BOLD)
      : colorize('[WARNING]', COLORS.YELLOW + COLORS.BOLD)
    const severityText = hasCritical
      ? 'Bidirectional Text Attack Detected'
      : 'Confusable Characters'

    output.push(`${BOX.VERTICAL}  ${severityLabel} ${severityText}`)
    output.push(`${BOX.VERTICAL}`)

    // Process each finding
    result.findings.forEach((finding, findingIndex) => {
      const lineCol = colorize(`Line ${finding.line}:${finding.column}`, COLORS.GRAY)
      const codePoint = colorize(finding.codePoint, COLORS.BOLD)
      const name = finding.name

      output.push(`${BOX.VERTICAL}  ${lineCol}  >  ${codePoint}  ${name}`)

      // Snippet box
      output.push(`${BOX.VERTICAL}  ${BOX.T_RIGHT}${BOX.HORIZONTAL.repeat(45)}`)
      output.push(`${BOX.VERTICAL}  ${BOX.VERTICAL} ${finding.snippet}`)

      // Position indicator
      const indicator = createPositionIndicator(finding.column, finding.snippet)
      output.push(`${BOX.VERTICAL}  ${indicator}`)

      output.push(`${BOX.VERTICAL}  ${BOX.BOTTOM_LEFT}${BOX.HORIZONTAL.repeat(45)}`)

      // Additional details
      output.push(`${BOX.VERTICAL}  ${colorize('Category:', COLORS.GRAY)} ${finding.category}`)
      const risk = getRiskDescription(finding.codePoint)
      output.push(`${BOX.VERTICAL}  ${colorize('Risk:', COLORS.GRAY)} ${risk}`)

      // Add spacing between findings (but not after the last one)
      if (findingIndex < result.findings.length - 1) {
        output.push(`${BOX.VERTICAL}`)
      }
    })

    output.push(`${BOX.VERTICAL}`)

    // File footer
    const issueCount = result.findings.length
    output.push(
      `${BOX.BOTTOM_LEFT}${BOX.HORIZONTAL} ${issueCount} issue${issueCount !== 1 ? 's' : ''} found`
    )

    // Add spacing between files (but not after the last one)
    if (index < results.length - 1) {
      output.push('')
    }
  })

  output.push('')

  // Summary box (width 50 means 48 chars between corners. " SCAN SUMMARY " = 14 chars, so 48 - 14 = 34, split as 17 + 17)
  output.push(
    `${BOX.TOP_LEFT}${BOX.HORIZONTAL.repeat(17)} SCAN SUMMARY ${BOX.HORIZONTAL.repeat(17)}${
      BOX.TOP_RIGHT
    }`
  )
  output.push(boxLine(`Files Scanned:      ${stats.totalFiles}`, 50))
  output.push(boxLine(`Files with Issues:  ${stats.filesWithIssues}`, 50))
  output.push(boxLine(`Total Issues:       ${stats.totalIssues}`, 50))
  output.push(boxLine(`Critical:           ${stats.criticalCount}`, 50))
  output.push(boxLine(`Warnings:           ${stats.warningCount}`, 50))
  output.push(boxFooter(50))
  output.push('')

  // Final message
  output.push(
    colorize('[FAILED]', COLORS.RED + COLORS.BOLD) +
      ' Security issues detected. Please review and fix.'
  )

  return output.join('\n')
}

/**
 * Format success message (no issues found)
 * @param {Object} stats - Statistics object
 * @param {boolean} verbose - Whether verbose mode is enabled
 * @returns {string}
 */
export function formatSuccess(stats, verbose = false) {
  let output = []

  if (verbose) {
    // Verbose success format
    output.push(boxHeader('Anti-Trojan Source Security Scanner', 50))
    output.push('')
    output.push(`Scanning ${stats.totalFiles} files...`)
    output.push('')
    output.push(colorize('[PASSED]', COLORS.GREEN + COLORS.BOLD) + ' No security issues detected')
    output.push('')

    // Summary box (width 50 means 48 chars between corners. " SCAN SUMMARY " = 14 chars, so 48 - 14 = 34, split as 17 + 17)
    output.push(
      `${BOX.TOP_LEFT}${BOX.HORIZONTAL.repeat(17)} SCAN SUMMARY ${BOX.HORIZONTAL.repeat(17)}${
        BOX.TOP_RIGHT
      }`
    )
    output.push(boxLine(`Files Scanned:      ${stats.totalFiles}`, 50))
    output.push(boxLine(`Files with Issues:  0`, 50))
    output.push(boxLine(`Total Issues:       0`, 50))
    output.push(boxFooter(50))
  } else {
    // Minimal success format
    output.push(boxHeader('Anti-Trojan Source Scanner', 50))
    output.push('')
    output.push(colorize('✓', COLORS.GREEN) + ' No security issues detected')
    output.push('')
    output.push(
      `${BOX.BOTTOM_LEFT}${BOX.HORIZONTAL} ${stats.totalFiles} file${
        stats.totalFiles !== 1 ? 's' : ''
      } scanned successfully`
    )
  }

  return output.join('\n')
}

export { calculateStats }
