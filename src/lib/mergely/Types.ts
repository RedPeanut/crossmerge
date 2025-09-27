export type Change = {
  'lhs-line-to' ?: number,
  'lhs-line-from' ?: number,
  'rhs-line-from' ?: number,
  'rhs-line-to' ?: number,
  'op' ?: string,
  'lhs-y-start' ?: number,
  'lhs-y-end' ?: number,
  'rhs-y-start' ?: number,
  'rhs-y-end' ?: number,
}

export type Side = 'lhs' | 'rhs';

export interface Viewport {
  from: number;
  to: number;
}

export type Direction = 'next' | 'prev';

export interface Colors {
  current: {
    border: string
  },
  a: {
    border: string,
    bg: string,
    fg: string,
    ch: string,
    in: string
  },
  d: {
    border: string,
    bg: string,
    fg: string,
    ch: string,
    in: string
  },
  c: {
    border: string,
    bg: string,
    fg: string,
  }
}