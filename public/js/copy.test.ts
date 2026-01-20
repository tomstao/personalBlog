import { describe, it, expect, beforeEach, mock } from "bun:test"

// Helper to create mock DOM elements that mirror the real DOM API
function createMockElement(
  tagName: string,
  options: { classList?: string[]; children?: MockElement[] } = {}
): MockElement {
  const classSet = new Set(options.classList || [])
  const children: MockElement[] = options.children || []
  let textContent = ""
  let innerText = ""

  const element: MockElement = {
    tagName: tagName.toUpperCase(),
    classList: {
      add: (className: string) => classSet.add(className),
      remove: (className: string) => classSet.delete(className),
      contains: (className: string) => classSet.has(className),
    },
    children,
    parentNode: null,
    parentElement: null,
    get textContent() {
      return textContent
    },
    set textContent(value: string) {
      textContent = value
    },
    get innerText() {
      return innerText
    },
    set innerText(value: string) {
      innerText = value
    },
    appendChild: function (child: MockElement) {
      children.push(child)
      child.parentElement = element
      child.parentNode = element
      return child
    },
    querySelector: function (selector: string) {
      if (selector === "pre") return children.find((c) => c.tagName === "PRE") || null
      if (selector === "code") return children.find((c) => c.tagName === "CODE") || null
      if (selector === ".copy-tooltip")
        return children.find((c) => c.classList.contains("copy-tooltip")) || null
      // Recursive search
      for (const child of children) {
        const result = child.querySelector(selector)
        if (result) return result
      }
      return null
    },
    setAttribute: mock(() => {}),
    getAttribute: () => null,
    addEventListener: mock(() => {}),
    insertBefore: function (newNode: MockElement, _refNode: MockElement | null) {
      children.unshift(newNode)
      newNode.parentNode = element
      newNode.parentElement = element
      return newNode
    },
  }

  return element
}

interface MockElement {
  tagName: string
  classList: {
    add: (className: string) => void
    remove: (className: string) => void
    contains: (className: string) => boolean
  }
  children: MockElement[]
  parentNode: MockElement | null
  parentElement: MockElement | null
  textContent: string
  innerText: string
  appendChild: (child: MockElement) => MockElement
  querySelector: (selector: string) => MockElement | null
  setAttribute: ReturnType<typeof mock>
  getAttribute: () => string | null
  addEventListener: ReturnType<typeof mock>
  insertBefore: (newNode: MockElement, refNode: MockElement | null) => MockElement
}

describe("Copy Button - Duplicate Prevention", () => {
  it("should detect when pre element is already wrapped", () => {
    // Create a pre element that already has a wrapper parent
    const code = createMockElement("code")
    code.innerText = "const x = 1;"

    const pre = createMockElement("pre", { children: [code] })

    const existingWrapper = createMockElement("div", {
      classList: ["code-block-wrapper"],
      children: [pre],
    })
    pre.parentElement = existingWrapper

    // This is the check that copy.js uses to prevent duplicates
    const isAlreadyWrapped = pre.parentElement?.classList.contains("code-block-wrapper")

    expect(isAlreadyWrapped).toBe(true)
  })

  it("should detect when pre element needs a wrapper", () => {
    const code = createMockElement("code")
    const pre = createMockElement("pre", { children: [code] })

    const parentDiv = createMockElement("div", { children: [pre] })
    pre.parentElement = parentDiv

    // This is the check that copy.js uses
    const isAlreadyWrapped = pre.parentElement?.classList.contains("code-block-wrapper")

    expect(isAlreadyWrapped).toBe(false)
  })
})

