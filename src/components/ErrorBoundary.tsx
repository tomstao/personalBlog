import { ErrorBoundary as SolidErrorBoundary, type ParentProps } from "solid-js"
import type { JSX } from "solid-js"

interface ErrorFallbackProps {
  error: Error
  reset: () => void
}

function ErrorFallback(props: ErrorFallbackProps): JSX.Element {
  return (
    <div class="flex flex-col items-center justify-center gap-4 rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950">
      <div class="text-red-600 dark:text-red-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="mx-auto h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <div>
        <h3 class="font-semibold text-red-800 dark:text-red-200">Something went wrong</h3>
        <p class="mt-1 text-sm text-red-600 dark:text-red-400">{props.error.message}</p>
      </div>
      <button
        onClick={props.reset}
        class="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
      >
        Try again
      </button>
    </div>
  )
}

export default function ErrorBoundary(props: ParentProps): JSX.Element {
  return (
    <SolidErrorBoundary fallback={(error, reset) => <ErrorFallback error={error} reset={reset} />}>
      {props.children}
    </SolidErrorBoundary>
  )
}
