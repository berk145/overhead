import { z } from 'zod'
export const cloudForecastSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  utc_offset_seconds: z.number(),
  hourly: z.object({
    time: z.array(z.string()),
    cloud_cover: z.array(z.number().nullable()),
    cloud_cover_low: z.array(z.number().nullable()),
    cloud_cover_mid: z.array(z.number().nullable()),
    cloud_cover_high: z.array(z.number().nullable()),
  }),
})
export type CloudForecast = z.infer<typeof cloudForecastSchema>
