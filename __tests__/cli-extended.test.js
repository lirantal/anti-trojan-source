import { spawnSync } from 'child_process'
import path from 'path'

const __dirname = new URL('.', import.meta.url).pathname
const repoRoot = path.join(__dirname, '..')
const bin = path.join(repoRoot, 'bin', 'anti-trojan-source.js')
const fixture = path.join(__dirname, '__fixtures__', 'true-extended-invisible.js')

describe('CLI --extended / --all', () => {
  test('exits 0 without flag when only extended characters', () => {
    const r = spawnSync(process.execPath, [bin, fixture], {
      encoding: 'utf8',
      cwd: repoRoot
    })
    expect(r.status).toBe(0)
  })

  test('exits 1 with --extended when file has extended-only finding', () => {
    const r = spawnSync(process.execPath, [bin, fixture, '--extended'], {
      encoding: 'utf8',
      cwd: repoRoot
    })
    expect(r.status).toBe(1)
  })

  test('JSON on stdout includes severity low with --extended', () => {
    const r = spawnSync(process.execPath, [bin, fixture, '--extended', '--json'], {
      encoding: 'utf8',
      cwd: repoRoot
    })
    expect(r.status).toBe(1)
    const data = JSON.parse(r.stdout.trim())
    expect(Array.isArray(data)).toBe(true)
    expect(data[0].findings[0].severity).toBe('low')
  })

  test('--all is alias of --extended', () => {
    const r = spawnSync(process.execPath, [bin, fixture, '--all'], {
      encoding: 'utf8',
      cwd: repoRoot
    })
    expect(r.status).toBe(1)
  })
})
