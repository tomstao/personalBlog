import { mergeProps } from "solid-js"

type Props = {
  direction?: "left" | "right"
  size?: number
  class?: string
}

export default function AnimatedArrow(_props: Props) {
  const props = mergeProps({ direction: "right", size: 20 }, _props)
  const isLeft = props.direction === "left"

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size}
      height={props.size}
      viewBox="0 0 24 24"
      fill="none"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      class={`stroke-current group-hover:stroke-black group-hover:dark:stroke-white ${isLeft ? "rotate-180" : ""} ${props.class || ""}`}
    >
      <line
        x1="5"
        y1="12"
        x2="19"
        y2="12"
        class="translate-x-4 scale-x-0 transition-all duration-300 ease-in-out group-hover:translate-x-1 group-hover:scale-x-100"
      />
      <polyline
        points="12 5 19 12 12 19"
        class="translate-x-0 transition-all duration-300 ease-in-out group-hover:translate-x-1"
      />
    </svg>
  )
}
