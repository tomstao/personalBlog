const codeBlocks = document.querySelectorAll("pre:has(code)")

//add copy btn to every code block on the dom
codeBlocks.forEach((pre) => {
  //button icon
  const use = document.createElementNS("http://www.w3.org/2000/svg", "use")
  use.setAttribute("href", "/copy.svg#empty")
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
  svg.classList.add("copy-svg")
  svg.appendChild(use)

  //create tooltip
  const tooltip = document.createElement("span")
  tooltip.classList.add("copy-tooltip")
  tooltip.textContent = "Copy"

  //create button
  const btn = document.createElement("button")
  btn.appendChild(svg)
  btn.appendChild(tooltip)
  btn.classList.add("copy-btn")
  btn.setAttribute("aria-label", "Copy code to clipboard")
  btn.addEventListener("click", (e) => copyCode(e))

  //create wrapper to hold pre and button
  const wrapper = document.createElement("div")
  wrapper.classList.add("code-block-wrapper")

  //wrap the pre element
  pre.parentNode.insertBefore(wrapper, pre)
  wrapper.appendChild(pre)
  wrapper.appendChild(btn)
})

/**
 * @param {MouseEvent} event
 */
function copyCode(event) {
  const btn = event.currentTarget
  const wrapper = btn.parentElement
  const pre = wrapper.querySelector("pre")
  const codeBlock = pre.querySelector("code")
  navigator.clipboard.writeText(codeBlock.innerText)

  const use = getChildByTagName(getChildByTagName(btn, "svg"), "use")
  const tooltip = btn.querySelector(".copy-tooltip")

  // Update icon and tooltip
  use.setAttribute("href", "/copy.svg#filled")
  btn.classList.add("copied")
  if (tooltip) {
    tooltip.textContent = "Copied!"
  }

  // Reset after delay
  setTimeout(() => {
    if (use) {
      use.setAttribute("href", "/copy.svg#empty")
    }
    btn.classList.remove("copied")
    if (tooltip) {
      tooltip.textContent = "Copy"
    }
  }, 1500)
}

function getChildByTagName(element, tagName) {
  return Array.from(element.children).find((child) => child.tagName === tagName)
}
