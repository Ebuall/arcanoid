import { div, VNode } from '@cycle/dom'
import { style } from 'typestyle'

const boardClass = style({
  border: '5px solid black',
  borderBottom: 'none',
  height: 500 + 'px',
  position: 'relative',
  width: 500 + 'px',
  $nest: {
    '&:after': {
      border: '5px solid black',
      borderTop: 'none',
      bottom: '-14px',
      boxSizing: 'content-box',
      content: '"yobtvoyu maaat"',
      display: 'block',
      height: '10px',
      left: '-4.8px',
      position: 'absolute',
      width: '500px',
    }
  }
})

function board(children: VNode | VNode[]) {
  return div('.' + boardClass, children)
}

export default board
