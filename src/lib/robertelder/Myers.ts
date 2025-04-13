export class Myers {
  /**
  This function is a concrete implementation of the algorithm for 'finding the middle snake' presented
  similarly to the pseudocode on page 11 of 'An O(ND) Difference Algorithm and Its Variations' by EUGENE W. MYERS.
  This algorithm is a centeral part of calculating either the smallest edit script for a pair of
  sequences, or finding the longest common sub-sequence (these are known to be dual problems).

  The worst-case (and expected case) space requirement of this function is O(N + M), where N is
  the length of the first sequence, and M is the length of the second sequence.
  The worst-case run time of this function is O(MN) and this occurs when both string have no common
  sub-sequence.  Since the expected case is for the sequences to have some similarities, the expected
  run time is O((M + N)D) where D is the number of edits required to transform sequence A into sequence B.
  The space requirement remains the same in all cases, but less space could be used with a modified version
  of the algorithm that simply specified a user-defined MAX value less than M + N.  In this case, the
  algorithm would stop earlier and report a D value no greater than MAX, which would be interpreted as
  'there is no edit sequence less than length D that produces the new_sequence from old_sequence'.

  Note that (if I have understood the paper correctly), the k values used for the reverse direction
  of this implementation have opposite sign compared with those suggested in the paper.  I found this made
  the algorithm easier to implement as it makes the forward and reverse directions more symmetric.

  @old_sequence  This represents a sequence of something that can be compared against 'new_sequence'
  using the '==' operator.  It could be characters, or lines of text or something different.

  @N  The length of 'old_sequence'

  @new_sequence  The new sequence to compare 'old_sequence' against.

  @M  The length of 'new_sequence'

  There are 5 return values for this function:

  The first is an integer representing the number of edits (delete or insert) that are necessary to
  produce new_sequence from old_sequence.

  The next two parts of the return value are the point (x, y) representing the starting coordinate of the
  middle snake.

  The next two return values are the point (u, v) representing the end coordinate of the middle snake.

  It is possible that (x,y) == (u,v)
  */
  findMiddleSnake(old_sequence: string, N: number, new_sequence: string, M: number): { D: number, x: number, y: number, u: number, v: number } {
    ///*
    // The sum of the length of the seqeunces.
    let MAX = N + M;
    // The difference between the length of the sequences.
    let Delta = N - M;

    // The array that holds the 'best possible x values' in search from top left to bottom right.
    let Vf; (Vf = []).length = MAX + 2;
    // The array that holds the 'best possible x values' in search from bottom right to top left.
    let Vb; (Vb = []).length = MAX + 2;
    // The initial point at (0, -1)
    Vf[1] = 0;
    // The initial point at (N, M+1)
    Vb[1] = 0;

    let x, y, x_i, y_i;
    // We only need to iterate to ceil((max edit length)/2) because we're searching in both directions.
    for(let D = 0; D < MAX/2+(MAX%2)+1; D++) {
        // for k in range(-D, D + 1, 2):
        for(let k = -D; k < D+1; k += 2) {
          if(k == -D || k != D && Vf[k - 1] < Vf[k + 1]) {
            // Did not increase x, but we'll take the better (or only) x value from the k line above
            x = Vf[k + 1];
          } else {
            // We can increase x by building on the best path from the k line above
            x = Vf[k - 1] + 1;
          }
          // From fundamental axiom of this algorithm: x - y = k
          y = x - k;
          // Remember the initial point before the snake so we can report it.
          x_i = x;
          y_i = y;
          // While these sequences are identical, keep moving through the graph with no cost
          while(x < N && y < M && old_sequence[x] == new_sequence[y]) {
            x = x + 1;
            y = y + 1;
          }
          // This is the new best x value
          Vf[k] = x;
          // Only check for connections from the forward search when N - M is odd
          // and when there is a reciprocal k line coming from the other direction.
          if((Delta % 2 == 1) && (-(k - Delta)) >= -(D -1) && (-(k - Delta)) <= (D -1)) {
            if(Vf[k] + Vb[-(k - Delta)] >= N) {
              return { D: 2*D-1, x: x_i, y: y_i, u: x, v: y };
            }
          }
        }

        for(let k = -D; k < D+1; k += 2) {
          if(k == -D || k != D && Vb[k - 1] < Vb[k + 1]) {
            x = Vb[k + 1];
          } else {
            x = Vb[k - 1] + 1;
          }
          y = x - k;
          x_i = x;
          y_i = y;
          while(x < N && y < M && old_sequence[N - x -1] == new_sequence[M - y - 1]) {
            x = x + 1;
            y = y + 1;
          }
          Vb[k] = x;
          if((Delta % 2 == 0) && (-(k - Delta)) >= -D && (-(k - Delta)) <= D) {
            if(Vb[k] + Vf[(-(k - Delta))] >= N) {
              return { D: 2*D, x: N-x, y: M-y, u: N-x_i, v: M-y_i };
            }
          }
        }
    }
    //*/
  }

  /**
  This function is a concrete implementation of the algorithm for finding the shortest edit script that was
  'left as an exercise' on page 12 of 'An O(ND) Difference Algorithm and Its Variations' by EUGENE W. MYERS.

  @old_sequence  This represents a sequence of something that can be compared against 'new_sequence'
  using the '==' operator.  It could be characters, or lines of text or something different.

  @N  The length of 'old_sequence'

  @new_sequence  The new sequence to compare 'old_sequence' against.

  @M  The length of 'new_sequence'

  The return value is a sequence of objects that contains the indicies in old_sequnce and new_sequnce that
  you could use to produce new_sequence from old_sequence using the minimum number of edits.

  The format of this function as it is currently written is optimized for clarity, not efficiency.  It is
  expected that anyone wanting to use this function in a real application would modify the 2 lines noted
  below to produce whatever representation of the edit sequence you wanted.
  */
  getShortestEditScript_h(old_sequence: string, N: number, new_sequence: string, M: number, current_x: number = 0, current_y: number = 0) {
    ///*
    let rtn = []
    if(N > 0 && M > 0) {
      const { D, x, y, u, v } = this.findMiddleSnake(old_sequence, N, new_sequence, M);
      // If the graph represented by the current sequences can be further subdivided.
      if(D > 1 || (x != u && y != v)) {
        // Collection delete/inserts before the snake
        rtn.push(...this.getShortestEditScript_h(old_sequence.substring(0,x), x, new_sequence.substring(0,y), y, current_x, current_y));
        // Collection delete/inserts after the snake
        rtn.push(...this.getShortestEditScript_h(old_sequence.substring(u,N), N-u, new_sequence.substring(v,M), M-v, current_x + u, current_y + v));
      } else if(M > N) {
        // M is longer than N, but we know there is a maximum of one edit to transform old_sequence into new_sequence
        // The first N elements of both sequences in this case will represent the snake, and the last element
        // will represent a single insertion.
        rtn.push(...this.getShortestEditScript_h(old_sequence.substring(N,N), N-N, new_sequence.substring(N,M), M-N, current_x + N, current_y + N));
      } else if(M < N) {
        // N is longer than (or equal to) M, but we know there is a maximum of one edit to transform old_sequence into new_sequence
        // The first M elements of both sequences in this case will represent the snake, and the last element
        // will represent a single deletion.  If M == N, then this reduces to a snake which does not contain any edits.
        rtn.push(...this.getShortestEditScript_h(old_sequence.substring(M,N), N-M, new_sequence.substring(M,M), M-M, current_x + M, current_y + M));
      }
    } else if(N > 0) {
      // This area of the graph consist of only horizontal edges that represent deletions.
      for(let i = 0; i < N; i++) {
        // Modify this line if you want a more efficient representation:
        rtn.push({"operation": "delete", "position_old": current_x + i}); // append
      }
    } else {
      // This area of the graph consist of only vertical edges that represent insertions.
      for(let i = 0; i < M; i++) {
        // Modify this line if you want a more efficient representation:
        rtn.push({"operation": "insert", "position_old": current_x, "position_new": current_y + i}); // append
      }
    }
    return rtn;
    //*/
  }

  getShortestEditScript(old_sequence: string, new_sequence: string) {
    return this.getShortestEditScript_h(old_sequence, old_sequence.length, new_sequence, new_sequence.length);
  }

  /**
  This function is a concrete implementation of the algorithm for finding the longest common subsequence presented
  similarly to the pseudocode on page 12 of 'An O(ND) Difference Algorithm and Its Variations' by EUGENE W. MYERS.

  @old_sequence  This represents a sequence of something that can be compared against 'new_sequence'
  using the '==' operator.  It could be characters, or lines of text or something different.

  @N  The length of 'old_sequence'

  @new_sequence  The new sequence to compare 'old_sequence' against.

  @M  The length of 'new_sequence'

  The return value is a new sequence that is the longest common subsequence of old_sequence and new_sequence.
  */
  getLongestCommonSubsequence_h(old_sequence: string, N: number, new_sequence: string, M: number) {
    ///*
    let rtn = []
    if(N > 0 && M > 0) {
      const { D, x, y, u, v } = this.findMiddleSnake(old_sequence, N, new_sequence, M);
      if(D > 1) {
        // LCS(A[1..x],x,B[1..y],y)
        rtn.push(...this.getLongestCommonSubsequence_h(old_sequence.substring(0,x), x, new_sequence.substring(0,y), y));
        // Output A[x+1..u].
        rtn.push(old_sequence.substring(x,u));
        // LCS(A[u+1..N],N-u,B[v+1..M],M-v)
        rtn.push(...this.getLongestCommonSubsequence_h(old_sequence.substring(u,N), N-u, new_sequence.substring(v,M), M-v));
      } else if(M > N) {
        // Output A[1..N].
        rtn.push(old_sequence.substring(0,N));
      } else {
        // Output B[1..M].
        rtn.push(new_sequence.substring(0,M));
      }
    }
    return rtn
    //*/
  }

  getLongestCommonSubsequence(old_sequence: string, new_sequence: string) {
    return this.getLongestCommonSubsequence_h(old_sequence, old_sequence.length, new_sequence, new_sequence.length);
  }
}