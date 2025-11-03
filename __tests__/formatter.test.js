import { formatMinimal, formatVerbose, formatSuccess, calculateStats } from '../src/formatter.js'

describe('formatter module', () => {
  describe('calculateStats', () => {
    test('calculates correct stats for results with critical and warning issues', () => {
      const results = [
        {
          file: 'test1.js',
          findings: [
            { codePoint: 'U+202E', name: 'RIGHT-TO-LEFT OVERRIDE' },
            { codePoint: 'U+2066', name: 'LEFT-TO-RIGHT ISOLATE' }
          ]
        },
        {
          file: 'test2.js',
          findings: [
            { codePoint: 'U+00A0', name: 'NO-BREAK SPACE' },
            { codePoint: 'U+200B', name: 'ZERO WIDTH SPACE' }
          ]
        }
      ]

      const stats = calculateStats(results, 5)

      expect(stats.totalFiles).toBe(5)
      expect(stats.filesWithIssues).toBe(2)
      expect(stats.totalIssues).toBe(4)
      expect(stats.criticalCount).toBe(2)
      expect(stats.warningCount).toBe(2)
    })

    test('calculates correct stats for results with only critical issues', () => {
      const results = [
        {
          file: 'test1.js',
          findings: [
            { codePoint: 'U+202E', name: 'RIGHT-TO-LEFT OVERRIDE' },
            { codePoint: 'U+202D', name: 'LEFT-TO-RIGHT OVERRIDE' }
          ]
        }
      ]

      const stats = calculateStats(results, 10)

      expect(stats.totalFiles).toBe(10)
      expect(stats.filesWithIssues).toBe(1)
      expect(stats.totalIssues).toBe(2)
      expect(stats.criticalCount).toBe(2)
      expect(stats.warningCount).toBe(0)
    })

    test('calculates correct stats for results with only warnings', () => {
      const results = [
        {
          file: 'test1.js',
          findings: [
            { codePoint: 'U+00A0', name: 'NO-BREAK SPACE' },
            { codePoint: 'U+00AD', name: 'SOFT HYPHEN' }
          ]
        }
      ]

      const stats = calculateStats(results, 3)

      expect(stats.totalFiles).toBe(3)
      expect(stats.filesWithIssues).toBe(1)
      expect(stats.totalIssues).toBe(2)
      expect(stats.criticalCount).toBe(0)
      expect(stats.warningCount).toBe(2)
    })

    test('handles empty results', () => {
      const stats = calculateStats([], 5)

      expect(stats.totalFiles).toBe(5)
      expect(stats.filesWithIssues).toBe(0)
      expect(stats.totalIssues).toBe(0)
      expect(stats.criticalCount).toBe(0)
      expect(stats.warningCount).toBe(0)
    })

    test('handles results without findings array', () => {
      const results = [{ file: 'test1.js' }, { file: 'test2.js' }]

      const stats = calculateStats(results, 5)

      expect(stats.totalFiles).toBe(5)
      expect(stats.filesWithIssues).toBe(2)
      expect(stats.totalIssues).toBe(0)
    })
  })

  describe('formatMinimal', () => {
    test('formats minimal output with critical and warning issues', () => {
      const results = [
        {
          file: 'test1.js',
          findings: [{ codePoint: 'U+202E', name: 'RIGHT-TO-LEFT OVERRIDE' }]
        },
        {
          file: 'test2.js',
          findings: [{ codePoint: 'U+00A0', name: 'NO-BREAK SPACE' }]
        }
      ]
      const stats = {
        totalFiles: 5,
        filesWithIssues: 2,
        totalIssues: 2,
        criticalCount: 1,
        warningCount: 1
      }

      const output = formatMinimal(results, stats)

      expect(output).toContain('Anti-Trojan Source Scanner')
      expect(output).toContain('Security Issues Found')
      expect(output).toContain('(1 issue) ❌')
      expect(output).toContain('test1.js')
      expect(output).toContain('(1 issue) ⚠️')
      expect(output).toContain('test2.js')
      expect(output).toContain('Run with --verbose for detailed information')
      expect(output).toContain('2 issues found across 2 files')
    })

    test('formats minimal output with multiple issues per file', () => {
      const results = [
        {
          file: 'test1.js',
          findings: [
            { codePoint: 'U+202E', name: 'RIGHT-TO-LEFT OVERRIDE' },
            { codePoint: 'U+2066', name: 'LEFT-TO-RIGHT ISOLATE' },
            { codePoint: 'U+2069', name: 'POP DIRECTIONAL ISOLATE' }
          ]
        }
      ]
      const stats = {
        totalFiles: 1,
        filesWithIssues: 1,
        totalIssues: 3,
        criticalCount: 3,
        warningCount: 0
      }

      const output = formatMinimal(results, stats)

      expect(output).toContain('(3 issues) ❌')
      expect(output).toContain('3 issues found across 1 file')
    })

    test('uses correct singular/plural forms', () => {
      const results = [
        {
          file: 'test1.js',
          findings: [{ codePoint: 'U+202E', name: 'RIGHT-TO-LEFT OVERRIDE' }]
        }
      ]
      const stats = {
        totalFiles: 1,
        filesWithIssues: 1,
        totalIssues: 1,
        criticalCount: 1,
        warningCount: 0
      }

      const output = formatMinimal(results, stats)

      expect(output).toContain('(1 issue) ❌')
      expect(output).toContain('1 issue found across 1 file')
    })

    test('includes box drawing characters', () => {
      const results = [
        {
          file: 'test1.js',
          findings: [{ codePoint: 'U+202E', name: 'RIGHT-TO-LEFT OVERRIDE' }]
        }
      ]
      const stats = {
        totalFiles: 1,
        filesWithIssues: 1,
        totalIssues: 1,
        criticalCount: 1,
        warningCount: 0
      }

      const output = formatMinimal(results, stats)

      expect(output).toContain('┌')
      expect(output).toContain('┐')
      expect(output).toContain('└')
      expect(output).toContain('┘')
      expect(output).toContain('─')
      expect(output).toContain('│')
    })
  })

  describe('formatVerbose', () => {
    test('formats verbose output with critical issues', () => {
      const results = [
        {
          file: 'test.js',
          findings: [
            {
              line: 2,
              column: 25,
              codePoint: 'U+202E',
              name: 'RIGHT-TO-LEFT OVERRIDE',
              category: 'Cf (Format)',
              snippet: 'if (accessLevel != "user") {'
            }
          ]
        }
      ]
      const stats = {
        totalFiles: 1,
        filesWithIssues: 1,
        totalIssues: 1,
        criticalCount: 1,
        warningCount: 0
      }

      const output = formatVerbose(results, stats)

      expect(output).toContain('Anti-Trojan Source Security Scanner')
      expect(output).toContain('Scanning 1 files')
      expect(output).toContain('Bidirectional Text Attack Detected')
      expect(output).toContain('[CRITICAL]')
      expect(output).toContain('Line 2:25')
      expect(output).toContain('U+202E')
      expect(output).toContain('RIGHT-TO-LEFT OVERRIDE')
      expect(output).toContain('Cf (Format)')
      expect(output).toContain('Can reverse the meaning of code')
      expect(output).toContain('^ invisible character here')
      expect(output).toContain('SCAN SUMMARY')
      expect(output).toContain('Files Scanned:      1')
      expect(output).toContain('Total Issues:       1')
      expect(output).toContain('Critical:           1')
      expect(output).toContain('Security issues detected')
      expect(output).toContain('[FAILED]')
    })

    test('formats verbose output with warning issues', () => {
      const results = [
        {
          file: 'test.js',
          findings: [
            {
              line: 1,
              column: 10,
              codePoint: 'U+00A0',
              name: 'NO-BREAK SPACE',
              category: 'Confusable',
              snippet: 'const x = 5;'
            }
          ]
        }
      ]
      const stats = {
        totalFiles: 1,
        filesWithIssues: 1,
        totalIssues: 1,
        criticalCount: 0,
        warningCount: 1
      }

      const output = formatVerbose(results, stats)

      expect(output).toContain('Confusable Characters')
      expect(output).toContain('[WARNING]')
      expect(output).toContain('U+00A0')
      expect(output).toContain('NO-BREAK SPACE')
      expect(output).toContain('Warnings:           1')
    })

    test('formats multiple findings in same file', () => {
      const results = [
        {
          file: 'test.js',
          findings: [
            {
              line: 1,
              column: 10,
              codePoint: 'U+202E',
              name: 'RIGHT-TO-LEFT OVERRIDE',
              category: 'Cf (Format)',
              snippet: 'const x = 5;'
            },
            {
              line: 2,
              column: 15,
              codePoint: 'U+2066',
              name: 'LEFT-TO-RIGHT ISOLATE',
              category: 'Cf (Format)',
              snippet: 'const y = 10;'
            }
          ]
        }
      ]
      const stats = {
        totalFiles: 1,
        filesWithIssues: 1,
        totalIssues: 2,
        criticalCount: 2,
        warningCount: 0
      }

      const output = formatVerbose(results, stats)

      expect(output).toContain('Line 1:10')
      expect(output).toContain('Line 2:15')
      expect(output).toContain('2 issues found')
    })

    test('formats multiple files', () => {
      const results = [
        {
          file: 'test1.js',
          findings: [
            {
              line: 1,
              column: 10,
              codePoint: 'U+202E',
              name: 'RIGHT-TO-LEFT OVERRIDE',
              category: 'Cf (Format)',
              snippet: 'const x = 5;'
            }
          ]
        },
        {
          file: 'test2.js',
          findings: [
            {
              line: 1,
              column: 5,
              codePoint: 'U+00A0',
              name: 'NO-BREAK SPACE',
              category: 'Confusable',
              snippet: 'const y = 10;'
            }
          ]
        }
      ]
      const stats = {
        totalFiles: 2,
        filesWithIssues: 2,
        totalIssues: 2,
        criticalCount: 1,
        warningCount: 1
      }

      const output = formatVerbose(results, stats)

      expect(output).toContain('test1.js')
      expect(output).toContain('test2.js')
      expect(output).toContain('Files with Issues:  2')
    })

    test('includes all box drawing elements', () => {
      const results = [
        {
          file: 'test.js',
          findings: [
            {
              line: 1,
              column: 10,
              codePoint: 'U+202E',
              name: 'RIGHT-TO-LEFT OVERRIDE',
              category: 'Cf (Format)',
              snippet: 'const x = 5;'
            }
          ]
        }
      ]
      const stats = {
        totalFiles: 1,
        filesWithIssues: 1,
        totalIssues: 1,
        criticalCount: 1,
        warningCount: 0
      }

      const output = formatVerbose(results, stats)

      expect(output).toContain('┌')
      expect(output).toContain('┐')
      expect(output).toContain('└')
      expect(output).toContain('┘')
      expect(output).toContain('├')
      expect(output).toContain('─')
      expect(output).toContain('│')
    })
  })

  describe('formatSuccess', () => {
    test('formats minimal success output', () => {
      const stats = { totalFiles: 5 }

      const output = formatSuccess(stats, false)

      expect(output).toContain('Anti-Trojan Source Scanner')
      expect(output).toContain('No security issues detected')
      expect(output).toContain('5 files scanned successfully')
    })

    test('formats verbose success output', () => {
      const stats = { totalFiles: 3 }

      const output = formatSuccess(stats, true)

      expect(output).toContain('Anti-Trojan Source Security Scanner')
      expect(output).toContain('Scanning 3 files')
      expect(output).toContain('No security issues detected')
      expect(output).toContain('[PASSED]')
      expect(output).toContain('SCAN SUMMARY')
      expect(output).toContain('Files Scanned:      3')
      expect(output).toContain('Files with Issues:  0')
      expect(output).toContain('Total Issues:       0')
    })

    test('uses correct singular form for 1 file', () => {
      const stats = { totalFiles: 1 }

      const output = formatSuccess(stats, false)

      expect(output).toContain('1 file scanned successfully')
    })

    test('uses correct plural form for multiple files', () => {
      const stats = { totalFiles: 10 }

      const output = formatSuccess(stats, false)

      expect(output).toContain('10 files scanned successfully')
    })

    test('includes box drawing characters in minimal mode', () => {
      const stats = { totalFiles: 1 }

      const output = formatSuccess(stats, false)

      expect(output).toContain('┌')
      expect(output).toContain('┐')
      expect(output).toContain('└')
      expect(output).toContain('┘')
      expect(output).toContain('─')
      expect(output).toContain('│')
    })

    test('includes box drawing characters in verbose mode', () => {
      const stats = { totalFiles: 1 }

      const output = formatSuccess(stats, true)

      expect(output).toContain('┌')
      expect(output).toContain('┐')
      expect(output).toContain('└')
      expect(output).toContain('┘')
      expect(output).toContain('─')
      expect(output).toContain('│')
    })
  })

  describe('box alignment', () => {
    test('minimal format has properly aligned boxes', () => {
      const results = [
        {
          file: 'test.js',
          findings: [{ codePoint: 'U+202E', name: 'RIGHT-TO-LEFT OVERRIDE' }]
        }
      ]
      const stats = {
        totalFiles: 1,
        filesWithIssues: 1,
        totalIssues: 1,
        criticalCount: 1,
        warningCount: 0
      }

      const output = formatMinimal(results, stats)
      const lines = output.split('\n')

      // Find the header box lines
      const topLine = lines.find((line) => line.startsWith('┌'))
      const bottomLine = lines.find((line) => line.startsWith('└') && line.includes('─'))

      expect(topLine).toBeDefined()
      expect(bottomLine).toBeDefined()

      // Check that the lines have the same width
      if (topLine && bottomLine) {
        expect(topLine.length).toBe(bottomLine.length)
      }
    })

    test('verbose format has properly aligned scan summary box', () => {
      const results = [
        {
          file: 'test.js',
          findings: [
            {
              line: 1,
              column: 10,
              codePoint: 'U+202E',
              name: 'RIGHT-TO-LEFT OVERRIDE',
              category: 'Cf (Format)',
              snippet: 'const x = 5;'
            }
          ]
        }
      ]
      const stats = {
        totalFiles: 1,
        filesWithIssues: 1,
        totalIssues: 1,
        criticalCount: 1,
        warningCount: 0
      }

      const output = formatVerbose(results, stats)
      const lines = output.split('\n')

      // Find the scan summary box lines
      const summaryTopIndex = lines.findIndex((line) => line.includes('SCAN SUMMARY'))
      expect(summaryTopIndex).toBeGreaterThan(-1)

      const summaryTop = lines[summaryTopIndex]
      const summaryBottom = lines.find(
        (line, index) => index > summaryTopIndex && line.startsWith('└')
      )

      expect(summaryTop).toBeDefined()
      expect(summaryBottom).toBeDefined()

      // Check alignment
      if (summaryTop && summaryBottom) {
        expect(summaryTop.startsWith('┌')).toBe(true)
        expect(summaryTop.endsWith('┐')).toBe(true)
        expect(summaryBottom.startsWith('└')).toBe(true)
        expect(summaryBottom.endsWith('┘')).toBe(true)
      }
    })
  })
})
