import xs, { Stream } from 'xstream'
import debounce from 'xstream/extra/debounce'
import dropRepeats from 'xstream/extra/dropRepeats'
import run from '@cycle/run'
import { makeDOMDriver, div, VNode, DOMSource } from '@cycle/dom'
import * as R from 'ramda'
import { style } from 'typestyle'
import ball from './components/ball'
import blocks from './components/blocks'
import { Coord, BallState, CollObj, MainState } from './interfaces'
import debugView from "./components/debug"

const boardClass = style({
  border: '5px solid black',
  height: 500 + 'px',
  position: 'relative',
  width: 500 + 'px',
})

const dy = 0
const blockHeight = 20
const blockWidth = 33.33
const ballRadius = 10

function main(sources: { DOM: DOMSource, state: Stream<MainState> }) {
  const ballProps = {
    pos: [240, dy],
    dir: Math.PI / 4,
    speed: 15
  }

  const mouse$ = sources.DOM.select('.' + boardClass).events('mousemove')
    .map((ev: MouseEvent) => [ev.clientX - 13, 513 - ev.clientY])
    .startWith([0, 0])

  const pause$ = sources.DOM.select('document').events('keypress')
    .filter(R.propEq('code', 'Space'))
    .fold(R.not, true)

  const reset$ = sources.DOM.select('document').events('keyup')
    .filter(R.propEq('code', 'Escape'))
    .startWith(null)

  const offset = (v: number) => Math.abs(v - 240)
  const borderColl = (x: number, y: number) => {
    let dir
    if (x > 480) dir = 'right'
    if (x < 0) dir = 'left'
    if (dir && offset(x) > offset(y)) return dir
    if (y > 480 + dy) dir = 'top'
    if (y < 0 + dy) dir = 'bottom'
    return dir
  }

  const sqr = (x: number) => x * x
  const distance = R.curry(([x1, y1]: Coord, [x2, y2]: Coord): number =>
    Math.sqrt(sqr(x1 - x2) + sqr(y1 - y2)))
  const findCenter = (ball: Coord, radius: number) => ball.map(R.add(radius))
  const ballColl = (ball: Coord, radius: number) => (target: Coord) =>
    distance(findCenter(ball, radius), target) < radius

  const blockColl = (ball: Coord) => ([x2, y2]: Coord) => {
    const hHeight = blockHeight / 2
    const hWidth = blockWidth / 2
    const ballC = findCenter(ball, ballRadius)
    const distX = Math.abs(ballC[0] - x2 - hWidth)
    const distY = Math.abs(ballC[1] - y2 - hHeight)

    if (distX > (hWidth + ballRadius)) return false
    if (distY > (hHeight + ballRadius)) return false
    if (distX <= hWidth) return true
    if (distY <= hHeight) return true

    const coll = R.xprod([x2, x2 + blockWidth], [y2, y2 + blockHeight])
      .filter(ballColl(ball, ballRadius))
    return !!coll.length
  }

  const findBlockColl = (ball: Coord, blocks: Coord[][]) =>
    R.findLast(R.identity, blocks.map(
      R.find(blockColl(ball)))) as Coord

  const fix2 = (x: number): string => Number.prototype.toFixed.call(x, 2)
  const findAngle = ([x1, y1]: Coord, [x2, y2]: Coord) => {
    const [cx1, cy1] = findCenter([x1, y2], ballRadius)
    const cx2 = x2 + blockWidth / 2
    const cy2 = y2 + blockHeight / 2
    
    if (y2 < y1 && y1 < y2 + blockHeight) {
      if (cx1 < cx2)
        return 'right'
      else if (cx1 > cx2)
        return 'left'
    } else if (cy1 > y2 + blockHeight)
      return 'bottom'
    return 'top'
  }

  const collision$ = sources.state.map<CollObj>(({ ball, blocks }) => {
    let dir = borderColl(ball.pos[0], ball.pos[1])
    const block = findBlockColl(ball.pos, blocks)
    if (!dir && block) {
      dir = findAngle(ball.pos, block)
    }
    return dir ? { pos: ball.pos, dir, block } : null
  }).filter(_ => !!_)
    .compose(dropRepeats(R.eqProps('dir')))
  // .debug(R.compose(console.log, R.map(R.compose(Number, fix2)), R.prop('pos')))
  // .debug(R.compose(console.log, R.prop('dir')))
  // .debug(_ => { debugger; })

  const destroy$ = collision$.filter(_ => !!_.block)
    .debug(R.compose(console.log, R.prop('dir')))
    .map(R.prop('block'))

  const ballSink$ = ball({
    pause: pause$,
    collision: collision$,
    props: ballProps
  })
  const ball$ = ballSink$.DOM

  const blocksSink$ = blocks({
    destroy: destroy$,
    reset: reset$,
  })

  const block$ = blocksSink$.DOM

  const state$ = xs.combine(
    ballSink$.state,
    blocksSink$.state,
    mouse$,
    pause$
  ).map(R.zipObj(['ball', 'blocks', 'mouse', 'pause']))

  const dirInPi = R.over(R.lensProp('dir'), R.compose(
    R.flip(R.concat)('π'),
    fix2,
    R.flip(R.divide)(Math.PI)
  ))
  const map3 = R.compose(R.map, R.map, R.map)
  const printedState$ = state$
    .map(R.evolve({ ball: dirInPi, blocks: map3(Math.round) }))

  const debug$ = debugView(printedState$)

  const vtree$ = xs.combine(ball$, block$, debug$)
    .map(div.bind(null, '.' + boardClass))
  return {
    DOM: vtree$,
    state: state$,
    // preventDefault: pause$
  }
}

run(main, {
  DOM: makeDOMDriver('#app'),
  state: R.identity,
  // preventDefault: ($: Stream<Event>) => $.map(ev => ev.preventDefault())
})
