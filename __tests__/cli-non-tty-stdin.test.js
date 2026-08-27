import { spawnSync } from 'child_process'
import path from 'path'

const __dirname = new URL('.', import.meta.url).pathname
const repoRoot = path.join(__dirname, '..')
const bin = path.join(repoRoot, 'bin', 'anti-trojan-source.js')

// Spawning with stdin set to 'ignore' gives the child a stdin stream that has
// no `unref` method, mirroring a non-TTY environment such as GitLab CI or
// Docker run without `-t`. Before the fix, the `--files` path called
// `process.stdin.unref()` unconditionally and crashed with
// "TypeError: process.stdin.unref is not a function" before scanning anything.
function runWithNonTtyStdin(args) {
  return spawnSync(process.execPath, [bin, ...args], {
    encoding: 'utf8',
    cwd: repoRoot,
    stdio: ['ignore', 'pipe', 'pipe']
  })
}

describe('CLI in non-TTY stdin environments (issue #36)', () => {
  test('does not crash on process.stdin.unref for a clean --files scan', () => {
    const r = runWithNonTtyStdin([
      '--files',
      '__tests__/__fixtures__/false-trojan-source.js'
    ])
    expect(r.stderr || '').not.toContain('unref is not a function')
    expect(r.stderr || '').not.toContain('TypeError')
    expect(r.status).toBe(0)
  })

  test('does not crash on process.stdin.unref when --files scan finds issues', () => {
    const r = runWithNonTtyStdin([
      '--files',
      '__tests__/__fixtures__/true-trojan-source.js'
    ])
    expect(r.stderr || '').not.toContain('unref is not a function')
    expect(r.stderr || '').not.toContain('TypeError')
    // A file with a finding exits non-zero, but must do so cleanly.
    expect(r.status).toBe(1)
  })
})
