import { Stream } from "xstream";

export type Coord = number[]

export type BallState = {
  pos: Coord,
  dir: number,
  speed: number,
}

export type CollObj = {
  pos: Coord,
  dir: string,
  block?: Coord
}

export type BallSources = {
  pause?: Stream<boolean>,
  update?: Stream<Reducer<BallState>>,
  keys?: (s: string, event?: string) => Stream<Event>,
  collisions: Stream<CollObj>,
  props: BallState
}

export type BlockSources = {
  collisions: Stream<CollObj>,
  reset: Stream<any>
}

export type Blocks = Coord[][]

export type MainState = {
  ball: BallState,
  blocks: number[][][],
  mouse: Coord,
  pause: boolean
}

export type Reducer<T> = (obj: T) => T

export type DOMKeys = (s: string, event?: string) => Stream<Event>
