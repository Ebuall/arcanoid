import xs, { Stream } from 'xstream'
import { div, VNode } from '@cycle/dom'
import { style } from 'typestyle'
import * as R from 'ramda'
import { Coord, BlockSources, Reducer, Blocks } from "../interfaces"
import { setPositionHook } from "../helpers"

const boardHeight = 500
const blockHeight = 20
const blockWidth = 33.33

function view(blocks$: Stream<Blocks>) {
  const blockStyle = style({
    backgroundColor: '#0af',
    border: '1px solid black',
    boxSizing: 'border-box',
    height: blockHeight + 'px',
    position: 'absolute',
    width: blockWidth + 'px'
  })
  function block([x, y]: Coord) {
    return div('.' + blockStyle, setPositionHook(x, y))
  }
  return blocks$.map(state => div(R.unnest(state).map(block)))
}

function generateBlocks(
  countX = 15,
  countY = 7,
  height = blockHeight,
  width = blockWidth
) {
  function genLine(posY: number): number[][] {
    return R.zip(R.range(0, countX).map(R.multiply(width)),
      R.repeat(posY, countX))
  }
  return R.range(1, countY + 1)
    .map(R.compose(R.subtract(boardHeight), R.multiply(height)))
    .map(genLine)
}

function blocks(sources: BlockSources) {
  const destroy$ = sources.collisions
    // .debug(R.compose(console.log, R.prop('dir')))
    .map(R.prop('targetPos'))
    .map(R.compose(R.map, R.compose(R.reject, R.equals)))

  const reset$ = sources.reset.mapTo(R.nAry(0, generateBlocks))

  const state$ = xs.merge(destroy$, reset$)
    .fold((state: Blocks, reducer: Reducer<Blocks>) => reducer(state), [])

  const vtree$ = view(state$)
  return {
    DOM: vtree$,
    state: state$
  }
}

export default blocks
