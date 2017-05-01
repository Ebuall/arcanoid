import { VNode } from "@cycle/dom";

export function setPosition(x: number, y: number) {
  return (v: VNode) => {
    const elm = (<HTMLElement>v.elm).style
    elm.left = x + 'px'
    elm.bottom = y + 'px'
  }
}

export function pretty(...args: any[]) {
  console.log(JSON.stringify(args, null, 2))
}
