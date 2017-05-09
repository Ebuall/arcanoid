import xs, { Stream } from 'xstream'
import * as R from 'ramda'
import { style } from 'typestyle'
import { div, VNode } from '@cycle/dom'
import { updateState } from "../helpers"
import { PlayerState, PlayerSources, Reducer } from "../interfaces"

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
const move = (fn: Fn) => (state: PlayerState) =>
  R.over(R.lensProp('pos'),
    R.compose(R.clamp(0, 500 - state.width), fn),
    state)

function player(sources: PlayerSources) {
  const moveKey = (key: string, moveFn: Fn) => {
    const keyDown = sources.keys(key, 'keydown')
      .mapTo(xs.periodic(20)
        .mapTo(move(moveFn)))

    const keyUp = sources.keys(key, 'keyup')
      .mapTo(xs.empty())

    return xs.merge(keyDown, keyUp)
      .flatten() as Stream<Reducer<PlayerState>>
  }

  const left = moveKey('ArrowLeft', subtract(7))
  const right = moveKey('ArrowRight', R.add(7))
  const softReset$ = sources.softReset
    .mapTo(R.evolve({
      pos: R.always(initialState.pos),
      lives: R.dec
    }))
  const hardReset$ = sources.hardReset
    .mapTo(R.always(initialState))

  const state$ = xs.merge(left, right, softReset$, hardReset$)
    .fold<PlayerState>(updateState, initialState)

  const vtree$ = view(state$)
  return {
    DOM: vtree$,
    state: state$
  }
}

export default player
