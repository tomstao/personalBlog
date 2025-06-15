import type { Site, Page, Links, Socials } from "@types"

// Global
export const SITE: Site = {
  TITLE: "Tao Su's Blog",
  DESCRIPTION: "Welcome to my blog, This blog is where I share my projects, school-life lessons, and random thoughts on tech, learning, and more. Stick around",
  AUTHOR: "Tao Su",
}

// Work Page
export const WORK: Page = {
  TITLE: "Work",
  DESCRIPTION: "Places I have worked.",
}

// Blog Page
export const BLOG: Page = {
  TITLE: "Blog",
  DESCRIPTION: "Writing on topics I am passionate about.",
}

// Projects Page 
export const PROJECTS: Page = {
  TITLE: "Projects",
  DESCRIPTION: "Recent projects I have worked on.",
}

// Search Page
export const SEARCH: Page = {
  TITLE: "Search",
  DESCRIPTION: "Search all posts and projects by keyword.",
}

// Links
export const LINKS: Links = [
  { 
    TEXT: "Home", 
    HREF: "/", 
  },
  { 
    TEXT: "Work", 
    HREF: "/work", 
  },
  { 
    TEXT: "Blog", 
    HREF: "/blog", 
  },
  { 
    TEXT: "Projects", 
    HREF: "/projects", 
  },
]

// Socials
export const SOCIALS: Socials = [
  { 
    NAME: "Email",
    ICON: "email", 
    TEXT: "taosu96@gmail.com",
    HREF: "mailto:taosu96@gmail.com",
  },
  { 
    NAME: "Github",
    ICON: "github",
    TEXT: "Tao Su",
    HREF: "https://github.com/tomstao"
  },
  { 
    NAME: "LinkedIn",
    ICON: "linkedin",
    TEXT: "Tao Su",
    HREF: "https://www.linkedin.com/in/tao-su/",
  },
  { 
    NAME: "Twitter",
    ICON: "twitter-x",
    TEXT: "Tao Su",
    HREF: "https://x.com/su_tao9637",
  },
]

