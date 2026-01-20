import { createSignal, lazy, onCleanup, onMount, Show, Suspense } from "solid-js"
import type { SearchableEntry } from "@/types"
import ErrorBoundary from "./ErrorBoundary"

// Lazy load SearchModal only when needed
const SearchModal = lazy(() => import("./SearchModalContent"))

type Props = {
  data: SearchableEntry[]
}

export default function SearchWrapper({ data }: Props) {
  const [shouldLoad, setShouldLoad] = createSignal(false)

  const handleOpenSearch = () => {
    setShouldLoad(true)
  }

  onMount(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("open-search-modal", handleOpenSearch)
    }
  })

  onCleanup(() => {
    if (typeof window !== "undefined") {
      window.removeEventListener("open-search-modal", handleOpenSearch)
    }
  })

  return (
    <ErrorBoundary>
      <Show when={shouldLoad()}>
        <Suspense>
          <SearchModal data={data} initialOpen={true} />
        </Suspense>
      </Show>
    </ErrorBoundary>
  )
}
