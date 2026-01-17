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

// Map tag names to devicon icon paths
const DEVICON_TAGS: Record<string, string> = {
  astro: "astro/astro-original",
  react: "react/react-original",
  vue: "vuejs/vuejs-original",
  svelte: "svelte/svelte-original",
  sveltekit: "svelte/svelte-original",
  javascript: "javascript/javascript-original",
  js: "javascript/javascript-original",
  typescript: "typescript/typescript-original",
  ts: "typescript/typescript-original",
  tailwind: "tailwindcss/tailwindcss-original",
  tailwindcss: "tailwindcss/tailwindcss-original",
  solidjs: "solidjs/solidjs-original",
  solid: "solidjs/solidjs-original",
  markdown: "markdown/markdown-original",
  md: "markdown/markdown-original",
}

// Map tag names to lucide icon names (fallback for non-dev icons)
const LUCIDE_TAGS: Record<string, string> = {
  tutorial: "book-open",
  blog: "newspaper",
  "astro sphere": "rocket",
  mdx: "code",
  "website deploy": "globe",
  stylex: "code",
}

export function getTagIcon(tag: string): string | null {
  const normalized = tag.toLowerCase()

  // Check devicon first
  const deviconPath = DEVICON_TAGS[normalized]
  if (deviconPath) {
    return `/devicons/${deviconPath}.svg`
  }

  // Fallback to lucide
  const lucideIcon = LUCIDE_TAGS[normalized]
  if (lucideIcon) {
    return `/lucide/${lucideIcon}.svg`
  }

  // Default fallback
  return "/lucide/tag.svg"
}
