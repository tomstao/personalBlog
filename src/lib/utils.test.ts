import { describe, it, expect } from "bun:test"
import { cn, formatDate, readingTime, truncateDescription, getTagIcon } from "./utils"

describe("cn (className merge)", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar")
  })

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", true && "visible")).toBe("base visible")
  })

  it("merges tailwind classes correctly", () => {
    expect(cn("px-4", "px-6")).toBe("px-6")
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500")
  })

  it("handles arrays and objects", () => {
    expect(cn(["foo", "bar"])).toBe("foo bar")
    expect(cn({ foo: true, bar: false })).toBe("foo")
  })
})

describe("formatDate", () => {
  it("formats date in en-US short format", () => {
    // Use explicit time to avoid timezone issues
    const date = new Date(2024, 0, 15) // Jan 15, 2024
    expect(formatDate(date)).toBe("Jan 15, 2024")
  })

  it("handles different months", () => {
    expect(formatDate(new Date(2024, 5, 1))).toBe("Jun 01, 2024") // June
    expect(formatDate(new Date(2024, 11, 25))).toBe("Dec 25, 2024") // December
  })
})

describe("readingTime", () => {
  it("calculates reading time for short text", () => {
    const shortText = "Hello world. ".repeat(50) // 100 words
    expect(readingTime(shortText)).toBe("1 min read")
  })

  it("calculates reading time for longer text", () => {
    const longText = "Hello world test. ".repeat(200) // 600 words = 3 min
    expect(readingTime(longText)).toBe("3 min read")
  })

  it("excludes code blocks from word count", () => {
    const textWithCode = "Hello world. ".repeat(100) + "<pre><code>const x = 1;</code></pre>"
    const textWithoutCode = "Hello world. ".repeat(100)
    expect(readingTime(textWithCode)).toBe(readingTime(textWithoutCode))
  })

  it("adds time for images", () => {
    const textOnly = "Hello world. ".repeat(100) // 200 words = 1 min
    const textWithImages = textOnly + '<img src="a.jpg"><img src="b.jpg">' // +24 sec = 1.4 min -> 2 min
    expect(readingTime(textWithImages)).toBe("2 min read")
  })

  it("strips HTML tags from word count", () => {
    const htmlText = "<p>Hello <strong>world</strong></p>".repeat(100) // 200 words
    expect(readingTime(htmlText)).toBe("1 min read")
  })
})

describe("truncateDescription", () => {
  it("returns short descriptions unchanged", () => {
    const short = "This is a short description."
    expect(truncateDescription(short)).toBe(short)
  })

  it("truncates long descriptions at word boundary", () => {
    const long = "A ".repeat(100) // 200 chars
    const result = truncateDescription(long, 50)
    expect(result.length).toBeLessThanOrEqual(53) // 50 + "..."
    expect(result.endsWith("...")).toBe(true)
  })

  it("respects custom maxLength", () => {
    const text = "This is a test description that is quite long."
    const result = truncateDescription(text, 20)
    expect(result.length).toBeLessThanOrEqual(23)
  })

  it("uses default maxLength of 155", () => {
    const exactlyMax = "A".repeat(155)
    expect(truncateDescription(exactlyMax)).toBe(exactlyMax)

    const overMax = "A".repeat(156)
    expect(truncateDescription(overMax).endsWith("...")).toBe(true)
  })
})

describe("getTagIcon", () => {
  it("returns devicon path for known tech tags", () => {
    const result = getTagIcon("react")
    expect(result.src).toBe("/devicons/react/react-original.svg")
    expect(result.needsInvert).toBe(false)
  })

  it("handles case insensitivity", () => {
    expect(getTagIcon("React").src).toBe("/devicons/react/react-original.svg")
    expect(getTagIcon("TYPESCRIPT").src).toBe("/devicons/typescript/typescript-original.svg")
  })

  it("returns lucide icon for non-dev tags", () => {
    const result = getTagIcon("tutorial")
    expect(result.src).toBe("/lucide/book-open.svg")
    expect(result.needsInvert).toBe(true)
  })

  it("returns brand icon for astro", () => {
    const result = getTagIcon("astro")
    expect(result.src).toBe("/brand.svg#brand")
    expect(result.isBrandIcon).toBe(true)
  })

  it("marks dark icons as needing invert", () => {
    expect(getTagIcon("markdown").needsInvert).toBe(true)
    expect(getTagIcon("nextjs").needsInvert).toBe(true)
  })

  it("returns default tag icon for unknown tags", () => {
    const result = getTagIcon("unknown-tag-xyz")
    expect(result.src).toBe("/lucide/tag.svg")
    expect(result.needsInvert).toBe(true)
  })

  it("handles tag aliases", () => {
    expect(getTagIcon("js").src).toBe(getTagIcon("javascript").src)
    expect(getTagIcon("ts").src).toBe(getTagIcon("typescript").src)
    expect(getTagIcon("md").src).toBe(getTagIcon("markdown").src)
  })
})
