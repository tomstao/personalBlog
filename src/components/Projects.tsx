import type { CollectionEntry } from "astro:content"
import FilterableList from "@components/FilterableList"

type Props = {
  tags: string[]
  data: CollectionEntry<"projects">[]
}

export default function Projects({ data, tags }: Props) {
  return <FilterableList data={data} tags={tags} collection="projects" />
}
