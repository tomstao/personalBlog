---
title: "Astro Sphere: Performance & UX Improvements"
summary: "My blog's performance optimizations, accessibility updates, and UX improvements made to Astro Sphere."
date: "Jan 17 2025"
draft: false
tags:
  - Tutorial
  - Astro
  - Astro Sphere
  - TypeScript
  - JavaScript
---

I've been spending some time improving my blog, focusing on performance, accessibility, and overall user experience. None of these changes are groundbreaking on their own, but together they make the site faster, more usable, and more polished. Below is a breakdown of what I changed and the reasoning behind it.

## Performance Improvements

### Lazy Loading the Search Modal

The search modal relies on Fuse.js for fuzzy searching, which is very useful but adds about 22KB of JavaScript. Since many users never open the search, loading it on every page didn't make much sense.

To solve this, I lazy-loaded the search modal so it only loads when needed:

```typescript
// SearchWrapper.tsx - Only loads when you actually need it
import { lazy, Suspense } from "solid-js"

const SearchModalContent = lazy(() => import("./SearchModalContent"))

export default function SearchWrapper({ data }) {
  const [shouldLoad, setShouldLoad] = createSignal(false)

  window.addEventListener("open-search-modal", () => setShouldLoad(true))

  return (
    <Show when={shouldLoad()}>
      <Suspense>
        <SearchModalContent data={data} initialOpen={true} />
      </Suspense>
    </Show>
  )
}
```

The `initialOpen={true}` prop fixes a subtle bug where the modal wouldn't open on the first click. Previously, the event fired before the component finished loading. Now, the modal opens immediately when it mounts.

### Removing WOFF Font Files

WOFF2 offers smaller file sizes with the same visual quality, and browser support is effectively universal at this point. I removed the WOFF fallbacks entirely.

| Font    | Before (WOFF + WOFF2) | After (WOFF2 only) |
| ------- | --------------------- | ------------------ |
| Regular | 39KB                  | 17KB               |
| Bold    | 40KB                  | 17KB               |

That's roughly 45KB saved just by removing unused files.

```css
@font-face {
  font-family: "Atkinson";
  src: url("/fonts/atkinson-regular.woff2") format("woff2");
  font-weight: 400;
  font-display: swap;
}
```

### Script Loading Order

Some scripts need to execute immediately (such as theme detection to prevent flashes), while others can safely wait:

```html
<!-- Run immediately -->
<script is:inline src="/js/theme.js"></script>
<script is:inline src="/js/scroll.js"></script>

<!-- Can be deferred -->
<script defer is:inline src="/js/animate.js"></script>
<script defer is:inline src="/js/back-to-top.js"></script>
```

This helps improve perceived performance without changing functionality.

### View Transitions

Astro's View Transitions make navigation feel smoother and faster. By using `transition:persist`, shared components don't re-render on navigation:

```astro
<Header transition:persist />
<Drawer transition:persist />
<main>
  <slot />
</main>
<Footer transition:persist />
```

This provides a near-SPA experience without the added complexity of a full SPA.

## Search Modal Improvements

The search experience received several usability upgrades.

### Keyboard Navigation

Users can now navigate search results using the arrow keys and press Enter to select an item:

```typescript
const handleInputKeyDown = (e: KeyboardEvent) => {
  if (e.key === "ArrowDown") {
    setSelectedIndex((prev) => (prev + 1) % results().length)
  } else if (e.key === "ArrowUp") {
    setSelectedIndex((prev) => (prev - 1 + results().length) % results().length)
  } else if (e.key === "Enter") {
    navigateToResult(results()[selectedIndex()])
  }
}
```

This small change makes a big difference for keyboard and power users.

### Grouped Results

Search results are now grouped by content type (posts vs. projects). To keep this efficient, I used `createMemo` so the grouping only recalculates when needed:

```typescript
const groupedResults = createMemo(() => {
  const groups: Record<string, SearchableEntry[]> = {}
  for (const result of results()) {
    const category = result.collection === "blog" ? "Posts" : "Projects"
    if (!groups[category]) groups[category] = []
    groups[category].push(result)
  }
  return groups
})
```

### Highlighting Search Matches

Matching text is now highlighted in the results. Fuse.js already provides match indices, so the main work was rendering them correctly:

```typescript
function highlightMatches(text: string, matches: FuseResultMatch[], key: string) {
  const match = matches?.find((m) => m.key === key)
  if (!match?.indices) return text

  // Wrap matched portions in <mark> tags
  // ... implementation details
}
```

This makes it easier to quickly understand why a result matched the query.

## Reading Progress Bar Fix

There was a small but annoying issue where the reading progress bar never quite reached 100%. I fixed this by explicitly checking whether the bottom of the article is visible:

```typescript
function updateProgress() {
  const articleRect = article.getBoundingClientRect()
  const windowHeight = window.innerHeight

  // If the end is visible, we're done
  const hasReachedEnd = articleRect.bottom <= windowHeight

  if (hasReachedEnd) {
    progressBar.style.width = "100%"
    return
  }

  // Otherwise calculate normally...
}
```

It's a minor detail, but it makes the UI feel more accurate and polished.

## Dark Mode Icon Fixes

The Astro tag icon looked incorrect in dark mode because the devicons version uses hardcoded colors. I replaced it with a custom brand SVG and used `fill-current` so it adapts automatically:

```typescript
// In getTagIcon()
if (normalized === "astro") {
  return {
    src: "/brand.svg#brand",
    needsInvert: false,
    isBrandIcon: true,
  }
}
```

Rendered inline:

```astro
{
  icon.isBrandIcon ? (
    <svg class="size-5 fill-current text-black dark:text-white">
      <use href={icon.src} />
    </svg>
  ) : (
    <img src={icon.src} alt={tag} class:list={[{ "dark:invert": icon.needsInvert }]} />
  )
}
```

Using `fill-current` ensures the icon automatically matches light and dark themes.

## SEO Enhancements

### Auto-Generated Breadcrumbs

Breadcrumbs help search engines understand site structure. These are generated directly from the URL path:

```typescript
const pathSegments = Astro.url.pathname.split("/").filter(Boolean)
const breadcrumbItems = [
  { name: "Home", url: Astro.site },
  ...pathSegments.map((segment, index) => ({
    name: formatSegment(segment),
    url: new URL(pathSegments.slice(0, index + 1).join("/"), Astro.site),
  })),
]
```

### Meta Description Length

To avoid search engines cutting off descriptions, I capped them at 155 characters:

```typescript
export function truncateDescription(description: string, maxLength = 155) {
  if (description.length <= maxLength) return description
  const truncated = description.slice(0, maxLength)
  const lastSpace = truncated.lastIndexOf(" ")
  return truncated.slice(0, lastSpace) + "..."
}
```

## Accessibility Improvements

### Skip to Content Link

Keyboard users can now skip directly to the main content:

```astro
<a href="#main-content" class="sr-only focus:not-sr-only focus:absolute ..."> Skip to content </a>
```

### aria-current for Navigation

Active navigation links now correctly indicate the current page for screen readers:

```javascript
if (isLinkActive(link.href)) {
  link.setAttribute("aria-current", "page")
}
```

## Final Thoughts

Most of these updates are small, but together they noticeably improve the experience. The site feels faster, works better with keyboards and screen readers, and avoids several subtle annoyances.

Key takeaways:

- Lazy-load heavy features like search when they're actually needed
- Use modern formats such as WOFF2 now that support is widespread
- Fix the small details—they matter more than you think
- Always test dark mode, especially for icons
- Design with keyboard users in mind

That's all for now. Time to ship!
