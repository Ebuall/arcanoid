import { VNode } from "@cycle/dom";

function setPosition(x: number, y: number) {
  return (v: VNode) => {
    const elm = (<HTMLElement>v.elm).style
    elm.left = x + 'px'
    elm.bottom = y + 'px'
  }
}

export function setPositionHook(x: number, y: number) {
  return {
    hook: {
      insert: setPosition(x, y),
      update: setPosition(x, y)
    }
  }
}

export function pretty(...args: any[]) {
  console.log(JSON.stringify(args, null, 2))
}

export function fix2(x: number): string {
  return Number.prototype.toFixed.call(x, 2)
}

