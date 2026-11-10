import { expect, it } from 'vitest'
import { clampLat, parsers, readUrlState } from './url-state'
it('clamps latitude and provides the intended URL defaults', () => {
  expect(clampLat(95)).toBe(90)
  expect(clampLat(-95)).toBe(-90)
  expect(parsers.lat.defaultValue).toBe(52.37)
  expect(parsers.groups.defaultValue).toEqual(['stations', 'visual'])
  expect(parsers.minel.defaultValue).toBe(10)
})

it('rejects non-finite coordinates and parses a navigation URL', () => {
  const state = readUrlState(
    new URLSearchParams('lat=Infinity&lon=1e999&groups=active&view=track'),
  )
  expect(state.lat).toBe(52.37)
  expect(state.lon).toBeCloseTo(4.9)
  expect(state.groups).toEqual(['active'])
  expect(state.view).toBe('track')
})
