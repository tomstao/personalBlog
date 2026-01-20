import type { CollectionEntry } from "astro:content"
import FilterableList from "@components/FilterableList"

type Props = {
  tags: string[]
  data: CollectionEntry<"blog">[]
}

export default function Blog(props: Props) {
  return <FilterableList data={props.data} tags={props.tags} collection="blog" />
}
