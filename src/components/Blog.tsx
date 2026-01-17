import type { CollectionEntry } from "astro:content"
import FilterableList from "@components/FilterableList"

type Props = {
  tags: string[]
  data: CollectionEntry<"blog">[]
}

export default function Blog({ data, tags }: Props) {
  return <FilterableList data={data} tags={tags} collection="blog" />
}
