import { hasTrojanSource } from '../src/main.js'
import { dangerousBidiChars } from '../src/constants.js'

test('shouldnt detect dangerous because this text is innocent', () => {
  expect(hasTrojanSource({ sourceText: 'bla bla bla' })).toBe(false)
})

test('the list of dangerous bidi characters should be more than 0', () => {
  expect(dangerousBidiChars.length).toBeGreaterThan(0)
})

test('detects all those dangerous characters', () => {
  dangerousBidiChars.forEach((char) => {
    expect(
      hasTrojanSource({
        sourceText: `this is some text that could have \n and \r and even \n\r but above all it has this dangerous bidi character: ${char} which the library should detect`
      })
    ).toBe(true)
  })
})
