import { Stream } from "xstream";

export type Coord = number[]

export type BallState = {
  pos: Coord,
  dir: number,
  speed: number,
}

export type BallSources = {
  pause?: Stream<boolean>,
  reset?: Stream<any>,
  keys?: (s: string, event?: string) => Stream<Event>,
  collisions: Stream<CollObj>,
  props: BallState
}

export type CollTarget = 'block' | 'ground' | 'paddle' | 'wall'
export interface CollObj {
  pos: Coord,
  dir: string,
  target: CollTarget
  targetPos?: Coord | number
}

export type BlockSources = {
  collisions: Stream<CollObj>,
  reset: Stream<any>
}

export type Blocks = Coord[][]

export type PlayerSources = {
  keys: DOMKeys,
  pause: Stream<boolean>,
  softReset: Stream<any>,
  hardReset: Stream<any>,  
}

export type PlayerState = {
  lifes?: number,
  pos: number,
  width?: number
}

export type MainState = {
  ball: BallState,
  blocks: number[][][],
  player: PlayerState,
  mouse: Coord,
  pause: boolean
}

export type Reducer<T> = (obj: T) => T

export type DOMKeys = (s: string, event?: string) => Stream<Event>
