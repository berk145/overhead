import { expect, it } from 'vitest'
import { formatCoord, formatDistance, formatDuration, formatRelativeTime, formatSpeed } from './format'
it('formats positions, units and elapsed time', () => { expect(formatCoord(-33.9, 151.2)).toBe('33.90°S 151.20°E'); expect(formatDistance(19877)).toBe('19,877 km'); expect(formatSpeed(7.66)).toBe('7.66 km/s'); expect(formatDuration(278 * 60000)).toBe('4 h 38 min'); expect(formatRelativeTime(0, 120000)).toBe('2 min ago') })
