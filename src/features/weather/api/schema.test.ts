import { expect, it } from 'vitest'
import fixture from '@/test/fixtures/open-meteo-cloud.json'
import { cloudForecastSchema } from './schema'
it('parses the captured forecast', () => {
  expect(cloudForecastSchema.parse(fixture).hourly.time).toHaveLength(144)
})
