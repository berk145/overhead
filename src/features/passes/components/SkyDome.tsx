import { compassPoint } from '@/lib/geo'
import { formatDateShort, formatDegrees, formatTime } from '@/lib/format'
import type { Pass } from '@/lib/propagation/types'
import { labelSamples, litRuns, skyToXY } from '../lib/sky-dome'
export function SkyDome({
  pass,
  size = 260,
}: {
  pass: Pass | null
  size?: number
}) {
  if (!pass)
    return (
      <div className="text-fg-subtle flex h-full min-h-48 items-center justify-center text-sm">
        Select a pass to see its path
      </div>
    )
  const center = size / 2,
    radius = size * 0.37
  const fmt = (ms: number) => formatTime(ms, { seconds: true })
  return (
    <figure className="flex h-full min-h-0 flex-col items-center justify-center">
      <figcaption className="label-caps self-start">
        Sky dome · {formatDateShort(pass.peakMs)} {formatTime(pass.peakMs)}
      </figcaption>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        data-testid="sky-dome"
        role="img"
        aria-label="Sky dome showing the pass path"
        className="max-h-full w-full max-w-[360px]"
      >
        <title>Sky dome showing the pass path</title>
        <g fill="none" stroke="var(--color-chart-grid)">
          {[1, 2 / 3, 1 / 3].map((r) => (
            <circle key={r} cx={center} cy={center} r={radius * r} />
          ))}
          <path
            d={`M ${center - radius} ${center} H ${center + radius} M ${center} ${center - radius} V ${center + radius}`}
          />
        </g>
        {[
          ['N', center, center - radius - 10],
          ['E', center + radius + 12, center + 4],
          ['S', center, center + radius + 16],
          ['W', center - radius - 12, center + 4],
        ].map(([label, x, y]) => (
          <text
            key={label}
            x={x}
            y={y}
            fill="var(--color-fg-muted)"
            textAnchor="middle"
            fontSize="12"
            fontWeight="700"
            paintOrder="stroke"
            stroke="var(--color-bg)"
            strokeWidth="3"
          >
            {label}
          </text>
        ))}
        {[30, 60].map((elevation) => (
          <text
            key={elevation}
            x={center + 4}
            y={center - (radius * (90 - elevation)) / 90 - 3}
            fill="var(--color-fg-subtle)"
            fontSize="10"
            fontFamily="var(--font-mono)"
            paintOrder="stroke"
            stroke="var(--color-bg)"
            strokeWidth="3"
          >
            {elevation}°
          </text>
        ))}
        {litRuns(pass.samples).map((run, i) => (
          <path
            key={i}
            d={run.samples
              .map((s, index) => {
                const p = skyToXY(s.azDeg, s.elDeg, radius, center, center)
                return `${index ? 'L' : 'M'} ${p.x} ${p.y}`
              })
              .join(' ')}
            fill="none"
            className="stroke-brand-600 dark:stroke-brand-300"
            strokeWidth="2.5"
            strokeDasharray={run.lit ? undefined : '4 4'}
          />
        ))}
        {labelSamples(pass.samples, pass.peakMs, pass.maxElDeg).map((s) => {
          const pt = skyToXY(s.azDeg, s.elDeg, radius, center, center)
          return (
            <g key={s.tMs}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={s.tMs === pass.peakMs ? 4 : 2}
                className="fill-brand-600 dark:fill-brand-300"
              />
              <text
                x={pt.x + (pt.x < center ? -6 : 6)}
                y={pt.y + (pt.y < center ? -6 : 12)}
                textAnchor={pt.x < center ? 'end' : 'start'}
                fill="var(--color-fg-muted)"
                fontSize="10"
                fontFamily="var(--font-mono)"
                paintOrder="stroke"
                stroke="var(--color-bg)"
                strokeWidth="3"
              >
                {fmt(s.tMs)}
              </text>
            </g>
          )
        })}
      </svg>
      <span className="sr-only">
        Rises {fmt(pass.riseMs)} at {compassPoint(pass.riseAzDeg)}, peaks{' '}
        {fmt(pass.peakMs)} at {formatDegrees(pass.maxElDeg, 0)}{' '}
        {compassPoint(pass.peakAzDeg)}, sets {fmt(pass.setMs)} at{' '}
        {compassPoint(pass.setAzDeg)}.
      </span>
    </figure>
  )
}
