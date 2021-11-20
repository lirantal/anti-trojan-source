#!/usr/bin/env node
import readline from 'readline'
import meow from 'meow'
import { globby } from 'globby'
import { hasTrojanSource, hasTrojanSourceInFiles } from '../src/main.js'

const cli = meow(`
	Usage
	  $ anti-trojan-source <paths> <arguments>

	Options
	  --help                  Show help
	  --files, -f             File pattern of files to check.

	Examples
	  $ anti-trojan-source --files='**/*.js'
	  $ anti-trojan-source /home/user/project/src/index.js /home/user/project/src/helper.js
`,
  {
    importMeta: import.meta,
    flags: {
      files: {
        type: 'string',
        alias: 'f'
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

  const results = await hasTrojanSourceInFiles({ filePaths })

  if (results && results.length > 0) {
    console.error('[\u001B[31mx\u001B[39m] Detected cases of trojan source in the following files:')
    console.error('| ')
    results.forEach((result) => {
      console.error(` - ${result.file}`)
    })
    console.error()
    process.exit(1)
  } else {
    console.log('[\u001B[32m✓\u001B[39m] No case of trojan source detected')
    console.log()
    process.exit(0)
  }
}

function handleStdin() {
  rl.on('line', (sourceText) => {
    if (hasTrojanSource({ sourceText })) {
      console.error(
        '[\u001B[31mx\u001B[39m] Detected cases of trojan source for input passed to STDIN'
      )
      process.exit(1)
    }
  })

  rl.on('close', () => {
    process.stdin.unref()
  })
}
