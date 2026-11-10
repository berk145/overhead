export function ErrorState({
  status,
  message,
  onRetry,
}: {
  status?: number
  message: string
  onRetry: () => void
}) {
  return (
    <div
      data-testid="error-state"
      role="alert"
      className="text-error-600 dark:text-error-500 p-4 text-sm"
    >
      <p>
        {message}
        {status ? ` (${status})` : ''}
      </p>
      <button
        type="button"
        className="mt-2 min-h-10 min-w-10 px-1 underline"
        onClick={onRetry}
      >
        Retry
      </button>
    </div>
  )
}
