export function KeyValueTile({
  label,
  value,
  tooltip,
}: {
  label: string
  value: string | number
  tooltip?: string
}) {
  return (
    <div
      title={tooltip}
      className="border-border bg-surface-2 rounded-lg border px-2.5 py-1.5"
    >
      <p className="label-caps text-fg-muted text-[10.5px] tracking-[0.06em]">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold whitespace-nowrap">{value}</p>
    </div>
  )
}
