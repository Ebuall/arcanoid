import { Stream } from "xstream";

export type Coord = number[]

export type BallState = {
  pos: Coord,
  dir: number,
  speed: number,
}

export type CollObj = {
  pos: Coord,
  dir: string
}

export type BallSources = {
  pause: Stream<boolean>
  collision: Stream<CollObj>,
  props: BallState
}

export type MainState = {
  ball: BallState,
  blocks: number[][][]
}

export type Reducer<T> = (obj: T) => T
