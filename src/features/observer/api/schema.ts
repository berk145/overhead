import { z } from 'zod'
export const geocodeResultSchema = z.object({
  id: z.number(),
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  elevation: z.number().optional(),
  country: z.string().optional(),
  country_code: z.string().optional(),
  admin1: z.string().optional(),
  timezone: z.string().optional(),
  population: z.number().optional(),
})
export const geocodeResponseSchema = z.object({
  results: z.array(geocodeResultSchema).optional().default([]),
})
export type GeocodeResult = z.infer<typeof geocodeResultSchema>
