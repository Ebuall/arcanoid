import { VNode } from "@cycle/dom"
import { Reducer } from "./interfaces"
import { Stream } from "xstream"
import sampleCombine from 'xstream/extra/sampleCombine'


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

export function updateState<T>(state: T, fn: Reducer<T>): T {
  return fn(state)
}


export const when = (bool$: Stream<boolean>) =>
  <T>(v$: Stream<T>): Stream<T> =>
    v$.compose(sampleCombine(bool$))
      .filter(([v, b]) => b)
      .map(([v, b]) => v)

export function printLivesFromVNode(o: any) {
    try {
      console.log(
        JSON.parse(o.children[3]
          .children[0].text)
          .player.lives)
    }
    catch (e) { }
  }
  