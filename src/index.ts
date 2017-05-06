import xs, { Stream } from 'xstream'
import dropRepeats from 'xstream/extra/dropRepeats'
import throttle from 'xstream/extra/throttle'
import run from '@cycle/run'
import { makeDOMDriver, DOMSource } from '@cycle/dom'
import * as R from 'ramda'
import ball from './components/ball'
import blocks from './components/blocks'
import debugView from "./components/debug"
import board from './components/board'
import player from './components/player'
import findCollisions from './collisionDetection'
import { MainState } from './interfaces'
import { updateState } from "./helpers"

const ballProps = {
  pos: [240, 0],
  dir: Math.PI / 4,
  speed: 1
}

function main(sources: { DOM: DOMSource, state: Stream<MainState> }) {
  const keys = (key: string, event = 'keypress') =>
    sources.DOM.select('document').events(event)
      .filter(R.propEq('code', key))

  const reset$ = keys('Escape', 'keyup')
  const pause$ = xs.merge(
    keys('Space').mapTo(R.not),
    reset$.mapTo(R.T)
  ).fold<boolean>(updateState, true)

  const mouse$ = sources.DOM.select('document').events('mousemove')
    .map((ev: MouseEvent) => [ev.clientX - 13, 513 - ev.clientY])
    .startWith([0, 0])

  const collision$ = sources.state
    .map(findCollisions)
    .filter(_ => !!_)
    .compose(dropRepeats(R.eqProps('dir')))  // TODO: improve dropRepeats logic
    // .compose(throttle(100))
  
  const ballSinks = ball({
    pause: pause$,
    keys,
    collisions: collision$,
    props: ballProps
  })

  const blockSinks = blocks({
    collisions: collision$,
    reset: reset$.startWith(null),
  })

  const playerSinks = player({
    keys,
    reset: reset$
  })

  const state$ = xs.combine(
    ballSinks.state,
    blockSinks.state,
    playerSinks.state,
    mouse$,
    pause$
  ).map(R.zipObj(
    ['ball', 'blocks', 'player', 'mouse', 'pause'])) as Stream<MainState>

  const debug$ = debugView(state$)
  const vtree$ = xs.combine(
    ballSinks.DOM,
    blockSinks.DOM,
    playerSinks.DOM,
    debug$)
    .map(board)
    .compose(throttle(16))

  return {
    DOM: vtree$,
    state: state$,
  }
}

run(main, {
  DOM: makeDOMDriver('#app'),
  state: R.identity,
})
