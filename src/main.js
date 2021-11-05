function hasTrojanSource({ sourceText }) {
  const sourceTextToSearch = sourceText.toString()
  const dangerousBidiChars = ['\u061c']
  for (const bidiChar of dangerousBidiChars) {
    if (sourceTextToSearch.includes(bidiChar)) {
      return true
    }
  }

  return false
}

export { hasTrojanSource }
