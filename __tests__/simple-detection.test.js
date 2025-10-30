import { hasConfusables, confusableChars } from '../src/main.js'

test('shouldnt detect dangerous because this text is innocent', () => {
  expect(hasConfusables({ sourceText: 'bla bla bla' })).toBe(false)
})

test('shouldnt detect dangerous because this text is innocent too even if it has some control chars', () => {
  expect(
    hasConfusables({
      sourceText:
        'bla \n bla \r bla \n\r more \t\t\t and more \u204c and also this greek question mark ; which isnt ;'
    })
  ).toBe(false)
})

test('the list of dangerous bidi characters should be more than 0', () => {
  expect(confusableChars.length).toBeGreaterThan(0)
})

test('detects all those dangerous characters', () => {
  confusableChars.forEach((char) => {
    expect(
      hasConfusables({
        sourceText: `this is some text that could have \n and \r and even \n\r but above all it has this dangerous bidi character: ${char} which the library should detect`
      })
    ).toBe(true)
  })
})