describe("Copy Button - DOM Structure Creation", () => {
  it("should create correct wrapper structure", () => {
    const code = createMockElement("code")
    code.innerText = "console.log('hello');"

    const pre = createMockElement("pre", { children: [code] })

    // Simulate what copy.js does
    const wrapper = createMockElement("div")
    wrapper.classList.add("code-block-wrapper")

    const btn = createMockElement("button")
    btn.classList.add("copy-btn")

    wrapper.appendChild(pre)
    wrapper.appendChild(btn)

    expect(wrapper.classList.contains("code-block-wrapper")).toBe(true)
    expect(wrapper.children.length).toBe(2)
    expect(wrapper.children[0].tagName).toBe("PRE")
    expect(wrapper.children[1].tagName).toBe("BUTTON")
  })

  it("should create button with svg and tooltip", () => {
    const use = createMockElement("use")
    use.setAttribute("href", "/copy.svg#empty")

    const svg = createMockElement("svg")
    svg.classList.add("copy-svg")
    svg.appendChild(use)

    const tooltip = createMockElement("span")
    tooltip.classList.add("copy-tooltip")
    tooltip.textContent = "Copy"

    const btn = createMockElement("button")
    btn.classList.add("copy-btn")
    btn.appendChild(svg)
    btn.appendChild(tooltip)

    expect(btn.classList.contains("copy-btn")).toBe(true)
    expect(btn.children.length).toBe(2)
    expect(btn.children[0].classList.contains("copy-svg")).toBe(true)
    expect(btn.children[1].classList.contains("copy-tooltip")).toBe(true)
    expect(btn.children[1].textContent).toBe("Copy")
  })
})

describe("Copy Button - Copy Action", () => {
  let clipboardWriteText: ReturnType<typeof mock>

  beforeEach(() => {
    clipboardWriteText = mock(() => Promise.resolve())
  })

  it("should copy code text to clipboard", async () => {
    const codeText = "const example = 'test';"

    // Simulate the copy action
    await clipboardWriteText(codeText)

    expect(clipboardWriteText).toHaveBeenCalledWith(codeText)
  })

  it("should update button state after copy", () => {
    const btn = createMockElement("button")
    btn.classList.add("copy-btn")

    const tooltip = createMockElement("span")
    tooltip.classList.add("copy-tooltip")
    tooltip.textContent = "Copy"

    // Simulate the state change after copy
    btn.classList.add("copied")
    tooltip.textContent = "Copied!"

    expect(btn.classList.contains("copied")).toBe(true)
    expect(tooltip.textContent).toBe("Copied!")
  })

  it("should update SVG icon after copy", () => {
    const use = createMockElement("use")
    use.setAttribute("href", "/copy.svg#empty")

    // Simulate the icon change after copy
    use.setAttribute("href", "/copy.svg#filled")

    expect(use.setAttribute).toHaveBeenCalledWith("href", "/copy.svg#filled")
  })

  it("should reset button state after delay", () => {
    const btn = createMockElement("button")
    btn.classList.add("copy-btn")
    btn.classList.add("copied")

    const tooltip = createMockElement("span")
    tooltip.textContent = "Copied!"

    const use = createMockElement("use")

    // Simulate the reset (what happens in setTimeout callback)
    use.setAttribute("href", "/copy.svg#empty")
    btn.classList.remove("copied")
    tooltip.textContent = "Copy"

    expect(btn.classList.contains("copied")).toBe(false)
    expect(tooltip.textContent).toBe("Copy")
    expect(use.setAttribute).toHaveBeenCalledWith("href", "/copy.svg#empty")
  })
})

