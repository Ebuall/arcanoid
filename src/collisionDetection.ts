import * as R from 'ramda'
import { Coord, MainState, CollObj, CollTarget } from "./interfaces"

const blockHeight = 20
const blockWidth = 33.33
const ballRadius = 10

const offset = (v: number) => Math.abs(v - 240)
const borderColl = (x: number, y: number) => {
  let dir
  if (x > 480) dir = 'right'
  if (x < 0) dir = 'left'
  if (dir && offset(x) > offset(y)) return dir
  if (y > 480) dir = 'top'
  if (y < 0) dir = 'bottom'
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

const findAngle = ([x1, y1]: Coord, [x2, y2]: Coord) => {
  const [cx1, cy1] = findCenter([x1, y1], ballRadius)
  const cx2 = x2 + blockWidth / 2
  const cy2 = y2 + blockHeight / 2

  if (y2 < cy1 && cy1 < y2 + blockHeight) {
    if (cx1 < cx2)
      return 'right'
    else if (cx1 > cx2)
      return 'left'
  } else if (cy1 > y2 + blockHeight)
    return 'bottom'
  return 'top'
}

const findPaddleColl =
  ([x, _]: Coord, paddleX: number, width: number): number => {
    const cx = x + ballRadius
    const hw = width / 2
    const center = paddleX + hw
    return Math.abs(center - cx) < hw + 5 ? paddleX : null
  }

function findCollisions({ ball, blocks, player }: MainState): CollObj {
  let target: CollTarget
  let targetPos: number | Coord
  let dir = borderColl(ball.pos[0], ball.pos[1])
  if (dir == 'bottom') {
    if ((targetPos = findPaddleColl(ball.pos, player.pos, player.width)) !== null)
      target = 'paddle'
    else
      target = 'ground'
  } else if (dir !== undefined)
    target = 'wall'
  else {
    if (targetPos = findBlockColl(ball.pos, blocks)) {
      dir = findAngle(ball.pos, targetPos)
      target = 'block'
    }
  }
  return target ? { pos: ball.pos, dir, target, targetPos } : null
}

export default findCollisions
