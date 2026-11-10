import { expect, it } from 'vitest'
import stations from '@/test/fixtures/gp-stations.json'
import visual from '@/test/fixtures/gp-visual.json'
import { gpGroupSchema } from '../api/schema'
import { mergeGroups, searchCatalog } from './catalog'
it('merges duplicate satellites in group priority and searches', () => {
  const a = gpGroupSchema.parse(stations)
  const b = gpGroupSchema.parse(visual)
  const result = mergeGroups({ stations: a, visual: b }, ['stations', 'visual'])
  expect(result.byId.size).toBe(
    new Set([...a, ...b].map((r) => r.NORAD_CAT_ID)).size,
  )
  expect(result.groupOf.get(25544)).toBe('stations')
  expect(searchCatalog(result.records, '25544')[0]?.NORAD_CAT_ID).toBe(25544)
  expect(searchCatalog(result.records, '')).toEqual([])
  expect(searchCatalog(result.records, 'hst').length).toBeGreaterThan(0)
})
