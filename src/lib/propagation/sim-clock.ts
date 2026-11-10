import type { SimClock } from './types'
export const simNow = (c: SimClock, realNowMs = Date.now()): number => c.baseSimMs + (realNowMs - c.baseRealMs) * c.speed
export const withSpeed = (c: SimClock, speed: number, realNowMs = Date.now()): SimClock => ({ baseRealMs: realNowMs, baseSimMs: simNow(c, realNowMs), speed })
export const realTime = (realNowMs = Date.now()): SimClock => ({ baseRealMs: realNowMs, baseSimMs: realNowMs, speed: 1 })
export const isSimulated = (c: SimClock, realNowMs = Date.now()): boolean => c.speed !== 1 || Math.abs(simNow(c, realNowMs) - realNowMs) > 2000
