import type { CollectionEntry } from "astro:content"
import FilterableList from "@components/FilterableList"

type Props = {
  tags: string[]
  data: CollectionEntry<"projects">[]
}

export default function Projects(props: Props) {
  return <FilterableList data={props.data} tags={props.tags} collection="projects" />
}
