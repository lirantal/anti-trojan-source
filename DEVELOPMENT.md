# Development guide: anti-trojan-source

How to set up the repo, run checks, extend tests, and ship consistent library + CLI artifacts.

## Prerequisites

- **Node.js** >= 14 (see [`package.json`](package.json) `engines`).
- **npm** (lockfile is [`package-lock.json`](package-lock.json)).

```bash
npm install
```

## Module system and packaging

- Source in **`src/`** is **ESM** (`"type": "module"`).
- [`package.json`](package.json) `exports`:
  - `"import"` → `./src/main.js`
  - `"require"` → `./cjs/main.cjs` (built output)
- After **any** change under `src/`, run **`npm run build`** so [`cjs/`](cjs/) stays in sync for CommonJS consumers. Rollup config: [`rollup.config.mjs`](rollup.config.mjs) (`preserveModules`, one `.cjs` file per source module).

Do not hand-edit files under `cjs/`.

## npm scripts

| Script | Purpose |
|--------|---------|
| `npm test` | Jest with `NODE_OPTIONS=--experimental-vm-modules`, coverage on `src/**/*` |
| `npm run test:watch` | Jest watch mode |
| `npm run lint` | ESLint on the repo + `lockfile-lint` on `package-lock.json` |
| `npm run lint:fix` | ESLint with `--fix` |
| `npm run format` | Prettier write for `**/*.js` |
| `npm run build` | Rollup → `cjs/` |
| `npm run coverage:view` | Open HTML coverage report (optional) |

Global coverage thresholds (Jest): **80%** branches, functions, lines, statements.

## Writing tests

- Tests live in [`__tests__/**/*.test.js`](__tests__).
- Jest is configured with `testPathIgnorePatterns` excluding [`__tests__/__fixtures__/`](__tests__/__fixtures__/) so fixture files are not treated as test suites.
- **ESM in tests**: use `import` and `import.meta.url` where a directory is needed; many tests define `__dirname` as:

  ```javascript
  const __dirname = new URL('.', import.meta.url).pathname
  ```

  Prefer matching existing test files for consistency.

- **Fixtures**: place sample files under `__tests__/__fixtures__/`. Load them with `readFileSync` / `hasConfusablesInFiles` and assert on results (see [`__tests__/files-detection.test.js`](__tests__/files-detection.test.js)). The Unicode tag-letter sample lives at [`__tests__/__fixtures__/SKILL.md`](__tests__/__fixtures__/SKILL.md). For **`extended: true`**, use fixtures such as [`true-extended-homoglyph.js`](__tests__/__fixtures__/true-extended-homoglyph.js), [`true-extended-invisible.js`](__tests__/__fixtures__/true-extended-invisible.js) (literal U+2800 in source), and [`false-extended-cyrillic-comment.js`](__tests__/__fixtures__/false-extended-cyrillic-comment.js).

### What to assert

- Boolean API: `hasConfusables({ sourceText })` true/false.
- File API: `hasConfusablesInFiles({ filePaths, detailed })` length and shape.
- Detailed findings: `line`, `column`, `codePoint`, `name`, `category`, **`severity`**, `snippet` as appropriate.

## Linting and style

- ESLint config is inline in [`package.json`](package.json) (`eslintConfig`), with plugins including `node`, `security`, `jest`.
- Paths ignored: `coverage/**`, `cjs/**`, `rollup.config.mjs` (`eslintIgnore`).
- `lockfile-lint` enforces HTTPS registry usage; `npm run lint` includes it.

## CLI vs library during development

- **Library**: import from `../src/main.js` in tests (or package name when used as dependency).
- **CLI**: [`bin/anti-trojan-source.js`](bin/anti-trojan-source.js) imports the same `src/main.js` implementation. Verifying CLI behavior can be done via integration-style tests or manual `node bin/anti-trojan-source.js ...`; most unit coverage targets `src/` directly.

## Git hooks and commits (optional)

The repo may use **Husky** and **commitlint** (see `devDependencies` and `commitlint` in [`package.json`](package.json)). Follow [Conventional Commits](https://www.conventionalcommits.org/) if hooks are enabled in your clone.

## Agent-oriented overview

For architecture, threat model, and API invariants aimed at coding agents, see [`AGENTS.md`](AGENTS.md).

## Release notes

Versioning and changelog may be driven by **semantic-release** (see `release` and plugins in [`package.json`](package.json)); day-to-day feature work still requires local test + lint + build green.
