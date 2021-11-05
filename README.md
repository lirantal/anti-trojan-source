<p align="center"><h1 align="center">
  anti-trojan-source
</h1>

<p align="center">
  Detect trojan source attacks that employ unicode bidi attacks to inject malicious code
</p>

<p align="center">
  <img src="https://github.com/lirantal/anti-trojan-source/raw/master/.github/anti-trojan-source-logo.png" height="150">
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

Detects cases of trojan source attacks that employ unicode bidi attacks to inject malicious code

## Why is Trojan Source important?

The following publication on the topic of unicode characters attacks, dubbed [Trojan Source: Invisible Vulnerabilities](https://trojansource.codes/trojan-source.pdf), has caused a lot of concern from potential supply chain attacks where adversaries are able to inject malicious code into the source code of a project, slipping by unseen in the code review process.

For more information on the topic, you're welcome to read on the official website [trojansource.codes](https://trojansource.codes/) and the following [source code repository](https://github.com/nickboucher/trojan-source/) which contains the source code of the publication.

# Usage as command-line tool

`anti-trojan-source` is an npm package that supports detecting files that contain bidirectional unicode characters in them, per the research.

## Detect Trojan Source attacks using file globbing

The following command will detect all files that contain bidirectional unicode characters in them based on the file matching pattern that was provided to it:

```bash
npx anti-trojan-source --files='src/**/*.js'
```

If it doesn't find anything it will return with a 0 exit code and print to stdout:

```
[✓] No case of trojan source detected
```

## Detect Trojan Source attacks using file paths

```bash
npx anti-trojan-source '/src/index.js' '/src/helper.js'
```

If it found any matching bidi unicode characters, it will return with an exit code of 1 and print to stderr:

```
[x] Detected cases of trojan source in the following files:
|
 - /src/index.js
 - /src/helper.js
```

## Detect Trojan Source attacks by piping input

If you just run `npx anti-trojan-source` and pipe in a file contents, it will detect the bidi unicode characters in that file:

```bash
cat /src/index.js | npx anti-trojan-source
```

# Usage as a library

To use it as a library and pass it file contents to detect:

```js
import { hasTrojanSource } from 'anti-trojan-source'
const isDangerous = hasTrojanSource({
  sourceText: 'if (accessLevel != "user‮ ⁦// Check if admin⁩ ⁦") {'
})
```

`hasTrojanSource` returns a boolean.

# Contributing

Please consult [CONTRIBUTING](./CONTRIBUTING.md) for guidelines on contributing to this project.

# Author

**anti-trojan-source** © [Liran Tal](https://github.com/lirantal), Released under the [Apache-2.0](./LICENSE) License.
