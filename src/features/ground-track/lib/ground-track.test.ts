import { expect, it } from 'vitest'
import { buildSatrec } from '@/lib/propagation/satrec'
import records from '@/test/fixtures/gp-stations.json'
import { groundTrack } from './ground-track'
it('samples three orbits within geographic bounds', () => {
  const record = records.find((r) => r.NORAD_CAT_ID === 25544)
  expect(record).toBeDefined()
  if (!record) return
  const built = buildSatrec({ ...record, EPHEMERIS_TYPE: 0 })
  expect(built).not.toBeNull()
  if (!built) return
  const tracks = groundTrack(
    built.satrec,
    Date.parse(`${record.EPOCH}Z`),
    1440 / record.MEAN_MOTION,
  )
  expect(tracks).toHaveLength(3)
  expect(tracks[0]?.coordinates.at(-1)).toEqual(tracks[1]?.coordinates[0])
  expect(tracks[1]?.coordinates.at(-1)).toEqual(tracks[2]?.coordinates[0])
  expect(
    tracks.every(
      (track) =>
        track.coordinates.length > 180 &&
        track.coordinates.every(
          ([lon, lat]) =>
            lon !== undefined &&
            lat !== undefined &&
            Math.abs(lon) <= 180 &&
            Math.abs(lat) <= 90,
        ),
    ),
  ).toBe(true)
})
