import { expect, it } from 'vitest'
import { simNow, withSpeed, realTime, isSimulated } from './sim-clock'
it('advances and changes speed without a jump', () => {
  const clock = { baseRealMs: 1000, baseSimMs: 5000, speed: 10 }
  expect(simNow(clock, 1600)).toBe(11000)
  expect(simNow(withSpeed(clock, 60, 1600), 1600)).toBe(11000)
  expect(isSimulated(realTime(1600), 1600)).toBe(false)
})
