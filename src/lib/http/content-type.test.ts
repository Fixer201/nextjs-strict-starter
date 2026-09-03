import { describe, expect, it } from 'bun:test'
import { isJsonContentType } from './content-type'

describe('isJsonContentType', () => {
  const cases: ReadonlyArray<readonly [null | string, boolean]> = [
    [null, false],
    ['', false],
    ['application/json', true],
    ['Application/JSON', true],
    ['application/json; charset=utf-8', true],
    ['application/json ; charset="utf-8"', true],
    ['application/problem+json', false],
    ['text/json', false],
    ['application/json; garbage', false],
    ['application/json; charset', false],
  ]

  for (const [contentType, expected] of cases) {
    it(`returns ${String(expected)} for ${contentType ?? 'null'}`, () => {
      expect(isJsonContentType(contentType)).toBe(expected)
    })
  }
})
