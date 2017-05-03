import { pre, div } from "@cycle/dom"
import { Stream } from "xstream"
import { style } from "typestyle"

const offset = style({
  marginLeft: '550px'
})

export default function debugView(state$: Stream<any>) {
  return state$.map(state =>
    pre('.' + offset, [
      'ball: ',
      JSON.stringify(state.ball, null, 2),
      '\nblocks:\n',
      state.blocks.map(JSON.stringify).join('\n'),
      '\nmouse: ',
      JSON.stringify(state.mouse),
      state.pause ? '\nPAUSED' : '',
      '\n----------------------------------',
      '\nKeys: ',
      '\n  Escape  reset',
      '\n  Space   start/pause',
      '\n  A/S     speed++/--',
    ])
  )
}
