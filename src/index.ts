import xs, { Stream } from 'xstream'
import debounce from 'xstream/extra/debounce'
import dropRepeats from 'xstream/extra/dropRepeats'
import run from '@cycle/run'
import { makeDOMDriver, div, VNode, DOMSource } from '@cycle/dom'
import * as R from 'ramda'
import { style } from 'typestyle'
import ball from './components/ball'
import blocks from './components/blocks'
import { Coord, BallState, CollObj } from './interfaces'
import debugView from "./components/debug";

const boardStyle = style({
  border: '5px solid black',
  height: 500 + 'px',
  position: 'relative',
  width: 500 + 'px',
})

const dy = 0

function main(sources: { DOM: DOMSource, state: Stream<{ ball: BallState }> }) {
  const ballProps = {
    pos: [240, dy],
    dir: Math.PI / 4,
    speed: 5
  }
  const collision$ = sources.state.map<CollObj>(({ ball }) => {
    let dir
    if (ball.pos[0] > 480)
      dir = 'right'
    if (ball.pos[0] < 0)
      dir = 'left'
    if (ball.pos[1] > 480 + dy)
      dir = 'top'
    if (ball.pos[1] < 0 + dy)
      dir = 'bottom'

    return dir ? { pos: ball.pos, dir } : null
  }).filter(_ => !!_)
    .compose(dropRepeats(R.eqProps('dir')))

  const ballSink$ = ball({
    collision: collision$,
    props: ballProps
  })
  const ball$ = ballSink$.DOM

  const blocksSink$ = blocks()
  const block$ = blocksSink$.DOM

  const state$ = xs.combine(ballSink$.state, blocksSink$.state)
    .map(([ball, blocks]) => ({ ball, blocks }))

  const dirInPi = R.over(R.lensProp('dir'),
    R.compose(R.flip(R.concat)('π'), String, R.flip(R.divide)(Math.PI)))
  const printedState$ = state$ //.map(R.omit('blocks'))
    .map(R.evolve({ ball: dirInPi, blocks: R.map(R.map(R.map(Math.round))) }))

  const debug$ = debugView(printedState$)

  const vtree$ = xs.combine(ball$, block$, debug$).map(div.bind(null, '.' + boardStyle))
  return {
    DOM: vtree$,
    state: state$
  }
}

run(main, {
  DOM: makeDOMDriver('#app'),
  state: R.identity
})
