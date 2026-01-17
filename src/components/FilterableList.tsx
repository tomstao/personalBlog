import type { CollectionEntry } from "astro:content"
import { createEffect, createSignal, For } from "solid-js"
import ArrowCard from "@components/ArrowCard"
import { cn } from "@lib/utils"

type FilterableCollection = "blog" | "projects"

type Props<T extends FilterableCollection> = {
  tags: string[]
  data: CollectionEntry<T>[]
  collection: T
}

export default function FilterableList<T extends FilterableCollection>({
  data,
  tags,
  collection,
}: Props<T>) {
  const [filter, setFilter] = createSignal(new Set<string>())
  const [items, setItems] = createSignal<CollectionEntry<T>[]>([])

  const label = collection === "blog" ? "POSTS" : "PROJECTS"

  createEffect(() => {
    setItems(
      data.filter((entry) =>
        Array.from(filter()).every((value) =>
          entry.data.tags.some((tag: string) => tag.toLowerCase() === String(value).toLowerCase())
        )
      )
    )
  })

  function toggleTag(tag: string) {
    setFilter(
      (prev) => new Set(prev.has(tag) ? [...prev].filter((t) => t !== tag) : [...prev, tag])
    )
  }

  return (
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
      <div class="col-span-3 sm:col-span-1">
        <div class="sticky top-24">
          <div class="mb-2 text-sm font-semibold uppercase text-black dark:text-white">Filter</div>
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
            SHOWING {items().length} OF {data.length} {label}
          </div>
          <ul class="flex flex-col gap-3">
            {items().map((item) => (
              <li>
                <ArrowCard entry={item} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
