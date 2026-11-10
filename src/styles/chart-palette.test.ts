import { afterEach, expect, it } from 'vitest'
import { cssToRgb01, normalizeColor, readPalette } from './chart-palette'

const tokens = [
  'group-stations',
  'group-visual',
  'group-starlink',
  'group-gps',
  'group-active',
  'orbit-selected',
  'orbit-past',
  'observer',
  'footprint',
  'night',
  'globe-bg',
  'globe-atmosphere',
  'chart-grid',
  'chart-axis',
]
afterEach(() => {
  for (const token of tokens)
    document.documentElement.style.removeProperty(`--color-${token}`)
})
it('reads hex and modern and legacy rgb colors', () => {
  for (const input of [
    '#2e90fa',
    'rgb(46 144 250)',
    'rgb(46, 144, 250)',
    'rgb(46 144 250 / 0.5)',
  ]) {
    const [r, g, b] = cssToRgb01(input)
    expect(r).toBeCloseTo(0.18, 2)
    expect(g).toBeCloseTo(0.565, 2)
    expect(b).toBeCloseTo(0.98, 2)
  }
})
it('reads group colors from the active document tokens', () => {
  for (const token of tokens)
    document.documentElement.style.setProperty(`--color-${token}`, '#599fd8')
  expect(cssToRgb01(readPalette().groups.stations)).toEqual([
    89 / 255,
    159 / 255,
    216 / 255,
  ])
})
it('throws for missing tokens and removes the probe', () => {
  const children = document.documentElement.children.length
  expect(() => readPalette()).toThrow(
    '--color-group-stations is not defined in globals.css',
  )
  expect(document.documentElement.children.length).toBe(children)
})

it('normalizes modern computed colors for globe rendering', () => {
  expect(normalizeColor('color(srgb 0.5 0.25 1 / 0.25)')).toBe(
    'rgba(128, 64, 255, 0.25)',
  )
  expect(normalizeColor('rgb(10 20 30 / 0.5)')).toBe('rgba(10, 20, 30, 0.5)')
  expect(() => normalizeColor('invalid')).toThrow('Unsupported color')
})
