import { z } from 'zod'
export const issPositionSchema = z.object({
  name: z.string(),
  id: z.number().int(),
  latitude: z.number(),
  longitude: z.number(),
  altitude: z.number(),
  velocity: z.number(),
  visibility: z.string(),
  footprint: z.number(),
  timestamp: z.number().int(),
  daynum: z.number(),
  solar_lat: z.number(),
  solar_lon: z.number(),
  units: z.string(),
})
export type IssPosition = z.infer<typeof issPositionSchema>
