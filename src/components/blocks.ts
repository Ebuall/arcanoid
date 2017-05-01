import xs from 'xstream'
import { div, VNode } from '@cycle/dom'
import { style } from 'typestyle'
import * as R from 'ramda'
import { Coord } from "../interfaces"
import { setPosition } from "../helpers"

const boardHeight = 500
const blockHeight = 20
const blockWidth = 33.33

function view(blocks: Coord[]) {
  const blockStyle = style({
    backgroundColor: '#0af',
    border: '1px solid black',
    boxSizing: 'border-box',
    height: blockHeight + 'px',
    position: 'absolute',
    width: blockWidth + 'px'
  })
  function block(pos: Coord) {
    return div('.' + blockStyle, {
      hook: { insert: setPosition(pos[0], pos[1]) }
    })
  }
  return div(blocks.map(block))
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

function blocks() {
  const state = generateBlocks()
  const state$ = xs.of(state)


  const vtree = div(generateBlocks().map(view))

  const vtree$ = state$.map(state => div(state.map(view)))
  return {
    DOM: vtree$,
    state: state$
  }
}

export default blocks
