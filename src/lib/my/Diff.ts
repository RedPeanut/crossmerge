import { negativeArray } from "./Util";

interface DiffOptions {
  ignorews?: boolean;
  ignoreaccents?: boolean;
  ignorecase?: boolean;
  split?: string; // lines|words|chars
}

export class Diff {

  /* lhsText: string;
  rhsText: string;
  options: DiffOptions;
  // trace: any[][];

  constructor(lhs, rhs, options: DiffOptions = {
    ignorews: false,
    ignoreaccents: false,
    ignorecase: false,
    split: 'lines'
  }) {
    this.lhsText = lhs;
    this.rhsText = rhs;
    this.options = options;
  } */

  static do(lhsText, rhsText, options: DiffOptions = {
    ignorews: false,
    ignoreaccents: false,
    ignorecase: false,
    split: 'lines'
  }) { //do() {

    // const lhsText = this.lhsText;
    // const rhsText = this.rhsText;
    // const trace = this.trace;
    // const options = this.options;

    let re = '\n'; // lines (default)
    if(options.split === 'chars') re = '';
    else if(options.split === 'words') re = ' ';

    let lhsArray = lhsText.split(re);
    let rhsArray = rhsText.split(re);

    let N = lhsArray.length, M = rhsArray.length, MAX = N+M;
    //let V = new Array(2*MAX+1);
    let V; (V = []).length = 2*MAX+1;
    let _V = negativeArray(V);
    let x, y;

    _V[1] = 0;

    outer: for(let D = 0; D <= MAX; D++) {
      for(let k = -D; k <= D; k += 2) {
        if(k == -D /* && _V[k-1] < _V[k+1] */) { // move down if left boundary
          x = _V[k+1];
        } else if(k != D && _V[k-1] < _V[k+1]) { // move down if what?
          x = _V[k+1];
        } else { // move right else
          x = _V[k-1]+1;
        }

        y = x - k;

        // snake
        while (
          x < N && y < M
          // x and y is position(=index+1)
          // so comparing next position value is
          && lhsArray[x-1+1] == rhsArray[y-1+1]
        ) {
          x++;y++;
        }

        _V[k] = x;
        if(x >= N && y >= M) {
          return {D:D, k:k};
        }

      }
    }

    // should never get to this state
    throw new Error('unexpected state');
  }

  getGnuNormalForm() {}
}