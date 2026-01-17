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
  // Remove code blocks first (they're read slower)
  const withoutCode = html.replace(/<pre[\s\S]*?<\/pre>/g, "")
  const textOnly = withoutCode.replace(/<[^>]+>/g, "")
  const wordCount = textOnly.split(/\s+/).filter(Boolean).length

  // Count images (add 12 seconds per image)
  const imageCount = (html.match(/<img/g) || []).length
  const imageTime = (imageCount * 12) / 60

  // 200 words per minute average reading speed
  const readingTimeMinutes = Math.ceil(wordCount / 200 + imageTime)
  return `${readingTimeMinutes} min read`
}

/**
 * Truncate meta description to optimal SEO length (120-160 chars)
 * Cuts at word boundary and adds ellipsis if needed
 */
export function truncateDescription(description: string, maxLength = 155): string {
  if (description.length <= maxLength) return description

  // Find the last space before maxLength
  const truncated = description.slice(0, maxLength)
  const lastSpace = truncated.lastIndexOf(" ")

  if (lastSpace > maxLength - 30) {
    return truncated.slice(0, lastSpace) + "..."
  }

  return truncated + "..."
}

// Map tag names to devicon icon paths
const DEVICON_TAGS: Record<string, string> = {
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

// Icons that need dark:invert for dark mode (dark-colored icons)
const INVERT_ICONS = new Set(["markdown", "md"])

interface TagIconResult {
  src: string
  needsInvert: boolean
  isBrandIcon?: boolean
}

export function getTagIcon(tag: string): TagIconResult {
  const normalized = tag.toLowerCase()

  // Special case: Astro uses brand.svg with fill-current for proper dark mode
  if (normalized === "astro") {
    return {
      src: "/brand.svg#brand",
      needsInvert: false,
      isBrandIcon: true,
    }
  }

  // Check devicon first
  const deviconPath = DEVICON_TAGS[normalized]
  if (deviconPath) {
    return {
      src: `/devicons/${deviconPath}.svg`,
      needsInvert: INVERT_ICONS.has(normalized),
    }
  }

  // Fallback to lucide (all lucide icons need invert)
  const lucideIcon = LUCIDE_TAGS[normalized]
  if (lucideIcon) {
    return {
      src: `/lucide/${lucideIcon}.svg`,
      needsInvert: true,
    }
  }

  // Default fallback
  return {
    src: "/lucide/tag.svg",
    needsInvert: true,
  }
}
