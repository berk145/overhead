export type OmmRecordLike = {
  OBJECT_NAME: string; OBJECT_ID: string; EPOCH: string
  MEAN_MOTION: number; ECCENTRICITY: number; INCLINATION: number
  RA_OF_ASC_NODE: number; ARG_OF_PERICENTER: number; MEAN_ANOMALY: number
  EPHEMERIS_TYPE: 0; CLASSIFICATION_TYPE: string; NORAD_CAT_ID: number
  ELEMENT_SET_NO: number; REV_AT_EPOCH: number; BSTAR: number
  MEAN_MOTION_DOT: number; MEAN_MOTION_DDOT: number
}
export type GroupId = 'stations' | 'visual' | 'starlink' | 'gps-ops' | 'active'
export const GROUP_ORDER: GroupId[] = ['stations', 'visual', 'gps-ops', 'starlink', 'active']
export type SimClock = { baseRealMs: number; baseSimMs: number; speed: number }
export type ObserverInput = { lat: number; lon: number; altM: number }
export type PassSample = { tMs: number; azDeg: number; elDeg: number; lit: boolean }
export type Pass = { noradId: number; riseMs: number; peakMs: number; setMs: number; riseAzDeg: number; peakAzDeg: number; setAzDeg: number; maxElDeg: number; visibility: 'visible' | 'daylight' | 'shadow'; samples: PassSample[] }
export type WorkerRequest =
  | { type: 'load'; group: GroupId; records: OmmRecordLike[] }
  | { type: 'unload'; group: GroupId }
  | { type: 'setClock'; clock: SimClock }
  | { type: 'predictPasses'; requestId: number; noradId: number; observer: ObserverInput; startMs: number; days: number; minElevationDeg: number }
export type WorkerResponse =
  | { type: 'loaded'; group: GroupId; count: number; rejectedIds: number[] }
  | { type: 'roster'; ids: Int32Array; groupIndex: Uint8Array }
  | { type: 'positions'; simTimeMs: number; latLngAlt: Float32Array }
  | { type: 'passes'; requestId: number; noradId: number; passes: Pass[]; error?: 'not-loaded' | 'decayed' | 'not-leo' }
