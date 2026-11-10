import { expect, it } from 'vitest'
import { jday, sunPos } from 'satellite.js'
import { observerIsDark, satelliteSunlit, sunAltitudeDeg } from './illumination'
it('classifies sunward and shadowed satellites and observer twilight', () => {
  const t = 1794241823000, { rsun } = sunPos(jday(new Date(t))), n = Math.hypot(rsun.x, rsun.y, rsun.z)
  const p = { x: rsun.x / n * 7000, y: rsun.y / n * 7000, z: rsun.z / n * 7000 }
  expect(satelliteSunlit(p, t)).toBe(true)
  expect(satelliteSunlit({ x: -p.x, y: -p.y, z: -p.z }, t)).toBe(false)
  const ams = { lat: 52.37, lon: 4.9, altM: 0 }
  expect(observerIsDark(ams, Date.parse('2026-11-09T22:00:00Z'))).toBe(true)
  expect(sunAltitudeDeg(ams, Date.parse('2026-11-09T12:00:00Z'))).toBeGreaterThan(15)
})
