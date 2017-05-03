import xs, { Stream } from 'xstream'
import delay from 'xstream/extra/delay'
import { div, VNode } from '@cycle/dom'
import { style } from 'typestyle'
import { Coord, BallSources, BallState, Reducer } from '../interfaces'
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

function ball(sources: BallSources) {
  function move(state: BallState): BallState {
    const newPos: Coord = [
      state.pos[0] + state.speed * Math.cos(state.dir),
      state.pos[1] + state.speed * Math.sin(state.dir)
    ]
    return R.assoc('pos', newPos, state)
  }
  const move$ = sources.pause
    .map(b => b
      ? xs.never()
      : xs.periodic(33).mapTo(move))
    .flatten()

  const rotate$ = sources.collision
    .map(({ dir }) => {
      if (dir == 'top' || dir == 'bottom')
        return R.over(R.lensProp('dir'), R.negate)
      else if (dir == 'right')
        return R.over(R.lensProp('dir'), R.subtract(Math.PI))
      else
        return R.over(R.lensProp('dir'), R.subtract(-Math.PI))
    })

  const state$ = xs.merge(move$, rotate$, sources.update)
    .fold((state, reducer: Reducer<BallState>) => reducer(state), sources.props)

  const vtree$ = state$.map(({ pos }) => view(pos))

  return {
    DOM: vtree$,
    state: state$
  }
}

export default ball
