import { z } from 'zod'
export const ommRecordSchema = z.object({
  OBJECT_NAME: z.string().min(1),
  OBJECT_ID: z.string(),
  EPOCH: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z?$/),
  MEAN_MOTION: z.number().positive(),
  ECCENTRICITY: z.number().min(0).lt(1),
  INCLINATION: z.number().min(0).max(180),
  RA_OF_ASC_NODE: z.number(),
  ARG_OF_PERICENTER: z.number(),
  MEAN_ANOMALY: z.number(),
  EPHEMERIS_TYPE: z.literal(0),
  CLASSIFICATION_TYPE: z.string(),
  NORAD_CAT_ID: z.number().int().positive(),
  ELEMENT_SET_NO: z.number().int(),
  REV_AT_EPOCH: z.number().int(),
  BSTAR: z.number(),
  MEAN_MOTION_DOT: z.number(),
  MEAN_MOTION_DDOT: z.number(),
})
export const gpGroupSchema = z.array(ommRecordSchema)
export type OmmRecord = z.infer<typeof ommRecordSchema>

export const gpResponseSchema = z.object({
  records: gpGroupSchema.min(1),
  source: z.enum(['CelesTrak via ReTLEctor', 'CelesTrak']),
  updatedAt: z.number().finite(),
  stale: z.boolean(),
})
export type GpGroup = z.infer<typeof gpResponseSchema>
