import type { APIRoute } from "astro"

// Disable prerendering for this API route (server-side only)
export const prerender = false

/**
 * View Counter API Endpoint
 *
 * This endpoint tracks post views using Vercel KV (Redis via Upstash).
 *
 * Setup:
 * 1. Create a KV database in Vercel Dashboard → Storage → Create Database → KV
 * 2. Connect the database to your project (auto-sets environment variables)
 * 3. Install: bun add @vercel/kv
 *
 * Environment variables (auto-configured by Vercel):
 * - KV_REST_API_URL
 * - KV_REST_API_TOKEN
 *
 * Usage:
 * - GET /api/views/[slug] - Get view count
 * - POST /api/views/[slug] - Increment and get view count
 */

import { kv } from "@vercel/kv"

export const GET: APIRoute = async ({ params }) => {
  const { slug } = params

  if (!slug) {
    return new Response(JSON.stringify({ error: "Slug is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    const views = (await kv.get<number>(`views:${slug}`)) ?? 0
    return new Response(JSON.stringify({ slug, views }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Failed to get views:", error)
    return new Response(JSON.stringify({ error: "Failed to get views" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

export const POST: APIRoute = async ({ params }) => {
  const { slug } = params

  if (!slug) {
    return new Response(JSON.stringify({ error: "Slug is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    const views = await kv.incr(`views:${slug}`)
    return new Response(JSON.stringify({ slug, views }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Failed to increment views:", error)
    return new Response(JSON.stringify({ error: "Failed to increment views" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
