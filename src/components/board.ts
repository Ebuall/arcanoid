import { div, VNode } from '@cycle/dom'
import { style } from 'typestyle'

const boardClass = style({
  border: '5px solid black',
  height: 500 + 'px',
  position: 'relative',
  width: 500 + 'px',
})

function board(children: VNode | VNode[]) {
  return div('.' + boardClass, children)
}

export default board
