/**
 * Shared navigation utilities for active link management
 */

/**
 * Check if a link is active based on current pathname
 * @param {string} href - The link href to check
 * @returns {boolean} - Whether the link is active
 */
function isLinkActive(href) {
  const pathname = window.location.pathname
  const subpath = pathname.match(/[^/]+/g)
  return pathname === href || "/" + (subpath?.[0] || "") === href
}

/**
 * Update active state for header navigation
 */
function updateHeaderNav() {
  const navLinks = document.querySelectorAll("#header nav a")

  navLinks.forEach((link) => {
    const href = link.getAttribute("href")
    const isActive = isLinkActive(href)

    // Update aria-current for accessibility
    if (isActive) {
      link.setAttribute("aria-current", "page")
      link.classList.remove(
        "hover:bg-black/5",
        "hover:text-black",
        "dark:hover:bg-white/20",
        "dark:hover:text-white"
      )
      link.classList.add("bg-black", "text-white", "dark:bg-white", "dark:text-black")
    } else {
      link.removeAttribute("aria-current")
      link.classList.remove("bg-black", "text-white", "dark:bg-white", "dark:text-black")
      link.classList.add(
        "hover:bg-black/5",
        "hover:text-black",
        "dark:hover:bg-white/20",
        "dark:hover:text-white"
      )
    }
  })
}

/**
 * Update active state for drawer navigation
 */
function updateDrawerNav() {
  const navLinks = document.querySelectorAll("#drawer nav a")

  navLinks.forEach((link) => {
    const href = link.getAttribute("href")
    const isActive = isLinkActive(href)

    // Update aria-current for accessibility
    if (isActive) {
      link.setAttribute("aria-current", "page")
      link.classList.add(
        "pointer-events-none",
        "bg-black",
        "text-white",
        "dark:bg-white",
        "dark:text-black"
      )
    } else {
      link.removeAttribute("aria-current")
      link.classList.remove(
        "pointer-events-none",
        "bg-black",
        "text-white",
        "dark:bg-white",
        "dark:text-black"
      )
    }
  })
}

/**
 * Update all navigation active states
 */
function updateAllNav() {
  updateHeaderNav()
  updateDrawerNav()
}
