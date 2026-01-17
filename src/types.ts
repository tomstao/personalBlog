import type { CollectionEntry } from "astro:content"

export type Page = {
  TITLE: string
  DESCRIPTION: string
}

export interface Site extends Page {
  AUTHOR: string
}

export type Links = {
  TEXT: string
  HREF: string
}[]

export type Socials = {
  NAME: string
  ICON: string
  TEXT: string
  HREF: string
}[]

// Searchable content types (blog and projects share common fields)
export type SearchableEntry = CollectionEntry<"blog"> | CollectionEntry<"projects">
