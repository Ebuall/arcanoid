import xs, { Stream } from 'xstream'
import delay from 'xstream/extra/delay'
import { div, VNode } from '@cycle/dom'
import { style } from 'typestyle'
import { Coord, BallSources, BallState, Reducer } from '../interfaces'
import * as R from 'ramda'

function view([x, y]: Coord) {
  const className = style({
    background: 'red',
    borderRadius: '50%',
    height: '20px',
    position: 'relative',
    width: '20px',
  })
  return div('.' + className, {
    hook: {
      update: (v: VNode) => {
        const elem = v.elm as HTMLElement
        elem.style.bottom = y + 'px'
        elem.style.left = x + 'px'
      }
    }
  })
}

function ball(sources: BallSources) {
  function move(state: BallState): BallState {
    const newPos: Coord = [
      state.pos[0] + state.speed * Math.cos(state.dir),
      state.pos[1] + state.speed * Math.sin(state.dir)
    ]
    return R.assoc('pos', newPos, state)
  }
  const move$ = xs.periodic(33).mapTo(move)

  const rotate$ = sources.collision
    .debug(R.compose(console.log, R.prop('pos')))
    // .debug(_ => { debugger; })
    .map(({ dir }) => {
      if (dir == 'top' || dir == 'bottom')
        return R.over(R.lensProp('dir'), R.negate)
      else
        return R.over(R.lensProp('dir'), R.subtract(Math.PI))  
    })

  const state$ = xs.merge(move$, rotate$)
    .fold((state, reducer: Reducer<BallState>) => reducer(state), sources.props)

  const vtree$ = state$.map(({ pos }) => view(pos))

  return {
    DOM: vtree$,
    state: state$
  }
}

export default ball
