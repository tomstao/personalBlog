import { createEffect, createMemo, createSignal, For, onCleanup, onMount, Show } from "solid-js"
import type { JSX } from "solid-js"
import Fuse, { type FuseResult, type FuseResultMatch } from "fuse.js"
import type { SearchableEntry } from "@/types"

type Props = {
  data: SearchableEntry[]
  initialOpen?: boolean
}

type SearchResult = FuseResult<SearchableEntry>

// Highlight matched text in search results
function highlightMatches(
  text: string,
  matches: readonly FuseResultMatch[] | undefined,
  key: string
): JSX.Element {
  if (!matches) return <>{text}</>

  const match = matches.find((m) => m.key === key)
  if (!match || !match.indices.length) return <>{text}</>

  const parts: JSX.Element[] = []
  let lastIndex = 0

  // Sort indices and merge overlapping
  const sortedIndices = [...match.indices].sort((a, b) => a[0] - b[0])

  for (const [start, end] of sortedIndices) {
    if (start > lastIndex) {
      parts.push(<>{text.slice(lastIndex, start)}</>)
    }
    parts.push(
      <mark class="rounded bg-yellow-200/70 px-0.5 text-black dark:bg-yellow-500/40 dark:text-white">
        {text.slice(start, end + 1)}
      </mark>
    )
    lastIndex = end + 1
  }

  if (lastIndex < text.length) {
    parts.push(<>{text.slice(lastIndex)}</>)
  }

  return <>{parts}</>
}

