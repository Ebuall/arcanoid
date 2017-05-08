import { pre } from "@cycle/dom"
import { Stream } from "xstream"
import { style } from "typestyle"
import * as R from "ramda"
import { fix2 } from "../helpers"
import { MainState } from "../interfaces";

const offset = style({
  marginLeft: '550px'
})

const dirInPi = R.over(R.lensProp('dir'), R.compose(
  R.flip(R.concat)('π'),
  fix2,
  R.flip(R.divide)(Math.PI)
))
const map3 = R.compose(R.map, R.map, R.map)

function debugView(state$: Stream<MainState>) {
  const printedState$ = state$
    .map(R.evolve<MainState>({
      ball: dirInPi,
      // blocks: map3(Math.round)
    }))

  return printedState$.map(state =>
    pre('.' + offset,
      [JSON.stringify(R.omit('blocks', state), null, 2),
        //   'ball: ',
        //   JSON.stringify(state.ball, null, 2),
        // '\nblocks:\n',
        // state.blocks.map(R.unary(JSON.stringify)).join('\n'),
        //   '\nmouse: ',
        //   JSON.stringify(state.mouse),
        //   state.pause ? '\nPAUSED' : '',
        '\n----------------------------------',
        '\nKeys: ',
        '\n  Escape  reset',
        '\n  Space   start/pause',
        '\n  A/S     speed++/--',
      ])
  )
}

export default debugView
