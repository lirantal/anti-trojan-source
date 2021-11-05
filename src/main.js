import { dangerousBidiChars } from '../src/constants.js'

function hasTrojanSource({ sourceText }) {
  const sourceTextToSearch = sourceText.toString()

  for (const bidiChar of dangerousBidiChars) {
    if (sourceTextToSearch.includes(bidiChar)) {
      return true
    }
  }

  return false
}

export { hasTrojanSource, dangerousBidiChars }