export default function SearchModal({ data, initialOpen = false }: Props) {
  const [isOpen, setIsOpen] = createSignal(initialOpen)
  const [query, setQuery] = createSignal("")
  const [selectedIndex, setSelectedIndex] = createSignal(0)
  let inputRef: HTMLInputElement | undefined

  const fuse = new Fuse(data, {
    keys: ["slug", "data.title", "data.summary", "data.tags"],
    includeMatches: true,
    minMatchCharLength: 2,
    threshold: 0.4,
  })

  // Store full fuse results to access match info
  const fuseResults = createMemo(() => {
    if (query().length < 2) return []
    return fuse.search(query())
  })

  const results = createMemo(() => fuseResults().map((result) => result.item))

  const groupedResults = createMemo(() => {
    const groups: Record<string, SearchResult[]> = {}
    for (const result of fuseResults()) {
      const category = result.item.collection === "blog" ? "Posts" : "Projects"
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(result)
    }
    return groups
  })

  // Pre-calculate global index offsets for each category
  const categoryOffsets = createMemo(() => {
    const offsets: Record<string, number> = {}
    let offset = 0
    for (const [category, items] of Object.entries(groupedResults())) {
      offsets[category] = offset
      offset += items.length
    }
    return offsets
  })

  // Focus input and reset state when modal opens
  createEffect(() => {
    if (isOpen()) {
      setTimeout(() => inputRef?.focus(), 10)
      setQuery("")
      setSelectedIndex(0)
    }
  })

  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)

  const onInputChange = (e: Event) => {
    const target = e.target as HTMLInputElement
    setQuery(target.value)
    setSelectedIndex(0)
  }

  const navigateToResult = (result: SearchableEntry) => {
    const basePath = result.collection === "blog" ? "/blog" : "/projects"
    window.location.href = `${basePath}/${result.slug}`
    closeModal()
  }

  const handleInputKeyDown = (e: KeyboardEvent) => {
    const totalResults = results().length

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % totalResults)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + totalResults) % totalResults)
    } else if (e.key === "Enter" && results()[selectedIndex()]) {
      e.preventDefault()
      navigateToResult(results()[selectedIndex()])
    }
  }

  const handleGlobalKeyDown = (e: KeyboardEvent) => {
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

  onMount(() => {
    if (typeof document !== "undefined") {
      document.addEventListener("keydown", handleGlobalKeyDown)
      window.addEventListener("open-search-modal", openModal)
    }
  })

  onCleanup(() => {
    if (typeof document !== "undefined") {
      document.removeEventListener("keydown", handleGlobalKeyDown)
      window.removeEventListener("open-search-modal", openModal)
    }
  })

  return (
    <Show when={isOpen()}>
      <div class="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
        {/* Backdrop - clickable to close */}
        <div
          class="absolute inset-0 bg-white/80 backdrop-blur-sm dark:bg-black/80"
          onClick={closeModal}
        />

        {/* Modal */}
        <div class="animate-fade-in relative mx-4 w-full max-w-lg">
          <div class="overflow-hidden rounded-xl border border-black/15 bg-white shadow-2xl dark:border-white/20 dark:bg-neutral-900">
            {/* Search Input */}
            <div class="flex items-center gap-3 border-b border-black/10 px-4 dark:border-white/10">
              <svg class="size-5 shrink-0 stroke-current opacity-50">
                <use href="/ui.svg#search" />
              </svg>
              <input
                ref={inputRef}
                name="search"
                type="text"
                value={query()}
                onInput={onInputChange}
                onKeyDown={handleInputKeyDown}
                autocomplete="off"
                spellcheck={false}
                placeholder="Search posts and projects..."
                class="min-w-0 flex-1 bg-transparent py-4 text-base text-black outline-none placeholder:text-black/50 dark:text-white dark:placeholder:text-white/50"
              />
              <button
                onClick={closeModal}
                class="shrink-0 rounded-md p-1 text-black/50 transition-colors hover:bg-black/5 hover:text-black dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <svg class="size-4 stroke-current" stroke-width="2">
                  <use href="/ui.svg#x" />
                </svg>
              </button>
            </div>

            {/* Results */}
            <div class="max-h-80 overflow-y-auto p-2">
              <Show
                when={query().length >= 2}
                fallback={
                  <div class="py-8 text-center text-sm text-black/50 dark:text-white/50">
                    Type at least 2 characters to search
                  </div>
                }
              >
                <Show
                  when={results().length > 0}
                  fallback={
                    <div class="py-8 text-center text-sm text-black/50 dark:text-white/50">
                      No results found for "{query()}"
                    </div>
                  }
                >
                  <For each={Object.entries(groupedResults())}>
                    {([category, items]) => {
                      const globalIndexOffset = categoryOffsets()[category]

                      return (
                        <div class="mb-2">
                          <div class="px-2 py-1.5 text-xs font-medium text-black/50 dark:text-white/50">
                            {category}
                          </div>
                          <For each={items}>
                            {(fuseResult, localIndex) => {
                              const result = fuseResult.item
                              const globalIndex = () => globalIndexOffset + localIndex()
                              const isSelected = () => globalIndex() === selectedIndex()

                              return (
                                <button
                                  onClick={() => navigateToResult(result)}
                                  onMouseEnter={() => setSelectedIndex(globalIndex())}
                                  class={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                                    isSelected()
                                      ? "bg-black/5 dark:bg-white/10"
                                      : "hover:bg-black/[0.03] dark:hover:bg-white/5"
                                  }`}
                                >
                                  <span class="flex size-8 shrink-0 items-center justify-center rounded-md bg-black/5 text-black/70 dark:bg-white/10 dark:text-white/70">
                                    <svg class="size-4 stroke-current">
                                      <use
                                        href={`/ui.svg#${result.collection === "blog" ? "document" : "folder"}`}
                                      />
                                    </svg>
                                  </span>
                                  <div class="min-w-0 flex-1">
                                    <div class="truncate font-medium text-black dark:text-white">
                                      {highlightMatches(
                                        result.data.title,
                                        fuseResult.matches,
                                        "data.title"
                                      )}
                                    </div>
                                    <div class="truncate text-sm text-black/50 dark:text-white/50">
                                      {highlightMatches(
                                        result.data.summary,
                                        fuseResult.matches,
                                        "data.summary"
                                      )}
                                    </div>
                                  </div>
                                  <Show when={isSelected()}>
                                    <svg class="size-4 shrink-0 stroke-current text-black/50 dark:text-white/50">
                                      <use href="/ui.svg#arrow-right" />
                                    </svg>
                                  </Show>
                                </button>
                              )
                            }}
                          </For>
                        </div>
                      )
                    }}
                  </For>
                </Show>
              </Show>
            </div>

            {/* Footer */}
            <div class="flex items-center justify-between border-t border-black/10 px-4 py-2.5 text-xs text-black/50 dark:border-white/10 dark:text-white/50">
              <div class="flex items-center gap-4">
                <span class="flex items-center gap-1">
                  <kbd class="rounded bg-black/5 px-1.5 py-0.5 font-mono text-[10px] font-medium dark:bg-white/10">
                    ↑
                  </kbd>
                  <kbd class="rounded bg-black/5 px-1.5 py-0.5 font-mono text-[10px] font-medium dark:bg-white/10">
                    ↓
                  </kbd>
                  <span class="ml-1">Navigate</span>
                </span>
                <span class="flex items-center gap-1">
                  <kbd class="rounded bg-black/5 px-1.5 py-0.5 font-mono text-[10px] font-medium dark:bg-white/10">
                    ↵
                  </kbd>
                  <span class="ml-1">Select</span>
                </span>
              </div>
              <span class="flex items-center gap-1">
                <kbd class="rounded bg-black/5 px-1.5 py-0.5 font-mono text-[10px] font-medium dark:bg-white/10">
                  esc
                </kbd>
                <span class="ml-1">Close</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Show>
  )
}
