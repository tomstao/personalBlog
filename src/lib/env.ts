import { z } from "astro:content"

/**
 * Environment variable validation schema
 * Add any custom environment variables here
 *
 * Built-in Astro env vars (no need to validate):
 * - import.meta.env.MODE: 'development' | 'production'
 * - import.meta.env.PROD: boolean
 * - import.meta.env.DEV: boolean
 * - import.meta.env.SSR: boolean
 * - import.meta.env.SITE: string (from astro.config)
 * - import.meta.env.BASE_URL: string
 */

const envSchema = z.object({
  // Add custom environment variables here
  // Example: ANALYTICS_ID: z.string().optional(),

  // Site URL - must be a valid URL
  SITE: z.string().url().optional(),
})

/**
 * Validate environment variables at runtime
 * Call this in your layout or config to catch issues early
 */
export function validateEnv() {
  const env = {
    SITE: import.meta.env.SITE,
  }

  const result = envSchema.safeParse(env)

  if (!result.success) {
    console.error("Invalid environment variables:")
    console.error(result.error.flatten().fieldErrors)

    if (import.meta.env.PROD) {
      throw new Error("Invalid environment configuration")
    }
  }

  return result.success
}

/**
 * Get typed environment variables
 * Use this instead of accessing import.meta.env directly
 */
export function getEnv() {
  return {
    SITE: import.meta.env.SITE as string,
    PROD: import.meta.env.PROD as boolean,
    DEV: import.meta.env.DEV as boolean,
    MODE: import.meta.env.MODE as "development" | "production",
  }
}

// Validate on module load in production
if (import.meta.env.PROD) {
  validateEnv()
}
