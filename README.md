<p align="center"><h1 align="center">
  anti-trojan-source
</h1>

<p align="center">
  Detect trojan source attacks that employ unicode bidi attacks to inject malicious code
</p>

<p align="center">
  <img src="https://github.com/lirantal/anti-trojan-source/raw/main/.github/anti-trojan-source-logo.png" height="220">
</p>

<p align="center">
  <a href="https://www.npmjs.org/package/anti-trojan-source"><img src="https://badgen.net/npm/v/anti-trojan-source" alt="npm version"/></a>
  <a href="https://www.npmjs.org/package/anti-trojan-source"><img src="https://badgen.net/npm/license/anti-trojan-source" alt="license"/></a>
  <a href="https://www.npmjs.org/package/anti-trojan-source"><img src="https://badgen.net/npm/dt/anti-trojan-source" alt="downloads"/></a>
  <a href="https://github.com/lirantal/anti-trojan-source/actions?workflow=CI"><img src="https://github.com/lirantal/anti-trojan-source/workflows/CI/badge.svg" alt="build"/></a>
  <a href="https://codecov.io/gh/lirantal/anti-trojan-source"><img src="https://badgen.net/codecov/c/github/lirantal/anti-trojan-source" alt="codecov"/></a>
  <a href="https://snyk.io/test/github/lirantal/anti-trojan-source"><img src="https://snyk.io/test/github/lirantal/anti-trojan-source/badge.svg" alt="Known Vulnerabilities"/></a>
  <a href="./SECURITY.md"><img src="https://img.shields.io/badge/Security-Responsible%20Disclosure-yellow.svg" alt="Responsible Disclosure Policy" /></a>
</p>

# About

Detects cases of [trojan source attacks](https://trojansource.codes) that employ unicode bidi attacks to inject malicious code, as well as other attacks that use confusable characters (such as glassworm attacks).

If you're using ESLint:
* See: [eslint-plugin-anti-trojan-source](https://github.com/lirantal/eslint-plugin-anti-trojan-source) for a purpose-bulit plugin to detect anti-trojan characters.
* This plugin [inspired work](https://github.com/eslint-community/eslint-plugin-security/pull/95) to create an anti-trojan rule `detect-bidi-characters` in [eslint-plugin-security](https://github.com/eslint-community/eslint-plugin-security) and if you're already using that security plugin then it is advised to turn on that rule.

## Why is Confusable Unicode Character detection important?

The following publication on the topic of unicode characters attacks, dubbed [Trojan Source: Invisible Vulnerabilities](https://trojansource.codes/trojan-source.pdf), has caused a lot of concern from potential supply chain attacks where adversaries are able to inject malicious code into the source code of a project, slipping by unseen in the code review process. This project expands on that to detect other forms of confusable characters that can be used in similar attacks.

For more information on the topic, you're welcome to read on the official website [trojansource.codes](https://trojansource.codes/) and the following [source code repository](https://github.com/nickboucher/trojan-source/) which contains the source code of the publication.

---

Table of Contents

- [Use as a CLI](#use-as-a-cli)
  - [Detect confusable characters using file globbing](#detect-confusable-characters-using-file-globbing)
  - [Detect confusable characters using file paths](#detect-confusable-characters-using-file-paths)
  - [Detect confusable characters by piping input](#detect-confusable-characters-by-piping-input)
- [Use as an eslint plugin](#use-as-an-eslint-plugin)
- [Use as a library](#use-as-a-library)

---

# Use as a CLI

`anti-trojan-source` is an npm package that supports detecting files that contain confusable unicode characters in them, per the research.

## Detect confusable characters using file globbing

The following command will detect all files that contain confusable unicode characters in them based on the file matching pattern that was provided to it:

```bash
npx anti-trojan-source --files='src/**/*.js'
```

If it doesn't find anything it will return with a 0 exit code and print to stdout:

```
[✓] No confusable characters detected
```

## Detect confusable characters using file paths

```bash
npx anti-trojan-source '/src/index.js' '/src/helper.js'
```

If it found any matching confusable unicode characters, it will return with an exit code of 1 and print to stderr:

```
[x] Detected cases of confusable characters in the following files:
|
 - /src/index.js
 - /src/helper.js
```

## Detect confusable characters by piping input

If you just run `npx anti-trojan-source` and pipe in a file contents, it will detect the confusable unicode characters in that file:

```bash
cat /src/index.js | npx anti-trojan-source
```

# Use as an eslint plugin

Refer to the ESLint Plugin for this CLI and the README on that repository which clearly explains how to set it up: [eslint-plugin-anti-trojan-source](https://github.com/lirantal/eslint-plugin-anti-trojan-source).

# Use as a library

To use it as a library and pass it file contents to detect:

```js
import { hasConfusables } from 'anti-trojan-source'
const isDangerous = hasConfusables({
  sourceText: 'if (accessLevel != "user‮ ⁦// Check if admin⁩ ⁦") {'
})
```

`hasConfusables` returns a boolean.

# Use as a pre-commit hook

To add this tool to your project as a [`pre-commit`](https://pre-commit.com) hook, try this sample configuration in `.pre-commit-config.yaml`:

```yaml
repos:
  - repo: https://github.com/lirantal/anti-trojan-source
    rev: v1.3.3  # choose the release you want
    hooks:
      - id: anti-trojan-source
```

# Contributing

Please consult [CONTRIBUTING](./CONTRIBUTING.md) for guidelines on contributing to this project.

# Author

**anti-trojan-source** © [Liran Tal](https://github.com/lirantal), Released under the [Apache-2.0](./LICENSE) License.
