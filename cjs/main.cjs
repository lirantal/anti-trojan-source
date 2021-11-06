'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var fs = require('fs');
var constants = require('./constants.cjs');

function hasTrojanSource({ sourceText }) {
  const sourceTextToSearch = sourceText.toString();

  for (const bidiChar of constants.dangerousBidiChars) {
    if (sourceTextToSearch.includes(bidiChar)) {
      return true
    }
  }

  return false
}

function hasTrojanSourceInFiles({ filePaths }) {
  const filesFoundVulnerable = [];

  for (const filePath of filePaths) {
    if (fs.existsSync(filePath)) {
      const file = fs.readFileSync(filePath, 'utf-8');
      const fileText = file.toString();

      if (hasTrojanSource({ sourceText: fileText })) {
        filesFoundVulnerable.push({
          file: filePath
        });
      }
    }
  }

  return filesFoundVulnerable
}

exports.dangerousBidiChars = constants.dangerousBidiChars;
exports.hasTrojanSource = hasTrojanSource;
exports.hasTrojanSourceInFiles = hasTrojanSourceInFiles;
