export function StatTile({
  label,
  value,
  unit,
  hint,
}: {
  label: string
  value: string | number
  unit?: string
  hint?: string
}) {
  return (
    <div>
      <p className="label-caps">{label}</p>
      <p className="flex items-baseline gap-1">
        <span className="stat-value max-lg:text-4xl">{value}</span>
        {unit && <span className="text-md text-fg-subtle">{unit}</span>}
      </p>
      {hint && <p className="text-fg-subtle text-xs">{hint}</p>}
    </div>
  )
}
