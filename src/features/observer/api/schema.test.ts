import { describe, expect, it } from 'vitest'
import fixture from '@/test/fixtures/geocode-amsterdam.json'
import { geocodeResponseSchema } from './schema'
describe('geocoding response', () => {
  it('accepts captured results and missing results', () => {
    expect(geocodeResponseSchema.parse(fixture).results[0]?.name).toBe(
      'Amsterdam',
    )
    expect(geocodeResponseSchema.parse({}).results).toEqual([])
  })
})