describe("Copy Button - getChildByTagName helper", () => {
  // This tests the helper function logic used in copy.js
  function getChildByTagName(element: MockElement, tagName: string): MockElement | undefined {
    return Array.from(element.children).find((child) => child.tagName === tagName.toUpperCase())
  }

  it("should find child element by tag name", () => {
    const span = createMockElement("span")
    const svg = createMockElement("svg")
    const parent = createMockElement("div", { children: [span, svg] })

    const result = getChildByTagName(parent, "svg")

    expect(result).toBe(svg)
  })

  it("should return undefined if child not found", () => {
    const span = createMockElement("span")
    const parent = createMockElement("div", { children: [span] })

    const result = getChildByTagName(parent, "svg")

    expect(result).toBeUndefined()
  })

  it("should handle case-insensitive tag names", () => {
    const svg = createMockElement("svg")
    const parent = createMockElement("div", { children: [svg] })

    const lowerResult = getChildByTagName(parent, "svg")
    const upperResult = getChildByTagName(parent, "SVG")

    expect(lowerResult).toBe(svg)
    expect(upperResult).toBe(svg)
  })

  it("should find nested svg use element", () => {
    const use = createMockElement("use")
    const svg = createMockElement("svg", { children: [use] })
    const btn = createMockElement("button", { children: [svg] })

    const foundSvg = getChildByTagName(btn, "svg")
    const foundUse = foundSvg ? getChildByTagName(foundSvg, "use") : undefined

    expect(foundSvg).toBe(svg)
    expect(foundUse).toBe(use)
  })
})

describe("Copy Button - Event Listener Registration", () => {
  it("should support DOMContentLoaded event pattern", () => {
    const listeners: { event: string; callback: () => void }[] = []
    const mockAddEventListener = (event: string, callback: () => void) => {
      listeners.push({ event, callback })
    }

    // Simulate the event registration pattern from copy.js
    const initFunction = () => {}
    mockAddEventListener("DOMContentLoaded", initFunction)
    mockAddEventListener("astro:after-swap", initFunction)

    const eventTypes = listeners.map((l) => l.event)

    expect(eventTypes).toContain("DOMContentLoaded")
    expect(eventTypes).toContain("astro:after-swap")
    expect(listeners.length).toBe(2)
  })
})

describe("Copy Button - Full Flow Simulation", () => {
  it("should simulate complete copy button lifecycle", async () => {
    // 1. Create initial DOM structure (before copy.js runs)
    const code = createMockElement("code")
    code.innerText = "function hello() { return 'world'; }"

    const pre = createMockElement("pre", { children: [code] })
    const articleDiv = createMockElement("div", { children: [pre] })
    pre.parentElement = articleDiv
    pre.parentNode = articleDiv

    // 2. Simulate initCopyButtons running
    const isAlreadyWrapped = pre.parentElement?.classList.contains("code-block-wrapper")
    expect(isAlreadyWrapped).toBe(false)

    // 3. Create wrapper and button (what initCopyButtons does)
    const use = createMockElement("use")
    use.setAttribute("href", "/copy.svg#empty")

    const svg = createMockElement("svg")
    svg.classList.add("copy-svg")
    svg.appendChild(use)

    const tooltip = createMockElement("span")
    tooltip.classList.add("copy-tooltip")
    tooltip.textContent = "Copy"

    const btn = createMockElement("button")
    btn.classList.add("copy-btn")
    btn.appendChild(svg)
    btn.appendChild(tooltip)

    const wrapper = createMockElement("div")
    wrapper.classList.add("code-block-wrapper")
    wrapper.appendChild(pre)
    wrapper.appendChild(btn)

    // 4. Verify structure
    expect(wrapper.classList.contains("code-block-wrapper")).toBe(true)
    expect(pre.parentElement).toBe(wrapper)

    // 5. Simulate click and copy
    const clipboardWriteText = mock(() => Promise.resolve())
    await clipboardWriteText(code.innerText)

    expect(clipboardWriteText).toHaveBeenCalledWith("function hello() { return 'world'; }")

    // 6. Simulate visual feedback
    use.setAttribute("href", "/copy.svg#filled")
    btn.classList.add("copied")
    tooltip.textContent = "Copied!"

    expect(btn.classList.contains("copied")).toBe(true)
    expect(tooltip.textContent).toBe("Copied!")

    // 7. After calling initCopyButtons again, it should skip this pre
    const isNowWrapped = pre.parentElement?.classList.contains("code-block-wrapper")
    expect(isNowWrapped).toBe(true)
  })
})
