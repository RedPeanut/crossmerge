// import fs from 'fs';
import { Myers } from '../src/lib/robertelder/Myers';

describe('#robertelder', function() {
  it('default ', function() {
    const ret = new Myers().getShortestEditScript('abcabba', 'cbabac');
    console.log('ret =', ret);
  });

});
