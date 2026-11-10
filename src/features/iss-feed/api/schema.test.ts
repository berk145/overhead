import { expect, it } from 'vitest'
import live from '@/test/fixtures/iss-live.json'
import positions from '@/test/fixtures/iss-positions.json'
import { issPositionSchema } from './schema'
it('parses captured ISS positions', () => {
  expect(issPositionSchema.parse(live).id).toBe(25544)
  for (const position of positions)
    expect(issPositionSchema.parse(position).id).toBe(25544)
})
