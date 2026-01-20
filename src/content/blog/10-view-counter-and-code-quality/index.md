---
title: "Adding a View Counter and Improving Code Quality"
summary: "Implementing a privacy-friendly view counter with Vercel KV, fixing SolidJS reactivity issues, and adding tests to CI."
date: "Jan 19 2025"
draft: false
tags:
  - Tutorial
  - Astro
  - TypeScript
  - JavaScript
---

This post covers a few updates I made to the blog: adding a view counter that respects user privacy, fixing some SolidJS lint warnings, and improving the CI pipeline.

## View Counter with Vercel KV

I wanted to track post popularity without relying on third-party analytics. Vercel KV (powered by Upstash Redis) provides a simple key-value store that's perfect for this.

### Setting Up Vercel KV

1. Go to Vercel Dashboard → Storage → Create Database → KV (Upstash)
2. Connect the database to your project
3. Install the package: `bun add @vercel/kv`

Vercel automatically injects the required environment variables (`KV_REST_API_URL`, `KV_REST_API_TOKEN`) when you connect the database.

### The API Endpoint

The endpoint handles both reading and incrementing view counts:

```typescript
// src/pages/api/views/[slug].ts
import type { APIRoute } from "astro"
import { kv } from "@vercel/kv"

export const prerender = false

export const GET: APIRoute = async ({ params }) => {
  const { slug } = params
  const views = (await kv.get<number>(`views:${slug}`)) ?? 0
  return new Response(JSON.stringify({ slug, views }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}

export const POST: APIRoute = async ({ params }) => {
  const { slug } = params
  const views = await kv.incr(`views:${slug}`)
  return new Response(JSON.stringify({ slug, views }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}
```

The `prerender = false` directive tells Astro this is a server-side route that shouldn't be statically generated.

### Client-Side Deduplication

The obvious problem: every page refresh would increment the counter. To fix this without storing any user data server-side, I use localStorage to track which posts have been viewed:

```typescript
const VIEWED_POSTS_KEY = "viewedPosts"

function getViewedPosts(): Set<string> {
  try {
    const stored = localStorage.getItem(VIEWED_POSTS_KEY)
    return stored ? new Set(JSON.parse(stored)) : new Set()
  } catch {
    return new Set()
  }
}

function markAsViewed(slug: string): void {
  const viewed = getViewedPosts()
  viewed.add(slug)
  localStorage.setItem(VIEWED_POSTS_KEY, JSON.stringify([...viewed]))
}

async function initViewCounters() {
  const viewedPosts = getViewedPosts()
  const slug = counter.getAttribute("data-slug")
  const alreadyViewed = viewedPosts.has(slug)

  // POST to increment if not viewed, GET to just fetch count
  const response = await fetch(`/api/views/${slug}`, {
    method: alreadyViewed ? "GET" : "POST",
  })

  if (!alreadyViewed) {
    markAsViewed(slug)
  }
}
```

This approach has a few benefits:

- **Privacy-friendly**: No cookies, no user tracking, no server-side user data
- **Graceful degradation**: If localStorage isn't available, it just fetches without incrementing
- **Simple**: The logic is straightforward and easy to understand

The component also hides itself if the API returns an error, which is useful during local development when the KV database isn't available.

### Displaying the Counter

The view counter appears in the article metadata alongside the date and reading time:

```astro
<div class="flex flex-wrap gap-3 text-sm uppercase opacity-75">
  <div class="flex items-center gap-2">
    <svg class="size-5 stroke-current">
      <use href="/ui.svg#calendar"></use>
    </svg>
    {formatDate(date)}
  </div>
  <div class="flex items-center gap-2">
    <svg class="size-5 stroke-current">
      <use href="/ui.svg#book-open"></use>
    </svg>
    {readingTime(body)}
  </div>
  <ViewCounter slug={slug} class="uppercase" />
</div>
```

## Fixing SolidJS Reactivity Warnings

ESLint with the SolidJS plugin flagged several components for destructuring props directly. In SolidJS, this can break reactivity because the destructured values become static.

### The Problem

```typescript
// This breaks reactivity - values are captured once
export default function AnimatedArrow({ direction = "right", size = 20 }: Props) {
  const isLeft = direction === "left" // Static!
  // ...
}
```

### The Solution

Use `mergeProps` to preserve reactivity while still providing defaults:

```typescript
import { mergeProps } from "solid-js"

export default function AnimatedArrow(_props: Props) {
  const props = mergeProps({ direction: "right", size: 20 }, _props)
  const isLeft = props.direction === "left" // Reactive!
  // ...
}
```

Event handlers also need special attention. Instead of passing the prop directly, wrap it in an arrow function:

```typescript
// Before - may not work correctly
<button onClick={props.reset}>

// After - properly reactive
<button onClick={() => props.reset()}>
```

In practice, these issues often don't manifest because Astro passes props from the server that never change. But it's good practice to follow the framework's reactivity model, and it makes the linter happy.

## CI Pipeline Improvements

I added a test step to the GitHub Actions workflow to catch issues earlier:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Run ESLint
        run: bun run lint

      - name: Run tests
        run: bun test

      - name: Run Prettier check
        run: bun run format:check

      - name: Type check
        run: bunx astro check

      - name: Build
        run: bun run build
```

The pipeline now runs:

1. **ESLint** - Catches code quality issues
2. **Tests** - Runs the unit test suite with Bun's built-in test runner
3. **Prettier** - Ensures consistent formatting
4. **Type check** - Validates TypeScript types
5. **Build** - Confirms the site builds successfully

### Other Lint Fixes

A few other small fixes were needed:

**ESLint ignoring build artifacts:**

```javascript
// eslint.config.js
{
  ignores: ["dist/", "node_modules/", ".astro/", ".vercel/", "public/js/"],
}
```

**Test file constant expressions:**

```typescript
// Before - lint error about constant truthiness
expect(cn("base", false && "hidden", true && "visible")).toBe("base visible")

// After - using variables makes intent clear
const isHidden = false
const isVisible = true
expect(cn("base", isHidden && "hidden", isVisible && "visible")).toBe("base visible")
```

## Key Takeaways

- **localStorage is great for privacy-friendly deduplication** - No server-side user tracking needed
- **Follow framework reactivity patterns** - Even if it seems to work, the linter warnings are usually right
- **Automate quality checks** - CI should catch issues before they reach production
- **Graceful degradation matters** - Components should handle missing APIs cleanly

The view counter is now live. If you refresh this page, the count shouldn't change (unless you clear your localStorage).
