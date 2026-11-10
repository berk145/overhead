import { describe, expect, it } from 'vitest'
import { createPointsLayer, fillPositions } from './points-layer'
describe('fillPositions', () => {
  it('compacts invalid frames and keeps source indices aligned', () => {
    const layer = createPointsLayer(3)
    const indices: number[] = []
    const count = fillPositions(
      layer.position,
      new Float32Array([1, 2, 3, NaN, 0, 0, 4, 5, 6]),
      (lat, lng, alt) => ({ x: lat, y: lng, z: alt }),
      (i) => indices.push(i),
    )
    expect(count).toBe(2)
    expect(indices).toEqual([0, 2])
    expect(layer.position.getX(1)).toBe(4)
  })
})
