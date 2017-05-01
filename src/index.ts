import xs, { Stream } from 'xstream'
import debounce from 'xstream/extra/debounce'
import dropRepeats from 'xstream/extra/dropRepeats'
import run from '@cycle/run'
import { makeDOMDriver, div, VNode, DOMSource } from '@cycle/dom'
import * as R from 'ramda'
import { style } from 'typestyle'
import ball from './components/ball'
import { Coord, BallState, CollObj } from './interfaces'

const boardStyle = style({
  border: '5px solid black',
  height: 500 + 'px',
  width: 500 + 'px',
})

const dy = -480

function main(sources: { DOM: DOMSource, state: Stream<BallState> }) {
  const ballProps = {
    pos: [240, dy] as Coord,
    dir: Math.PI / 4,
    speed: 5
  }
  const collision$ = sources.state.map<CollObj>(state => {
    if (state.pos[0] > 480)
      return { pos: /*R.update(0, 500, state.pos)*/ state.pos, dir: 'right' }
    if (state.pos[0] < 0)
      return { pos: /* R.update(0, 0, state.pos), */ state.pos, dir: 'left' }
    if (state.pos[1] > 480 + dy)
      return { pos: /* R.update(1, 500, state.pos),*/ state.pos, dir: 'top' }
    if (state.pos[1] < 0 + dy)
      return { pos: /* R.update(1, 0, state.pos) */ state.pos, dir: 'bottom' }
  }).filter(_ => !!_)
    .compose(dropRepeats(R.eqProps('dir')))

  const ballSink$ = ball({
    collision: collision$,
    props: ballProps
  })
  const ball$ = ballSink$.DOM
  const vtree$ = xs.combine(ball$).map(div.bind(null, '.' + boardStyle))
  return {
    DOM: vtree$,
    state: ballSink$.state
  }
}

run(main, {
  DOM: makeDOMDriver('#app'),
  state: R.identity
})
