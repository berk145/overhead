'use client'

export default function Error({ retry }: { retry: () => void }) {
  return (
    <main role="alert" className="text-fg p-6">
      <h1 className="text-lg font-semibold">Something went wrong</h1>
      <p className="text-fg-muted mt-2 text-sm">Please try again.</p>
      <button
        type="button"
        onClick={retry}
        className="border-border mt-4 rounded-lg border px-3 py-2 text-sm"
      >
        Retry
      </button>
    </main>
  )
}
