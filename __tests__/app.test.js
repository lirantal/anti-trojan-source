import { hasTrojanSource } from '../src/main.js'

test('shouldnt detect dangerous because this text is innocent', () => {
  expect(hasTrojanSource({ sourceText: 'bla bla bla' })).toBe(false)
})

test('detects U+061C', () => {
  expect(hasTrojanSource({ sourceText: 'this string has \u061c in it' })).toBe(true)
})
