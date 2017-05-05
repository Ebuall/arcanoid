import xs, { Stream } from 'xstream'
import * as R from 'ramda'
import { style } from 'typestyle'
import { div, VNode } from '@cycle/dom'
import { DOMKeys } from "../interfaces"
import { updateState } from "../helpers"

type PlayerSources = {
  keys: DOMKeys,
  reset: Stream<any>
}

interface PlayerState {
  lifes?: number,
  pos: number,
  width?: number
}

type Fn = (n: number) => number

const initialState = {
  lives: 3,
  pos: 200,
  width: 100
}

const playerStyle = style({
  backgroundColor: 'green',
  bottom: -10,
  height: '11px',
  position: 'absolute',
  zIndex: 2
})

const setPositionAndWidth = (x: number, width: number) => (v: VNode) => {
  const elm = (<HTMLElement>v.elm).style
  elm.left = x + 'px'
  elm.width = width + 'px'
}
const insertUpdateHook = (fn: (v: VNode) => void) => ({
  hook: { insert: fn, update: fn }
})

function view(state$: Stream<PlayerState>) {
  return state$.map((({ pos, width }) =>
    div('.' + playerStyle,
      insertUpdateHook(setPositionAndWidth(pos, width)))
  ))
}

const subtract = (x: number) => (y: number) => y - x
const bounded = (fn: Fn, width: number) => (x: number) => {
  const value = fn(x)
  if (value > 500 - width || value < 0) return x
  return value
}
// const move = (fn: Fn) => R.over(R.lensProp('pos'), bounded(fn))
const move = (fn: Fn) => (state: PlayerState) =>
  R.over(R.lensProp('pos'), bounded(fn, state.width), state)

function player(sources: PlayerSources) {
  const moveKey = (key: string, moveFn: Fn) => {
    const keyDown = sources.keys(key, 'keydown')
      .mapTo(xs.periodic(20)
        .mapTo(move(moveFn)))

    const keyUp = sources.keys(key, 'keyup')
      .mapTo(xs.empty())

    return xs.merge(keyDown, keyUp).flatten()
  }

  const left = moveKey('ArrowLeft', subtract(5))
  const right = moveKey('ArrowRight', R.add(5))

  const state$ = xs.merge(left, right)
    .fold<PlayerState>(updateState, initialState)

  const vtree$ = view(state$)
  return {
    DOM: vtree$,
    state: state$
  }
}

export default player
