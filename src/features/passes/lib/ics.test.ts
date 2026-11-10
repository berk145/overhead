import { expect, it } from 'vitest'
import { buildIcs, escapeText, foldLine, icsDate } from './ics'
it('escapes and folds calendar text by octets', () => {
  expect(icsDate(Date.parse('2026-11-10T06:29:42.123Z'))).toBe(
    '20261110T062942Z',
  )
  expect(escapeText('a,b;c\\d\ne')).toBe('a\\,b\\;c\\\\d\\ne')
  const lines = foldLine('X'.repeat(74) + 'ø' + 'Y'.repeat(10)).split('\r\n')
  expect(lines).toHaveLength(2)
  expect(lines.every((l) => new TextEncoder().encode(l).length <= 75)).toBe(
    true,
  )
})
it('exports events with stable IDs and ten-minute alarms', () => {
  const ics = buildIcs({
    passes: [
      {
        noradId: 25544,
        riseMs: 1794292182000,
        peakMs: 1794292371000,
        setMs: 1794292563000,
        riseAzDeg: 203,
        peakAzDeg: 125,
        setAzDeg: 20,
        maxElDeg: 52,
        visibility: 'visible',
        samples: [],
      },
    ],
    satelliteName: 'ISS',
    locationLabel: 'Amsterdam, Netherlands\rInjected: value',
    nowMs: 0,
  })
  expect(ics).toContain('UID:25544-1794292182000@overhead.app')
  expect(ics).toContain('TRIGGER:-PT10M')
  expect(ics).toContain('LOCATION:Amsterdam\\, Netherlands\\nInjected: value\r\n')
  expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true)
})
