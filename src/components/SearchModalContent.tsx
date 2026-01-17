import { createEffect, createSignal, onCleanup, onMount, Show } from "solid-js"
import Fuse from "fuse.js"
import ArrowCard from "@components/ArrowCard"
import type { SearchableEntry } from "@/types"

type Props = {
  data: SearchableEntry[]
}

export default function SearchModal({ data }: Props) {
  const [isOpen, setIsOpen] = createSignal(false)
  const [query, setQuery] = createSignal("")
  const [results, setResults] = createSignal<SearchableEntry[]>([])
  let inputRef: HTMLInputElement | undefined

  const fuse = new Fuse(data, {
    keys: ["slug", "data.title", "data.summary", "data.tags"],
    includeMatches: true,
    minMatchCharLength: 2,
    threshold: 0.4,
  })

  createEffect(() => {
    if (query().length < 2) {
      setResults([])
    } else {
      setResults(fuse.search(query()).map((result) => result.item))
    }
  })

  // Focus input when modal opens
  createEffect(() => {
    if (isOpen() && inputRef) {
      setTimeout(() => inputRef?.focus(), 10)
    }
  })

  // Clear query when modal closes
  createEffect(() => {
    if (!isOpen()) {
      setQuery("")
    }
  })

  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)

  const onInput = (e: Event) => {
    const target = e.target as HTMLInputElement
    setQuery(target.value)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    // Close on escape
    if (e.key === "Escape" && isOpen()) {
      e.preventDefault()
      closeModal()
      return
    }

    // Skip if user is typing in an input/textarea (except our search input)
    const target = e.target as HTMLElement
    if (
      (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) &&
      target !== inputRef
    ) {
      return
    }

    // Open on "/" or Cmd/Ctrl+K
    const isSlash = e.key === "/" && !isOpen()
    const isCmdK = (e.metaKey || e.ctrlKey) && e.key === "k"

    if (isSlash || isCmdK) {
      e.preventDefault()
      if (isOpen()) {
        closeModal()
      } else {
        openModal()
      }
    }
  }

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal()
    }
  }

  onMount(() => {
    if (typeof document !== "undefined") {
      document.addEventListener("keydown", handleKeyDown)
      window.addEventListener("open-search-modal", openModal)
    }
  })

  onCleanup(() => {
    if (typeof document !== "undefined") {
      document.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("open-search-modal", openModal)
    }
  })

  return (
    <Show when={isOpen()}>
      <div
        class="fixed inset-0 z-[100] flex items-start justify-center bg-black/50 pt-[10vh] backdrop-blur-sm"
        onClick={handleBackdropClick}
      >
        <div class="mx-4 max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-xl border border-black/15 bg-white shadow-2xl dark:border-white/20 dark:bg-black">
          {/* Search Input */}
          <div class="relative border-b border-black/10 dark:border-white/20">
            <input
              ref={inputRef}
              name="search"
              type="text"
              value={query()}
              onInput={onInput}
              autocomplete="off"
              spellcheck={false}
              placeholder="Search posts and projects..."
              class="w-full bg-transparent px-4 py-4 pl-12 text-lg text-black outline-none ring-inset placeholder:text-black/50 focus-visible:ring-2 focus-visible:ring-black/20 dark:text-white dark:placeholder:text-white/50 dark:focus-visible:ring-white/20"
            />
            <svg class="absolute left-4 top-1/2 size-5 -translate-y-1/2 stroke-current opacity-50">
              <use href="/ui.svg#search" />
            </svg>
            <div class="absolute right-4 top-1/2 -translate-y-1/2">
              <kbd class="rounded border border-black/20 bg-black/5 px-1.5 py-0.5 text-xs text-black/50 dark:border-white/20 dark:bg-white/10 dark:text-white/50">
                ESC
              </kbd>
            </div>
          </div>

          {/* Results */}
          <div class="max-h-[60vh] overflow-y-auto p-4">
            <Show
              when={query().length >= 2}
              fallback={
                <div class="py-8 text-center text-sm opacity-50">
                  Type at least 2 characters to search
                </div>
              }
            >
              <Show
                when={results().length > 0}
                fallback={
                  <div class="py-8 text-center text-sm opacity-50">
                    No results found for "{query()}"
                  </div>
                }
              >
                <div class="mb-3 text-sm uppercase opacity-75">
                  Found {results().length} results
                </div>
                <ul class="flex flex-col gap-3">
                  {results().map((result) => (
                    <li>
                      <ArrowCard entry={result} pill={true} />
                    </li>
                  ))}
                </ul>
              </Show>
            </Show>
          </div>
        </div>
      </div>
    </Show>
  )
}
