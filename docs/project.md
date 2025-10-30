# Project Overview

## Introduction

`anti-trojan-source` is a security tool designed to detect and prevent Trojan Source attacks. These attacks exploit the way Unicode bidirectional characters are handled to create visually deceptive code, which can lead to the introduction of hidden vulnerabilities.

## Purpose

The primary purpose of this project is to provide a simple and effective way to scan source code for the presence of dangerous bidirectional Unicode characters. By detecting these characters, the tool helps to mitigate the risk of Trojan Source attacks, which can be used to introduce malicious code that is not easily visible during code reviews.

## Features

*   **CLI Tool:** A command-line interface for scanning files and directories.
*   **Library:** A JavaScript library that can be integrated into other tools and workflows.
*   **ESLint Plugin:** An ESLint plugin for real-time detection of Trojan Source vulnerabilities in your code.
*   **Pre-commit Hook:** A pre-commit hook to prevent committing code that contains dangerous bidirectional characters.

## How it Works

The tool works by searching for a predefined list of dangerous Unicode bidirectional characters within the source code. If any of these characters are found, the tool will flag the file as potentially vulnerable.
