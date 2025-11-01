#!/usr/bin/env node
import readline from 'readline'
import meow from 'meow'
import { globby } from 'globby'
import { hasConfusables, hasConfusablesInFiles } from '../src/main.js'

const cli = meow(
  `
	Usage
	  $ anti-trojan-source <paths> <arguments>

	Options
	  --help                  Show help
	  --files, -f             File pattern of files to check.
	  --verbose, -v           Show detailed information about detected characters
	  --json, -j              Output results in JSON format

	Examples
	  $ anti-trojan-source --files='**/*.js'
	  $ anti-trojan-source --files='**/*.js' --verbose
	  $ anti-trojan-source --files='**/*.js' --json
	  $ anti-trojan-source /home/user/project/src/index.js /home/user/project/src/helper.js
`,
  {
    importMeta: import.meta,
    flags: {
      files: {
        type: 'string',
        alias: 'f'
      },
      verbose: {
        type: 'boolean',
        alias: 'v',
        default: false
      },
      json: {
        type: 'boolean',
        alias: 'j',
        default: false
      }
    }
  }
)

const rl = readline.createInterface({
  input: process.stdin
})

if (cli.input?.length > 0 || (cli.flags.hasOwnProperty('files') && cli.flags.files !== '')) {
  handleCliFlags({ filesList: cli.input, flags: cli.flags })
  process.stdin.unref()
} else {
  // this should be a debug() use case: console.log('[waiting to process input from STDIN...]')
  handleStdin()
}

async function handleCliFlags({ filesList, flags }) {
  let filePaths = []

  if (filesList && filesList.length > 0) {
    // handle files path passed as input
    // this is the way that lint-staged works
    filePaths = filesList
  } else {
    // otherwise, fall back to processing any file matching patterns
    filePaths = await globby(flags.files)
  }

  const isDetailed = flags.verbose || flags.json
  const results = await hasConfusablesInFiles({ filePaths, detailed: isDetailed })

  if (results && results.length > 0) {
    if (flags.json) {
      // JSON output mode
      console.log(JSON.stringify(results, null, 2))
    } else if (flags.verbose) {
      // Verbose output mode
      console.error(
        '[\u001B[31mx\u001B[39m] Detected cases of trojan source in the following files:'
      )
      console.error('| ')
      results.forEach((result) => {
        console.error(` - ${result.file}`)
        if (result.findings && result.findings.length > 0) {
          result.findings.forEach((finding) => {
            console.error(
              `   Line ${finding.line}:${finding.column} - ${finding.codePoint} ${finding.name} [${finding.category}]`
            )
            console.error(`   Snippet: ${finding.snippet}`)
          })
        }
      })
      console.error()
    } else {
      // Simple output mode (backward compatible)
      console.error(
        '[\u001B[31mx\u001B[39m] Detected cases of trojan source in the following files:'
      )
      console.error('| ')
      results.forEach((result) => {
        console.error(` - ${result.file}`)
      })
      console.error()
    }
    process.exit(1)
  } else {
    if (flags.json) {
      console.log(JSON.stringify({ success: true, message: 'No case of trojan source detected' }))
    } else {
      console.log('[\u001B[32m✓\u001B[39m] No case of trojan source detected')
      console.log()
    }
    process.exit(0)
  }
}

function handleStdin() {
  let stdinBuffer = ''

  rl.on('line', (line) => {
    stdinBuffer += line + '\n'
  })

  rl.on('close', () => {
    if (stdinBuffer) {
      const isDetailed = cli.flags.verbose || cli.flags.json

      if (isDetailed) {
        const findings = hasConfusables({ sourceText: stdinBuffer, detailed: true })
        if (findings.length > 0) {
          if (cli.flags.json) {
            console.log(JSON.stringify({ findings }, null, 2))
          } else {
            console.error(
              '[\u001B[31mx\u001B[39m] Detected cases of trojan source for input passed to STDIN:'
            )
            findings.forEach((finding) => {
              console.error(
                `Line ${finding.line}:${finding.column} - ${finding.codePoint} ${finding.name} [${finding.category}]`
              )
              console.error(`Snippet: ${finding.snippet}`)
            })
          }
          process.exit(1)
        }
      } else {
        if (hasConfusables({ sourceText: stdinBuffer })) {
          console.error(
            '[\u001B[31mx\u001B[39m] Detected cases of trojan source for input passed to STDIN'
          )
          process.exit(1)
        }
      }
    }
    process.stdin.unref()
  })
}
