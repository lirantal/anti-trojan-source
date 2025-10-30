# Project Overview

## Introduction

`anti-trojan-source` is a security tool designed to detect and prevent attacks that use confusable Unicode characters to create visually deceptive code. This includes Trojan Source attacks, which exploit bidirectional characters, as well as other attacks like glassworm that use invisible characters to hide malicious code.

## Purpose

The primary purpose of this project is to provide a simple and effective way to scan source code for the presence of dangerous confusable Unicode characters. By detecting these characters, the tool helps to mitigate the risk of attacks that can be used to introduce malicious code that is not easily visible during code reviews.

## Features

*   **CLI Tool:** A command-line interface for scanning files and directories.
*   **Library:** A JavaScript library that can be integrated into other tools and workflows.
*   **ESLint Plugin:** An ESLint plugin for real-time detection of confusable characters in your code.
*   **Pre-commit Hook:** A pre-commit hook to prevent committing code that contains dangerous Unicode characters.

## How it Works

The tool works by searching for a predefined list of dangerous Unicode characters within the source code. If any of these characters are found, the tool will flag the file as potentially vulnerable.
