import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date) {
  return Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date)
}

export function readingTime(html: string) {
  const textOnly = html.replace(/<[^>]+>/g, "")
  const wordCount = textOnly.split(/\s+/).length
  const readingTimeMinutes = (wordCount / 200 + 1).toFixed()
  return `${readingTimeMinutes} min read`
}

// Map tag names to their icon IDs in stack.svg
const TAG_ICONS: Record<string, string> = {
  astro: "astro",
  react: "react",
  vue: "vue",
  svelte: "svelte",
  sveltekit: "svelte",
  javascript: "javascript",
  js: "javascript",
  typescript: "typescript",
  ts: "typescript",
  tailwind: "tailwind",
  tailwindcss: "tailwind",
}

export function getTagIcon(tag: string): string | null {
  const normalized = tag.toLowerCase()
  return TAG_ICONS[normalized] || null
}
