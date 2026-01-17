function goBackToTop(event) {
  event.preventDefault()
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  })
}

function handleBackToTopScroll() {
  const backToTop = document.getElementById("back-to-top")
  if (!backToTop) return

  if (window.scrollY > 300) {
    backToTop.classList.remove("opacity-0", "pointer-events-none", "translate-y-4")
    backToTop.classList.add("opacity-100", "pointer-events-auto", "translate-y-0")
  } else {
    backToTop.classList.add("opacity-0", "pointer-events-none", "translate-y-4")
    backToTop.classList.remove("opacity-100", "pointer-events-auto", "translate-y-0")
  }
}

function initializeBackToTop() {
  const backToTop = document.getElementById("back-to-top")
  if (!backToTop) return

  backToTop.addEventListener("click", goBackToTop)
  handleBackToTopScroll()
}

window.addEventListener("scroll", handleBackToTopScroll)
document.addEventListener("DOMContentLoaded", initializeBackToTop)
document.addEventListener("astro:after-swap", initializeBackToTop)
