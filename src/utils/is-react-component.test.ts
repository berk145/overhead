import { forwardRef } from 'react'
import { expect, it } from 'vitest'
import { isForwardRefComponent, isReactComponent } from './is-react-component'

it('recognizes component types and rejects malformed objects safely', () => {
  expect(isReactComponent(() => null)).toBe(true)
  expect(isForwardRefComponent(forwardRef(function Example() { return null }))).toBe(true)
  for (const value of [null, {}, { $$typeof: null }, { $$typeof: 'Symbol(react.forward_ref)' }, 'div']) {
    expect(isReactComponent(value)).toBe(false)
  }
})
