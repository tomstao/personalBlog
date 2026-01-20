import { formatDate, readingTime } from "@lib/utils"
import type { CollectionEntry } from "astro:content"
import AnimatedArrow from "./AnimatedArrow"

type Props = {
  entry: CollectionEntry<"blog"> | CollectionEntry<"projects">
  pill?: boolean
}

export default function ArrowCard(props: Props) {
  return (
    <a
      href={`/${props.entry.collection}/${props.entry.slug}`}
      data-astro-prefetch
      class="group flex items-center gap-3 rounded-lg border border-black/15 p-4 transition-colors duration-300 ease-in-out hover:bg-black/5 dark:border-white/20 hover:dark:bg-white/10"
    >
      <div class="blend w-full group-hover:text-black group-hover:dark:text-white">
        <div class="flex flex-wrap items-center gap-2">
          {props.pill && (
            <div class="rounded-full border border-black/15 px-2 py-0.5 text-sm capitalize dark:border-white/25">
              {props.entry.collection === "blog" ? "post" : "project"}
            </div>
          )}
          <div class="text-sm uppercase">{formatDate(props.entry.data.date)}</div>
          <span class="text-black/25 dark:text-white/25">•</span>
          <div class="text-sm">{readingTime(props.entry.body)}</div>
        </div>
        <div class="mt-3 font-semibold text-black dark:text-white">{props.entry.data.title}</div>

        <div class="line-clamp-2 text-sm">{props.entry.data.summary}</div>
        <ul class="mt-2 flex flex-wrap gap-1">
          {props.entry.data.tags.map((tag: string) => (
            <li class="rounded bg-black/5 px-1 py-0.5 text-xs uppercase text-black/75 dark:bg-white/20 dark:text-white/75">
              {tag}
            </li>
          ))}
        </ul>
      </div>
      <AnimatedArrow />
    </a>
  )
}
