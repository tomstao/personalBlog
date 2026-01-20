import type { CollectionEntry } from "astro:content"
import { createEffect, createMemo, createSignal, For, Show } from "solid-js"
import ArrowCard from "@components/ArrowCard"
import ErrorBoundary from "@components/ErrorBoundary"
import { cn } from "@lib/utils"

type FilterableCollection = "blog" | "projects"

type Props<T extends FilterableCollection> = {
  tags: string[]
  data: CollectionEntry<T>[]
  collection: T
  itemsPerPage?: number
}

const ITEMS_PER_PAGE = 6

export default function FilterableList<T extends FilterableCollection>({
  data,
  tags,
  collection,
  itemsPerPage = ITEMS_PER_PAGE,
}: Props<T>) {
  const [filter, setFilter] = createSignal(new Set<string>())
  const [items, setItems] = createSignal<CollectionEntry<T>[]>([])
  const [currentPage, setCurrentPage] = createSignal(1)

  const label = collection === "blog" ? "POSTS" : "PROJECTS"

  createEffect(() => {
    const filtered = data.filter((entry) =>
      Array.from(filter()).every((value) =>
        entry.data.tags.some((tag: string) => tag.toLowerCase() === String(value).toLowerCase())
      )
    )
    setItems(filtered)
    setCurrentPage(1) // Reset to first page when filter changes
  })

  const totalPages = createMemo(() => Math.ceil(items().length / itemsPerPage))

  const paginatedItems = createMemo(() => {
    const start = (currentPage() - 1) * itemsPerPage
    return items().slice(start, start + itemsPerPage)
  })

  const canGoPrev = createMemo(() => currentPage() > 1)
  const canGoNext = createMemo(() => currentPage() < totalPages())

  function toggleTag(tag: string) {
    setFilter(
      (prev) => new Set(prev.has(tag) ? [...prev].filter((t) => t !== tag) : [...prev, tag])
    )
  }

  return (
    <ErrorBoundary>
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div class="col-span-3 sm:col-span-1">
          <div class="sticky top-24">
            <div class="mb-2 text-sm font-semibold uppercase text-black dark:text-white">
              Filter
            </div>
            <ul class="flex flex-wrap gap-1.5 sm:flex-col">
              <For each={tags}>
                {(tag) => (
                  <li>
                    <button
                      onClick={() => toggleTag(tag)}
                      class={cn(
                        "w-full rounded px-2 py-1",
                        "overflow-hidden overflow-ellipsis whitespace-nowrap",
                        "flex items-center gap-2",
                        "bg-black/5 dark:bg-white/10",
                        "hover:bg-black/10 hover:dark:bg-white/15",
                        "transition-colors duration-300 ease-in-out",
                        filter().has(tag) && "text-black dark:text-white"
                      )}
                    >
                      <svg
                        class={cn(
                          "size-5 fill-black/50 dark:fill-white/50",
                          "transition-colors duration-300 ease-in-out",
                          filter().has(tag) && "fill-black dark:fill-white"
                        )}
                      >
                        <use
                          href={`/ui.svg#square`}
                          class={cn(!filter().has(tag) ? "block" : "hidden")}
                        />
                        <use
                          href={`/ui.svg#square-check`}
                          class={cn(filter().has(tag) ? "block" : "hidden")}
                        />
                      </svg>
                      {tag}
                    </button>
                  </li>
                )}
              </For>
            </ul>
          </div>
        </div>
        <div class="col-span-3 sm:col-span-2">
          <div class="flex flex-col">
            <div class="mb-2 text-sm uppercase">
              SHOWING {paginatedItems().length} OF {items().length} {label}
              {filter().size > 0 && ` (${data.length} total)`}
            </div>

            <Show
              when={items().length > 0}
              fallback={
                <div class="flex flex-col items-center justify-center rounded-lg border border-dashed border-black/20 py-12 dark:border-white/20">
                  <svg class="mb-3 size-12 stroke-black/30 dark:stroke-white/30" stroke-width="1.5">
                    <use href="/ui.svg#search" />
                  </svg>
                  <p class="text-black/50 dark:text-white/50">
                    No {label.toLowerCase()} match the selected filters
                  </p>
                  <button
                    onClick={() => setFilter(new Set())}
                    class="mt-3 rounded-md bg-black/5 px-3 py-1.5 text-sm transition-colors hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15"
                  >
                    Clear filters
                  </button>
                </div>
              }
            >
              <ul class="flex flex-col gap-3">
                <For each={paginatedItems()}>
                  {(item) => (
                    <li>
                      <ArrowCard entry={item} />
                    </li>
                  )}
                </For>
              </ul>

              {/* Pagination Controls */}
              <Show when={totalPages() > 1}>
                <div class="mt-6 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={!canGoPrev()}
                    class={cn(
                      "rounded-md px-3 py-1.5 text-sm transition-colors",
                      canGoPrev()
                        ? "bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15"
                        : "cursor-not-allowed bg-black/5 opacity-50 dark:bg-white/10"
                    )}
                  >
                    Previous
                  </button>

                  <div class="flex items-center gap-1">
                    <For each={Array.from({ length: totalPages() }, (_, i) => i + 1)}>
                      {(page) => (
                        <button
                          onClick={() => setCurrentPage(page)}
                          class={cn(
                            "size-8 rounded-md text-sm transition-colors",
                            currentPage() === page
                              ? "bg-black text-white dark:bg-white dark:text-black"
                              : "bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15"
                          )}
                        >
                          {page}
                        </button>
                      )}
                    </For>
                  </div>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages(), p + 1))}
                    disabled={!canGoNext()}
                    class={cn(
                      "rounded-md px-3 py-1.5 text-sm transition-colors",
                      canGoNext()
                        ? "bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15"
                        : "cursor-not-allowed bg-black/5 opacity-50 dark:bg-white/10"
                    )}
                  >
                    Next
                  </button>
                </div>
              </Show>
            </Show>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
