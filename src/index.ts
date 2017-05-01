import xs, { Stream } from 'xstream'
import debounce from 'xstream/extra/debounce'
import dropRepeats from 'xstream/extra/dropRepeats'
import run from '@cycle/run'
import { makeDOMDriver, div, VNode, DOMSource } from '@cycle/dom'
import * as R from 'ramda'
import { style } from 'typestyle'
import ball from './components/ball'
import { Coord, BallState, CollObj } from './interfaces'

function board() {
  const className = style({
    border: '5px solid black',
    height: 500 + 'px',
    width: 500 + 'px',
  })
  return div('.' + className)
}

function main(sources: { DOM: DOMSource, state: Stream<BallState> }) {
  const ballProps = {
    pos: [263, 493] as Coord,
    dir: Math.PI/4,
    speed: 5
  }
  const collision$ = sources.state.map<CollObj>(state => {
    if (state.pos[0] > 494)
      return { pos: /*R.update(0, 500, state.pos)*/ state.pos, dir: 'right' }
    if (state.pos[0] < 12)
      return { pos: /* R.update(0, 0, state.pos), */ state.pos, dir: 'left' }
    if (state.pos[1] > 494)
      return { pos: /* R.update(1, 500, state.pos),*/ state.pos, dir: 'bottom' }
    if (state.pos[1] < 12)
      return { pos: /* R.update(1, 0, state.pos) */ state.pos, dir: 'top' }
  }).filter(_ => !!_)
    .compose(dropRepeats(R.eqProps('dir')))

  const ballSink$ = ball({
    collision: collision$,
    props: ballProps
  })
  const ball$ = ballSink$.DOM
  const board$ = xs.of(board())
  const vtree$ = xs.combine(board$, ball$).map(div)
  return {
    DOM: vtree$,
    state: ballSink$.state
  }
}

run(main, {
  DOM: makeDOMDriver('#app'),
  state: R.identity
})
