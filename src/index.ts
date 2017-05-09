import xs, { Stream } from 'xstream'
import dropRepeats from 'xstream/extra/dropRepeats'
import throttle from 'xstream/extra/throttle'
import debounce from 'xstream/extra/debounce'
import run from '@cycle/run'
import { makeDOMDriver, DOMSource, div, VNode } from '@cycle/dom'
import * as R from 'ramda'
import ball from './components/ball'
import blocks from './components/blocks'
import debugView from "./components/debug"
import board from './components/board'
import player from './components/player'
import gameOverScreen from './components/gameOverScreen'
import findCollisions from './collisionDetection'
import { MainState } from './interfaces'
import { updateState, when, printLivesFromVNode } from "./helpers"

const DEBUG = true
const ballProps = {
  pos: [240, 0],
  dir: Math.PI / 4,
  speed: 2
}
const zeroBlocks = R.compose(
  R.equals(0),
  R.prop('length'),
  R.flatten,
  R.prop('blocks'))
const gameOverCondition = R.cond([
  [R.pathEq(['player', 'lives'], 0), R.T],
  [zeroBlocks, R.T],
  [R.T, R.F]
]);
(<any>window).goc = gameOverCondition
// const st = {player: {lives: 0}, blocks: [[],[],[],[]]}

function main(sources: { DOM: DOMSource, state: Stream<MainState> }) {
  const gameOver$ = sources.state
    .map(gameOverCondition)
    .compose(dropRepeats())
    .startWith(false)
  const whenGameIsNotOver = when(gameOver$.map(R.not))

  const keys = (key: string, event = 'keypress') =>
    sources.DOM.select('document').events(event)
      .filter(R.propEq('code', key))
      .compose(whenGameIsNotOver)

  const space$ = keys('Space')
  const resumeKey$ = sources.DOM.select('document').events('keyup')
    .filter(R.propSatisfies(p => p == 'Escape' || p == 'Space', 'code'))
    .compose(when(gameOver$))
  const hardReset$ = xs.merge(keys('Escape', 'keyup'), resumeKey$)
  const mouse$ = sources.DOM.select('document').events('mousemove')
    .map((ev: MouseEvent) => [ev.clientX - 13, 513 - ev.clientY])
    .startWith([0, 0])

  const collision$ = sources.state
    .map(findCollisions)
    .filter(_ => !!_)
    .compose(dropRepeats(R.eqProps('dir')))
  // .debug(R.compose(console.log, R.join(' \t'), R.reverse,
  //   R.values, R.omit(['pos', 'targetPos'])))

  const softReset$ = collision$.filter(c => c.target == 'ground')
  const reset$ = xs.merge(hardReset$, softReset$)
  const pause$ = xs.merge(
    space$.mapTo(R.not),
    reset$.mapTo(R.T)
  ).fold<boolean>(updateState, true)

  const ballSinks = ball({
    pause: pause$,
    reset: reset$,
    keys,
    collisions: collision$,
    props: ballProps
  })

  const blockSinks = blocks({
    collisions: collision$.filter(c => c.target == 'block'),
    reset: hardReset$.startWith(null),
  })

  const playerSinks = player({
    keys,
    pause: pause$,
    softReset: softReset$,
    hardReset: hardReset$
  })

  const init$ = xs.merge(
    reset$.mapTo(R.T),
    pause$.filter(R.not).mapTo(R.F)
  ).fold<boolean>(updateState, true)

  const state$ = xs.combine(
    ballSinks.state,
    blockSinks.state,
    playerSinks.state,
    mouse$,
    pause$,
    init$
  ).map(R.zipObj([
    'ball',
    'blocks',
    'player',
    'mouse',
    'pause',
    'init'])) as Stream<MainState>

  const debug$ = debugView(state$)

  const frames = xs.combine(
    ballSinks.DOM,
    blockSinks.DOM,
    playerSinks.DOM,
    debug$
  ).map(board)

  const importantFrames = xs.merge(
    hardReset$,
    pause$.compose(whenGameIsNotOver)
  )
    .mapTo(frames.take(12 /* wtf, needs fix */))
    //      debounce doesn't help, not sure why
    .flatten()

  const vtree$ = xs.merge(
    gameOverScreen(gameOver$.filter(l => l)),
    importantFrames,
    frames.compose(throttle(16))
  )

  return {
    DOM: vtree$,
    state: state$,
  }
}

run(main, {
  DOM: makeDOMDriver('#app'),
  state: R.identity,
})
