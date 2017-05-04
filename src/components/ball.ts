import xs, { Stream } from 'xstream'
import delay from 'xstream/extra/delay'
import { div, VNode } from '@cycle/dom'
import { style } from 'typestyle'
import { Coord, BallSources, BallState, Reducer, CollObj } from '../interfaces'
import * as R from 'ramda'
import { setPositionHook } from "../helpers"

function view([x, y]: Coord) {
  const className = style({
    background: 'red',
    borderRadius: '50%',
    height: '20px',
    position: 'absolute',
    width: '20px',
    zIndex: 1,
  })
  return div('.' + className, setPositionHook(x, y))
}

const actions = {
  move: (state: BallState): BallState => {
    const newPos: Coord = [
      state.pos[0] + state.speed * Math.cos(state.dir),
      state.pos[1] + state.speed * Math.sin(state.dir)
    ]
    return R.assoc('pos', newPos, state)
  },
  rotate: ({ dir }: CollObj) => {
    let modifier
    if (dir == 'top' || dir == 'bottom')
      modifier = R.negate
    else if (dir == 'right')
      modifier = R.subtract(Math.PI)
    else
      modifier = R.subtract(-Math.PI)
    return R.over(R.lensProp('dir'), modifier) as Reducer<BallState>
  }
}

function ball(sources: BallSources) {
  const accelerate$ = sources.keys('KeyA')
    .mapTo(R.over(R.lensProp('speed'), R.inc))
  const slowDown$ = sources.keys('KeyS')
    .mapTo(R.over(R.lensProp('speed'), R.dec))
  const reset$ = sources.keys('Escape', 'keyup')
    .mapTo(R.merge(R.__, sources.props))

  const move$ = sources.pause
    .map(b => b
      ? xs.never()
      : xs.periodic(33).mapTo(actions.move))
    .flatten()

  const rotate$ = sources.collisions.map(actions.rotate)

  const state$ = xs.merge(
    move$,
    rotate$,
    accelerate$,
    slowDown$,
    reset$
  ).fold((state, reducer) => reducer(state), sources.props)

  const vtree$ = state$.map(({ pos }) => view(pos))

  return {
    DOM: vtree$,
    state: state$
  }
}

export default ball
