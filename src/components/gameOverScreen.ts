import { Stream } from "xstream"
import { div, h1, p } from "@cycle/dom"
import { style } from "typestyle"

const className = style({
  textAlign: 'center',
  padding: '90px 100px',
  width: '300px'
})

function view($: Stream<any>) {
  return $.mapTo(div('.' + className, [
    h1('Game Over'),
    p('Press ESC to start a new game')
  ]))
}

export default view
