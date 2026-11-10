import { act, renderHook } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { useFrameClock } from './use-frame-clock'
vi.mock('@/store', () => ({ useAppStore: (selector: (s: { baseRealMs: number; baseSimMs: number; speed: number }) => unknown) => selector({ baseRealMs: 1000, baseSimMs: 5000, speed: 10 }) }))
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals() })
it('updates simulated time on animation frames and cancels on unmount', () => {
  vi.useFakeTimers()
  vi.setSystemTime(1000)
  let callback: FrameRequestCallback = () => {}
  const cancel = vi.fn()
  vi.stubGlobal('requestAnimationFrame', vi.fn((cb: FrameRequestCallback) => { callback = cb; return 1 }))
  vi.stubGlobal('cancelAnimationFrame', cancel)
  const hook = renderHook(() => useFrameClock(1))
  expect(hook.result.current).toBe(5000)
  act(() => { vi.setSystemTime(1600); callback(1000) })
  expect(hook.result.current).toBe(11000)
  hook.unmount()
  expect(cancel).toHaveBeenCalledWith(1)
})
