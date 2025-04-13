import fs from 'fs';
// import { expect } from 'chai';
// import { describe, expect } from 'jest';
import { Diff } from '../src/lib/my/Diff';

describe('#diff', function() {
  it('default ', function() {
    const ret = Diff.do(
      'abcabba',
      'cbabac',
      { split: 'chars'}
    );
    expect(ret).toEqual({ D: 5, k: 1 });
  });

});
